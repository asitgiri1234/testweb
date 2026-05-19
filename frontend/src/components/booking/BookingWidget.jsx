/**
 * Booking widget — calendar blocks Airbnb + website bookings from API.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { fetchPropertyAvailability } from "../../api/calendar.js";
import { createBooking } from "../../api/bookings.js";
import { createPaymentOrder, verifyPayment } from "../../api/payments.js";
import { siteConfig } from "../../config/siteConfig.js";
import { loadRazorpayCheckout } from "../../utils/loadRazorpay.js";
import "./BookingWidget.css";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function BookingWidget({
  property,
  compact = false,
  showCalendar = true,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}) {
  const minGuests = property?.minGuests || 1;
  const maxGuests = property?.maxGuests || 1;
  const defaultGuests = initialGuests ?? minGuests;
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(defaultGuests);
  const [blockedDates, setBlockedDates] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");
  const [hasAirbnbSync, setHasAirbnbSync] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    if (!property?.slug) return undefined;

    let cancelled = false;

    async function loadAvailability() {
      setCalendarLoading(true);
      setCalendarError("");
      try {
        const data = await fetchPropertyAvailability(property.slug);
        if (!cancelled) {
          setBlockedDates(data.blockedDates || []);
          setHasAirbnbSync(Boolean(data.hasAirbnbSync));
        }
      } catch (err) {
        if (!cancelled) {
          setCalendarError(err.message);
          setBlockedDates([]);
        }
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [property?.slug]);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
        )
      : 0;

  const subtotal = nights * (property?.pricePerNight || 0);
  const cleaning = nights > 0 ? property?.cleaningFee || 0 : 0;
  const total = subtotal + cleaning;

  const isDateBlocked = (date) => {
    const key = new Date(date);
    key.setHours(0, 0, 0, 0);
    return blockedSet.has(key.toISOString().slice(0, 10));
  };

  const handleRangeSelect = (range) => {
    setBookingError("");
    setBookingSuccess(null);

    if (!range?.from) {
      setCheckIn(undefined);
      setCheckOut(undefined);
      return;
    }

    if (range.from && range.to) {
      const cursor = new Date(range.from);
      cursor.setHours(0, 0, 0, 0);
      const end = new Date(range.to);
      end.setHours(0, 0, 0, 0);

      while (cursor < end) {
        if (isDateBlocked(cursor)) {
          setBookingError("Selected range includes unavailable dates.");
          setCheckIn(range.from);
          setCheckOut(undefined);
          return;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    setCheckIn(range.from);
    setCheckOut(range.to);
  };

  const openRazorpayCheckout = async (booking, order) => {
    const Razorpay = await loadRazorpayCheckout();
    const key = order.key_id || RAZORPAY_KEY_ID;

    if (!key) {
      throw new Error(
        "Payment is not configured. Please add VITE_RAZORPAY_KEY_ID on the frontend.",
      );
    }

    return new Promise((resolve, reject) => {
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: siteConfig.name,
        description: `${property.title} — ${nights} night${nights > 1 ? "s" : ""}`,
        order_id: order.order_id,
        prefill: {
          name: guestName.trim(),
          email: guestEmail.trim(),
          contact: guestPhone.trim() || undefined,
        },
        theme: { color: "#1c1917" },
        handler: async (response) => {
          try {
            const verified = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking.id,
            });
            resolve(verified);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled. Your dates are held until payment completes."));
          },
        },
      };

      const rzp = new Razorpay(options);

      rzp.on("payment.failed", (response) => {
        const description =
          response.error?.description ||
          response.error?.reason ||
          "Payment failed. Please try again.";
        reject(new Error(description));
      });

      rzp.open();
    });
  };

  const handleReserve = async () => {
    if (!checkIn || !checkOut || nights < 1) {
      setBookingError("Please select valid check-in and check-out dates.");
      return;
    }

    if (!guestName.trim() || !guestEmail.trim()) {
      setBookingError("Name and email are required to reserve.");
      return;
    }

    if (total < 1) {
      setBookingError("Total amount must be at least ₹1 to pay online.");
      return;
    }

    setSubmitting(true);
    setBookingError("");
    setBookingSuccess(null);

    try {
      const result = await createBooking({
        propertySlug: property.slug,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
      });

      const booking = result.booking;
      const order = await createPaymentOrder({ bookingId: booking.id });

      const verified = await openRazorpayCheckout(booking, order);

      setBookingSuccess(verified.booking || booking);
      const refreshed = await fetchPropertyAvailability(property.slug);
      setBlockedDates(refreshed.blockedDates || []);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className={`booking-widget ${compact ? "booking-widget--compact" : ""}`}>
      <p className="booking-widget__price">
        <strong>₹{property?.pricePerNight?.toLocaleString("en-IN")}</strong>
        <span> / night</span>
      </p>

      <div className="booking-widget__field">
        <label htmlFor="guests">Guests</label>
        <select
          id="guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        >
          {Array.from(
            { length: maxGuests - minGuests + 1 },
            (_, i) => minGuests + i,
          ).map((n) => (
            <option key={n} value={n}>
              {n} guest{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {showCalendar && (
        <div className="booking-widget__calendar">
          <p className="booking-widget__label">Select dates</p>
          {calendarLoading ? (
            <p className="booking-widget__hint">Loading availability…</p>
          ) : (
            <DayPicker
              mode="range"
              selected={{ from: checkIn, to: checkOut }}
              onSelect={handleRangeSelect}
              disabled={[
                { before: new Date() },
                (date) => isDateBlocked(date),
              ]}
              numberOfMonths={compact ? 1 : 2}
            />
          )}
          <p className="booking-widget__hint">
            {hasAirbnbSync
              ? `Unavailable dates include ${property.title} Airbnb bookings and website reservations.`
              : "Unavailable dates include existing website reservations."}
          </p>
          {calendarError && (
            <p className="booking-widget__error">{calendarError}</p>
          )}
        </div>
      )}

      {!compact && (
        <div className="booking-widget__guest-form">
          <div className="booking-widget__field">
            <label htmlFor="guestName">Full name</label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="booking-widget__field">
            <label htmlFor="guestEmail">Email</label>
            <input
              id="guestEmail"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="booking-widget__field">
            <label htmlFor="guestPhone">Phone (optional)</label>
            <input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
        </div>
      )}

      {nights > 0 && (
        <div className="booking-widget__breakdown">
          <div className="booking-widget__row">
            <span>
              ₹{property.pricePerNight.toLocaleString("en-IN")} × {nights} nights
            </span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {cleaning > 0 && (
            <div className="booking-widget__row">
              <span>Cleaning fee</span>
              <span>₹{cleaning.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="booking-widget__row booking-widget__row--total">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {bookingError && <p className="booking-widget__error">{bookingError}</p>}
      {bookingSuccess && (
        <p className="booking-widget__success">
          Payment received — your stay is confirmed. Reference:{" "}
          {bookingSuccess.id}
          {bookingSuccess.razorpayPaymentId && (
            <>
              <br />
              <span className="booking-widget__payment-id">
                Payment ID: {bookingSuccess.razorpayPaymentId}
              </span>
            </>
          )}
        </p>
      )}

      {compact ? (
        <Link
          to={`/booking/${property.slug}`}
          className="btn booking-widget__cta"
          state={{ checkIn, checkOut, guests }}
        >
          Reserve
        </Link>
      ) : (
        <button
          type="button"
          className="btn booking-widget__cta"
          disabled={submitting || nights < 1}
          onClick={handleReserve}
        >
          {submitting ? "Processing…" : "Pay & reserve"}
        </button>
      )}
    </aside>
  );
}

export default BookingWidget;

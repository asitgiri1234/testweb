/**
 * Booking widget — calendar blocks Airbnb + website bookings from API.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { fetchPropertyAvailability } from "../../api/calendar.js";
import { createBooking, releaseBookingHold } from "../../api/bookings.js";
import {
  createPaymentOrder,
  fetchPaymentConfig,
  verifyPayment,
} from "../../api/payments.js";
import { siteConfig } from "../../config/siteConfig.js";
import { toLocalDateString } from "../../utils/dateStrings.js";
import { buildRazorpayCheckoutOptions } from "../../utils/buildRazorpayOptions.js";
import { loadRazorpayCheckout } from "../../utils/loadRazorpay.js";
import "./BookingWidget.css";

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
  const [calendarWarning, setCalendarWarning] = useState("");
  const [hasAirbnbSync, setHasAirbnbSync] = useState(false);
  const [paymentConfigured, setPaymentConfigured] = useState(null);
  const [serverPaymentConfig, setServerPaymentConfig] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPaymentConfig() {
      try {
        const config = await fetchPaymentConfig();
        if (!cancelled) {
          setServerPaymentConfig(config);
          setPaymentConfigured(
            Boolean(config.configured && config.key_id && config.checkout_ready),
          );
        }
      } catch {
        if (!cancelled) {
          setPaymentConfigured(false);
          setServerPaymentConfig(null);
        }
      }
    }

    loadPaymentConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!property?.slug) return undefined;

    let cancelled = false;

    async function loadAvailability() {
      setCalendarLoading(true);
      setCalendarWarning("");
      try {
        const data = await fetchPropertyAvailability(property.slug);
        if (!cancelled) {
          setBlockedDates(data.blockedDates || []);
          setHasAirbnbSync(Boolean(data.hasAirbnbSync));
          if (data.dbConnected === false) {
            setCalendarWarning(
              "Showing Airbnb availability only. Website bookings sync when the database is connected.",
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setBlockedDates([]);
          setCalendarWarning(
            "Could not load live availability. You can still select dates — we will verify before confirming.",
          );
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

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isDateBlocked = (date) => blockedSet.has(toLocalDateString(date));

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

  const refreshAvailability = async () => {
    try {
      const refreshed = await fetchPropertyAvailability(property.slug);
      setBlockedDates(refreshed.blockedDates || []);
    } catch {
      /* calendar will refresh on next load */
    }
  };

  const releaseHold = async (bookingId) => {
    try {
      await releaseBookingHold(bookingId);
    } catch {
      /* hold may already be expired */
    }
    await refreshAvailability();
  };

  const openRazorpayCheckout = async (booking, order) => {
    const Razorpay = await loadRazorpayCheckout();

    if (!serverPaymentConfig?.checkout_ready) {
      throw new Error(
        serverPaymentConfig?.message ||
          "Payment configuration is not ready. Check Razorpay keys and dashboard config on the server.",
      );
    }

    return new Promise((resolve, reject) => {
      let options;
      try {
        options = buildRazorpayCheckoutOptions({
          serverPaymentConfig,
          order,
          siteName: siteConfig.name,
          description: `${property.title} — ${nights} night${nights > 1 ? "s" : ""}`,
          prefill: {
            name: guestName.trim(),
            email: guestEmail.trim(),
            contact: guestPhone.trim() || undefined,
          },
          onSuccess: async (response) => {
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
          onDismiss: () => {
            releaseHold(booking.id);
            reject(new Error("Payment cancelled. Those dates are available again."));
          },
        });
      } catch (err) {
        reject(err);
        return;
      }

      const rzp = new Razorpay(options);

      rzp.on("payment.failed", (response) => {
        releaseHold(booking.id);
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

      if (!paymentConfigured) {
        const paymentMsg =
          serverPaymentConfig?.message ||
          serverPaymentConfig?.hint ||
          "Online payment is not available right now.";
        setBookingError(paymentMsg);
        setBookingSuccess({
          ...booking,
          pendingPayment: true,
        });
        return;
      }

      const order = await createPaymentOrder({ bookingId: booking.id });

      if (order.checkout_ready === false) {
        throw new Error(
          serverPaymentConfig?.message ||
            "Razorpay checkout configuration is invalid for the current API keys.",
        );
      }
      try {
        const verified = await openRazorpayCheckout(booking, order);
        setBookingSuccess(verified.booking || booking);
        await refreshAvailability();
      } catch (payErr) {
        if (booking?.id) {
          await releaseHold(booking.id);
        }
        throw payErr;
      }
    } catch (err) {
      if (
        err.code === "DB_NOT_CONFIGURED" ||
        err.code === "DB_UNAVAILABLE"
      ) {
        setBookingError(
          "Booking database is not available. Start MongoDB locally (or set MONGODB_URI on the server), then try Pay & reserve again.",
        );
      } else if (err.status === 503 && err.message?.includes("not configured")) {
        setBookingError(
          "Payment gateway is not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env (or Vercel env).",
        );
      } else {
        setBookingError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ctaLabel =
    paymentConfigured === false
      ? "Request reservation"
      : submitting
        ? "Processing…"
        : "Pay & reserve";

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
              disabled={[{ before: today }, (date) => isDateBlocked(date)]}
              numberOfMonths={compact ? 1 : 2}
            />
          )}
          <p className="booking-widget__hint">
            {hasAirbnbSync
              ? `Unavailable dates include ${property.title} Airbnb bookings and website reservations.`
              : "Unavailable dates include existing website reservations."}
          </p>
          {calendarWarning && (
            <p className="booking-widget__warning">{calendarWarning}</p>
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
          {bookingSuccess.pendingPayment ? (
            <>
              Reservation requested for ₹{total.toLocaleString("en-IN")}. Reference:{" "}
              {bookingSuccess.id}. Online payment is being set up — we will contact you
              at {guestEmail.trim()} to confirm.
            </>
          ) : (
            <>
              Payment received — your stay is confirmed. Reference: {bookingSuccess.id}
              {bookingSuccess.razorpayPaymentId && (
                <>
                  <br />
                  <span className="booking-widget__payment-id">
                    Payment ID: {bookingSuccess.razorpayPaymentId}
                  </span>
                </>
              )}
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
          disabled={submitting || nights < 1 || paymentConfigured === null}
          onClick={handleReserve}
        >
          {ctaLabel}
        </button>
      )}

      {serverPaymentConfig?.payment_methods?.length > 0 && paymentConfigured && (
        <p className="booking-widget__hint booking-widget__hint--payment">
          Pay securely with {serverPaymentConfig.payment_methods.join(", ")} via Razorpay
          {serverPaymentConfig.checkout_mode === "dashboard" ? " (your live dashboard setup)" : ""}.
        </p>
      )}

      {paymentConfigured === false && !compact && (
        <p className="booking-widget__hint booking-widget__hint--payment booking-widget__warning">
          {serverPaymentConfig?.message ||
            serverPaymentConfig?.hint ||
            "Online payment is not ready. Check Razorpay keys and payment configuration on the server."}
        </p>
      )}
    </aside>
  );
}

export default BookingWidget;

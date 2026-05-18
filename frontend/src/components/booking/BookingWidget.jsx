/**
 * Booking widget — calendar blocks Airbnb + website bookings from API.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { fetchPropertyAvailability } from "../../api/calendar.js";
import { createBooking } from "../../api/bookings.js";
import "./BookingWidget.css";

function BookingWidget({
  property,
  compact = false,
  showCalendar = true,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 1,
}) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
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

  const handleReserve = async () => {
    if (!checkIn || !checkOut || nights < 1) {
      setBookingError("Please select valid check-in and check-out dates.");
      return;
    }

    if (!guestName.trim() || !guestEmail.trim()) {
      setBookingError("Name and email are required to reserve.");
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

      setBookingSuccess(result.booking);
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
          {Array.from({ length: property?.maxGuests || 1 }, (_, i) => i + 1).map(
            (n) => (
              <option key={n} value={n}>
                {n} guest{n > 1 ? "s" : ""}
              </option>
            ),
          )}
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
            {property.slug === "amber-house" && hasAirbnbSync
              ? "Unavailable dates include Amber House Airbnb bookings and website reservations."
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
          Reservation held (pending payment). Reference: {bookingSuccess.id}
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
          {submitting ? "Checking availability…" : "Reserve dates"}
        </button>
      )}
    </aside>
  );
}

export default BookingWidget;

/**
 * Booking widget — sidebar on detail page & full form on booking page.
 * Phase 3 will connect calendar to API availability and pricing logic.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./BookingWidget.css";

function BookingWidget({
  property,
  compact = false,
  showCalendar = true,
}) {
  const [checkIn, setCheckIn] = useState(undefined);
  const [checkOut, setCheckOut] = useState(undefined);
  const [guests, setGuests] = useState(1);

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        )
      : 0;

  const subtotal = nights * (property?.pricePerNight || 0);
  const cleaning = nights > 0 ? property?.cleaningFee || 0 : 0;
  const total = subtotal + cleaning;

  const handleRangeSelect = (range) => {
    setCheckIn(range?.from);
    setCheckOut(range?.to);
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
            )
          )}
        </select>
      </div>

      {showCalendar && (
        <div className="booking-widget__calendar">
          <p className="booking-widget__label">Select dates</p>
          <DayPicker
            mode="range"
            selected={{ from: checkIn, to: checkOut }}
            onSelect={handleRangeSelect}
            disabled={{ before: new Date() }}
            numberOfMonths={compact ? 1 : 2}
          />
          <p className="booking-widget__hint">
            Blocked dates from the server will appear in Phase 3.
          </p>
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

      {compact ? (
        <Link
          to={`/booking/${property.slug}`}
          className="btn booking-widget__cta"
          state={{ checkIn, checkOut, guests }}
        >
          Reserve
        </Link>
      ) : (
        <button type="button" className="btn booking-widget__cta" disabled>
          Pay with Razorpay (Phase 4)
        </button>
      )}
    </aside>
  );
}

export default BookingWidget;

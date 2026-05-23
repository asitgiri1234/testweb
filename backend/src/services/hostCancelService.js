/**
 * Host-initiated booking cancellation — frees calendar dates immediately.
 */
import Booking from "../models/Booking.js";
import { clearAirbnbCache } from "./airbnbImportService.js";
import { getCalendarSlugForPropertySlug } from "../config/calendarConfig.js";
import { expireStalePendingBookings } from "./availabilityService.js";
import { sendBookingCancellationEmails } from "./bookingEmailService.js";

function serializeBooking(booking) {
  const property =
    typeof booking.property === "object" && booking.property
      ? {
          id: booking.property._id,
          title: booking.property.title,
          slug: booking.property.slug,
        }
      : null;

  return {
    id: booking._id,
    property,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    nights: booking.nights,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
    razorpayPaymentId: booking.razorpayPaymentId,
    cancelledAt: booking.cancelledAt,
    cancelledBy: booking.cancelledBy,
    cancellationReason: booking.cancellationReason,
    createdAt: booking.createdAt,
  };
}

export async function listBookingsForAdmin({ status } = {}) {
  const query = {};

  if (status === "active") {
    query.bookingStatus = { $ne: "cancelled" };
  } else if (status === "cancelled") {
    query.bookingStatus = "cancelled";
  }

  const bookings = await Booking.find(query)
    .populate("property", "title slug")
    .sort({ checkIn: 1 })
    .limit(200);

  return bookings.map(serializeBooking);
}

export async function cancelBookingByHost(bookingId, adminEmail, reason = "") {
  const booking = await Booking.findById(bookingId).populate(
    "property",
    "title slug",
  );

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.bookingStatus === "cancelled") {
    return serializeBooking(booking);
  }

  const wasPaid = booking.paymentStatus === "paid";

  await Booking.findByIdAndUpdate(booking._id, {
    $set: {
      bookingStatus: "cancelled",
      paymentStatus: wasPaid ? "refunded" : "failed",
      cancelledAt: new Date(),
      cancelledBy: adminEmail,
      cancellationReason:
        reason?.trim() ||
        "Cancelled by host — dates are available again on the website calendar.",
    },
    $unset: {
      razorpayOrderId: "",
      razorpayPaymentId: "",
      razorpaySignature: "",
    },
  });

  booking.bookingStatus = "cancelled";
  booking.paymentStatus = wasPaid ? "refunded" : "failed";
  booking.cancelledAt = new Date();
  booking.cancelledBy = adminEmail;
  booking.cancellationReason = reason?.trim() || "";

  const propertyId =
    typeof booking.property === "object" && booking.property?._id
      ? booking.property._id
      : booking.property;

  if (propertyId) {
    await expireStalePendingBookings(propertyId);
  }

  const propertySlug =
    typeof booking.property === "object" && booking.property?.slug
      ? booking.property.slug
      : null;

  if (propertySlug) {
    const calendarSlug = getCalendarSlugForPropertySlug(propertySlug);
    if (calendarSlug) {
      clearAirbnbCache(calendarSlug);
    }
  }

  sendBookingCancellationEmails(booking, { wasPaid }).catch((err) => {
    console.error("[booking-email] Cancellation email failed:", err);
  });

  return serializeBooking(booking);
}

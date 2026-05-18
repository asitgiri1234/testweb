/**
 * Booking creation with availability validation before payment.
 */
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import { isRangeAvailable } from "./availabilityService.js";
import { clearAirbnbCache } from "./airbnbImportService.js";
import { getCalendarSlugForPropertySlug } from "../config/calendarConfig.js";

function calculatePricing(property, nights) {
  const subtotal = nights * property.pricePerNight;
  const cleaningFee = nights > 0 ? property.cleaningFee || 0 : 0;
  const serviceFeePercent = property.serviceFeePercent ?? 0;
  const serviceFee = Math.round((subtotal * serviceFeePercent) / 100);
  const totalAmount = subtotal + cleaningFee + serviceFee;

  return { subtotal, cleaningFee, serviceFee, totalAmount };
}

export async function createBooking(payload) {
  const {
    propertySlug,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    guests,
  } = payload;

  if (!propertySlug || !guestName || !guestEmail || !checkIn || !checkOut) {
    const error = new Error(
      "propertySlug, guestName, guestEmail, checkIn, and checkOut are required",
    );
    error.statusCode = 400;
    throw error;
  }

  const property = await Property.findOne({
    slug: propertySlug,
    isActive: { $ne: false },
  });

  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  const guestCount = Number(guests) || 1;
  if (guestCount > property.maxGuests) {
    const error = new Error(
      `This property allows a maximum of ${property.maxGuests} guests`,
    );
    error.statusCode = 400;
    throw error;
  }

  const availability = await isRangeAvailable(propertySlug, checkIn, checkOut);
  if (!availability.available) {
    const error = new Error(
      `Selected dates are not available (${availability.conflict.source}: ${availability.conflict.summary}).`,
    );
    error.statusCode = 409;
    error.code = "DATES_UNAVAILABLE";
    error.conflict = availability.conflict;
    throw error;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.round(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );

  const pricing = calculatePricing(property, nights);

  const booking = await Booking.create({
    property: property._id,
    guestName: guestName.trim(),
    guestEmail: guestEmail.trim().toLowerCase(),
    guestPhone: guestPhone?.trim(),
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guestCount,
    nights,
    subtotal: pricing.subtotal,
    cleaningFee: pricing.cleaningFee,
    serviceFee: pricing.serviceFee,
    totalAmount: pricing.totalAmount,
    currency: "INR",
    paymentStatus: "pending",
    bookingStatus: "pending",
  });

  const calendarSlug = getCalendarSlugForPropertySlug(propertySlug);
  if (calendarSlug) {
    clearAirbnbCache(calendarSlug);
  }

  return booking;
}

export async function getBookingById(id) {
  return Booking.findById(id).populate("property", "title slug");
}

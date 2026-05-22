/**
 * Booking creation with availability validation before payment.
 */
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import { getStaticProperty } from "../config/propertiesConfig.js";
import { ensureDb } from "../middleware/ensureDb.js";
import {
  expireStalePendingBookings,
  isRangeAvailable,
} from "./availabilityService.js";
import {
  eachNightInRange,
  normalizeStayDateInput,
  parseCalendarDate,
} from "../utils/dateUtils.js";
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

  await ensureDb();

  let property = await Property.findOne({
    slug: propertySlug,
    isActive: { $ne: false },
  });

  if (!property) {
    const staticData = getStaticProperty(propertySlug);
    if (staticData) {
      property = await Property.findOneAndUpdate(
        { slug: propertySlug },
        staticData,
        { upsert: true, new: true },
      );
    }
  }

  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  const guestCount = Number(guests) || 1;
  const minGuests = property.minGuests || 1;

  if (guestCount < minGuests) {
    const error = new Error(
      `This property requires at least ${minGuests} guests`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (guestCount > property.maxGuests) {
    const error = new Error(
      `This property allows a maximum of ${property.maxGuests} guests`,
    );
    error.statusCode = 400;
    throw error;
  }

  await expireStalePendingBookings(property._id);

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

  const checkInLabel = normalizeStayDateInput(checkIn);
  const checkOutLabel = normalizeStayDateInput(checkOut);
  const checkInDate = parseCalendarDate(checkInLabel);
  const checkOutDate = parseCalendarDate(checkOutLabel);
  const nights = eachNightInRange(checkInDate, checkOutDate).length;

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

/** Release dates when guest closes checkout without paying. */
export async function releaseBookingHold(bookingId) {
  await ensureDb();

  const booking = await Booking.findById(bookingId).populate(
    "property",
    "slug",
  );

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.paymentStatus === "paid") {
    const error = new Error("This booking is already paid and cannot be released");
    error.statusCode = 400;
    throw error;
  }

  if (booking.bookingStatus === "cancelled") {
    return booking;
  }

  booking.paymentStatus = "failed";
  booking.bookingStatus = "cancelled";
  await booking.save();

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

  return booking;
}

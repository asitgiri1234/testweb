/**
 * Merges Airbnb blocked dates with website bookings from MongoDB.
 */
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import {
  getCalendarConfig,
  getCalendarSlugForPropertySlug,
} from "../config/calendarConfig.js";
import { getStaticProperty } from "../config/propertiesConfig.js";
import { tryEnsureDb } from "../middleware/ensureDb.js";
import { fetchAirbnbBlockedRanges } from "./airbnbImportService.js";
import {
  eachNightInRange,
  expandRangeToDates,
  normalizeStayDateInput,
  parseCalendarDate,
  rangesOverlap,
  toDateString,
} from "../utils/dateUtils.js";

const DEFAULT_HOLD_MINUTES = 15;

function getPaymentHoldMinutes() {
  const minutes = Number(process.env.PAYMENT_HOLD_MINUTES);
  return Number.isFinite(minutes) && minutes > 0
    ? minutes
    : DEFAULT_HOLD_MINUTES;
}

function getHoldCutoffDate() {
  return new Date(Date.now() - getPaymentHoldMinutes() * 60 * 1000);
}

/** Cancel unpaid pending bookings past the short checkout hold window. */
export async function expireStalePendingBookings(propertyId) {
  if (!propertyId) return 0;

  const dbReady = await tryEnsureDb();
  if (!dbReady) return 0;

  const cutoff = getHoldCutoffDate();

  const result = await Booking.updateMany(
    {
      property: propertyId,
      paymentStatus: "pending",
      bookingStatus: "pending",
      createdAt: { $lt: cutoff },
    },
    {
      $set: {
        paymentStatus: "failed",
        bookingStatus: "cancelled",
        razorpayOrderId: null,
      },
    },
  );

  return result.modifiedCount;
}

async function resolveProperty(propertySlug) {
  const dbReady = await tryEnsureDb();
  if (!dbReady) return null;

  const fromDb = await Property.findOne({
    slug: propertySlug,
    isActive: { $ne: false },
  });
  if (fromDb) return fromDb;

  const staticData = getStaticProperty(propertySlug);
  if (!staticData) return null;

  return Property.findOneAndUpdate({ slug: propertySlug }, staticData, {
    upsert: true,
    new: true,
  });
}

export async function getWebsiteBookingRanges(propertyId) {
  const dbReady = await tryEnsureDb();
  if (!dbReady || !propertyId) return [];

  await expireStalePendingBookings(propertyId);

  const holdCutoff = getHoldCutoffDate();

  // Paid bookings always block. Unpaid pending only block during the short checkout window.
  const bookings = await Booking.find({
    property: propertyId,
    bookingStatus: { $ne: "cancelled" },
    $or: [
      { paymentStatus: "paid" },
      {
        paymentStatus: "pending",
        bookingStatus: "pending",
        createdAt: { $gte: holdCutoff },
      },
    ],
  }).select("checkIn checkOut guestName bookingStatus paymentStatus");

  return bookings.map((booking) => ({
    start: booking.checkIn,
    end: booking.checkOut,
    summary: `Booked — ${booking.guestName || "Guest"}`,
    source: "website",
    bookingId: booking._id.toString(),
  }));
}

export async function getMergedBlockedRanges(calendarSlug) {
  const config = getCalendarConfig(calendarSlug);
  if (!config) {
    const error = new Error(`Unknown calendar: ${calendarSlug}`);
    error.statusCode = 404;
    throw error;
  }

  const property = await resolveProperty(config.propertySlug);
  const websiteRanges = property
    ? await getWebsiteBookingRanges(property._id)
    : [];

  let airbnbRanges = [];
  try {
    airbnbRanges = await fetchAirbnbBlockedRanges(
      config.airbnbIcalUrl,
      calendarSlug,
    );
  } catch (err) {
    console.warn(`Airbnb calendar import failed (${calendarSlug}):`, err.message);
  }

  return {
    property,
    config,
    ranges: [...airbnbRanges, ...websiteRanges],
    airbnbRanges,
    websiteRanges,
  };
}

export async function getAvailabilityByPropertySlug(propertySlug) {
  const calendarSlug = getCalendarSlugForPropertySlug(propertySlug);
  if (!calendarSlug) {
    const error = new Error(`No calendar configured for property: ${propertySlug}`);
    error.statusCode = 404;
    throw error;
  }

  const { property, config, ranges, airbnbRanges, websiteRanges } =
    await getMergedBlockedRanges(calendarSlug);

  const blockedDatesSet = new Set();
  for (const range of ranges) {
    for (const night of eachNightInRange(range.start, range.end)) {
      blockedDatesSet.add(night);
    }
  }

  const dbReady = await tryEnsureDb();

  return {
    propertySlug,
    calendarSlug,
    propertyId: property?._id?.toString() || null,
    title: config.title,
    hasAirbnbSync: Boolean(config.airbnbIcalUrl),
    dbConnected: dbReady,
    blockedDates: [...blockedDatesSet].sort(),
    blockedRanges: ranges.map((range) => ({
      from: toDateString(range.start),
      to: toDateString(range.end),
      source: range.source,
      summary: range.summary,
    })),
    sources: {
      airbnb: airbnbRanges.length,
      website: websiteRanges.length,
    },
  };
}

export async function isRangeAvailable(propertySlug, checkIn, checkOut) {
  const checkInDate = parseCalendarDate(normalizeStayDateInput(checkIn));
  const checkOutDate = parseCalendarDate(normalizeStayDateInput(checkOut));

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    const error = new Error("Invalid check-in or check-out date");
    error.statusCode = 400;
    throw error;
  }

  if (checkOutDate <= checkInDate) {
    const error = new Error("Check-out must be after check-in");
    error.statusCode = 400;
    throw error;
  }

  const calendarSlug = getCalendarSlugForPropertySlug(propertySlug);
  if (!calendarSlug) {
    const error = new Error(`No calendar configured for property: ${propertySlug}`);
    error.statusCode = 404;
    throw error;
  }

  const { ranges } = await getMergedBlockedRanges(calendarSlug);

  const conflict = ranges.find((range) =>
    rangesOverlap(checkInDate, checkOutDate, range.start, range.end),
  );

  if (conflict) {
    return {
      available: false,
      conflict: {
        source: conflict.source,
        summary: conflict.summary,
        from: toDateString(conflict.start),
        to: toDateString(conflict.end),
      },
    };
  }

  return { available: true };
}

export function datesToDayPickerMatcher(blockedDates = []) {
  const blocked = new Set(blockedDates);
  return (date) => blocked.has(toDateString(date));
}

export { expandRangeToDates };

/**
 * Merges Airbnb blocked dates with website bookings from MongoDB.
 */
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import {
  getCalendarConfig,
  getCalendarSlugForPropertySlug,
} from "../config/calendarConfig.js";
import { fetchAirbnbBlockedRanges } from "./airbnbImportService.js";
import {
  eachNightInRange,
  expandRangeToDates,
  rangesOverlap,
  startOfDay,
  toDateString,
} from "../utils/dateUtils.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"];
const ACTIVE_PAYMENT_STATUSES = ["pending", "paid"];

async function resolveProperty(propertySlug) {
  return Property.findOne({ slug: propertySlug, isActive: { $ne: false } });
}

export async function getWebsiteBookingRanges(propertyId) {
  const bookings = await Booking.find({
    property: propertyId,
    bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
    paymentStatus: { $in: ACTIVE_PAYMENT_STATUSES },
  }).select("checkIn checkOut guestName bookingStatus");

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

  const airbnbRanges = await fetchAirbnbBlockedRanges(
    config.airbnbIcalUrl,
    calendarSlug,
  );

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

  return {
    propertySlug,
    calendarSlug,
    propertyId: property?._id?.toString() || null,
    title: config.title,
    hasAirbnbSync: Boolean(config.airbnbIcalUrl),
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
  const checkInDate = startOfDay(checkIn);
  const checkOutDate = startOfDay(checkOut);

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

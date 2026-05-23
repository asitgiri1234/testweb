/**
 * Host manual date blocks — maintenance and unavailable periods.
 */
import ManualBlock from "../models/ManualBlock.js";
import Property from "../models/Property.js";
import { getStaticProperty } from "../config/propertiesConfig.js";
import { clearAirbnbCache } from "./airbnbImportService.js";
import { getCalendarSlugForPropertySlug } from "../config/calendarConfig.js";
import {
  eachNightInRange,
  normalizeStayDateInput,
  parseCalendarDate,
  rangesOverlap,
  toDateString,
} from "../utils/dateUtils.js";

async function resolvePropertyBySlug(propertySlug) {
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

  return property;
}

function serializeBlock(block) {
  const property =
    typeof block.property === "object" && block.property
      ? {
          id: block.property._id,
          title: block.property.title,
          slug: block.property.slug,
        }
      : null;

  return {
    id: block._id,
    property,
    checkIn: block.checkIn,
    checkOut: block.checkOut,
    reason: block.reason,
    createdBy: block.createdBy,
    createdAt: block.createdAt,
    nights: eachNightInRange(block.checkIn, block.checkOut).length,
  };
}

export async function listManualBlocksForAdmin() {
  const blocks = await ManualBlock.find()
    .populate("property", "title slug")
    .sort({ checkIn: 1 })
    .limit(200);

  const today = parseCalendarDate(toDateString(new Date()));

  return blocks.map((block) => ({
    ...serializeBlock(block),
    isPast: parseCalendarDate(toDateString(block.checkOut)) <= today,
  }));
}

export async function createManualBlock(
  { propertySlug, checkIn, checkOut, reason },
  adminEmail,
) {
  const property = await resolvePropertyBySlug(propertySlug);
  if (!property) {
    const error = new Error("Property not found");
    error.statusCode = 404;
    throw error;
  }

  const checkInLabel = normalizeStayDateInput(checkIn);
  const checkOutLabel = normalizeStayDateInput(checkOut);
  const checkInDate = parseCalendarDate(checkInLabel);
  const checkOutDate = parseCalendarDate(checkOutLabel);

  if (checkOutDate <= checkInDate) {
    const error = new Error("Check-out must be after check-in");
    error.statusCode = 400;
    throw error;
  }

  const calendarSlug = getCalendarSlugForPropertySlug(propertySlug);
  const { getMergedBlockedRanges } = await import("./availabilityService.js");
  const { ranges } = await getMergedBlockedRanges(calendarSlug);

  const conflict = ranges.find((range) =>
    rangesOverlap(checkInDate, checkOutDate, range.start, range.end),
  );

  if (conflict) {
    const error = new Error(
      `Dates overlap with existing ${conflict.source} entry (${conflict.summary}).`,
    );
    error.statusCode = 409;
    throw error;
  }

  const block = await ManualBlock.create({
    property: property._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    reason: reason?.trim() || "Blocked by host — maintenance",
    createdBy: adminEmail,
  });

  if (calendarSlug) {
    clearAirbnbCache(calendarSlug);
  }

  const populated = await ManualBlock.findById(block._id).populate(
    "property",
    "title slug",
  );

  return serializeBlock(populated);
}

export async function deleteManualBlock(blockId) {
  const block = await ManualBlock.findById(blockId).populate(
    "property",
    "slug",
  );

  if (!block) {
    const error = new Error("Block not found");
    error.statusCode = 404;
    throw error;
  }

  const propertySlug =
    typeof block.property === "object" && block.property?.slug
      ? block.property.slug
      : null;

  await ManualBlock.findByIdAndDelete(blockId);

  if (propertySlug) {
    const calendarSlug = getCalendarSlugForPropertySlug(propertySlug);
    if (calendarSlug) {
      clearAirbnbCache(calendarSlug);
    }
  }

  return { deleted: true, id: blockId };
}

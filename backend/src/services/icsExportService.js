/**
 * Generates .ics export for Airbnb to import (website bookings only).
 */
import ical from "ical-generator";
import { getCalendarConfig, getSiteBaseUrl } from "../config/calendarConfig.js";
import { getWebsiteBookingRanges } from "./availabilityService.js";
import Property from "../models/Property.js";

export async function generatePropertyIcs(calendarSlug) {
  const slug = calendarSlug.replace(/\.ics$/i, "");
  const config = getCalendarConfig(slug);

  if (!config) {
    const error = new Error(`Unknown calendar: ${calendarSlug}`);
    error.statusCode = 404;
    throw error;
  }

  const property =
    (await Property.findOne({ slug: config.propertySlug })) ||
    ({ title: config.title, slug: config.propertySlug });

  const websiteRanges = property._id
    ? await getWebsiteBookingRanges(property._id)
    : [];

  const calendar = ical({
    name: `${property.title} — Joseph's Retreat`,
    description: `Direct bookings from Joseph's Retreat for ${property.title}`,
    timezone: process.env.CALENDAR_TIMEZONE || "Asia/Kolkata",
    url: `${getSiteBaseUrl()}/properties/${property.slug}`,
    prodId: {
      company: "Joseph's Retreat",
      product: "Booking Calendar",
    },
  });

  for (const range of websiteRanges) {
    calendar.createEvent({
      start: range.start,
      end: range.end,
      summary: range.summary || "Booked — Website",
      description: "Reserved via Joseph's Retreat website. Do not accept overlapping Airbnb bookings.",
      busystatus: "BUSY",
      transparency: "OPAQUE",
    });
  }

  return calendar.toString();
}

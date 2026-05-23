/**
 * Generates .ics export for Airbnb to import (website bookings).
 * Works without MongoDB — returns a valid empty calendar if DB is unavailable.
 */
import ical from "ical-generator";
import { getCalendarConfig, getSiteBaseUrl } from "../config/calendarConfig.js";
import { getWebsiteCalendarRanges } from "./availabilityService.js";
import { toDateString } from "../utils/dateUtils.js";
import Property from "../models/Property.js";
import mongoose from "mongoose";

function buildEmptyCalendar(config, propertySlug) {
  return ical({
    name: `${config.title} - Joseph's Retreat`,
    description: `Direct bookings from Joseph's Retreat for ${config.title}`,
    timezone: process.env.CALENDAR_TIMEZONE || "Asia/Kolkata",
    url: `${getSiteBaseUrl()}/properties/${propertySlug}`,
    prodId: {
      company: "Josephs Retreat",
      product: "Booking Calendar",
    },
  }).toString();
}

export async function generatePropertyIcs(calendarSlug) {
  const slug = calendarSlug.replace(/\.ics$/i, "");
  const config = getCalendarConfig(slug);

  if (!config) {
    const error = new Error(`Unknown calendar: ${calendarSlug}`);
    error.statusCode = 404;
    throw error;
  }

  let websiteRanges = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const property = await Property.findOne({ slug: config.propertySlug });
      if (property?._id) {
        websiteRanges = await getWebsiteCalendarRanges(property._id);
      }
    } catch (err) {
      console.warn("ICS export: could not load bookings from DB", err.message);
    }
  }

  const calendar = ical({
    name: `${config.title} - Joseph's Retreat`,
    description: `Direct bookings from Joseph's Retreat for ${config.title}`,
    timezone: process.env.CALENDAR_TIMEZONE || "Asia/Kolkata",
    url: `${getSiteBaseUrl()}/properties/${config.propertySlug}`,
    prodId: {
      company: "Josephs Retreat",
      product: "Booking Calendar",
    },
  });

  for (const range of websiteRanges) {
    calendar.createEvent({
      start: toDateString(range.start),
      end: toDateString(range.end),
      allDay: true,
      summary: range.summary || "Booked - Website",
      description:
        range.source === "host"
          ? "Blocked by host on Joseph's Retreat calendar."
          : "Reserved via Joseph's Retreat website. Do not accept overlapping Airbnb bookings.",
      busystatus: "BUSY",
      transparency: "OPAQUE",
    });
  }

  const body = calendar.toString();
  if (body && body.includes("BEGIN:VCALENDAR")) {
    return body;
  }

  return buildEmptyCalendar(config, config.propertySlug);
}

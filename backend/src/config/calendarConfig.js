/**
 * Calendar sync configuration per property.
 * Airbnb import is enabled for Amber House only.
 */

export const AIRBNB_ICAL_AMBER_HOUSE =
  process.env.AIRBNB_ICAL_AMBER_HOUSE ||
  "https://www.airbnb.co.in/calendar/ical/1544236559464750907.ics?t=3a0f37bd6daf4590b22eb41e51e7b038";

export const CALENDAR_PROPERTIES = {
  "property-1": {
    propertySlug: "amber-house",
    title: "Amber House",
    airbnbIcalUrl: AIRBNB_ICAL_AMBER_HOUSE,
  },
  "property-2": {
    propertySlug: "rooftop-serenity",
    title: "Rooftop Serenity",
    airbnbIcalUrl: process.env.AIRBNB_ICAL_ROOFTOP_SERENITY || "",
  },
};

export function getCalendarConfig(calendarSlug) {
  const key = calendarSlug?.replace(/\.ics$/i, "");
  return CALENDAR_PROPERTIES[key] || null;
}

export function getCalendarSlugForPropertySlug(propertySlug) {
  return (
    Object.entries(CALENDAR_PROPERTIES).find(
      ([, config]) => config.propertySlug === propertySlug,
    )?.[0] || null
  );
}

export function getSiteBaseUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:5000";
}

/**
 * Calendar sync configuration per property.
 */

export const AIRBNB_ICAL_AMBER_HOUSE =
  process.env.AIRBNB_ICAL_AMBER_HOUSE ||
  "https://www.airbnb.co.in/calendar/ical/1544236559464750907.ics?t=3a0f37bd6daf4590b22eb41e51e7b038";

export const AIRBNB_ICAL_ROOFTOP_SERENITY =
  process.env.AIRBNB_ICAL_ROOFTOP_SERENITY ||
  "https://www.airbnb.co.in/calendar/ical/1666598775797444713.ics?t=bdc1de1cdf68438ea4c2202108d863b6";

export const CALENDAR_PROPERTIES = {
  "property-1": {
    propertySlug: "amber-house",
    title: "Amber House",
    airbnbIcalUrl: AIRBNB_ICAL_AMBER_HOUSE,
  },
  "property-2": {
    propertySlug: "rooftop-serenity",
    title: "Rooftop Serenity",
    airbnbIcalUrl: AIRBNB_ICAL_ROOFTOP_SERENITY,
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
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:5000";
}

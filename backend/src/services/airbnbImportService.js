/**
 * Fetches and parses Airbnb .ics export calendars.
 */
import axios from "axios";
import ical from "node-ical";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

function normalizeSlug(calendarSlug) {
  return calendarSlug?.replace(/\.ics$/i, "") || "";
}

export async function fetchAirbnbBlockedRanges(airbnbIcalUrl, cacheKey) {
  if (!airbnbIcalUrl?.trim()) {
    return [];
  }

  const key = cacheKey || airbnbIcalUrl;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.ranges;
  }

  const response = await axios.get(airbnbIcalUrl, {
    timeout: 15000,
    responseType: "text",
    headers: { "User-Agent": "JosephsRetreat-CalendarSync/1.0" },
  });

  const parsed = ical.parseICS(response.data);
  const ranges = [];

  for (const event of Object.values(parsed)) {
    if (!event || event.type !== "VEVENT") continue;
    if (!event.start || !event.end) continue;

    ranges.push({
      start: new Date(event.start),
      end: new Date(event.end),
      summary: event.summary || "Airbnb blocked",
      source: "airbnb",
    });
  }

  cache.set(key, {
    ranges,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return ranges;
}

export function clearAirbnbCache(calendarSlug) {
  cache.delete(normalizeSlug(calendarSlug));
}

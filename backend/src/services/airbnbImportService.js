/**
 * Fetches and parses Airbnb .ics export calendars.
 * DATE-only events (VALUE=DATE:YYYYMMDD) are parsed as calendar dates in
 * CALENDAR_TIMEZONE — never via JS Date timezone math (avoids off-by-one nights).
 */
import axios from "axios";
import { parseCalendarDate } from "../utils/dateUtils.js";

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

function normalizeSlug(calendarSlug) {
  return calendarSlug?.replace(/\.ics$/i, "") || "";
}

function parseYyyymmdd(value) {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length !== 8) return null;
  return parseCalendarDate(
    `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`,
  );
}

/**
 * Parse Airbnb ICS text into blocked stay ranges [checkIn, checkOut) in IST.
 */
export function parseAirbnbIcsText(icsText) {
  const ranges = [];
  const eventBlocks = String(icsText).split("BEGIN:VEVENT").slice(1);

  for (const block of eventBlocks) {
    const body = block.split("END:VEVENT")[0] || block;
    const unfolded = body.replace(/\r\n[ \t]/g, "");

    const dtstartMatch = unfolded.match(
      /DTSTART(?:;[^:\r\n]+)?:(\d{8})(?:T\d{6}Z?)?/,
    );
    const dtendMatch = unfolded.match(
      /DTEND(?:;[^:\r\n]+)?:(\d{8})(?:T\d{6}Z?)?/,
    );

    if (!dtstartMatch || !dtendMatch) continue;

    const start = parseYyyymmdd(dtstartMatch[1]);
    const end = parseYyyymmdd(dtendMatch[1]);
    if (!start || !end) continue;

    const summaryMatch = unfolded.match(/SUMMARY:([^\r\n]+)/);
    const summary = summaryMatch?.[1]?.trim() || "Airbnb blocked";

    ranges.push({
      start,
      end,
      summary,
      source: "airbnb",
    });
  }

  return ranges;
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
    headers: {
      "User-Agent": "JosephsRetreat-CalendarSync/1.0",
      "Cache-Control": "no-cache",
    },
  });

  const ranges = parseAirbnbIcsText(response.data);

  cache.set(key, {
    ranges,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return ranges;
}

export function clearAirbnbCache(calendarSlug) {
  cache.delete(normalizeSlug(calendarSlug));
  cache.delete(calendarSlug);
}

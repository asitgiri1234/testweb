/**
 * Date helpers for availability and iCal sync.
 * All stay nights use CALENDAR_TIMEZONE (default Asia/Kolkata) so the API
 * matches what guests see in the DayPicker (local dates in India).
 */

const DEFAULT_TIMEZONE = "Asia/Kolkata";

export function getCalendarTimezone() {
  return process.env.CALENDAR_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
}

/** YYYY-MM-DD in the property calendar timezone. */
export function toDateString(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getCalendarTimezone(),
  }).format(new Date(date));
}

/**
 * Parse YYYY-MM-DD as midnight on that calendar day in CALENDAR_TIMEZONE.
 */
export function parseCalendarDate(dateStr) {
  const trimmed = String(dateStr).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (!match) {
    return startOfCalendarDay(new Date(dateStr));
  }

  const [, year, month, day] = match;
  const target = `${year}-${month}-${day}`;
  let utc = Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0);

  for (let attempt = 0; attempt < 72; attempt += 1) {
    const label = toDateString(new Date(utc));
    if (label === target) {
      return new Date(utc);
    }
    if (label < target) {
      utc += 60 * 60 * 1000;
    } else {
      utc -= 60 * 60 * 1000;
    }
  }

  return new Date(utc);
}

/** Start of the calendar day containing `date` (property timezone). */
export function startOfCalendarDay(date) {
  return parseCalendarDate(toDateString(date));
}

/** @deprecated Use startOfCalendarDay — kept for internal overlap math. */
export function startOfDay(date) {
  return startOfCalendarDay(date);
}

export function addDays(date, days) {
  const base = startOfCalendarDay(date);
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Hotel-style overlap: [checkIn, checkOut) nights */
export function rangesOverlap(startA, endA, startB, endB) {
  const aStart = startOfCalendarDay(startA).getTime();
  const aEnd = startOfCalendarDay(endA).getTime();
  const bStart = startOfCalendarDay(startB).getTime();
  const bEnd = startOfCalendarDay(endB).getTime();
  return aStart < bEnd && aEnd > bStart;
}

export function eachNightInRange(checkIn, checkOut) {
  const nights = [];
  let cursor = startOfCalendarDay(checkIn);
  const end = startOfCalendarDay(checkOut);

  while (cursor < end) {
    nights.push(toDateString(cursor));
    cursor = addDays(cursor, 1);
  }

  return nights;
}

export function expandRangeToDates(from, to) {
  if (!from || !to) return [];
  return eachNightInRange(from, to);
}

/**
 * Normalize API payload dates to calendar YYYY-MM-DD strings.
 */
export function normalizeStayDateInput(value) {
  if (!value) return null;
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  return toDateString(new Date(str));
}

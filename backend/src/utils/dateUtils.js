/**
 * Date helpers for availability and iCal sync.
 */

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateString(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** Hotel-style overlap: [checkIn, checkOut) nights */
export function rangesOverlap(startA, endA, startB, endB) {
  const aStart = startOfDay(startA).getTime();
  const aEnd = startOfDay(endA).getTime();
  const bStart = startOfDay(startB).getTime();
  const bEnd = startOfDay(endB).getTime();
  return aStart < bEnd && aEnd > bStart;
}

export function eachNightInRange(checkIn, checkOut) {
  const nights = [];
  let cursor = startOfDay(checkIn);
  const end = startOfDay(checkOut);

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

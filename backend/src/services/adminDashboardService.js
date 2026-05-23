/**
 * Host admin dashboard — revenue and upcoming stay summaries.
 */
import Booking from "../models/Booking.js";
import ManualBlock from "../models/ManualBlock.js";
import { CALENDAR_PROPERTIES } from "../config/calendarConfig.js";
import {
  parseCalendarDate,
  toDateString,
} from "../utils/dateUtils.js";

function getMonthBoundsInTimezone() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const startLabel = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endLabel = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  return {
    start: parseCalendarDate(startLabel),
    end: parseCalendarDate(endLabel),
    label: new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
  };
}

function serializeBookingSummary(booking) {
  const property =
    typeof booking.property === "object" && booking.property
      ? { title: booking.property.title, slug: booking.property.slug }
      : null;

  return {
    id: booking._id,
    property,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalAmount: booking.totalAmount,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
  };
}

export async function getAdminDashboard() {
  const today = parseCalendarDate(toDateString(new Date()));
  const { start: monthStart, end: monthEnd, label: monthLabel } =
    getMonthBoundsInTimezone();

  const paidConfirmedFilter = {
    paymentStatus: "paid",
    bookingStatus: { $ne: "cancelled" },
  };

  const [upcomingStays, revenueBookings, allPaidBookings, activeBlocks, nextStays] =
    await Promise.all([
      Booking.countDocuments({
        ...paidConfirmedFilter,
        checkOut: { $gt: today },
      }),
      Booking.find({
        ...paidConfirmedFilter,
        createdAt: { $gte: monthStart, $lt: monthEnd },
      }).select("totalAmount"),
      Booking.find(paidConfirmedFilter).select("totalAmount"),
      ManualBlock.countDocuments({ checkOut: { $gt: today } }),
      Booking.find({
        ...paidConfirmedFilter,
        checkIn: { $gte: today },
      })
        .populate("property", "title slug")
        .sort({ checkIn: 1 })
        .limit(6),
    ]);

  const revenueThisMonth = revenueBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0,
  );
  const revenueAllTime = allPaidBookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0,
  );

  const properties = Object.values(CALENDAR_PROPERTIES).map((config) => ({
    slug: config.propertySlug,
    title: config.title,
  }));

  return {
    monthLabel,
    stats: {
      upcomingStays,
      revenueThisMonth,
      revenueAllTime,
      paidBookingsCount: allPaidBookings.length,
      activeManualBlocks: activeBlocks,
    },
    upcomingBookings: nextStays.map(serializeBookingSummary),
    properties,
  };
}

/**
 * Razorpay order creation and payment signature verification.
 */
import crypto from "crypto";
import Booking from "../models/Booking.js";
import {
  getRazorpayClient,
  getRazorpayKeyId,
  getCheckoutConfigId,
  isRazorpayConfigured,
} from "../config/razorpay.js";
import { clearAirbnbCache } from "./airbnbImportService.js";
import { getCalendarSlugForPropertySlug } from "../config/calendarConfig.js";
import Property from "../models/Property.js";
import { sendBookingConfirmationEmails } from "./bookingEmailService.js";
import { getCheckoutSettingsForWebsite } from "./razorpayCheckoutService.js";

const MIN_AMOUNT_PAISE = 100;

function toPaise(amountInRupees) {
  return Math.round(Number(amountInRupees) * 100);
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
}

export async function createPaymentOrder(payload) {
  if (!isRazorpayConfigured()) {
    const error = new Error("Payment gateway is not configured");
    error.statusCode = 503;
    throw error;
  }

  const { bookingId, amount, currency = "INR", receipt } = payload;

  let amountPaise;
  let receiptId;
  let booking = null;

  if (bookingId) {
    booking = await Booking.findById(bookingId).populate(
      "property",
      "title slug",
    );

    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    if (booking.paymentStatus === "paid") {
      const error = new Error("This booking is already paid");
      error.statusCode = 400;
      throw error;
    }

    amountPaise = toPaise(booking.totalAmount);
    receiptId = `booking_${booking._id}`;
  } else {
    amountPaise = Number(amount);
    receiptId = receipt || `receipt_${Date.now()}`;
  }

  if (!Number.isFinite(amountPaise) || amountPaise < MIN_AMOUNT_PAISE) {
    const error = new Error(
      `Amount must be at least ${MIN_AMOUNT_PAISE} paise (₹1)`,
    );
    error.statusCode = 400;
    throw error;
  }

  const razorpay = getRazorpayClient();

  const orderPayload = {
    amount: amountPaise,
    currency: currency.toUpperCase(),
    receipt: String(receiptId).slice(0, 40),
  };

  const checkoutConfigId = getCheckoutConfigId();
  if (checkoutConfigId) {
    orderPayload.checkout_config_id = checkoutConfigId;
  }

  let order;
  try {
    order = await razorpay.orders.create(orderPayload);
  } catch (err) {
    const statusCode = err.statusCode === 401 ? 401 : 500;
    const error = new Error(
      err.error?.description || err.message || "Failed to create Razorpay order",
    );
    error.statusCode = statusCode;
    throw error;
  }

  if (booking) {
    booking.razorpayOrderId = order.id;
    await booking.save();
  }

  const checkoutSettings = await getCheckoutSettingsForWebsite();

  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: getRazorpayKeyId(),
    booking_id: booking?._id?.toString(),
    checkout_config_id: checkoutConfigId || undefined,
    checkout_mode: checkoutSettings.checkout_mode,
    checkout_ready: checkoutSettings.checkout_ready,
  };
}

async function clearCalendarCacheForBooking(booking) {
  const property = booking.property;
  const propertySlug =
    typeof property === "object" && property?.slug
      ? property.slug
      : (await Property.findById(booking.property))?.slug;

  const calendarSlug = propertySlug
    ? getCalendarSlugForPropertySlug(propertySlug)
    : null;
  if (calendarSlug) {
    clearAirbnbCache(calendarSlug);
  }
}

/**
 * Marks a booking paid + confirmed and locks calendar dates immediately.
 */
export async function confirmBookingPaid(booking, paymentDetails = {}) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = paymentDetails;

  if (booking.paymentStatus === "paid") {
    return booking;
  }

  if (razorpay_order_id) {
    booking.razorpayOrderId = razorpay_order_id;
  }
  if (razorpay_payment_id) {
    booking.razorpayPaymentId = razorpay_payment_id;
  }
  if (razorpay_signature) {
    booking.razorpaySignature = razorpay_signature;
  }

  booking.paymentStatus = "paid";
  booking.bookingStatus = "confirmed";
  await booking.save();
  await clearCalendarCacheForBooking(booking);

  sendBookingConfirmationEmails(booking).catch((err) => {
    console.error("[booking-email] Failed after payment confirm:", err);
  });

  return booking;
}

export async function verifyAndConfirmPayment(payload) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = payload;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error(
      "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!bookingId) {
    const error = new Error("bookingId is required");
    error.statusCode = 400;
    throw error;
  }

  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (!isValid) {
    const error = new Error("Payment signature verification failed");
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId).populate(
    "property",
    "title slug",
  );

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpay_order_id) {
    const error = new Error("Order ID does not match this booking");
    error.statusCode = 400;
    throw error;
  }

  return confirmBookingPaid(booking, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expected === signature;
}

/** Razorpay webhook backup — confirms booking if client verify fails after payment. */
export async function handleRazorpayWebhookEvent(event) {
  const eventName = event?.event;
  if (eventName !== "payment.captured" && eventName !== "order.paid") {
    return { handled: false, reason: "ignored_event" };
  }

  const paymentEntity =
    event?.payload?.payment?.entity || event?.payload?.payment;
  const orderId = paymentEntity?.order_id;
  const paymentId = paymentEntity?.id;

  if (!orderId || !paymentId) {
    return { handled: false, reason: "missing_payment_data" };
  }

  const booking = await Booking.findOne({ razorpayOrderId: orderId }).populate(
    "property",
    "title slug",
  );

  if (!booking) {
    return { handled: false, reason: "booking_not_found" };
  }

  if (booking.paymentStatus === "paid") {
    return { handled: true, bookingId: booking._id.toString(), alreadyPaid: true };
  }

  await confirmBookingPaid(booking, {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
  });

  return { handled: true, bookingId: booking._id.toString() };
}

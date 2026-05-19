/**
 * Razorpay client — credentials from environment only.
 */
import Razorpay from "razorpay";

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID?.trim() || "";
}

export function getRazorpayKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET?.trim() || "";
}

export function isRazorpayConfigured() {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

let razorpayInstance = null;

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    const error = new Error("Razorpay is not configured on the server");
    error.statusCode = 503;
    throw error;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: getRazorpayKeyId(),
      key_secret: getRazorpayKeySecret(),
    });
  }

  return razorpayInstance;
}

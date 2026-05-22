/**
 * Razorpay payment API — create order and verify payment.
 */
const API_URL = import.meta.env.VITE_API_URL || "/api";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Payment request failed");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export async function createPaymentOrder({ bookingId, amount, currency, receipt }) {
  const response = await fetch(`${API_URL}/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, amount, currency, receipt }),
  });
  return parseJsonResponse(response);
}

export async function verifyPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  bookingId,
}) {
  const response = await fetch(`${API_URL}/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    }),
  });
  return parseJsonResponse(response);
}

export async function fetchPaymentConfig() {
  const response = await fetch(`${API_URL}/payment-config`);
  return parseJsonResponse(response);
}

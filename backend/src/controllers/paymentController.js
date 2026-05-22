/**
 * Razorpay payment endpoints — create order and verify payment.
 */
import * as paymentService from "../services/paymentService.js";
import {
  getCheckoutConfigId,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "../config/razorpay.js";

export const createOrder = async (req, res, next) => {
  try {
    const result = await paymentService.createPaymentOrder(req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    return next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const booking = await paymentService.verifyAndConfirmPayment(req.body);

    return res.json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking: {
        id: booking._id,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        razorpayPaymentId: booking.razorpayPaymentId,
      },
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    return next(err);
  }
};

function getRazorpayKeyMode(keyId) {
  if (!keyId) return null;
  if (keyId.startsWith("rzp_live_")) return "live";
  if (keyId.startsWith("rzp_test_")) return "test";
  return "unknown";
}

export const getPaymentConfig = (req, res) => {
  const checkoutConfigId = getCheckoutConfigId();
  const keyId = isRazorpayConfigured() ? getRazorpayKeyId() : null;
  const keyMode = getRazorpayKeyMode(keyId);

  return res.json({
    success: true,
    configured: isRazorpayConfigured(),
    key_id: keyId,
    key_mode: keyMode,
    checkout_config_id: checkoutConfigId || null,
    uses_dashboard_payment_config: Boolean(checkoutConfigId),
    hint:
      checkoutConfigId && keyMode
        ? `Payment Configuration must be created in Razorpay ${keyMode.toUpperCase()} mode (same as your API keys). A test config ID will not work with rzp_live_ keys.`
        : null,
  });
};

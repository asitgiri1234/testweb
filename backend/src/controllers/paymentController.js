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

export const getPaymentConfig = (req, res) => {
  const checkoutConfigId = getCheckoutConfigId();

  return res.json({
    success: true,
    configured: isRazorpayConfigured(),
    key_id: isRazorpayConfigured() ? getRazorpayKeyId() : null,
    checkout_config_id: checkoutConfigId || null,
    uses_dashboard_payment_config: Boolean(checkoutConfigId),
  });
};

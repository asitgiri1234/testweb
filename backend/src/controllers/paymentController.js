/**
 * Razorpay payment endpoints — create order and verify payment.
 */
import * as paymentService from "../services/paymentService.js";
import { getCheckoutSettingsForWebsite } from "../services/razorpayCheckoutService.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody =
      typeof req.body === "string"
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString("utf8")
          : JSON.stringify(req.body);

    if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event =
      typeof req.body === "object" && !Buffer.isBuffer(req.body)
        ? req.body
        : JSON.parse(rawBody);

    const result = await paymentService.handleRazorpayWebhookEvent(event);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("[razorpay-webhook]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Webhook processing failed",
    });
  }
};

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

export const getPaymentConfig = async (req, res, next) => {
  try {
    const settings = await getCheckoutSettingsForWebsite();
    return res.json({ success: true, ...settings });
  } catch (err) {
    return next(err);
  }
};

/**
 * Razorpay Standard Checkout API routes.
 * POST /api/create-order
 * POST /api/verify-payment
 */
import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentConfig,
} from "../controllers/paymentController.js";
import { ensureDb } from "../middleware/ensureDb.js";

const router = express.Router();

router.get("/payment-config", getPaymentConfig);

router.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

export default router;

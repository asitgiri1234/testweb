import express from "express";
import {
  createBooking,
  verifyPayment,
  getBookingById,
} from "../controllers/bookingController.js";
import { ensureDb } from "../middleware/ensureDb.js";

const router = express.Router();

router.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
router.post("/", createBooking);

// POST /api/bookings/verify-payment
router.post("/verify-payment", verifyPayment);

// GET /api/bookings/:id
router.get("/:id", getBookingById);

export default router;

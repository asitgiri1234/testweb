import express from "express";
import {
  createBooking,
  verifyPayment,
  getBookingById,
} from "../controllers/bookingController.js";

const router = express.Router();

// POST /api/bookings
router.post("/", createBooking);

// POST /api/bookings/verify-payment
router.post("/verify-payment", verifyPayment);

// GET /api/bookings/:id
router.get("/:id", getBookingById);

export default router;

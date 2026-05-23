import express from "express";
import {
  createBooking,
  getBookingById,
  releaseBookingHold,
} from "../controllers/bookingController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
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

// POST /api/bookings/:id/release — cancel unpaid hold (payment dismissed)
router.post("/:id/release", releaseBookingHold);

// GET /api/bookings/:id — admin only
router.get("/:id", requireAdmin, getBookingById);

export default router;

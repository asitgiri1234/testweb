import express from "express";
import {
  cancelBooking,
  listBookings,
  login,
  me,
} from "../controllers/adminController.js";
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

router.post("/login", login);
router.get("/me", requireAdmin, me);
router.get("/bookings", requireAdmin, listBookings);
router.post("/bookings/:id/cancel", requireAdmin, cancelBooking);

export default router;

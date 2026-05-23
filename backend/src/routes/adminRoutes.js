import express from "express";
import {
  cancelBooking,
  createBlock,
  dashboard,
  emailGuest,
  listBlocks,
  listBookings,
  login,
  me,
  removeBlock,
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
router.get("/dashboard", requireAdmin, dashboard);
router.get("/bookings", requireAdmin, listBookings);
router.post("/bookings/:id/cancel", requireAdmin, cancelBooking);
router.post("/bookings/:id/email", requireAdmin, emailGuest);
router.get("/blocks", requireAdmin, listBlocks);
router.post("/blocks", requireAdmin, createBlock);
router.delete("/blocks/:id", requireAdmin, removeBlock);

export default router;

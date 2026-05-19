/**
 * Central route registry — mounts feature routes under /api
 */
import express from "express";
import propertyRoutes from "./propertyRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import contactRoutes from "./contactRoutes.js";
import calendarRoutes from "./calendarRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import { ensureDb } from "../middleware/ensureDb.js";

const router = express.Router();

router.use(paymentRoutes);

router.use(async (req, res, next) => {
  if (
    req.path.startsWith("/contact") ||
    req.path.startsWith("/calendar") ||
    req.path === "/payment-config"
  ) {
    return next();
  }
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

router.use("/calendar", calendarRoutes);
router.use("/properties", propertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/contact", contactRoutes);

export default router;

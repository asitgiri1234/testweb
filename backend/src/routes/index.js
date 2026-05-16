/**
 * Central route registry — mounts feature routes under /api
 */
import express from "express";
import propertyRoutes from "./propertyRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import contactRoutes from "./contactRoutes.js";

const router = express.Router();

router.use("/properties", propertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/contact", contactRoutes);

export default router;

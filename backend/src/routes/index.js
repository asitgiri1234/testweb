/**
 * Central route registry — mounts feature routes under /api
 */
import express from "express";
import propertyRoutes from "./propertyRoutes.js";
import bookingRoutes from "./bookingRoutes.js";

const router = express.Router();

router.use("/properties", propertyRoutes);
router.use("/bookings", bookingRoutes);

export default router;

import express from "express";
import {
  getAllProperties,
  getPropertyBySlug,
  getPropertyAvailability,
} from "../controllers/propertyController.js";

const router = express.Router();

// GET /api/properties
router.get("/", getAllProperties);

// More specific routes first (Express matches in order)
router.get("/:slug/availability", getPropertyAvailability);
router.get("/:slug", getPropertyBySlug);

export default router;

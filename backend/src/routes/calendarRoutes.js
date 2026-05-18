import express from "express";
import {
  exportCalendarIcs,
  getPropertyAvailability,
  getCalendarInfo,
} from "../controllers/calendarController.js";
import { ensureDb } from "../middleware/ensureDb.js";

const router = express.Router();

async function withDb(req, res, next) {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
}

/** GET /calendar/availability/amber-house */
router.get("/availability/:propertySlug", withDb, getPropertyAvailability);

/** GET /calendar/info/property-1 */
router.get("/info/:calendarSlug", getCalendarInfo);

/** GET /calendar/property-1.ics — Airbnb imports this (no DB required) */
router.get("/:calendarSlug", exportCalendarIcs);

export default router;

import express from "express";
import {
  exportCalendarIcs,
  getPropertyAvailability,
  getCalendarInfo,
} from "../controllers/calendarController.js";
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

/** GET /api/calendar/availability/amber-house */
router.get("/availability/:propertySlug", getPropertyAvailability);

/** GET /api/calendar/info/property-1 */
router.get("/info/:calendarSlug", getCalendarInfo);

/** GET /api/calendar/property-1.ics — paste this URL into Airbnb */
router.get("/:calendarSlug", exportCalendarIcs);

export default router;

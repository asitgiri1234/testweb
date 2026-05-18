/**
 * Calendar controller — ICS export and availability for Airbnb sync.
 */
import { generatePropertyIcs } from "../services/icsExportService.js";
import { getAvailabilityByPropertySlug } from "../services/availabilityService.js";
import { getCalendarConfig, getSiteBaseUrl } from "../config/calendarConfig.js";

export const exportCalendarIcs = async (req, res, next) => {
  try {
    const rawSlug = req.params.calendarSlug || "";
    const calendarSlug = rawSlug.replace(/\.ics$/i, "");

    const config = getCalendarConfig(calendarSlug);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: `Calendar not found: ${calendarSlug}`,
      });
    }

    const icsBody = await generatePropertyIcs(calendarSlug);

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${calendarSlug}.ics"`,
    );
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(icsBody);
  } catch (err) {
    return next(err);
  }
};

export const getPropertyAvailability = async (req, res, next) => {
  try {
    const { propertySlug } = req.params;
    const availability = await getAvailabilityByPropertySlug(propertySlug);

    return res.json({
      success: true,
      ...availability,
      exportUrl: availability.calendarSlug
        ? `${getSiteBaseUrl()}/api/calendar/${availability.calendarSlug}.ics`
        : null,
    });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    return next(err);
  }
};

export const getCalendarInfo = async (req, res) => {
  const calendarSlug = (req.params.calendarSlug || "").replace(/\.ics$/i, "");
  const config = getCalendarConfig(calendarSlug);

  if (!config) {
    return res.status(404).json({
      success: false,
      message: `Calendar not found: ${calendarSlug}`,
    });
  }

  return res.json({
    success: true,
    calendarSlug,
    propertySlug: config.propertySlug,
    title: config.title,
    hasAirbnbImport: Boolean(config.airbnbIcalUrl),
    exportUrl: `${getSiteBaseUrl()}/api/calendar/${calendarSlug}.ics`,
  });
};

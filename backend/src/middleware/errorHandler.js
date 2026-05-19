/**
 * Global error middleware
 */

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

function isCalendarIcsRequest(req) {
  return /\.ics$/i.test(req.path || req.originalUrl || "");
}

export const errorHandler = (err, req, res, next) => {
  if (isCalendarIcsRequest(req)) {
    const fallback =
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Josephs Retreat//Booking Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n";
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    return res.status(200).send(fallback);
  }

  if (err.message === "Not allowed by CORS") {
    console.warn(`CORS error for ${req.headers.origin}:`, err.message);
    return res.status(403).json({
      success: false,
      message: "Request blocked by CORS policy.",
    });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  const clientMessage =
    err.statusCode && err.message
      ? err.message
      : process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    code: err.code,
  });
};

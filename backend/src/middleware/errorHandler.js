/**
 * Global error middleware
 */

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    console.warn(`CORS error for ${req.headers.origin}:`, err.message);
    return res.status(403).json({
      success: false,
      message: "Request blocked by CORS policy.",
    });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong. Please try again."
        : err.message || "Internal server error",
  });
};

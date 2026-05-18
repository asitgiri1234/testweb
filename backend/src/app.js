/**
 * Express application setup.
 */
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

function buildAllowedOrigins() {
  const origins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  if (process.env.CLIENT_URL) {
    origins.add(process.env.CLIENT_URL.replace(/\/$/, ""));
  }
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL.replace(/\/$/, "")}`);
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(process.env.VERCEL_BRANCH_URL.replace(/\/$/, ""));
  }

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.has(normalized)) return true;
  if (normalized.endsWith(".vercel.app")) return true;
  return false;
}

app.use(express.json({ limit: "32kb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Vacation rental API is running",
    emailConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    calendars: {
      amberHouseExport: "/api/calendar/property-1.ics",
      amberHouseAvailability: "/api/calendar/availability/amber-house",
    },
  });
});

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

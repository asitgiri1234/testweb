/**
 * Express application setup.
 *
 * On Vercel, the backend service uses routePrefix "/api", so Express receives
 * paths WITHOUT the /api prefix (e.g. /calendar/property-1.ics).
 * Locally, routes are mounted at /api for the Vite proxy.
 */
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { validateMongoUri } from "./config/db.js";
import { isDbConfigured, tryEnsureDb } from "./middleware/ensureDb.js";

const app = express();
const IS_VERCEL = Boolean(process.env.VERCEL);
const API_MOUNT = IS_VERCEL ? "/" : "/api";

function buildAllowedOrigins() {
  const origins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  if (process.env.CLIENT_URL) {
    origins.add(process.env.CLIENT_URL.replace(/\/$/, ""));
  }
  if (process.env.SITE_URL) {
    origins.add(process.env.SITE_URL.replace(/\/$/, ""));
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

const webhookPath = IS_VERCEL ? "/razorpay/webhook" : "/api/razorpay/webhook";

app.post(
  webhookPath,
  express.raw({ type: "application/json" }),
  async (req, res, next) => {
    try {
      const { razorpayWebhook } = await import(
        "./controllers/paymentController.js"
      );
      const { ensureDb } = await import("./middleware/ensureDb.js");
      await ensureDb();
      return razorpayWebhook(req, res, next);
    } catch (err) {
      return next(err);
    }
  },
);

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

async function healthHandler(req, res) {
  const uriCheck = validateMongoUri();
  let databaseConnected = false;
  let databaseError = null;

  if (uriCheck.ok && isDbConfigured()) {
    databaseConnected = await tryEnsureDb();
    if (!databaseConnected) {
      databaseError =
        "Could not connect — use Standard mongodb:// URI with /vacation_rentals on Vercel backend env.";
    }
  } else {
    databaseError = uriCheck.message || "MONGODB_URI not set on backend service.";
  }

  res.json({
    status: "ok",
    message: "Vacation rental API is running",
    emailConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    razorpayConfigured: Boolean(
      process.env.RAZORPAY_KEY_ID?.trim() &&
        process.env.RAZORPAY_KEY_SECRET?.trim(),
    ),
    databaseConfigured: isDbConfigured() && uriCheck.ok,
    databaseConnected,
    databaseError,
    calendars: {
      amberHouseExport: "/api/calendar/property-1.ics",
      rooftopSerenityExport: "/api/calendar/property-2.ics",
      amberHouseAvailability: "/api/calendar/availability/amber-house",
      rooftopSerenityAvailability: "/api/calendar/availability/rooftop-serenity",
    },
  });
}

if (IS_VERCEL) {
  app.get("/health", healthHandler);
} else {
  app.get("/api/health", healthHandler);
}

app.use(API_MOUNT, apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

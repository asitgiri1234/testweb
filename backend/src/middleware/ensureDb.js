/**
 * Ensures MongoDB is connected (serverless-safe singleton).
 */
import mongoose from "mongoose";
import connectDB from "../config/db.js";

let connectionPromise = null;

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function ensureDb() {
  if (!isDbConfigured()) {
    const error = new Error(
      "Database is not configured. Set MONGODB_URI in your server environment.",
    );
    error.statusCode = 503;
    error.code = "DB_NOT_CONFIGURED";
    throw error;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = connectDB().catch((err) => {
      connectionPromise = null;

      const isConnectionFailure =
        err.name === "MongooseServerSelectionError" ||
        err.message?.includes("ECONNREFUSED") ||
        err.message?.includes("ENOTFOUND") ||
        err.message?.includes("querySrv");

      if (isConnectionFailure) {
        const uri = process.env.MONGODB_URI?.trim() || "";
        const hint = uri.startsWith("mongodb+srv://")
          ? " On Vercel, use the Atlas STANDARD connection string (mongodb://...shard hosts...) with /vacation_rentals and your real password — not mongodb+srv."
          : " Check Atlas Network Access (0.0.0.0/0) and that MONGODB_URI is on the backend service in Vercel.";
        const error = new Error(
          `Database is unreachable.${hint}`,
        );
        error.statusCode = 503;
        error.code = "DB_UNAVAILABLE";
        throw error;
      }

      throw err;
    });
  }

  return connectionPromise;
}

/** Connect when possible; returns false instead of throwing. */
export async function tryEnsureDb() {
  if (!isDbConfigured()) return false;
  try {
    await ensureDb();
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

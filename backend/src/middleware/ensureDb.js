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
        const error = new Error(
          "Database is unreachable. Start MongoDB locally or set a valid MONGODB_URI (e.g. MongoDB Atlas).",
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

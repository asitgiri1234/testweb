/**
 * Ensures MongoDB is connected (serverless-safe singleton).
 */
import mongoose from "mongoose";
import connectDB from "../config/db.js";

let connectionPromise = null;

export async function ensureDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = connectDB().catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }

  return connectionPromise;
}

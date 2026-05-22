/**
 * MongoDB connection using Mongoose.
 * URI comes from MONGODB_URI in environment.
 */
import "./dns.js";
import mongoose from "mongoose";

function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || "";
}

export function validateMongoUri(uri = getMongoUri()) {
  if (!uri) {
    return { ok: false, message: "MONGODB_URI is not set on the backend service." };
  }
  if (/[<>]/.test(uri) || uri.includes("db_password") || uri.includes("<password>")) {
    return {
      ok: false,
      message:
        "MONGODB_URI still contains a placeholder (<db_password>). Replace it with your real Atlas password.",
    };
  }
  if (uri.startsWith("mongodb+srv://") && !uri.includes(".mongodb.net")) {
    return { ok: false, message: "MONGODB_URI looks malformed — check the Atlas connection string." };
  }
  return { ok: true };
}

const connectDB = async () => {
  const uri = getMongoUri();
  const validation = validateMongoUri(uri);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log("MongoDB connected");
};

export default connectDB;

/**
 * MongoDB connection using Mongoose.
 * URI comes from MONGODB_URI in .env
 */
import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
  console.log("MongoDB connected");
};

export default connectDB;

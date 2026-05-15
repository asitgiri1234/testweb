/**
 * Express application setup.
 * Routes are mounted here; controllers handle business logic.
 */
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Parse JSON request bodies (needed for booking forms later)
app.use(express.json());

// Allow frontend (Vite) to call this API during development
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Health check — useful to verify the server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Vacation rental API is running" });
});

// All API routes live under /api
app.use("/api", apiRoutes);

// 404 and global error handling
app.use(notFound);
app.use(errorHandler);

export default app;

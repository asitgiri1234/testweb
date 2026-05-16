/**
 * Entry point — load env first, then start Express + MongoDB.
 */
import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      if (!process.env.RESEND_API_KEY?.trim()) {
        console.warn("WARNING: RESEND_API_KEY is not set — contact form emails will not send.");
      }
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });

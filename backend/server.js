/**
 * Entry point — load env first, then start Express (+ MongoDB when available).
 */
import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Host email: ${process.env.HOST_EMAIL || "asitkg03@gmail.com"}`);
    if (process.env.RESEND_API_KEY?.trim()) {
      console.log("Resend: configured");
    } else {
      console.warn("WARNING: RESEND_API_KEY is not set — contact form emails will not send.");
    }
  });
}

connectDB()
  .then(() => startServer())
  .catch((err) => {
    console.warn(`MongoDB unavailable (${err.message}) — starting API without database.`);
    startServer();
  });

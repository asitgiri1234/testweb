/**
 * Backend entry — exports Express for Vercel; listens locally when not on Vercel.
 */
import "dotenv/config";
import "./src/config/dns.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

export default app;

const PORT = process.env.PORT || 5000;

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Host email: ${process.env.HOST_EMAIL || "joeljoseph2003871@gmail.com"}`);
    if (process.env.RESEND_API_KEY?.trim()) {
      console.log("Resend: configured");
    } else {
      console.warn("WARNING: RESEND_API_KEY is not set — contact form emails will not send.");
    }
    if (
      process.env.RAZORPAY_KEY_ID?.trim() &&
      process.env.RAZORPAY_KEY_SECRET?.trim()
    ) {
      console.log("Razorpay: configured");
    } else {
      console.warn(
        "WARNING: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — online payments disabled.",
      );
    }
  });
}

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log("MongoDB ready — bookings and payments enabled.");
      startServer();
    })
    .catch((err) => {
      console.error(`MongoDB connection failed: ${err.message}`);
      console.error(
        "Fix: check MONGODB_URI in backend/.env, Atlas Network Access (0.0.0.0/0), and restart with npm run dev.",
      );
      if (process.env.MONGODB_URI?.trim()) {
        process.exit(1);
      }
      console.warn("No MONGODB_URI set — starting API without database.");
      startServer();
    });
}

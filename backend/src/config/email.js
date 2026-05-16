/**
 * Resend email client and shared mail configuration.
 * Requires RESEND_API_KEY in environment (loaded via dotenv before app imports).
 */
import { Resend } from "resend";

let resendClient = null;

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export const emailConfig = {
  get hostEmail() {
    return process.env.HOST_EMAIL?.trim() || "joeljoseph2003871@gmail.com";
  },
  get fromAddress() {
    return (
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "Joseph's Retreat <onboarding@resend.dev>"
    );
  },
  get siteName() {
    return process.env.SITE_NAME?.trim() || "Joseph's Retreat";
  },
};

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && emailConfig.fromAddress);
}

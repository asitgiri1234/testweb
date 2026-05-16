/**
 * Build and open a mailto link to the host — no third-party API required
 */
import { siteConfig } from "../config/siteConfig.js";

export function buildContactMailto({ name, email, property, message }) {
  const subject = `${siteConfig.name} — Inquiry from ${name} (${property})`;
  const body = [
    `Guest name: ${name}`,
    `Guest email: ${email}`,
    `Property: ${property}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const params = new URLSearchParams({
    subject,
    body,
    cc: email,
  });

  return `mailto:${siteConfig.hostEmail}?${params.toString()}`;
}

/** Open the user's default email app with the inquiry pre-filled */
export function sendContactViaEmail(formData) {
  const mailtoUrl = buildContactMailto(formData);
  const link = document.createElement("a");
  link.href = mailtoUrl;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

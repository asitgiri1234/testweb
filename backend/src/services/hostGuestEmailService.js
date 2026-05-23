/**
 * Host → guest email from admin dashboard.
 */
import Booking from "../models/Booking.js";
import {
  emailConfig,
  getResendClient,
  isEmailConfigured,
} from "../config/email.js";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendHostMessageToGuest(bookingId, { subject, message }, hostEmail) {
  if (!isEmailConfigured()) {
    const error = new Error(
      "Email is not configured on the server. Add RESEND_API_KEY to enable guest emails.",
    );
    error.statusCode = 503;
    throw error;
  }

  const booking = await Booking.findById(bookingId).populate(
    "property",
    "title slug",
  );

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (!booking.guestEmail) {
    const error = new Error("This booking has no guest email");
    error.statusCode = 400;
    throw error;
  }

  const trimmedSubject = subject?.trim();
  const trimmedMessage = message?.trim();

  if (!trimmedSubject || !trimmedMessage) {
    const error = new Error("Subject and message are required");
    error.statusCode = 400;
    throw error;
  }

  const propertyTitle =
    typeof booking.property === "object" && booking.property?.title
      ? booking.property.title
      : "your stay";

  const { hostName, hostEmail: defaultHostEmail, hostPhone } = emailConfig;
  const phoneDisplay = `+91 ${hostPhone.replace(/^\+?91/, "")}`;

  const checkIn = new Date(booking.checkIn).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const checkOut = new Date(booking.checkOut).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const text = [
    `Dear ${booking.guestName},`,
    "",
    trimmedMessage,
    "",
    `Your reservation: ${propertyTitle}`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    booking._id ? `Reference: ${booking._id}` : "",
    "",
    `${hostName}`,
    defaultHostEmail,
    phoneDisplay,
    emailConfig.siteName,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #1c1917; line-height: 1.65;">
      <p style="margin: 0 0 16px;">Dear ${escapeHtml(booking.guestName)},</p>
      <div style="margin: 0 0 20px; white-space: pre-wrap;">${escapeHtml(trimmedMessage).replace(/\n/g, "<br />")}</div>
      <p style="margin: 0 0 8px; font-size: 13px; color: #78716c;">Your reservation</p>
      <p style="margin: 0 0 4px;"><strong>${escapeHtml(propertyTitle)}</strong></p>
      <p style="margin: 0 0 16px; font-size: 14px;">${escapeHtml(checkIn)} → ${escapeHtml(checkOut)}</p>
      <p style="margin: 0; font-size: 14px;">
        <strong>${escapeHtml(hostName)}</strong><br />
        <a href="mailto:${escapeHtml(defaultHostEmail)}">${escapeHtml(defaultHostEmail)}</a><br />
        ${escapeHtml(phoneDisplay)}
      </p>
      <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">${escapeHtml(emailConfig.siteName)}</p>
    </div>
  `;

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: emailConfig.fromAddress,
    to: [booking.guestEmail],
    replyTo: hostEmail || defaultHostEmail,
    subject: trimmedSubject,
    text,
    html,
  });

  if (result.error) {
    const error = new Error(result.error.message || "Failed to send email");
    error.statusCode = 502;
    throw error;
  }

  return {
    sent: true,
    to: booking.guestEmail,
    messageId: result.data?.id,
  };
}

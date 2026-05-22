/**
 * Booking confirmation emails — guest receipt + host notification (Resend).
 */
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

function formatInr(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatStayDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function getPropertyTitle(booking) {
  const property = booking.property;
  if (typeof property === "object" && property?.title) {
    return property.title;
  }
  return "Your stay";
}

function buildBookingDetails(booking) {
  const propertyTitle = getPropertyTitle(booking);
  const reference = String(booking._id);
  const checkIn = formatStayDate(booking.checkIn);
  const checkOut = formatStayDate(booking.checkOut);
  const total = formatInr(booking.totalAmount);
  const nights = booking.nights;
  const guests = booking.guests;

  return {
    propertyTitle,
    reference,
    checkIn,
    checkOut,
    total,
    nights,
    guests,
  };
}

function buildGuestConfirmationEmail(booking) {
  const { siteName } = emailConfig;
  const d = buildBookingDetails(booking);
  const subject = `${siteName} — Booking confirmed at ${d.propertyTitle}`;

  const text = [
    `Hi ${booking.guestName},`,
    "",
    `Your payment was received and your stay is confirmed.`,
    "",
    `Property: ${d.propertyTitle}`,
    `Booking reference: ${d.reference}`,
    `Check-in: ${d.checkIn}`,
    `Check-out: ${d.checkOut}`,
    `Nights: ${d.nights}`,
    `Guests: ${d.guests}`,
    `Total paid: ${d.total}`,
    booking.razorpayPaymentId
      ? `Payment ID: ${booking.razorpayPaymentId}`
      : "",
    "",
    `We look forward to hosting you.`,
    "",
    siteName,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #222;">
      <h2 style="margin: 0 0 8px;">Booking confirmed</h2>
      <p style="margin: 0 0 20px; color: #444;">Hi ${escapeHtml(booking.guestName)}, your payment was received. Your stay at <strong>${escapeHtml(d.propertyTitle)}</strong> is confirmed.</p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Reference</td><td><strong>${escapeHtml(d.reference)}</strong></td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Check-in</td><td>${escapeHtml(d.checkIn)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Check-out</td><td>${escapeHtml(d.checkOut)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Nights</td><td>${d.nights}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Guests</td><td>${d.guests}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Total paid</td><td><strong>${escapeHtml(d.total)}</strong></td></tr>
        ${
          booking.razorpayPaymentId
            ? `<tr><td style="padding: 6px 12px 6px 0; color: #717171;">Payment ID</td><td style="font-size: 13px;">${escapeHtml(booking.razorpayPaymentId)}</td></tr>`
            : ""
        }
      </table>
      <p style="margin: 0; color: #444;">We look forward to hosting you.</p>
      <p style="margin-top: 24px; font-size: 12px; color: #717171;">${escapeHtml(siteName)}</p>
    </div>
  `;

  return { subject, text, html };
}

function buildHostNotificationEmail(booking) {
  const { siteName } = emailConfig;
  const d = buildBookingDetails(booking);
  const subject = `${siteName} — New paid booking: ${d.propertyTitle}`;

  const text = [
    `New confirmed booking (payment received).`,
    "",
    `Property: ${d.propertyTitle}`,
    `Booking reference: ${d.reference}`,
    `Guest: ${booking.guestName}`,
    `Email: ${booking.guestEmail}`,
    booking.guestPhone ? `Phone: ${booking.guestPhone}` : "",
    `Check-in: ${d.checkIn}`,
    `Check-out: ${d.checkOut}`,
    `Nights: ${d.nights}`,
    `Guests: ${d.guests}`,
    `Total: ${d.total}`,
    booking.razorpayPaymentId
      ? `Payment ID: ${booking.razorpayPaymentId}`
      : "",
    "",
    `Reply to the guest at ${booking.guestEmail}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #222;">
      <h2 style="margin: 0 0 8px;">New paid booking</h2>
      <p style="margin: 0 0 20px; color: #444;">A guest completed payment for <strong>${escapeHtml(d.propertyTitle)}</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Reference</td><td><strong>${escapeHtml(d.reference)}</strong></td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Guest</td><td><strong>${escapeHtml(booking.guestName)}</strong></td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Email</td><td><a href="mailto:${escapeHtml(booking.guestEmail)}">${escapeHtml(booking.guestEmail)}</a></td></tr>
        ${
          booking.guestPhone
            ? `<tr><td style="padding: 6px 12px 6px 0; color: #717171;">Phone</td><td>${escapeHtml(booking.guestPhone)}</td></tr>`
            : ""
        }
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Check-in</td><td>${escapeHtml(d.checkIn)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Check-out</td><td>${escapeHtml(d.checkOut)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Nights</td><td>${d.nights}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Guests</td><td>${d.guests}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Total</td><td><strong>${escapeHtml(d.total)}</strong></td></tr>
        ${
          booking.razorpayPaymentId
            ? `<tr><td style="padding: 6px 12px 6px 0; color: #717171;">Payment ID</td><td style="font-size: 13px;">${escapeHtml(booking.razorpayPaymentId)}</td></tr>`
            : ""
        }
      </table>
      <p style="margin: 0; font-size: 12px; color: #717171;">Reply to the guest at ${escapeHtml(booking.guestEmail)}.</p>
    </div>
  `;

  return { subject, text, html };
}

/**
 * Sends confirmation to guest and notification to host. Never throws — logs on failure.
 */
export async function sendBookingConfirmationEmails(booking) {
  if (!isEmailConfigured()) {
    console.warn(
      "[booking-email] Skipped — RESEND_API_KEY not set. Add it in backend env (Vercel or .env).",
    );
    return { sent: false, reason: "not_configured" };
  }

  const resend = getResendClient();
  if (!resend) {
    return { sent: false, reason: "no_client" };
  }

  const guestMail = buildGuestConfirmationEmail(booking);
  const hostMail = buildHostNotificationEmail(booking);
  const requestId = `booking-${booking._id}`;

  try {
    const [guestResult, hostResult] = await Promise.all([
      resend.emails.send({
        from: emailConfig.fromAddress,
        to: [booking.guestEmail],
        subject: guestMail.subject,
        text: guestMail.text,
        html: guestMail.html,
      }),
      resend.emails.send({
        from: emailConfig.fromAddress,
        to: [emailConfig.hostEmail],
        replyTo: booking.guestEmail,
        subject: hostMail.subject,
        text: hostMail.text,
        html: hostMail.html,
      }),
    ]);

    if (guestResult.error) {
      console.error(
        `[${requestId}] Guest email failed:`,
        JSON.stringify(guestResult.error),
      );
    } else {
      console.log(
        `[${requestId}] Guest confirmation sent to ${booking.guestEmail} (${guestResult.data?.id})`,
      );
    }

    if (hostResult.error) {
      console.error(
        `[${requestId}] Host email failed:`,
        JSON.stringify(hostResult.error),
      );
    } else {
      console.log(
        `[${requestId}] Host notification sent to ${emailConfig.hostEmail} (${hostResult.data?.id})`,
      );
    }

    const ok = !guestResult.error && !hostResult.error;
    return { sent: ok, guestId: guestResult.data?.id, hostId: hostResult.data?.id };
  } catch (err) {
    console.error(`[${requestId}] Unexpected email error:`, err);
    return { sent: false, reason: err.message };
  }
}

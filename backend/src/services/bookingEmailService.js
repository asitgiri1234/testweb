/**
 * Booking confirmation emails â€” guest receipt + host notification (Resend).
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
  return `â‚¹${Number(amount).toLocaleString("en-IN")}`;
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

function buildHostContactBlock() {
  const { hostName, hostEmail, hostPhone } = emailConfig;
  return {
    hostName,
    hostEmail,
    hostPhone,
    hostPhoneDisplay: `+91 ${hostPhone.replace(/^\+?91/, "")}`,
  };
}

function buildGuestConfirmationEmail(booking) {
  const { siteName } = emailConfig;
  const host = buildHostContactBlock();
  const d = buildBookingDetails(booking);
  const subject = `${siteName} â€” Your stay at ${d.propertyTitle} is confirmed`;

  const text = [
    `Dear ${booking.guestName},`,
    "",
    `Thank you for choosing ${siteName}. Your payment has been received and your reservation is confirmed.`,
    "",
    `Stay details`,
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
    `Your host`,
    `${host.hostName}`,
    `Email: ${host.hostEmail}`,
    `Phone: ${host.hostPhoneDisplay}`,
    "",
    `If you have any questions before your arrival, please reach out directly â€” we are happy to help with directions, check-in, or special requests.`,
    "",
    `We look forward to welcoming you.`,
    "",
    `Warm regards,`,
    `${host.hostName}`,
    siteName,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; color: #1c1917; line-height: 1.6;">
      <p style="font-family: system-ui, sans-serif; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #78716c; margin: 0 0 12px;">Booking confirmed</p>
      <h2 style="margin: 0 0 16px; font-weight: 500;">Thank you for your reservation</h2>
      <p style="margin: 0 0 20px; font-family: system-ui, sans-serif; color: #44403c;">Dear ${escapeHtml(booking.guestName)},</p>
      <p style="margin: 0 0 20px; font-family: system-ui, sans-serif; color: #44403c;">Thank you for choosing <strong>${escapeHtml(siteName)}</strong>. Your payment has been received and your stay at <strong>${escapeHtml(d.propertyTitle)}</strong> is confirmed.</p>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 24px; font-family: system-ui, sans-serif; font-size: 14px;">
        <tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Reference</td><td><strong>${escapeHtml(d.reference)}</strong></td></tr>
        <tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Check-in</td><td>${escapeHtml(d.checkIn)}</td></tr>
        <tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Check-out</td><td>${escapeHtml(d.checkOut)}</td></tr>
        <tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Nights</td><td>${d.nights}</td></tr>
        <tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Guests</td><td>${d.guests}</td></tr>
        <tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Total paid</td><td><strong>${escapeHtml(d.total)}</strong></td></tr>
        ${
          booking.razorpayPaymentId
            ? `<tr><td style="padding: 8px 12px 8px 0; color: #78716c;">Payment ID</td><td style="font-size: 13px;">${escapeHtml(booking.razorpayPaymentId)}</td></tr>`
            : ""
        }
      </table>
      <div style="margin-bottom: 24px; padding: 20px; background: #f5f4f2; border-radius: 12px; border: 1px solid rgba(28,25,23,0.08);">
        <p style="margin: 0 0 8px; font-family: system-ui, sans-serif; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #78716c;">Your host</p>
        <p style="margin: 0 0 4px; font-size: 18px; font-weight: 500;">${escapeHtml(host.hostName)}</p>
        <p style="margin: 0; font-family: system-ui, sans-serif; font-size: 14px; color: #44403c;">
          <a href="mailto:${escapeHtml(host.hostEmail)}" style="color: #1c1917;">${escapeHtml(host.hostEmail)}</a><br />
          <a href="tel:+91${escapeHtml(host.hostPhone.replace(/^\+?91/, ""))}" style="color: #1c1917;">${escapeHtml(host.hostPhoneDisplay)}</a>
        </p>
      </div>
      <p style="margin: 0 0 8px; font-family: system-ui, sans-serif; color: #44403c;">If you have any questions before your arrival, please reach out directly â€” we are happy to help with directions, check-in, or special requests.</p>
      <p style="margin: 16px 0 0; font-family: system-ui, sans-serif; color: #44403c;">We look forward to welcoming you.</p>
      <p style="margin-top: 24px; font-family: system-ui, sans-serif; font-size: 13px; color: #78716c;">Warm regards,<br /><strong>${escapeHtml(host.hostName)}</strong><br />${escapeHtml(siteName)}</p>
    </div>
  `;

  return { subject, text, html };
}

function buildHostNotificationEmail(booking) {
  const { siteName } = emailConfig;
  const d = buildBookingDetails(booking);
  const subject = `${siteName} â€” New paid booking: ${d.propertyTitle}`;

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
 * Sends confirmation to guest and notification to host. Never throws â€” logs on failure.
 */
export async function sendBookingConfirmationEmails(booking) {
  if (!isEmailConfigured()) {
    console.warn(
      "[booking-email] Skipped â€” RESEND_API_KEY not set. Add it in backend env (Vercel or .env).",
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
        replyTo: emailConfig.hostEmail,
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

function buildGuestCancellationEmail(booking, { wasPaid }) {
  const { siteName } = emailConfig;
  const host = buildHostContactBlock();
  const d = buildBookingDetails(booking);
  const reason =
    booking.cancellationReason?.trim() ||
    "We are unable to host you for these dates.";

  const subject = `${siteName} — Your reservation at ${d.propertyTitle} has been cancelled`;

  const text = [
    `Dear ${booking.guestName},`,
    "",
    `Your reservation at ${d.propertyTitle} has been cancelled.`,
    "",
    `Reference: ${d.reference}`,
    `Check-in: ${d.checkIn}`,
    `Check-out: ${d.checkOut}`,
    "",
    reason,
    wasPaid ? "\nIf you paid online, your host will process any refund due." : "",
    "",
    `Contact: ${host.hostName} — ${host.hostEmail} — ${host.hostPhoneDisplay}`,
    "",
    siteName,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<div style="font-family: system-ui, sans-serif; max-width: 560px; color: #222; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Reservation cancelled</h2>
      <p>Dear ${escapeHtml(booking.guestName)}, your stay at <strong>${escapeHtml(d.propertyTitle)}</strong> has been cancelled.</p>
      <p><strong>${escapeHtml(d.checkIn)}</strong> → <strong>${escapeHtml(d.checkOut)}</strong></p>
      <p style="background:#f5f4f2;padding:12px 16px;border-radius:8px;">${escapeHtml(reason)}</p>
      ${wasPaid ? "<p>If you paid online, your host will process any refund due.</p>" : ""}
      <p>Contact: ${escapeHtml(host.hostName)} — <a href="mailto:${escapeHtml(host.hostEmail)}">${escapeHtml(host.hostEmail)}</a> — ${escapeHtml(host.hostPhoneDisplay)}</p>
    </div>`;

  return { subject, text, html };
}

export async function sendBookingCancellationEmails(booking, { wasPaid = false } = {}) {
  if (!isEmailConfigured()) {
    console.warn("[booking-email] Cancellation skipped — RESEND_API_KEY not set.");
    return { sent: false, reason: "not_configured" };
  }

  const resend = getResendClient();
  if (!resend) return { sent: false, reason: "no_client" };

  const guestMail = buildGuestCancellationEmail(booking, { wasPaid });
  const requestId = `cancel-${booking._id}`;

  try {
    const guestResult = await resend.emails.send({
      from: emailConfig.fromAddress,
      to: [booking.guestEmail],
      replyTo: emailConfig.hostEmail,
      subject: guestMail.subject,
      text: guestMail.text,
      html: guestMail.html,
    });

    if (guestResult.error) {
      console.error(`[${requestId}] Guest cancellation email failed:`, guestResult.error);
      return { sent: false, reason: guestResult.error.message };
    }

    return { sent: true, guestId: guestResult.data?.id };
  } catch (err) {
    console.error(`[${requestId}] Cancellation email error:`, err);
    return { sent: false, reason: err.message };
  }
}

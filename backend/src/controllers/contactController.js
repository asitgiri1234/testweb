/**
 * Contact form — validates enquiry and sends via Resend to the host inbox.
 */
import { emailConfig, getResendClient, isEmailConfigured } from "../config/email.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateContactBody(body) {
  const errors = [];
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const property = body.property?.trim() ?? "General inquiry";

  if (!name || name.length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (name.length > 100) {
    errors.push("Name must be under 100 characters.");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push("A valid email address is required.");
  }
  if (!phone || !PHONE_REGEX.test(phone)) {
    errors.push("A valid phone number is required (7–20 digits).");
  }
  if (!message || message.length < 10) {
    errors.push("Message must be at least 10 characters.");
  }
  if (message.length > 5000) {
    errors.push("Message must be under 5000 characters.");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: { name, email, phone, message, property },
  };
}

function buildEnquiryEmail({ name, email, phone, message, property }) {
  const { siteName } = emailConfig;
  const subject = `${siteName} — Enquiry from ${name}${property !== "General inquiry" ? ` (${property})` : ""}`;

  const text = [
    `New enquiry for ${siteName}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Property: ${property}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #222;">
      <h2 style="margin: 0 0 16px;">New enquiry — ${escapeHtml(siteName)}</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Name</td><td><strong>${escapeHtml(name)}</strong></td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Phone</td><td>${escapeHtml(phone)}</td></tr>
        <tr><td style="padding: 6px 12px 6px 0; color: #717171;">Property</td><td>${escapeHtml(property)}</td></tr>
      </table>
      <h3 style="margin: 20px 0 8px;">Message</h3>
      <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
      <p style="margin-top: 24px; font-size: 12px; color: #717171;">Reply to this email to respond directly to the guest.</p>
    </div>
  `;

  return { subject, text, html };
}

export const sendContactMessage = async (req, res, next) => {
  const requestId = `contact-${Date.now()}`;

  try {
    console.log(`[${requestId}] Contact enquiry received`);

    const validation = validateContactBody(req.body);
    if (!validation.ok) {
      console.warn(`[${requestId}] Validation failed:`, validation.errors);
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    if (!isEmailConfigured()) {
      console.error(`[${requestId}] Resend not configured — missing RESEND_API_KEY`);
      return res.status(503).json({
        success: false,
        message:
          "Email service is not configured. Add RESEND_API_KEY to backend/.env and restart the server.",
      });
    }

    const resend = getResendClient();
    const { name, email, phone, message, property } = validation.data;
    const { subject, text, html } = buildEnquiryEmail(validation.data);

    console.log(`[${requestId}] Sending to host: ${emailConfig.hostEmail}`);

    const { data, error } = await resend.emails.send({
      from: emailConfig.fromAddress,
      to: [emailConfig.hostEmail],
      replyTo: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`[${requestId}] Resend API error:`, JSON.stringify(error, null, 2));
      const detail = error.message || error.name || "Unknown Resend error";
      return res.status(502).json({
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Unable to deliver your message. Please try again in a few minutes."
            : `Email delivery failed: ${detail}`,
      });
    }

    console.log(`[${requestId}] Email sent successfully. Resend id: ${data?.id}`);

    return res.status(200).json({
      success: true,
      message: "Your enquiry has been sent. The host will reply to your email shortly.",
    });
  } catch (err) {
    console.error(`[${requestId}] Unexpected error:`, err);
    return next(err);
  }
};

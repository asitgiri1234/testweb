/**
 * Contact form — sends guest inquiries to the host inbox via SMTP
 */
import nodemailer from "nodemailer";

const HOST_EMAIL = process.env.HOST_EMAIL || "joeljoseph2003871@gmail.com";
const SITE_NAME = process.env.SITE_NAME || "Joseph's Retreat";

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
}

export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, property, message } = req.body;

    if (!name?.trim() || !email?.trim() || !property?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({
        success: false,
        message: "Email service is not configured. Contact the site administrator.",
      });
    }

    const guestName = name.trim();
    const guestEmail = email.trim();
    const propertyName = property.trim();
    const guestMessage = message.trim();

    await transporter.sendMail({
      from: `"${SITE_NAME}" <${process.env.SMTP_USER}>`,
      to: HOST_EMAIL,
      replyTo: `"${guestName}" <${guestEmail}>`,
      subject: `${SITE_NAME} — Inquiry from ${guestName} (${propertyName})`,
      text: [
        `New inquiry for ${SITE_NAME}`,
        "",
        `Guest name: ${guestName}`,
        `Guest email: ${guestEmail}`,
        `Property: ${propertyName}`,
        "",
        "Message:",
        guestMessage,
      ].join("\n"),
      html: `
        <h2>New inquiry for ${SITE_NAME}</h2>
        <p><strong>Guest name:</strong> ${guestName}</p>
        <p><strong>Guest email:</strong> <a href="mailto:${guestEmail}">${guestEmail}</a></p>
        <p><strong>Property:</strong> ${propertyName}</p>
        <p><strong>Message:</strong></p>
        <p>${guestMessage.replace(/\n/g, "<br>")}</p>
      `,
    });

    res.json({
      success: true,
      message: "Your message has been sent to the host.",
    });
  } catch (err) {
    console.error("Contact email error:", err);
    next(err);
  }
};

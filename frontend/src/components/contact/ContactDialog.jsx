/**
 * Contact host modal — sends enquiries via backend + Resend
 */
import { useEffect, useRef, useState } from "react";
import { submitContactEnquiry } from "../../api/contact.js";
import { siteConfig } from "../../config/siteConfig.js";
import "./ContactDialog.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  property: "",
  message: "",
};

function ContactDialog({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedEmail, setSubmittedEmail] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setErrorMessage("");
      setFieldErrors({});
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && status !== "sending") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateClient = () => {
    const errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.phone.trim())) {
      errors.phone = "Enter a valid phone number.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateClient()) return;

    setStatus("sending");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      property: form.property || "General inquiry",
      message: form.message.trim(),
    };

    try {
      await submitContactEnquiry(payload);
      setSubmittedEmail(payload.email);
      setStatus("success");
      setForm(INITIAL_FORM);
      setErrorMessage("");
    } catch (err) {
      setStatus("error");
      if (err.message === "Failed to fetch") {
        setErrorMessage(
          "Could not reach the server. Start the backend (npm run dev in /backend) and try again."
        );
      } else {
        setErrorMessage(err.message);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && status !== "sending") onClose();
  };

  if (!isOpen) return null;

  const isSending = status === "sending";

  return (
    <div
      className="contact-dialog-backdrop"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="contact-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className="contact-dialog__close"
          onClick={onClose}
          disabled={isSending}
          aria-label="Close contact form"
        >
          &times;
        </button>

        <header className="contact-dialog__header">
          <p className="contact-dialog__eyebrow">{siteConfig.name}</p>
          <h2 id="contact-dialog-title">Compose your enquiry</h2>
          <p className="contact-dialog__subtitle">
            Your message shall be received at{" "}
            <a href={`mailto:${siteConfig.hostEmail}`}>{siteConfig.hostEmail}</a>
          </p>
        </header>

        {status === "success" ? (
          <div className="contact-dialog__success" role="status">
            <p className="contact-dialog__success-title">Enquiry received</p>
            <p>
              Thank you. {siteConfig.hostName} shall respond with care at{" "}
              <strong>{submittedEmail}</strong>.
            </p>
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="contact-dialog__form" onSubmit={handleSubmit} noValidate>
            <div className="contact-dialog__field">
              <label htmlFor="contact-name">Your name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                disabled={isSending}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
              />
              {fieldErrors.name && (
                <span id="contact-name-error" className="contact-dialog__field-error">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-email">Your email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@email.com"
                disabled={isSending}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
              />
              {fieldErrors.email && (
                <span id="contact-email-error" className="contact-dialog__field-error">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-phone">Phone number</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+91 98765 43210"
                disabled={isSending}
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined}
              />
              {fieldErrors.phone && (
                <span id="contact-phone-error" className="contact-dialog__field-error">
                  {fieldErrors.phone}
                </span>
              )}
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-property">Property (optional)</label>
              <select
                id="contact-property"
                name="property"
                value={form.property}
                onChange={handleChange}
                disabled={isSending}
              >
                <option value="">General inquiry</option>
                {siteConfig.properties.map((p) => (
                  <option key={p.id} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-message">Your message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Dates, number of guests, questions…"
                disabled={isSending}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
              />
              {fieldErrors.message && (
                <span id="contact-message-error" className="contact-dialog__field-error">
                  {fieldErrors.message}
                </span>
              )}
            </div>

            {status === "error" && errorMessage && (
              <p className="contact-dialog__error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="contact-dialog__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isSending}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={isSending}>
                {isSending ? (
                  <>
                    <span className="contact-dialog__spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Send enquiry"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactDialog;

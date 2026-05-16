/**
 * Contact host modal — opens the guest's email app to send directly to the host
 */
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../../config/siteConfig.js";
import { sendContactViaEmail } from "../../utils/contactEmail.js";
import "./ContactDialog.css";

function ContactDialog({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setErrorMessage("");
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = e.target;
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      property: form.property.value,
      message: form.message.value.trim(),
    };

    try {
      sendContactViaEmail(data);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(
        "Could not open your email app. Please email the host directly using the address below."
      );
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

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
          aria-label="Close contact form"
        >
          &times;
        </button>

        <header className="contact-dialog__header">
          <p className="contact-dialog__eyebrow">{siteConfig.name}</p>
          <h2 id="contact-dialog-title">Send a request to the host</h2>
          <p className="contact-dialog__subtitle">
            Messages are sent to{" "}
            <a href={`mailto:${siteConfig.hostEmail}`}>{siteConfig.hostEmail}</a>
          </p>
        </header>

        {status === "success" ? (
          <div className="contact-dialog__success">
            <p className="contact-dialog__success-title">Email app opened</p>
            <p>
              Your message is ready in your email app. Tap <strong>Send</strong> to deliver it to{" "}
              {siteConfig.hostName} at {siteConfig.hostEmail}.
            </p>
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="contact-dialog__form" onSubmit={handleSubmit}>
            <div className="contact-dialog__field">
              <label htmlFor="contact-name">Your name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                placeholder="Your full name"
                disabled={status === "sending"}
              />
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-email">Your email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="you@email.com"
                disabled={status === "sending"}
              />
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-property">Property</label>
              <select
                id="contact-property"
                name="property"
                required
                defaultValue=""
                disabled={status === "sending"}
              >
                <option value="" disabled>
                  Select a property
                </option>
                {siteConfig.properties.map((p) => (
                  <option key={p.id} value={p.label}>
                    {p.label}
                  </option>
                ))}
                <option value="General inquiry">General inquiry</option>
              </select>
            </div>

            <div className="contact-dialog__field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                placeholder="Dates, number of guests, or any questions…"
                disabled={status === "sending"}
              />
            </div>

            {status === "error" && (
              <p className="contact-dialog__error" role="alert">
                {errorMessage}{" "}
                <a href={`mailto:${siteConfig.hostEmail}`}>Email {siteConfig.hostEmail}</a> instead.
              </p>
            )}

            <div className="contact-dialog__actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={status === "sending"}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={status === "sending"}>
                {status === "sending" ? "Opening email…" : "Send request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactDialog;

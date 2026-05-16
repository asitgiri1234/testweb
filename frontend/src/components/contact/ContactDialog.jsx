/**
 * Contact host modal — sends inquiries to the host email via FormSubmit
 */
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../../config/siteConfig.js";
import "./ContactDialog.css";

const FORM_ENDPOINT = `https://formsubmit.co/ajax/${siteConfig.hostEmail}`;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message. Please try again.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please email us directly.");
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
            Your message goes directly to{" "}
            <a href={`mailto:${siteConfig.hostEmail}`}>{siteConfig.hostEmail}</a>
          </p>
        </header>

        {status === "success" ? (
          <div className="contact-dialog__success">
            <p className="contact-dialog__success-title">Request sent</p>
            <p>
              Thanks for reaching out. {siteConfig.hostName} will reply to your email shortly.
            </p>
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className="contact-dialog__form" onSubmit={handleSubmit}>
            <input type="hidden" name="_subject" value={`${siteConfig.name} — New guest inquiry`} />
            <input type="hidden" name="_template" value="table" />
            <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

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
                {status === "sending" ? "Sending…" : "Send request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ContactDialog;

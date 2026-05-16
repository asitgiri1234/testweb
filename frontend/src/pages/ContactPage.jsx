/**
 * Contact page — private enquiries to the host
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ContactDialog from "../components/contact/ContactDialog.jsx";
import { siteConfig } from "../config/siteConfig.js";
import "./ContactPage.css";

function ContactPage() {
  const [searchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("inquire") === "1") {
      setDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <section className="page contact-page">
      <div className="container contact-page__inner">
        <header className="page-header">
          <span className="page-eyebrow">Enquiries</span>
          <h1 className="page-title">Begin your reservation</h1>
          <p className="page-subtitle">
            Whether you are drawn to {siteConfig.properties[0].label} or{" "}
            {siteConfig.properties[1].label}, we welcome your message and shall respond
            with care and promptness.
          </p>
        </header>

        <div className="contact-page__card">
          <div className="contact-page__host">
            <p className="contact-page__label">Private correspondence</p>
            <a className="contact-page__email" href={`mailto:${siteConfig.hostEmail}`}>
              {siteConfig.hostEmail}
            </a>
          </div>

          <ul className="contact-page__properties">
            {siteConfig.properties.map((p) => (
              <li key={p.id}>{p.label}</li>
            ))}
          </ul>

          <button type="button" className="btn contact-page__cta" onClick={() => setDialogOpen(true)}>
            Compose an enquiry
          </button>
          <p className="contact-page__hint">
            Share your preferred dates and party size — your message is delivered
            directly to our host.
          </p>
        </div>
      </div>

      <ContactDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </section>
  );
}

export default ContactPage;

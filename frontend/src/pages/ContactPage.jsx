/**
 * Contact page — host inquiries via modal dialog (email to host)
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
        <h1 className="page-title">Contact {siteConfig.name}</h1>
        <p className="page-subtitle">
          Questions about {siteConfig.properties[0].label} or {siteConfig.properties[1].label}?
          Send a direct request to the host.
        </p>

        <div className="contact-page__card">
          <div className="contact-page__host">
            <p className="contact-page__label">Host email</p>
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
            Open contact form
          </button>
          <p className="contact-page__hint">
            Fill in the form and your message is delivered straight to the host&apos;s inbox.
          </p>
        </div>
      </div>

      <ContactDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </section>
  );
}

export default ContactPage;

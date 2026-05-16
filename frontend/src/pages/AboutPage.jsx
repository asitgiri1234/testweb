/**
 * About page — host / brand story (static for Phase 1)
 */
import { siteConfig } from "../config/siteConfig.js";

function AboutPage() {
  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "720px" }}>
        <h1 className="page-title">About {siteConfig.name}</h1>
        <p className="page-subtitle">
          A direct booking home for {siteConfig.properties[0].label} and{" "}
          {siteConfig.properties[1].label} in Delhi.
        </p>

        <p style={{ marginBottom: "1rem" }}>
          {siteConfig.name} lets you browse our two stays, check availability, and book without
          paying platform commissions. Payments are processed securely through Razorpay.
        </p>

        <p style={{ marginBottom: "1rem" }}>
          This project is being built in phases: Phase 1 is the UI skeleton; upcoming
          phases connect MongoDB, availability logic, and payments.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "2rem", marginBottom: "0.5rem" }}>
          What guests can expect
        </h2>
        <ul style={{ paddingLeft: "1.25rem", color: "var(--color-muted)" }}>
          <li>Clear pricing with no hidden fees</li>
          <li>Real-time availability on the booking calendar</li>
          <li>Instant booking confirmation after payment</li>
        </ul>
      </div>
    </section>
  );
}

export default AboutPage;

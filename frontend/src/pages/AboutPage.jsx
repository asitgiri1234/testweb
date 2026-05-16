/**
 * About page — brand story and guest promise
 */
import { Link } from "react-router-dom";
import { siteConfig } from "../config/siteConfig.js";
import "./AboutPage.css";

function AboutPage() {
  return (
    <section className="page about-page">
      <div className="container about-page__inner">
        <header className="page-header">
          <span className="page-eyebrow">Our story</span>
          <h1 className="page-title">A refuge for the discerning traveller</h1>
          <p className="page-subtitle">
            {siteConfig.name} was conceived as an antidote to impersonal stays — a place
            where hospitality is personal, spaces are considered, and every detail invites
            you to linger.
          </p>
        </header>

        <div className="about-page__content prose">
          <p>
            Nestled in Delhi, we offer two distinct residences —{" "}
            <strong>{siteConfig.properties[0].label}</strong>, warm and enveloping, and{" "}
            <strong>{siteConfig.properties[1].label}</strong>, elevated and serene. Each
            has been shaped with the same philosophy: comfort without ostentation, beauty
            without pretence.
          </p>
          <p>
            When you reserve with us directly, you are welcomed not as a transaction, but
            as a guest. Transparent pricing, thoughtful communication, and the assurance
            that your host is never more than a message away.
          </p>

          <h2>The guest experience</h2>
          <ul>
            <li>Honest, all-inclusive pricing — no concealed fees</li>
            <li>Real-time availability and seamless reservation</li>
            <li>Secure payment and immediate confirmation</li>
            <li>A host who knows each residence intimately</li>
          </ul>

          <p className="about-page__closing">
            We invite you to discover a stay that feels less like a booking, and more like
            an invitation.
          </p>
          <p className="about-page__cta-wrap">
            <Link to="/properties" className="btn">
              Explore our residences
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;

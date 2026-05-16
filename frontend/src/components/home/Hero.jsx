/**
 * Homepage hero — main value proposition and CTA
 */
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero__content">
        <p className="hero__eyebrow">{siteConfig.name}</p>
        <h1 className="hero__title">Amber House & Rooftop Serenity</h1>
        <p className="hero__text">
          Two thoughtfully hosted stays in Delhi — book direct, check availability, and pay
          securely with Razorpay.
        </p>
        <div className="hero__actions">
          <Link to="/properties" className="btn">
            Explore properties
          </Link>
          <Link to="/contact?inquire=1" className="btn btn-outline">
            Contact host
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;

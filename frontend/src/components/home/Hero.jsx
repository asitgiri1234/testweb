/**
 * Homepage hero — welcoming first impression
 */
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="container hero__content">
        <p className="hero__eyebrow">Delhi · Private retreats</p>
        <h1 className="hero__title">
          Where quiet evenings
          <br />
          <em>feel like home</em>
        </h1>
        <p className="hero__text">
          Welcome to {siteConfig.name} — two intimately hosted residences,{" "}
          <span className="hero__highlight">Amber House</span> and{" "}
          <span className="hero__highlight">Rooftop Serenity</span>, offered directly
          to discerning guests who value comfort, character, and unhurried hospitality.
        </p>
        <div className="hero__actions">
          <Link to="/properties" className="btn">
            Discover our residences
          </Link>
          <Link to="/contact?inquire=1" className="btn btn-outline">
            Request a stay
          </Link>
        </div>
        <p className="hero__footnote">Reserve directly · No platform fees</p>
      </div>
    </section>
  );
}

export default Hero;

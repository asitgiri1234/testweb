/**
 * Homepage hero — main value proposition and CTA
 */
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero__content">
        <p className="hero__eyebrow">Book direct · Save on fees</p>
        <h1 className="hero__title">Your perfect stay, without the middleman</h1>
        <p className="hero__text">
          Browse hand-picked vacation rentals, check real-time availability, and book
          securely with Razorpay — all on one site.
        </p>
        <div className="hero__actions">
          <Link to="/properties" className="btn">
            Explore properties
          </Link>
          <Link to="/about" className="btn btn-outline">
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;

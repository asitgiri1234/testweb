/**
 * Homepage hero — welcoming first impression with sliding background photos.
 */
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import heroHomeImage from "../../assets/images/hero-home.png";
import heroCozyLounge from "../../assets/images/hero-cozy-lounge.png";
import heroChessEvening from "../../assets/images/hero-chess-evening.png";
import "./Hero.css";

const heroImages = [heroHomeImage, heroCozyLounge, heroChessEvening];

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = heroImages.length;

  const goTo = useCallback(
    (index) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total],
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`hero__slide ${index === activeIndex ? "hero__slide--active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="hero__overlay" />

        <button
          type="button"
          className="hero__nav hero__nav--prev"
          onClick={goPrev}
          aria-label="Previous background photo"
        >
          ‹
        </button>
        <button
          type="button"
          className="hero__nav hero__nav--next"
          onClick={goNext}
          aria-label="Next background photo"
        >
          ›
        </button>
      </div>

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

/**
 * Homepage hero — auto-rotating background photos every 5 seconds.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import heroSlide1 from "../../assets/images/hero-slide-1.png";
import heroSlide2 from "../../assets/images/hero-slide-2.png";
import heroSlide3 from "../../assets/images/hero-slide-3.png";
import "./Hero.css";

const HERO_INTERVAL_MS = 5000;

const heroImages = [heroSlide1, heroSlide2, heroSlide3];

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = heroImages.length;

  const goTo = useCallback(
    (index) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total],
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  useEffect(() => {
    if (isPaused || total <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, HERO_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, total]);

  return (
    <section className="hero">
      <div
        className="hero__bg"
        aria-hidden="true"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
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

        <div className="hero__dots" role="tablist" aria-label="Hero photos">
          {heroImages.map((image, index) => (
            <button
              key={image}
              type="button"
              role="tab"
              className={`hero__dot ${index === activeIndex ? "hero__dot--active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-selected={index === activeIndex}
            />
          ))}
        </div>
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

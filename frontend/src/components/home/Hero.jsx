/**
 * Homepage hero — auto-rotating background photos every 5 seconds.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import heroSlide2 from "../../assets/images/hero-slide-2.png";
import heroSlide3 from "../../assets/images/hero-slide-3.png";
import heroSlide4 from "../../assets/images/hero-slide-4.png";
import heroSlide5 from "../../assets/images/hero-slide-5.png";
import "./Hero.css";

const HERO_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 48;

const heroImages = [heroSlide2, heroSlide3, heroSlide4, heroSlide5];

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const total = heroImages.length;

  const goTo = useCallback(
    (index) => {
      setActiveIndex(((index % total) + total) % total);
    },
    [total],
  );

  const goPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, HERO_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, total]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <section className="hero">
      <div
        className="hero__bg"
        aria-hidden="true"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
          aria-label="Previous background photo"
        >
          ‹
        </button>
        <button
          type="button"
          className="hero__nav hero__nav--next"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
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
              onClick={(event) => {
                event.stopPropagation();
                goTo(index);
              }}
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

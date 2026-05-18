/**
 * Image gallery for property detail page — slide through photos with arrows, swipe, or thumbnails.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import "./PropertyGallery.css";

const SWIPE_THRESHOLD_PX = 48;

function PropertyGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  const total = images.length;
  const hasMultiple = total > 1;

  const goTo = useCallback(
    (index) => {
      if (!total) return;
      const next = ((index % total) + total) % total;
      setActiveIndex(next);
    },
    [total],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!hasMultiple) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, goPrev, goNext]);

  if (!total) {
    return <div className="gallery gallery--empty">No images available yet</div>;
  }

  const active = images[activeIndex];

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
    <section className="gallery" aria-label="Property photos">
      <div
        className="gallery__main"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <img
          src={active.url}
          alt={active.caption || "Property photo"}
          className="gallery__main-image"
          key={active.url}
          draggable={false}
        />

        {active.caption && <p className="gallery__caption">{active.caption}</p>}

        {hasMultiple && (
          <>
            <button
              type="button"
              className="gallery__nav gallery__nav--prev"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery__nav gallery__nav--next"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label="Next photo"
            >
              ›
            </button>
            <p className="gallery__counter" aria-live="polite">
              {activeIndex + 1} / {total}
            </p>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="gallery__thumbs" role="list">
          {images.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              role="listitem"
              className={`gallery__thumb ${index === activeIndex ? "gallery__thumb--active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}: ${img.caption || "Property photo"}`}
              aria-current={index === activeIndex}
            >
              <img src={img.url} alt="" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default PropertyGallery;

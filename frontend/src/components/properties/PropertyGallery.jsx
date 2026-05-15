/**
 * Image gallery for property detail page.
 * Accepts an array of { url, caption } — swap URLs when you have real photos.
 */
import { useState } from "react";
import "./PropertyGallery.css";

function PropertyGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return <div className="gallery gallery--empty">No images available yet</div>;
  }

  const active = images[activeIndex];

  return (
    <section className="gallery" aria-label="Property photos">
      <div className="gallery__main">
        <img
          src={active.url}
          alt={active.caption || "Property photo"}
          className="gallery__main-image"
        />
        {active.caption && (
          <p className="gallery__caption">{active.caption}</p>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery__thumbs" role="list">
          {images.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              role="listitem"
              className={`gallery__thumb ${index === activeIndex ? "gallery__thumb--active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <img src={img.url} alt={img.caption || ""} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default PropertyGallery;

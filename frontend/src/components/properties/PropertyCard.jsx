/**
 * Reusable card for property listings (used on Home and Properties pages)
 */
import { Link } from "react-router-dom";
import "./PropertyCard.css";

function PropertyCard({ property }) {
  const coverImage = property.images?.[0]?.url;
  const rating = property.rating ?? 5;
  const reviewCount = property.reviewCount ?? 100;

  return (
    <article className="property-card">
      <div className="property-card__rating">
        <span className="property-card__rating-stars">{rating}★ Rating</span>
        <span className="property-card__rating-sep" aria-hidden="true">
          ·
        </span>
        <span className="property-card__rating-reviews">({reviewCount} Reviews)</span>
        <span className="property-card__rating-location">
          Location: {property.location}
        </span>
      </div>

      <Link to={`/properties/${property.slug}`} className="property-card__image-link">
        {coverImage ? (
          <img
            src={coverImage}
            alt={property.title}
            className="property-card__image"
          />
        ) : (
          <div className="property-card__placeholder">No image</div>
        )}
      </Link>

      <div className="property-card__body">
        <p className="property-card__label">Residence</p>
        <h3 className="property-card__title">
          <Link to={`/properties/${property.slug}`}>{property.title}</Link>
        </h3>
        <p className="property-card__meta">
          {property.minGuests
            ? `${property.minGuests}–${property.maxGuests}`
            : property.maxGuests}{" "}
          guests · {property.bedrooms} bed · {property.bathrooms} bath
        </p>
        <p className="property-card__price">
          <strong>₹{property.pricePerNight.toLocaleString("en-IN")}</strong>
          <span> / night</span>
        </p>
        <Link to={`/properties/${property.slug}`} className="btn btn-outline property-card__btn">
          View residence
        </Link>
      </div>
    </article>
  );
}

export default PropertyCard;

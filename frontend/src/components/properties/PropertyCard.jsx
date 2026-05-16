/**
 * Reusable card for property listings (used on Home and Properties pages)
 */
import { Link } from "react-router-dom";
import "./PropertyCard.css";

function PropertyCard({ property }) {
  const coverImage = property.images?.[0]?.url;

  return (
    <article className="property-card">
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
        <p className="property-card__location">{property.location}</p>
        <p className="property-card__meta">
          {property.maxGuests} guests · {property.bedrooms} bed · {property.bathrooms} bath
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

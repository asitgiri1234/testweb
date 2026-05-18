/**
 * Single property page — gallery, description, amenities, booking widget
 */
import { useParams, Link } from "react-router-dom";
import PropertyGallery from "../components/properties/PropertyGallery.jsx";
import PropertyDescription from "../components/properties/PropertyDescription.jsx";
import AmenitiesSection from "../components/properties/AmenitiesSection.jsx";
import HostProfile from "../components/HostProfile.jsx";
import BookingWidget from "../components/booking/BookingWidget.jsx";
import { getPropertyBySlug } from "../data/dummyProperties.js";
import "./PropertyDetailsPage.css";

function PropertyDetailsPage() {
  const { slug } = useParams();
  const property = getPropertyBySlug(slug);

  if (!property) {
    return (
      <section className="page container">
        <h1>Residence not found</h1>
        <p>
          <Link to="/properties">Return to our collection</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="page property-details">
      <div className="container">
        <header className="property-details__header">
          <div className="property-details__rating">
            <span className="property-details__rating-stars">
              {property.rating ?? 5}★ Rating
            </span>
            <span className="property-details__rating-sep" aria-hidden="true">
              ·
            </span>
            <span className="property-details__rating-reviews">
              ({property.reviewCount ?? 100} Reviews)
            </span>
          </div>
          <h1 className="page-title">{property.title}</h1>
          <p className="property-details__location">{property.location}</p>
          <p className="property-details__meta">
            {property.minGuests
              ? `${property.minGuests}–${property.maxGuests}`
              : property.maxGuests}{" "}
            guests · {property.bedrooms}{" "}
            {property.bedrooms === 1 ? "bedroom" : "bedrooms"} · {property.bathrooms}{" "}
            {property.bathrooms === 1 ? "bathroom" : "bathrooms"}
          </p>
        </header>

        <div className="property-details__layout">
          <div className="property-details__main">
            <PropertyGallery images={property.images} />

            <PropertyDescription sections={property.descriptionSections} />

            <AmenitiesSection amenities={property.amenities} />

            <HostProfile variant="compact" />

            {property.rules?.length > 0 && (
              <section className="property-details__section">
                <h2>House etiquette</h2>
                <ul className="property-details__rules">
                  {property.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </section>
            )}

            {property.address && (
              <section className="property-details__section property-details__map">
                <h2>Location</h2>
                <p className="property-details__map-area">{property.location}</p>
                <a
                  href={property.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="property-details__map-link"
                >
                  <span className="property-details__map-icon" aria-hidden="true">
                    📍
                  </span>
                  <span>{property.address}</span>
                  <span className="property-details__map-cta">Open in Google Maps</span>
                </a>
              </section>
            )}
          </div>

          <BookingWidget property={property} compact showCalendar={false} />
        </div>
      </div>
    </section>
  );
}

export default PropertyDetailsPage;

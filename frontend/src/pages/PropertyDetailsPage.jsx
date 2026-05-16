/**
 * Single property page — gallery, description, amenities, booking widget
 */
import { useParams, Link } from "react-router-dom";
import PropertyGallery from "../components/properties/PropertyGallery.jsx";
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
          <h1 className="page-title">{property.title}</h1>
          <p className="property-details__location">{property.location}</p>
          <p className="property-details__meta">
            {property.maxGuests} guests · {property.bedrooms} bedrooms ·{" "}
            {property.bathrooms} bathrooms
          </p>
        </header>

        <div className="property-details__layout">
          <div className="property-details__main">
            <PropertyGallery images={property.images} />

            <section className="property-details__section">
              <h2>The residence</h2>
              <p>{property.description}</p>
            </section>

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
          </div>

          <BookingWidget property={property} compact showCalendar={false} />
        </div>
      </div>
    </section>
  );
}

export default PropertyDetailsPage;

/**
 * Full booking page — calendar, guest count, cost breakdown (payment in Phase 4)
 */
import { useParams, Link, useLocation } from "react-router-dom";
import BookingWidget from "../components/booking/BookingWidget.jsx";
import { getPropertyBySlug } from "../data/dummyProperties.js";

function BookingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const property = getPropertyBySlug(slug);

  // Dates/guests can be passed from the detail page "Reserve" button
  const prefilled = location.state;

  if (!property) {
    return (
      <section className="page container">
        <h1>Property not found</h1>
        <Link to="/properties">Back to listings</Link>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="container">
        <h1 className="page-title">Book your stay</h1>
        <p className="page-subtitle">
          {property.title}
          {prefilled?.checkIn && " — dates carried over from property page"}
        </p>

        <div style={{ maxWidth: "420px" }}>
          <BookingWidget
            property={property}
            compact={false}
            showCalendar={true}
          />
        </div>

        <p style={{ marginTop: "1.5rem" }}>
          <Link to={`/properties/${property.slug}`} className="btn btn-outline">
            Back to property
          </Link>
        </p>
      </div>
    </section>
  );
}

export default BookingPage;

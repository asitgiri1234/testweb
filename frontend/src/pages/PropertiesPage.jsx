/**
 * Property listing page — shows all available rentals
 */
import PropertyCard from "../components/properties/PropertyCard.jsx";
import { dummyProperties } from "../data/dummyProperties.js";

function PropertiesPage() {
  return (
    <section className="page">
      <div className="container">
        <h1 className="page-title">All properties</h1>
        <p className="page-subtitle">
          Choose a stay and book directly — no third-party platform fees.
        </p>

        <div className="grid-2">
          {dummyProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PropertiesPage;

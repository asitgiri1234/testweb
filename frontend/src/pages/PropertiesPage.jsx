/**
 * Property listing page
 */
import PropertyCard from "../components/properties/PropertyCard.jsx";
import { dummyProperties } from "../data/dummyProperties.js";

function PropertiesPage() {
  return (
    <section className="page section--alt">
      <div className="container">
        <header className="page-header">
          <span className="page-eyebrow">The collection</span>
          <h1 className="page-title">Our residences</h1>
          <p className="page-subtitle">
            Two homes, each with its own character — reserve directly and arrive
            to a space prepared with intention.
          </p>
        </header>

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

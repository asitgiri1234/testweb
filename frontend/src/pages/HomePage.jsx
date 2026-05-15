/**
 * Home page — hero + featured property cards
 */
import Hero from "../components/home/Hero.jsx";
import HostProfile from "../components/HostProfile.jsx";
import PropertyCard from "../components/properties/PropertyCard.jsx";
import { dummyProperties } from "../data/dummyProperties.js";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <>
      <Hero />

      <HostProfile variant="full" />

      <section className="page">
        <div className="container">
          <h2 className="page-title">Featured stays</h2>
          <p className="page-subtitle">Hand-picked properties available for direct booking.</p>

          <div className="grid-2">
            {dummyProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <p style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link to="/properties" className="btn btn-outline">
              View all properties
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default HomePage;

/**
 * Home page — hero, featured residences, host introduction
 */
import Hero from "../components/home/Hero.jsx";
import HostProfile from "../components/HostProfile.jsx";
import PropertyCard from "../components/properties/PropertyCard.jsx";
import { dummyProperties } from "../data/dummyProperties.js";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <>
      <Hero />

      <section className="page section--warm home-featured">
        <div className="container">
          <header className="page-header">
            <span className="page-eyebrow">Our collection</span>
            <h2 className="page-title">Residences of quiet distinction</h2>
            <p className="page-subtitle">
              Each home is personally tended — spaces designed for rest, conversation,
              and the unhurried rhythm of a well-lived stay.
            </p>
          </header>

          <div className="grid-2">
            {dummyProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <p className="home-featured__cta">
            <Link to="/properties" className="btn btn-outline">
              View the full collection
            </Link>
          </p>
        </div>
      </section>

      <HostProfile variant="full" />
    </>
  );
}

export default HomePage;

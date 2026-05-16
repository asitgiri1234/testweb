/**
 * Site navigation — logo home link + main routes
 */
import { NavLink } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import logoImage from "../../assets/logo/josephs-retreat-logo.png";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo" aria-label={`${siteConfig.name} — Home`}>
          <img
            src={logoImage}
            alt={siteConfig.name}
            className="navbar__logo-image"
            width={220}
            height={60}
          />
        </NavLink>

        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/properties" className={({ isActive }) => (isActive ? "active" : "")}>
            Residences
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            Our story
          </NavLink>
          <NavLink to="/contact?inquire=1" className={({ isActive }) => (isActive ? "active" : "")}>
            Enquire
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

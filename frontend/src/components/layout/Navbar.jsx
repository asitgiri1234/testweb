/**
 * Site navigation — links to all main pages
 */
import { NavLink } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo">
          {siteConfig.name}
        </NavLink>

        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/properties" className={({ isActive }) => (isActive ? "active" : "")}>
            Properties
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            About
          </NavLink>
          <NavLink to="/contact?inquire=1" className={({ isActive }) => (isActive ? "active" : "")}>
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

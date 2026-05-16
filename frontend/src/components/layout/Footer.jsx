/**
 * Site footer
 */
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <p className="footer__name">{siteConfig.name}</p>
          <p className="footer__tagline">{siteConfig.tagline}</p>
        </div>
        <nav className="footer__links" aria-label="Footer navigation">
          <Link to="/properties">Residences</Link>
          <Link to="/about">Our story</Link>
          <Link to="/contact">Enquire</Link>
        </nav>
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

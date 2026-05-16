/**
 * Site footer — copyright and quick links
 */
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig.js";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} {siteConfig.name} · {siteConfig.tagline}
        </p>
        <div className="footer__links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/properties">Properties</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

/**
 * Site footer — copyright and quick links
 */
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} StayDirect · Direct vacation rental bookings
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

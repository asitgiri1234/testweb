/**
 * Displays a list of amenities for a property
 */
import "./AmenitiesSection.css";

function AmenitiesSection({ amenities = [] }) {
  if (!amenities.length) return null;

  return (
    <section className="amenities">
      <h2 className="amenities__title">What this place offers</h2>
      <ul className="amenities__list">
        {amenities.map((item) => (
          <li key={item} className="amenities__item">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AmenitiesSection;

/**
 * Structured property description — sections, paragraphs, and warnings.
 */
import "./PropertyDescription.css";

function PropertyDescription({ sections = [] }) {
  if (!sections.length) return null;

  return (
    <div className="property-description">
      {sections.map((section) => (
        <section key={section.heading} className="property-details__section">
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.warnings?.length > 0 && (
            <ul className="property-description__warnings">
              {section.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

export default PropertyDescription;

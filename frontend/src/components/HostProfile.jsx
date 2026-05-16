/**
 * Meet Your Host — reusable profile section.
 *
 * Replace the host photo:
 *   Drop your image at frontend/src/assets/host/host-profile-placeholder.jpg
 *   (same filename) or update the import below.
 *
 * @param {object} props
 * @param {"full"|"compact"} props.variant — full section (home) or compact card (property page)
 */
import hostProfileImage from "../assets/host/host-profile-placeholder.jpg";
import { hostProfile } from "../data/hostProfile.js";
import "./HostProfile.css";

function HostProfile({ variant = "full" }) {
  const { name, age, hostingYears, city, intro, highlights } = hostProfile;
  const isCompact = variant === "compact";

  return (
    <section
      className={`host-profile host-profile--${variant}`}
      aria-labelledby={isCompact ? "host-card-title" : "host-section-title"}
    >
      <div className={isCompact ? "host-profile__card" : "host-profile__inner container"}>
        {!isCompact && (
          <header className="host-profile__header">
            <p className="host-profile__eyebrow">Your host</p>
            <h2 id="host-section-title" className="host-profile__title">
              Hospitality, personally extended
            </h2>
          </header>
        )}

        <div className="host-profile__body">
          <div className="host-profile__media">
            <div className="host-profile__image-wrap">
              <img
                src={hostProfileImage}
                alt={`${name}, vacation rental host`}
                className="host-profile__image"
              />
              {!isCompact && (
                <span className="host-profile__badge" aria-label="Preferred host">
                  Preferred host
                </span>
              )}
            </div>
          </div>

          <div className="host-profile__content">
            {isCompact && (
              <h2 id="host-card-title" className="host-profile__card-heading">
                Meet your host
              </h2>
            )}

            <p className="host-profile__name">{name}</p>

            <ul className="host-profile__stats" aria-label="Host details">
              <li>{age} years old</li>
              <li>Hosting guests for {hostingYears} years</li>
              <li>Currently based in {city}</li>
            </ul>

            <p className="host-profile__intro">{intro}</p>

            {!isCompact && highlights?.length > 0 && (
              <ul className="host-profile__highlights">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {!isCompact && (
              <div className="host-profile__trust">
                <div className="host-profile__trust-item">
                  <span className="host-profile__trust-value">{hostingYears}+</span>
                  <span className="host-profile__trust-label">Years hosting</span>
                </div>
                <div className="host-profile__trust-item">
                  <span className="host-profile__trust-value">24/7</span>
                  <span className="host-profile__trust-label">Attentive care</span>
                </div>
                <div className="host-profile__trust-item">
                  <span className="host-profile__trust-value">100%</span>
                  <span className="host-profile__trust-label">Direct booking</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HostProfile;

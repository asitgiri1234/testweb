/**
 * Featured guest reviews with links to read full text on Airbnb.
 */
import "./PropertyReviewsSection.css";

function StarRow({ rating }) {
  const stars = Math.round(rating || 5);
  return (
    <span className="property-reviews__stars" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < stars ? "property-reviews__star property-reviews__star--on" : "property-reviews__star"
          }
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

function PropertyReviewsSection({ reviewsData, propertyTitle, overallRating, reviewCount }) {
  if (!reviewsData?.reviews?.length) return null;

  const { reviews, airbnbAllReviewsUrl } = reviewsData;

  return (
    <section className="property-reviews" aria-labelledby="property-reviews-heading">
      <div className="property-reviews__header">
        <div>
          <h2 id="property-reviews-heading" className="property-reviews__title">
            Guest reviews
          </h2>
          <p className="property-reviews__summary">
            <span className="property-reviews__summary-rating">
              {overallRating ?? 5}★
            </span>
            <span className="property-reviews__summary-sep" aria-hidden="true">
              ·
            </span>
            <span>{reviewCount ?? reviews.length} reviews on Airbnb</span>
          </p>
        </div>
        <a
          href={airbnbAllReviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="property-reviews__all-link"
        >
          View all on Airbnb
        </a>
      </div>

      <ul className="property-reviews__grid">
        {reviews.map((review) => (
          <li key={review.id} className="property-reviews__card">
            <div className="property-reviews__card-top">
              <div className="property-reviews__guest">
                <span className="property-reviews__avatar" aria-hidden="true">
                  {review.guestName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="property-reviews__name">{review.guestName}</p>
                  {review.date && (
                    <p className="property-reviews__date">{review.date}</p>
                  )}
                </div>
              </div>
              <StarRow rating={review.rating} />
            </div>
            <p className="property-reviews__text">{review.text}</p>
            <a
              href={review.airbnbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="property-reviews__read-link"
            >
              Read on Airbnb
              <span className="property-reviews__read-icon" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="property-reviews__note">
        Reviews are from guests on Airbnb for {propertyTitle}. Tap a review to open it on
        Airbnb.
      </p>
    </section>
  );
}

export default PropertyReviewsSection;

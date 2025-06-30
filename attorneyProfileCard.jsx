import React from 'react';
import TinderCard from 'react-tinder-card';
import PropTypes from 'prop-types';

const DEFAULT_PHOTO =
  'https://via.placeholder.com/300x400.png?text=No+Photo+Available';

function AttorneyProfileCard({
  attorney,
  onSwipe = () => {},
  onCardLeftScreen = () => {},
}) {
  const {
    id,
    name,
    title,
    firm,
    photoURL,
    yearsExperience,
    rating,
    reviewsCount,
    specialties = [],
    bio,
  } = attorney;

  return (
    <TinderCard
      className="attorney-swipe"
      key={id}
      preventSwipe={['up', 'down']}
      onSwipe={(dir) => onSwipe(dir, id)}
      onCardLeftScreen={(dir) => onCardLeftScreen(dir, id)}
    >
      <div className="attorney-card">
        <img
          className="attorney-photo"
          src={photoURL || DEFAULT_PHOTO}
          alt={`Attorney ${name}${title ? `, ${title}` : ''}`}
        />
        <div className="attorney-overlay" role="region" aria-label={`Profile details for ${name}`}>
          <header className="attorney-header">
            <h2 className="attorney-name">
              {name}
              {title && <span className="attorney-title">, {title}</span>}
            </h2>
            {firm && <p className="attorney-firm">{firm}</p>}
          </header>

          <section className="attorney-details">
            {yearsExperience != null && (
              <span className="attorney-experience">
                {yearsExperience} yr{yearsExperience !== 1 ? 's' : ''} exp
              </span>
            )}
            {rating != null && (
              <span className="attorney-rating">
                {rating.toFixed(1)}?
                {reviewsCount != null && ` (${reviewsCount})`}
              </span>
            )}
          </section>

          {specialties.length > 0 && (
            <ul className="attorney-specialties">
              {specialties.map((spec) => (
                <li key={spec} className="attorney-specialty">
                  {spec}
                </li>
              ))}
            </ul>
          )}

          {bio && <p className="attorney-bio">{bio}</p>}
        </div>
      </div>
    </TinderCard>
  );
}

AttorneyProfileCard.propTypes = {
  attorney: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    firm: PropTypes.string,
    photoURL: PropTypes.string,
    yearsExperience: PropTypes.number,
    rating: PropTypes.number,
    reviewsCount: PropTypes.number,
    specialties: PropTypes.arrayOf(PropTypes.string),
    bio: PropTypes.string,
  }).isRequired,
  onSwipe: PropTypes.func,
  onCardLeftScreen: PropTypes.func,
};

export default AttorneyProfileCard;
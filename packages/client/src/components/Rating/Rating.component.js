/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import './Rating.styles.css';

function Rating({ rating, reviews }) {
  const totalStars = 5;
  const safeRating = Number(rating) || 0;

  const stars = Array.from({ length: totalStars }, (_, i) => {
    const starValue = i + 1;

    if (rating >= starValue) return 'full';
    if (rating >= starValue - 0.5) return 'half';
    return 'empty';
  });

  return (
    <div className="rating">
      <div className="stars">
        {stars.map((type, i) => (
          <span key={i} className={`star ${type}`}>
            ★
          </span>
        ))}
      </div>

      <span className="rating-value">{safeRating.toFixed(1)}</span>
      {reviews && <span className="reviews">({reviews})</span>}
    </div>
  );
}

Rating.propTypes = {
  rating: PropTypes.number.isRequired,
  reviews: PropTypes.number,
};

Rating.defaultProps = {
  reviews: null,
};

export default Rating;

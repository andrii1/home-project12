/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button } from '../Button/Button.component';
import { Badge } from '../Badge/Badge.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import Rating from '../Rating/Rating.component';
import { useUserContext } from '../../userContext';
import { getFlagEmoji } from '../../utils/getFlagEmoji';

import './Card.styles.css';

export const Card = ({
  title,
  description,
  referralCode,
  referralCodeOnClick,
  topic,
  topicId,
  appId,
  appTitle,
  price,
  currency,
  urlAffiliate,
  url,
  cardUrl,
  urlImage,
  urlImageIcon,
  id,
  className,
  smallCard = true,
  relatedItemsCard = false,
  listCard = false,
  isFavorite,
  addFavorite,
  deleteBookmark,
  bookmarkOnClick,
  rating,
  reviews,
  discount,
  isoCode,
}) => {
  const { user } = useUserContext();
  // Calculate original price
  const originalPrice = discount > 0 ? price / (1 - discount / 100) : price;
  // Convert ISO alpha-2 code to flag emoji

  if (smallCard) {
    return (
      <Link
        to={cardUrl}
        className="card-category--small card-image--small"
        style={{
          backgroundImage: `url(${urlImage})`,
          backgroundRepeat: 'no-repeat',
          // backgroundSize: 'cover',
        }}
      >
        <div className="card-header">
          <Link to={cardUrl} target="_blank">
            <h2>{title}</h2>
          </Link>
        </div>
        <div className="topics-bookmark--small">
          <Badge
            className="storybook-badge--transparent"
            label={topic}
            size="small"
          />
          {appTitle && <Badge primary label={appTitle} size="small" />}
        </div>
      </Link>
    );
  }

  return (
    <Link to={cardUrl} className={listCard ? 'card-list' : 'card-category'}>
      <div
        style={{
          backgroundImage: urlImage ? `url(${urlImage})` : 'none',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
        className={`card-image ${listCard ? 'list' : ''}`}
      >
        {!urlImage && isoCode && (
          <span className="img-emoji">{getFlagEmoji(isoCode)}</span>
        )}
        {!urlImage && !isoCode && <span className="img-emoji">🌍</span>}
        {/* <img
          className={`${listCard ? 'img-app-icon-list' : 'img-app-icon'} ${
            urlImageIcon ? 'icon-shadow' : ''
          }`}
          alt="test"
          src={urlImage}
        /> */}
      </div>

      <div className={`card-body ${listCard ? 'list' : ''}`}>
        <div className="card-header">
          <div className="card-title">
            <h2>{title.split(' ').slice(0, 8).join(' ')}</h2>
          </div>
          {/* <Badge label={appTitle} size="small" /> */}
        </div>
        {/* {description && (
          <div className="card-description">
            {`${description
              .split(' ')
              .slice(
                0,
                `${referralCode !== null ? (title.length > 21 ? 8 : 15) : 17}`,
              )
              .join(' ')}...`}
          </div>
        )} */}
        {rating && <Rating rating={rating} reviews={reviews} />}
        {price && (
          <div>
            <p className="price-card">
              {/* <span>{`From ${currency === 'USD' && '$'}${
              currency === 'EUR' && '€'
            } ${price} `}</span> */}
              <span className="price-from">From </span>
              {/* {discount > 0 && (
              <span className="original-price">
                {currency === 'USD' && '$ '}
                {currency === 'EUR' && '€ '}
                {Math.floor(originalPrice)}.
                {originalPrice.toFixed(2).split('.')[1]}
              </span>
            )} */}
              <span className="amount">
                {currency === 'USD' && '$'}
                {currency === 'EUR' && '€'}
                {price}
              </span>{' '}
              {discount > 0 && <span className="discount">-{discount}%</span>}
            </p>
          </div>
        )}

        {/* {!relatedItemsCard && (
          <div className="topics-bookmark">
            <div className="container-topic-app">
              {!relatedItemsCard && (
                <Link to={`/apps/categories/${topicId}`}>
                  <Button secondary label={topic} size="small" />
                </Link>
              )}
            </div>

            {user && isFavorite ? (
              <button
                type="button"
                onClick={deleteBookmark}
                onKeyDown={deleteBookmark}
                className="button-bookmark"
              >
                <FontAwesomeIcon icon={faHeartSolid} size="lg" />
              </button>
            ) : user ? (
              <button
                type="button"
                onClick={addFavorite}
                onKeyDown={addFavorite}
                className="button-bookmark"
              >
                <FontAwesomeIcon icon={faHeart} size="lg" />
              </button>
            ) : (
              <button
                type="button"
                onClick={bookmarkOnClick}
                onKeyDown={addFavorite}
                className="button-bookmark"
              >
                <FontAwesomeIcon icon={faHeart} size="lg" />
              </button>
            )}
          </div>
        )} */}
        {/* <div>
          <Link to={urlAffiliate} target="_blank">
            <Button
              fourth
              className="btn-card-affiliate"
              size="medium"
              icon={
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />
              }
              label="Buy Now"
            />
          </Link>
        </div> */}
      </div>
    </Link>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  referralCode: PropTypes.string,
  referralCodeOnClick: PropTypes.func,
  topic: PropTypes.string,
  topicId: PropTypes.string,
  appTitle: PropTypes.string,
  appId: PropTypes.string,
  id: PropTypes.string,
  url: PropTypes.shape,
  cardUrl: PropTypes.shape,
  urlImage: PropTypes.string,
  smallCard: PropTypes.bool,
  listCard: PropTypes.bool,
  relatedItemsCard: PropTypes.bool,
  urlImageIcon: PropTypes.bool,
  className: PropTypes.string,
  isFavorite: PropTypes.func,
  addFavorite: PropTypes.func,
  deleteBookmark: PropTypes.func,
  bookmarkOnClick: PropTypes.func,
  price: PropTypes.string,
  currency: PropTypes.string,
  urlAffiliate: PropTypes.string,
  rating: PropTypes.number.isRequired,
  reviews: PropTypes.number,
  discount: PropTypes.number,
  isoCode: PropTypes.string,
};

Card.defaultProps = {
  title: null,
  description: null,
  referralCode: null,
  appTitle: null,
  appId: null,
  topicId: null,
  topic: null,
  url: null,
  cardUrl: null,
  urlImage: null,
  id: null,
  smallCard: false,
  listCard: false,
  relatedItemsCard: false,
  urlImageIcon: false,
  className: null,
  isFavorite: undefined,
  addFavorite: undefined,
  deleteBookmark: undefined,
  bookmarkOnClick: undefined,
  referralCodeOnClick: undefined,
  price: null,
  currency: null,
  urlAffiliate: null,
  reviews: null,
  discount: null,
  isoCode: null,
};

// src/components/restaurant/RestaurantCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant, variant = 'default', onQuickView, onFavorite }) => {
    const [isFavorite, setIsFavorite] = useState(restaurant.isFavorite || false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        onFavorite?.(restaurant.id, !isFavorite);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView?.(restaurant);
    };

    const formatDeliveryTime = (minutes) => {
        if (!minutes) return 'N/A';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getOfferText = () => {
        if (restaurant.offer) return restaurant.offer;
        if (restaurant.discount) return `${restaurant.discount}% OFF`;
        if (restaurant.freeDelivery) return 'Free Delivery';
        return null;
    };

    const getDeliveryFeeText = () => {
        if (restaurant.freeDelivery) return 'Free Delivery';
        if (restaurant.deliveryFee === 0) return 'Free Delivery';
        if (restaurant.deliveryFee) return `₹${restaurant.deliveryFee} Delivery`;
        return null;
    };

    const getDistanceText = () => {
        if (!restaurant.distance) return null;
        if (restaurant.distance < 1) return `${Math.round(restaurant.distance * 1000)}m away`;
        return `${restaurant.distance.toFixed(1)} km away`;
    };

    const getMinimumOrderText = () => {
        if (restaurant.minOrder) return `Min ₹${restaurant.minOrder}`;
        return null;
    };

    // Compact variant for horizontal scrolling
    if (variant === 'compact') {
        return (
            <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card compact">
                <div className="card-image">
                    <img
                        src={imageError ? '/default-restaurant.jpg' : (restaurant.image || '/default-restaurant.jpg')}
                        alt={restaurant.name}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        style={{ opacity: imageLoaded ? 1 : 0 }}
                    />
                    {!imageLoaded && !imageError && <div className="image-placeholder shimmer" />}
                    {restaurant.isOpen === false && (
                        <div className="closed-overlay">
                            <span>Closed</span>
                        </div>
                    )}
                    {getOfferText() && (
                        <div className="offer-badge compact">{getOfferText()}</div>
                    )}
                </div>
                <div className="card-content">
                    <h3 className="restaurant-name">{restaurant.name}</h3>
                    <div className="restaurant-meta">
                        <RatingStars rating={restaurant.rating} size="small" readonly />
                        <span className="review-count">({restaurant.reviewCount || 0})</span>
                    </div>
                    <div className="restaurant-info">
                        <span className="delivery-time">⏱️ {formatDeliveryTime(restaurant.deliveryTime)}</span>
                        <span className="price-range">💵 {restaurant.priceRange || '$$'}</span>
                    </div>
                </div>
            </Link>
        );
    }

    // Default variant
    return (
        <div className={`restaurant-card default ${!restaurant.isOpen ? 'closed' : ''} ${restaurant.isPromoted ? 'promoted' : ''}`}>
            <Link to={`/restaurant/${restaurant.id}`} className="card-link">
                <div className="card-image">
                    <img
                        src={imageError ? '/default-restaurant.jpg' : (restaurant.image || '/default-restaurant.jpg')}
                        alt={restaurant.name}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        style={{ opacity: imageLoaded ? 1 : 0 }}
                    />
                    {!imageLoaded && !imageError && <div className="image-placeholder shimmer" />}

                    {getOfferText() && (
                        <div className="offer-badge">{getOfferText()}</div>
                    )}

                    {restaurant.isPromoted && (
                        <div className="promoted-badge">📢 Promoted</div>
                    )}

                    <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={handleFavoriteClick}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>

                    {restaurant.isOpen === false && (
                        <div className="closed-overlay">
                            <span>Currently Closed</span>
                        </div>
                    )}
                </div>

                <div className="card-content">
                    <div className="card-header">
                        <h3 className="restaurant-name">{restaurant.name}</h3>
                        {restaurant.isVeg && <span className="veg-badge">🟢 Pure Veg</span>}
                    </div>

                    <div className="restaurant-meta">
                        <div className="rating-container">
                            <span className="rating-value">{restaurant.rating?.toFixed(1) || '4.0'}</span>
                            <RatingStars rating={restaurant.rating || 4} size="small" readonly />
                        </div>
                        <span className="review-count">({restaurant.reviewCount || 0}+ reviews)</span>
                    </div>

                    <div className="restaurant-info">
                        <span className="cuisine-type">
                            {restaurant.cuisine?.slice(0, 2).join(' • ')}
                            {restaurant.cuisine?.length > 2 && ' + more'}
                        </span>
                    </div>

                    <div className="restaurant-details">
                        <div className="detail-item">
                            <span className="detail-icon">⏱️</span>
                            <span>{formatDeliveryTime(restaurant.deliveryTime)}</span>
                        </div>
                        {getDeliveryFeeText() && (
                            <div className="detail-item">
                                <span className="detail-icon">🚚</span>
                                <span>{getDeliveryFeeText()}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <span className="detail-icon">💵</span>
                            <span>{restaurant.priceRange || '$$'}</span>
                        </div>
                        {getDistanceText() && (
                            <div className="detail-item">
                                <span className="detail-icon">📍</span>
                                <span>{getDistanceText()}</span>
                            </div>
                        )}
                        {getMinimumOrderText() && (
                            <div className="detail-item">
                                <span className="detail-icon">🛒</span>
                                <span>{getMinimumOrderText()}</span>
                            </div>
                        )}
                    </div>

                    {restaurant.isOpen && restaurant.promoText && (
                        <div className="promo-text">
                            <span className="promo-icon">🎉</span>
                            <span>{restaurant.promoText}</span>
                        </div>
                    )}

                    <div className="card-footer">
                        <Button
                            variant="primary"
                            size="small"
                            onClick={handleQuickView}
                            className="quick-view-btn"
                            fullWidth
                        >
                            Quick View
                        </Button>
                    </div>
                </div>
            </Link>
        </div>
    );
};

// Horizontal Scrolling List Component
const RestaurantHorizontalList = ({ title, restaurants, onViewAll, loading = false }) => {
    if (loading) {
        return (
            <div className="restaurant-horizontal-list">
                <div className="list-header">
                    <h2 className="list-title">{title}</h2>
                </div>
                <div className="horizontal-scroll loading">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="restaurant-card-skeleton">
                            <div className="skeleton-image shimmer"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-title shimmer"></div>
                                <div className="skeleton-rating shimmer"></div>
                                <div className="skeleton-info shimmer"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!restaurants || restaurants.length === 0) return null;

    return (
        <div className="restaurant-horizontal-list">
            <div className="list-header">
                <h2 className="list-title">{title}</h2>
                {onViewAll && (
                    <button className="view-all-btn" onClick={onViewAll}>
                        View All <span className="arrow">→</span>
                    </button>
                )}
            </div>
            <div className="horizontal-scroll">
                {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} variant="compact" />
                ))}
            </div>
        </div>
    );
};

// Grid List Component
export const RestaurantGridList = ({ restaurants, columns = 3, onQuickView, onFavorite, loading = false }) => {
    if (loading) {
        return (
            <div className={`restaurant-grid grid-cols-${columns}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="restaurant-card-skeleton">
                        <div className="skeleton-image shimmer"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-title shimmer"></div>
                            <div className="skeleton-rating shimmer"></div>
                            <div className="skeleton-details shimmer"></div>
                            <div className="skeleton-button shimmer"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!restaurants || restaurants.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">🍽️</span>
                <h3>No restaurants found</h3>
                <p>Try adjusting your filters or search criteria</p>
            </div>
        );
    }

    return (
        <div className={`restaurant-grid grid-cols-${columns}`}>
            {restaurants.map((restaurant) => (
                <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onQuickView={onQuickView}
                    onFavorite={onFavorite}
                />
            ))}
        </div>
    );
};

// Featured Restaurant Component (large hero card)
export const FeaturedRestaurant = ({ restaurant, onOrderNow }) => {
    return (
        <div className="featured-restaurant">
            <div className="featured-image">
                <img src={restaurant.coverImage || restaurant.image} alt={restaurant.name} />
                <div className="featured-overlay">
                    <div className="featured-content">
                        <span className="featured-badge">Featured</span>
                        <h2>{restaurant.name}</h2>
                        <p>{restaurant.description}</p>
                        <div className="featured-stats">
                            <RatingStars rating={restaurant.rating} size="medium" readonly />
                            <span className="featured-reviews">{restaurant.reviewCount} reviews</span>
                        </div>
                        <Button variant="primary" size="large" onClick={() => onOrderNow?.(restaurant.id)}>
                            Order Now →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { RestaurantCard, RestaurantHorizontalList };
export default RestaurantCard;
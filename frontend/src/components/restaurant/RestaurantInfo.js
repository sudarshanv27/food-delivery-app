// src/components/restaurant/RestaurantInfo.js
import React, { useState, useEffect } from 'react';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';
import './RestaurantInfo.css';

const RestaurantInfo = ({ restaurant, onBack, onViewMenu, onWriteReview }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formatDeliveryTime = (minutes) => {
        if (!minutes) return 'N/A';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getStatusColor = () => {
        if (restaurant.isOpen) return '#4caf50';
        return '#f44336';
    };

    const getStatusText = () => {
        if (restaurant.isOpen) return 'Open Now';
        return 'Closed';
    };

    const getTodayHours = () => {
        const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
        const hours = restaurant.hours?.[today] || restaurant.operatingHours?.[today];
        return hours || '10:00 AM - 10:00 PM';
    };

    const getNextOpenTime = () => {
        if (restaurant.isOpen) return null;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[currentTime.getDay()];
        const todayHours = restaurant.hours?.[today] || restaurant.operatingHours?.[today];
        if (todayHours) {
            const openTime = todayHours.split(' - ')[0];
            return openTime;
        }
        return 'Tomorrow';
    };

    const infoItems = [
        { icon: '⏱️', label: 'Delivery Time', value: formatDeliveryTime(restaurant.deliveryTime), highlight: true },
        { icon: '💰', label: 'Price Range', value: restaurant.priceRange || '$$', highlight: false },
        { icon: '📍', label: 'Distance', value: restaurant.distance ? `${restaurant.distance} km` : 'Nearby', highlight: false },
        { icon: '🍽️', label: 'Cuisines', value: restaurant.cuisine?.join(' • ') || 'Various', highlight: true },
        { icon: '🏷️', label: 'Address', value: restaurant.address || 'Address not available', highlight: false },
        { icon: '📞', label: 'Phone', value: restaurant.phone || 'N/A', highlight: false },
        { icon: '💰', label: 'Min Order', value: restaurant.minOrder ? `₹${restaurant.minOrder}` : 'N/A', highlight: false },
        { icon: '🚚', label: 'Delivery Fee', value: restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee || 40}`, highlight: false },
    ];

    const features = [
        { icon: '🪑', label: 'Dine-in', available: restaurant.dineIn !== false, description: 'Enjoy your meal at our restaurant' },
        { icon: '🛵', label: 'Delivery', available: restaurant.delivery !== false, description: 'Get it delivered to your doorstep' },
        { icon: '🥡', label: 'Takeout', available: restaurant.takeout !== false, description: 'Pick up your order' },
        { icon: '💳', label: 'Card Payment', available: restaurant.cardPayment !== false, description: 'Pay with credit/debit cards' },
        { icon: '🔄', label: 'Returns', available: restaurant.returns || false, description: 'Return policy available' },
        { icon: '⭐', label: 'Veg Options', available: restaurant.vegOptions !== false, description: 'Vegetarian friendly' },
        { icon: '♿', label: 'Wheelchair Access', available: restaurant.wheelchairAccess || false, description: 'Accessible entrance' },
        { icon: '📶', label: 'Free WiFi', available: restaurant.freeWifi || false, description: 'Complimentary WiFi' },
        { icon: '🍺', label: 'Alcohol', available: restaurant.alcohol || false, description: 'Alcoholic beverages served' },
        { icon: '🌙', label: 'Late Night', available: restaurant.lateNight || false, description: 'Open late hours' },
    ];

    const generateHours = () => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const defaultHours = restaurant.hours || restaurant.operatingHours || {};

        return days.map(day => ({
            day,
            hours: defaultHours[day] || '10:00 AM - 10:00 PM',
            isToday: day === currentTime.toLocaleDateString('en-US', { weekday: 'long' })
        }));
    };

    const hours = generateHours();

    const tabs = [
        { id: 'info', label: 'Info', icon: 'ℹ️' },
        { id: 'features', label: 'Features', icon: '✨' },
        { id: 'hours', label: 'Hours', icon: '⏰' },
        { id: 'reviews', label: 'Reviews', icon: '⭐' },
    ];

    return (
        <div className="restaurant-info">
            {/* Cover Image */}
            <div className="info-cover">
                <img
                    src={restaurant.coverImage || restaurant.image || '/default-cover.jpg'}
                    alt={restaurant.name}
                    className="cover-image"
                    onError={(e) => { e.target.src = '/default-cover.jpg'; }}
                />
                <div className="cover-overlay"></div>
                <button className="back-btn" onClick={onBack}>
                    ← Back
                </button>
                <div className="cover-badge">
                    <span className="badge-icon">🏆</span>
                    <span>Popular Choice</span>
                </div>
            </div>

            <div className="info-content">
                {/* Restaurant Header */}
                <div className="info-header">
                    <div className="header-left">
                        <div className="restaurant-logo-wrapper">
                            <img
                                src={restaurant.logo || restaurant.image || '/default-restaurant.jpg'}
                                alt={restaurant.name}
                                className="restaurant-logo"
                                onError={(e) => { e.target.src = '/default-restaurant.jpg'; }}
                            />
                            {restaurant.isPromoted && <span className="promoted-star">⭐</span>}
                        </div>
                        <div className="restaurant-details">
                            <h1 className="restaurant-name">{restaurant.name}</h1>
                            <div className="restaurant-meta">
                                <RatingStars rating={restaurant.rating || 4.5} size="medium" readonly />
                                <span className="review-count">({restaurant.reviewCount || 0}+ reviews)</span>
                                <span className="separator">•</span>
                                <span className="restaurant-id">{restaurant.cuisine?.[0] || 'Restaurant'}</span>
                            </div>
                            <div className="restaurant-status">
                                <span className="status-dot" style={{ background: getStatusColor() }}></span>
                                <span className="status-text">{getStatusText()}</span>
                                {!restaurant.isOpen && (
                                    <span className="next-open">Opens at {getNextOpenTime()}</span>
                                )}
                                {restaurant.isOpen && restaurant.estimatedWait && (
                                    <span className="wait-time">⏱️ Wait time: {restaurant.estimatedWait} min</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Button variant="primary" onClick={onViewMenu} icon="🍽️">
                            View Menu
                        </Button>
                        <Button variant="outline" onClick={onWriteReview} icon="✍️">
                            Write Review
                        </Button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="info-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <>
                            {/* Info Grid */}
                            <div className="info-grid">
                                {infoItems.map((item, index) => (
                                    item.value && (
                                        <div key={index} className={`info-card ${item.highlight ? 'highlight' : ''}`}>
                                            <div className="info-icon">{item.icon}</div>
                                            <div className="info-text">
                                                <div className="info-label">{item.label}</div>
                                                <div className="info-value">{item.value}</div>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Description */}
                            {restaurant.description && (
                                <div className="info-section">
                                    <h3 className="section-title">
                                        <span className="title-icon">📖</span>
                                        About {restaurant.name}
                                    </h3>
                                    <div className="description-wrapper">
                                        <p className={`restaurant-description ${showFullDescription ? 'expanded' : 'collapsed'}`}>
                                            {restaurant.description}
                                        </p>
                                        {restaurant.description.length > 200 && (
                                            <button
                                                className="read-more-btn"
                                                onClick={() => setShowFullDescription(!showFullDescription)}
                                            >
                                                {showFullDescription ? 'Show Less ↑' : 'Read More ↓'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Popular Dishes */}
                            {restaurant.popularDishes && restaurant.popularDishes.length > 0 && (
                                <div className="info-section">
                                    <h3 className="section-title">
                                        <span className="title-icon">🔥</span>
                                        Popular Dishes
                                    </h3>
                                    <div className="popular-dishes">
                                        {restaurant.popularDishes.map((dish, index) => (
                                            <span key={index} className="dish-tag">{dish}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div className="info-section">
                            <h3 className="section-title">
                                <span className="title-icon">✨</span>
                                Features & Amenities
                            </h3>
                            <div className="features-grid">
                                {features.map((feature, index) => (
                                    <div key={index} className={`feature-item ${feature.available ? 'available' : 'unavailable'}`}>
                                        <div className="feature-icon-wrapper">
                                            <span className="feature-icon">{feature.icon}</span>
                                        </div>
                                        <div className="feature-content">
                                            <div className="feature-label">{feature.label}</div>
                                            <div className="feature-description">{feature.description}</div>
                                        </div>
                                        <div className="feature-status">
                                            {feature.available ? (
                                                <span className="status-available">✓ Available</span>
                                            ) : (
                                                <span className="status-unavailable">✗ Unavailable</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hours Tab */}
                    {activeTab === 'hours' && (
                        <div className="info-section">
                            <h3 className="section-title">
                                <span className="title-icon">⏰</span>
                                Operating Hours
                            </h3>
                            <div className="hours-table">
                                {hours.map((hour, index) => (
                                    <div key={index} className={`hour-row ${hour.isToday ? 'today' : ''}`}>
                                        <span className="hour-day">{hour.day}</span>
                                        <span className="hour-time">{hour.hours}</span>
                                        {hour.isToday && (
                                            <span className="today-badge">Today</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {!restaurant.isOpen && (
                                <div className="closed-message">
                                    <span className="message-icon">🕒</span>
                                    <span>We're currently closed. We'll be back at {getNextOpenTime()}!</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="info-section">
                            <h3 className="section-title">
                                <span className="title-icon">⭐</span>
                                Customer Reviews
                            </h3>
                            <div className="reviews-summary">
                                <div className="rating-summary">
                                    <div className="rating-score">{restaurant.rating?.toFixed(1) || '4.5'}</div>
                                    <RatingStars rating={restaurant.rating || 4.5} size="large" readonly />
                                    <div className="rating-count">Based on {restaurant.reviewCount || 0} reviews</div>
                                </div>
                                <button className="write-review-btn" onClick={onWriteReview}>
                                    Write a Review
                                </button>
                            </div>

                            {/* Sample Reviews */}
                            {restaurant.sampleReviews && restaurant.sampleReviews.length > 0 ? (
                                <div className="reviews-list">
                                    {restaurant.sampleReviews.map((review, index) => (
                                        <div key={index} className="review-card">
                                            <div className="review-header">
                                                <div className="reviewer-info">
                                                    <span className="reviewer-avatar">{review.userName?.charAt(0)}</span>
                                                    <div>
                                                        <div className="reviewer-name">{review.userName}</div>
                                                        <RatingStars rating={review.rating} size="small" readonly />
                                                    </div>
                                                </div>
                                                <div className="review-date">{review.date}</div>
                                            </div>
                                            <p className="review-text">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-reviews">
                                    <span className="no-reviews-icon">📝</span>
                                    <p>No reviews yet. Be the first to review!</p>
                                    <Button variant="outline" size="small" onClick={onWriteReview}>
                                        Write a Review
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Location Map */}
                {restaurant.location && (
                    <div className="info-section map-section">
                        <h3 className="section-title">
                            <span className="title-icon">🗺️</span>
                            Location
                        </h3>
                        <div className="map-container">
                            <div className="map-placeholder">
                                <div className="map-icon-wrapper">
                                    <span className="map-icon">📍</span>
                                </div>
                                <div className="address-details">
                                    <p className="address-line">{restaurant.address}</p>
                                    <p className="city-line">{restaurant.city}, {restaurant.state} - {restaurant.pincode}</p>
                                </div>
                                <button className="get-directions-btn">
                                    Get Directions →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Restaurant Stats Component
export const RestaurantStats = ({ stats }) => {
    const statItems = [
        { label: 'Total Orders', value: stats.totalOrders?.toLocaleString() || '0', icon: '📦', color: '#2196f3' },
        { label: 'Avg Rating', value: stats.avgRating?.toFixed(1) || '4.5', icon: '⭐', color: '#ffc107' },
        { label: 'Avg Delivery Time', value: `${stats.avgDeliveryTime || 30} min`, icon: '⏱️', color: '#4caf50' },
        { label: 'Customer Satisfaction', value: `${stats.satisfaction || 92}%`, icon: '😊', color: '#ff9800' },
        { label: 'Completion Rate', value: `${stats.completionRate || 98}%`, icon: '✅', color: '#8bc34a' },
        { label: 'Returning Customers', value: `${stats.returningRate || 65}%`, icon: '🔄', color: '#9c27b0' },
    ];

    return (
        <div className="restaurant-stats">
            {statItems.map((item, index) => (
                <div key={index} className="stat-item" style={{ borderLeftColor: item.color }}>
                    <div className="stat-icon" style={{ background: `${item.color}20`, color: item.color }}>
                        {item.icon}
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{item.value}</div>
                        <div className="stat-label">{item.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RestaurantInfo;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DeliveryMap.css';

const DeliveryMap = ({
    restaurantLocation,
    customerLocation,
    deliveryPartnerLocation,
    onLocationUpdate,
    orderStatus = 'preparing',
    estimatedDeliveryTime,
    showLiveTracking = true,
    showRouteInfo = true,
    showLocationDetails = true,
    showLiveUpdates = true,
    showShareTracking = true,
    showETA = true,
    mapProvider = 'mock', // 'mock', 'google', 'leaflet'
    apiKey = '',
    onMapLoad,
    onRouteCalculated,
    onDeliveryComplete
}) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [deliveryProgress, setDeliveryProgress] = useState(0);
    const [currentStatus, setCurrentStatus] = useState(orderStatus);
    const [liveUpdates, setLiveUpdates] = useState([]);
    const [trackingLink, setTrackingLink] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [deliveryLocation, setDeliveryLocation] = useState(deliveryPartnerLocation);
    const mapRef = useRef(null);
    const animationRef = useRef(null);

    // Mock locations for demonstration
    const defaultRestaurant = { lat: 40.7128, lng: -74.0060, address: '123 Main Street, Downtown' };
    const defaultCustomer = { lat: 40.7580, lng: -73.9855, address: '456 Park Avenue, Uptown' };
    const defaultDelivery = { lat: 40.7350, lng: -73.9950, address: 'En Route' };

    const restaurant = restaurantLocation || defaultRestaurant;
    const customer = customerLocation || defaultCustomer;
    const delivery = deliveryLocation || defaultDelivery;

    useEffect(() => {
        // Simulate map load
        const timer = setTimeout(() => {
            setMapLoaded(true);
            onMapLoad?.();
        }, 500);

        calculateRoute();
        generateTrackingLink();

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (currentStatus === 'delivered') {
            onDeliveryComplete?.();
        }
    }, [currentStatus]);

    const calculateRoute = useCallback(() => {
        // Calculate distance using Haversine formula
        const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const deg2rad = (deg) => deg * (Math.PI / 180);

        const routeDistance = getDistanceFromLatLonInKm(
            restaurant.lat, restaurant.lng,
            customer.lat, customer.lng
        );

        const routeDuration = Math.round(routeDistance * 5); // Assuming 5 minutes per km
        const progress = calculateProgress();

        setDistance(routeDistance);
        setDuration(routeDuration);
        setDeliveryProgress(progress);
        onRouteCalculated?.({ distance: routeDistance, duration: routeDuration });
    }, [restaurant, customer, delivery]);

    const calculateProgress = () => {
        if (currentStatus === 'delivered') return 100;
        if (currentStatus === 'delivered_to_restaurant') return 25;
        if (currentStatus === 'picked_up') return 50;
        if (currentStatus === 'on_the_way') return 75;
        return 0;
    };

    const generateTrackingLink = () => {
        const orderId = localStorage.getItem('currentOrderId') || 'ORD' + Date.now();
        const link = `${window.location.origin}/track-order/${orderId}`;
        setTrackingLink(link);
    };

    const copyTrackingLink = () => {
        navigator.clipboard.writeText(trackingLink);
        addLiveUpdate('Tracking link copied to clipboard', 'info');
        setTimeout(() => setShowShareModal(false), 1500);
    };

    const addLiveUpdate = (message, type = 'info') => {
        const newUpdate = {
            id: Date.now(),
            time: new Date(),
            message,
            type
        };
        setLiveUpdates(prev => [newUpdate, ...prev].slice(0, 10));
    };

    const simulateDeliveryProgress = () => {
        if (animationRef.current) return;

        let progress = 0;
        animationRef.current = setInterval(() => {
            progress += 5;
            if (progress >= 100) {
                clearInterval(animationRef.current);
                animationRef.current = null;
                setCurrentStatus('delivered');
                addLiveUpdate('Order has been delivered successfully!', 'success');
            } else {
                setDeliveryProgress(progress);
                if (progress === 25) {
                    setCurrentStatus('delivered_to_restaurant');
                    addLiveUpdate('Delivery partner has arrived at restaurant', 'info');
                } else if (progress === 50) {
                    setCurrentStatus('picked_up');
                    addLiveUpdate('Order has been picked up! On the way to you', 'success');
                } else if (progress === 75) {
                    setCurrentStatus('on_the_way');
                    addLiveUpdate('Delivery partner is nearby', 'info');
                }
            }
        }, 1000);
    };

    const getStatusText = () => {
        switch (currentStatus) {
            case 'preparing': return 'Restaurant is preparing your order';
            case 'ready_for_pickup': return 'Order ready for pickup';
            case 'delivered_to_restaurant': return 'Delivery partner at restaurant';
            case 'picked_up': return 'Order picked up';
            case 'on_the_way': return 'Delivery partner on the way';
            case 'delivered': return 'Order delivered!';
            default: return 'Processing order';
        }
    };

    const getStatusColor = () => {
        switch (currentStatus) {
            case 'delivered': return '#4caf50';
            case 'on_the_way': return '#2196f3';
            case 'picked_up': return '#ff9800';
            default: return '#ff4757';
        }
    };

    const getDistanceText = () => {
        if (!distance) return 'Calculating...';
        return `${distance.toFixed(1)} km`;
    };

    const getDurationText = () => {
        if (!duration) return 'Calculating...';
        if (duration < 60) return `${duration} mins`;
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        return `${hours}h ${mins}m`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!mapLoaded) {
        return (
            <div className="delivery-map-loading">
                <div className="map-spinner"></div>
                <p>Loading map...</p>
            </div>
        );
    }

    return (
        <div className="delivery-map">
            {/* Map Container */}
            <div className="map-container">
                {mapProvider === 'mock' ? (
                    <div className="mock-map-container">
                        <div className="map-background">
                            <div className="map-grid">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="grid-line horizontal" style={{ top: `${i * 5}%` }} />
                                ))}
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="grid-line vertical" style={{ left: `${i * 5}%` }} />
                                ))}
                            </div>

                            {/* Delivery Progress Route */}
                            <svg className="route-svg">
                                <defs>
                                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#ff4757" />
                                        <stop offset="100%" stopColor="#4caf50" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Route Path */}
                                <path
                                    d="M 80 180 Q 200 100, 320 250"
                                    stroke="url(#routeGradient)"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray="8,4"
                                    filter="url(#glow)"
                                />

                                {/* Progress Path */}
                                <path
                                    d="M 80 180 Q 200 100, 320 250"
                                    stroke="#ff4757"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${deliveryProgress * 3}, 300`}
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Restaurant Marker */}
                            <div className="map-marker restaurant-marker" style={{ left: '15%', top: '60%' }}>
                                <div className="marker-icon">🏪</div>
                                <div className="marker-label">Restaurant</div>
                                <div className="marker-pulse"></div>
                                <div className="marker-tooltip">
                                    {restaurant.address}
                                </div>
                            </div>

                            {/* Delivery Partner Marker */}
                            <div
                                className="map-marker delivery-marker"
                                style={{
                                    left: `${30 + deliveryProgress * 0.7}%`,
                                    top: `${70 - deliveryProgress * 0.5}%`
                                }}
                            >
                                <div className="marker-icon">🛵</div>
                                <div className="marker-label">Delivery Partner</div>
                                <div className="marker-pulse"></div>
                                <div className="marker-tooltip">
                                    {delivery.address}
                                </div>
                            </div>

                            {/* Customer Marker */}
                            <div className="map-marker customer-marker" style={{ left: '75%', top: '30%' }}>
                                <div className="marker-icon">🏠</div>
                                <div className="marker-label">Your Location</div>
                                <div className="marker-tooltip">
                                    {customer.address}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div id="map" ref={mapRef} className="real-map" />
                )}
            </div>

            {/* Delivery Progress Bar */}
            {showLiveTracking && (
                <div className="delivery-progress">
                    <div className="progress-header">
                        <span className="progress-title">Delivery Progress</span>
                        <span className="progress-percentage">{deliveryProgress}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${deliveryProgress}%`, backgroundColor: getStatusColor() }}
                        />
                        <div
                            className="progress-bar-glow"
                            style={{ left: `${deliveryProgress}%` }}
                        />
                    </div>
                    <div className="progress-steps">
                        <div className={`step ${deliveryProgress >= 25 ? 'completed' : ''}`}>
                            <div className="step-dot"></div>
                            <span>Restaurant</span>
                        </div>
                        <div className={`step ${deliveryProgress >= 50 ? 'completed' : ''}`}>
                            <div className="step-dot"></div>
                            <span>Picked Up</span>
                        </div>
                        <div className={`step ${deliveryProgress >= 75 ? 'completed' : ''}`}>
                            <div className="step-dot"></div>
                            <span>On The Way</span>
                        </div>
                        <div className={`step ${deliveryProgress >= 100 ? 'completed' : ''}`}>
                            <div className="step-dot"></div>
                            <span>Delivered</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Route Info Cards */}
            {showRouteInfo && (
                <div className="route-info">
                    <div className="info-card">
                        <div className="info-icon">📏</div>
                        <div className="info-content">
                            <div className="info-label">Distance</div>
                            <div className="info-value">{getDistanceText()}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">⏱️</div>
                        <div className="info-content">
                            <div className="info-label">Estimated Time</div>
                            <div className="info-value">{getDurationText()}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">🚚</div>
                        <div className="info-content">
                            <div className="info-label">Delivery Status</div>
                            <div className="info-value" style={{ color: getStatusColor() }}>
                                {getStatusText()}
                            </div>
                        </div>
                    </div>

                    {showETA && estimatedDeliveryTime && (
                        <div className="info-card">
                            <div className="info-icon">⌛</div>
                            <div className="info-content">
                                <div className="info-label">ETA</div>
                                <div className="info-value">{estimatedDeliveryTime}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Location Details */}
            {showLocationDetails && (
                <div className="location-details">
                    <div className="location-item">
                        <div className="location-dot pickup"></div>
                        <div className="location-info">
                            <div className="location-type">Pickup Location</div>
                            <div className="location-address">{restaurant.address}</div>
                            <div className="location-contact">
                                <span className="contact-icon">📞</span>
                                <span>+1 234 567 8900</span>
                            </div>
                        </div>
                    </div>

                    <div className="location-connector">
                        <div className="connector-line"></div>
                        <div className="connector-car">🛵</div>
                    </div>

                    <div className="location-item">
                        <div className="location-dot dropoff"></div>
                        <div className="location-info">
                            <div className="location-type">Dropoff Location</div>
                            <div className="location-address">{customer.address}</div>
                            <div className="location-eta">
                                <span className="eta-icon">🕐</span>
                                <span>ETA: {getDurationText()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Updates */}
            {showLiveUpdates && (
                <div className="live-updates">
                    <div className="update-header">
                        <span className="live-dot"></span>
                        <span className="update-title">Live Updates</span>
                        <span className="update-count">{liveUpdates.length}</span>
                    </div>
                    <div className="update-list">
                        {liveUpdates.length === 0 ? (
                            <div className="update-empty">
                                <span>No updates yet</span>
                            </div>
                        ) : (
                            liveUpdates.map(update => (
                                <div key={update.id} className={`update-item update-${update.type}`}>
                                    <span className="update-time">{formatTime(update.time)}</span>
                                    <span className="update-text">{update.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Share Tracking */}
            {showShareTracking && (
                <div className="share-tracking">
                    <button className="share-btn" onClick={() => setShowShareModal(true)}>
                        <span className="btn-icon">📤</span>
                        Share Tracking Link
                    </button>
                    <button className="refresh-btn" onClick={() => window.location.reload()}>
                        <span className="btn-icon">🔄</span>
                        Refresh Location
                    </button>
                    {currentStatus !== 'delivered' && deliveryProgress < 100 && (
                        <button className="simulate-btn" onClick={simulateDeliveryProgress}>
                            <span className="btn-icon">🚀</span>
                            Simulate Delivery
                        </button>
                    )}
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h3>Share Tracking Link</h3>
                            <button className="modal-close" onClick={() => setShowShareModal(false)}>✕</button>
                        </div>
                        <div className="share-modal-body">
                            <p>Share this link with friends and family to track your delivery:</p>
                            <div className="tracking-link-container">
                                <input
                                    type="text"
                                    value={trackingLink}
                                    readOnly
                                    className="tracking-link-input"
                                />
                                <button className="copy-link-btn" onClick={copyTrackingLink}>
                                    Copy
                                </button>
                            </div>
                            <div className="share-options">
                                <button className="share-option whatsapp">
                                    <span>💬</span> WhatsApp
                                </button>
                                <button className="share-option messenger">
                                    <span>💬</span> Messenger
                                </button>
                                <button className="share-option twitter">
                                    <span>🐦</span> Twitter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Banner for Delivered */}
            {currentStatus === 'delivered' && (
                <div className="delivered-banner">
                    <div className="banner-icon">🎉</div>
                    <div className="banner-text">
                        <h4>Order Delivered!</h4>
                        <p>Thank you for ordering with us. Enjoy your meal!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Mini Map Component for Order Card (Enhanced)
export const MiniMap = ({ restaurantLat, restaurantLng, customerLat, customerLng, distance }) => {
    const [displayDistance, setDisplayDistance] = useState(distance || '3.2');

    return (
        <div className="mini-map">
            <div className="mini-map-container">
                <div className="mini-route-line">
                    <div className="mini-marker start">
                        <span className="marker-emoji">🏪</span>
                        <span className="marker-label">Restaurant</span>
                    </div>
                    <div className="mini-route-animation">
                        <div className="route-dots"></div>
                    </div>
                    <div className="mini-marker end">
                        <span className="marker-emoji">🏠</span>
                        <span className="marker-label">You</span>
                    </div>
                </div>
            </div>
            <div className="mini-map-distance">
                <span className="distance-icon">📍</span>
                <span className="distance-value">{displayDistance} km away</span>
            </div>
        </div>
    );
};

// Delivery Status Badge Component
export const DeliveryStatusBadge = ({ status, size = 'medium' }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'preparing':
                return { label: 'Preparing', icon: '👨‍🍳', color: '#ff9800' };
            case 'ready_for_pickup':
                return { label: 'Ready for Pickup', icon: '✅', color: '#2196f3' };
            case 'picked_up':
                return { label: 'Picked Up', icon: '📦', color: '#9c27b0' };
            case 'on_the_way':
                return { label: 'On The Way', icon: '🚚', color: '#ff4757' };
            case 'delivered':
                return { label: 'Delivered', icon: '🎉', color: '#4caf50' };
            default:
                return { label: 'Processing', icon: '⏳', color: '#999' };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`delivery-status-badge ${size}`} style={{ borderLeftColor: config.color }}>
            <span className="status-icon">{config.icon}</span>
            <span className="status-label">{config.label}</span>
        </div>
    );
};

export default DeliveryMap;
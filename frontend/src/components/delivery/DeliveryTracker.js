import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './DeliveryTracker.css';

const DeliveryTracker = ({
    orderId,
    onStatusUpdate,
    onTrackLive,
    showMap = true,
    showPartnerInfo = true,
    showRestaurantInfo = true,
    showOrderSummary = true,
    autoRefresh = true,
    refreshInterval = 30000,
    theme = 'light',
    enableVoiceUpdates = false,
    enableShareTracking = true
}) => {
    const [currentStatus, setCurrentStatus] = useState('confirmed');
    const [orderDetails, setOrderDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [deliveryProgress, setDeliveryProgress] = useState(0);
    const [liveLocation, setLiveLocation] = useState(null);
    const [error, setError] = useState(null);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [shareLink, setShareLink] = useState('');

    const statuses = useMemo(() => [
        { id: 'confirmed', label: 'Order Confirmed', icon: '✅', time: 'Order placed', description: 'Your order has been confirmed', progress: 0 },
        { id: 'preparing', label: 'Preparing Your Food', icon: '👨‍🍳', time: 'Restaurant is preparing', description: 'Chef is preparing your delicious meal', progress: 20 },
        { id: 'quality_check', label: 'Quality Check', icon: '🔍', time: 'Quality check', description: 'Food is being quality checked', progress: 40 },
        { id: 'ready', label: 'Ready for Pickup', icon: '📦', time: 'Food is ready', description: 'Order is ready for pickup', progress: 60 },
        { id: 'picked_up', label: 'Picked Up', icon: '🛵', time: 'Delivery partner assigned', description: 'Delivery partner has picked up your order', progress: 75 },
        { id: 'on_the_way', label: 'On The Way', icon: '🚚', time: 'Out for delivery', description: 'Your order is on the way', progress: 90 },
        { id: 'nearby', label: 'Nearby', icon: '📍', time: 'Almost there', description: 'Delivery partner is nearby', progress: 95 },
        { id: 'delivered', label: 'Delivered', icon: '🎉', time: 'Order completed', description: 'Order has been delivered successfully', progress: 100 }
    ], []);

    useEffect(() => {
        fetchOrderStatus();
        if (autoRefresh) {
            const interval = setInterval(fetchOrderStatus, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [orderId, autoRefresh, refreshInterval]);

    useEffect(() => {
        if (currentStatus && onStatusUpdate) {
            onStatusUpdate(currentStatus);
        }
        updateDeliveryProgress();
    }, [currentStatus]);

    useEffect(() => {
        if (enableVoiceUpdates && !voiceEnabled) {
            checkVoiceSupport();
        }
        generateShareLink();
    }, []);

    const fetchOrderStatus = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate API call - replace with actual API
            const response = await simulateApiCall(orderId);

            setOrderDetails(response.orderDetails);
            setCurrentStatus(response.currentStatus);
            setEstimatedTime(response.estimatedDeliveryTime);
            setLiveLocation(response.liveLocation);

            // Voice update for status change
            if (enableVoiceUpdates && voiceEnabled && response.currentStatus !== currentStatus) {
                speakStatus(response.currentStatus);
            }
        } catch (error) {
            console.error('Error fetching order status:', error);
            setError('Failed to fetch order status. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const simulateApiCall = async (orderId) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const now = new Date();
        const mockOrderDetails = {
            id: orderId,
            status: currentStatus,
            restaurant: {
                name: 'Pizza Hut',
                address: '123 Main Street, Downtown',
                phone: '+1 234 567 8900',
                rating: 4.5,
                cuisine: 'Italian',
                image: 'https://via.placeholder.com/60'
            },
            deliveryPartner: {
                name: 'Raj Kumar',
                phone: '+1 234 567 8901',
                rating: 4.8,
                vehicleNumber: 'DL 01 AB 1234',
                vehicleType: 'Motorcycle',
                totalDeliveries: 1250,
                joinDate: '2023-01-15',
                photo: 'https://via.placeholder.com/80'
            },
            estimatedDeliveryTime: new Date(now + 25 * 60000),
            items: [
                { name: 'Margherita Pizza', quantity: 1, price: 250, image: '🍕' },
                { name: 'Garlic Bread', quantity: 2, price: 100, image: '🥖' },
                { name: 'Coke', quantity: 2, price: 60, image: '🥤' }
            ],
            subtotal: 470,
            deliveryFee: 30,
            tax: 25,
            total: 525,
            paymentMethod: 'Online',
            specialInstructions: 'Please ring the doorbell twice'
        };

        const liveLocationData = {
            lat: 40.7350 + (Math.random() - 0.5) * 0.01,
            lng: -73.9950 + (Math.random() - 0.5) * 0.01,
            accuracy: 50,
            lastUpdate: new Date()
        };

        return {
            orderDetails: mockOrderDetails,
            currentStatus: currentStatus,
            estimatedDeliveryTime: mockOrderDetails.estimatedDeliveryTime,
            liveLocation: liveLocationData
        };
    };

    const updateDeliveryProgress = () => {
        const currentStatusObj = statuses.find(s => s.id === currentStatus);
        if (currentStatusObj) {
            setDeliveryProgress(currentStatusObj.progress);
        }
    };

    const getCurrentStatusIndex = () => {
        return statuses.findIndex(s => s.id === currentStatus);
    };

    const formatTime = (date) => {
        if (!date) return 'Calculating...';
        const now = new Date();
        const diff = Math.max(0, Math.floor((date - now) / 60000));
        if (diff === 0) return 'Arriving any moment';
        if (diff < 60) return `${diff} minute${diff > 1 ? 's' : ''}`;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    const formatDate = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const checkVoiceSupport = () => {
        if ('speechSynthesis' in window) {
            setVoiceEnabled(true);
        } else {
            console.warn('Voice synthesis not supported');
        }
    };

    const speakStatus = (status) => {
        const statusText = statuses.find(s => s.id === status)?.label || status;
        const message = `Your order status has been updated to ${statusText}`;

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const generateShareLink = () => {
        const link = `${window.location.origin}/track-order/${orderId}`;
        setShareLink(link);
    };

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            alert('Tracking link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareViaWhatsApp = () => {
        const text = `Track my order #${orderId}: ${shareLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleContactPartner = () => {
        if (orderDetails?.deliveryPartner?.phone) {
            window.location.href = `tel:${orderDetails.deliveryPartner.phone}`;
        }
    };

    const handleCallRestaurant = () => {
        if (orderDetails?.restaurant?.phone) {
            window.location.href = `tel:${orderDetails.restaurant.phone}`;
        }
    };

    const handleTrackLive = () => {
        if (onTrackLive) {
            onTrackLive();
        }
    };

    const currentIndex = getCurrentStatusIndex();
    const isDelivered = currentStatus === 'delivered';

    if (isLoading) {
        return (
            <div className={`delivery-tracker-loading ${theme}`}>
                <div className="tracker-spinner">
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                </div>
                <p>Loading tracking details...</p>
                <span className="loading-subtitle">Please wait while we fetch your order status</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`delivery-tracker-error ${theme}`}>
                <div className="error-illustration">⚠️</div>
                <div className="error-message">{error}</div>
                <button className="retry-tracker-btn" onClick={fetchOrderStatus}>
                    🔄 Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={`delivery-tracker ${theme}`}>
            {/* Header with Share Option */}
            <div className="tracker-header">
                <div className="header-left">
                    <h2 className="tracker-title">Track Your Order</h2>
                    <div className="order-id-badge">Order #{orderId}</div>
                </div>
                {enableShareTracking && (
                    <div className="share-dropdown">
                        <button className="share-trigger-btn">📤 Share</button>
                        <div className="share-dropdown-menu">
                            <button onClick={copyShareLink}>📋 Copy Link</button>
                            <button onClick={shareViaWhatsApp}>💬 WhatsApp</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Overview */}
            <div className="progress-overview">
                <div className="overview-stats">
                    <div className="stat-item">
                        <span className="stat-value">{deliveryProgress}%</span>
                        <span className="stat-label">Complete</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{statuses[currentIndex]?.label}</span>
                        <span className="stat-label">Current Status</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{formatTime(estimatedTime)}</span>
                        <span className="stat-label">ETA</span>
                    </div>
                </div>
                <div className="global-progress-bar">
                    <div
                        className="global-progress-fill"
                        style={{ width: `${deliveryProgress}%` }}
                    >
                        <div className="progress-wave"></div>
                    </div>
                </div>
            </div>

            {/* Enhanced Progress Timeline */}
            <div className="progress-timeline-enhanced">
                {statuses.map((status, index) => (
                    <div
                        key={status.id}
                        className={`timeline-step-enhanced ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''} ${index < currentIndex ? 'past' : ''}`}
                        onClick={() => index <= currentIndex && setCurrentStatus(status.id)}
                    >
                        <div className="step-marker">
                            <div className="step-icon-wrapper">
                                <div className="step-icon">{status.icon}</div>
                                {index < currentIndex && <div className="step-check">✓</div>}
                            </div>
                            {index < statuses.length - 1 && (
                                <div className={`step-line-enhanced ${index < currentIndex ? 'completed' : ''}`}>
                                    <div className="line-progress" style={{ width: index < currentIndex ? '100%' : '0%' }}></div>
                                </div>
                            )}
                        </div>
                        <div className="step-content-enhanced">
                            <div className="step-label">{status.label}</div>
                            <div className="step-time">{status.time}</div>
                            {index === currentIndex && (
                                <div className="step-description">{status.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Location Map with Enhanced Features */}
            {showMap && currentStatus !== 'delivered' && (
                <div className="location-map-enhanced">
                    <div className="map-header">
                        <div className="map-header-left">
                            <span className="map-icon">🗺️</span>
                            <span>Live Location Tracking</span>
                            {currentIndex >= 4 && <span className="live-badge">LIVE</span>}
                        </div>
                        <button className="refresh-location-btn" onClick={fetchOrderStatus}>⟳</button>
                    </div>
                    <div className="map-placeholder-enhanced">
                        <div className="mock-map-enhanced">
                            {/* Grid Background */}
                            <div className="map-grid-bg">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="map-grid-line" style={{ top: `${i * 10}%` }}></div>
                                ))}
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="map-grid-line vertical" style={{ left: `${i * 10}%` }}></div>
                                ))}
                            </div>

                            {/* Route Path */}
                            <svg className="route-path-svg">
                                <defs>
                                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ff4757" />
                                        <stop offset="100%" stopColor="#4caf50" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <path d="M 20 200 Q 150 100, 280 200" stroke="url(#routeGradient)" strokeWidth="3" fill="none" strokeDasharray="5,5" filter="url(#glow)" />
                                <path d="M 20 200 Q 150 100, 280 200" stroke="#ff4757" strokeWidth="3" fill="none" strokeDasharray={`${deliveryProgress * 2.6}, 260`} strokeLinecap="round" />
                            </svg>

                            {/* Markers with Animation */}
                            <div className="map-marker restaurant-marker" style={{ left: '5%', top: '65%' }}>
                                <div className="marker-pulse"></div>
                                <span className="marker-emoji">🏪</span>
                                <span className="marker-label">Restaurant</span>
                            </div>
                            <div
                                className="map-marker delivery-marker"
                                style={{
                                    left: `${20 + (deliveryProgress / 100) * 60}%`,
                                    top: `${65 - (deliveryProgress / 100) * 35}%`
                                }}
                            >
                                <div className="delivery-vehicle">🛵</div>
                                <div className="delivery-trail"></div>
                                <span className="marker-label">Delivery Partner</span>
                            </div>
                            <div className="map-marker destination-marker" style={{ left: '85%', top: '25%' }}>
                                <span className="marker-emoji">🏠</span>
                                <span className="marker-label">Your Location</span>
                            </div>
                        </div>
                    </div>
                    <div className="map-controls">
                        <button className="map-control-btn" onClick={handleTrackLive}>
                            📍 Center on Delivery
                        </button>
                        <p className="map-note">*Live location updates every 30 seconds</p>
                    </div>
                </div>
            )}

            {/* Enhanced Delivery Partner Info */}
            {showPartnerInfo && currentIndex >= 3 && orderDetails?.deliveryPartner && !isDelivered && (
                <div className="delivery-partner-info-enhanced">
                    <h3 className="partner-title">
                        <span>🛵 Delivery Partner</span>
                        <span className="partner-rating-badge">⭐ {orderDetails.deliveryPartner.rating}</span>
                    </h3>
                    <div className="partner-details-enhanced">
                        <div className="partner-avatar-enhanced">
                            <img
                                src={orderDetails.deliveryPartner.photo || `https://ui-avatars.com/api/?name=${orderDetails.deliveryPartner.name}&background=ff4757&color=fff&length=2&size=80`}
                                alt={orderDetails.deliveryPartner.name}
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${orderDetails.deliveryPartner.name}&background=ff4757&color=fff`;
                                }}
                            />
                            <div className="online-status"></div>
                        </div>
                        <div className="partner-info-enhanced">
                            <div className="partner-name">{orderDetails.deliveryPartner.name}</div>
                            <div className="partner-stats">
                                <span className="stat">📦 {orderDetails.deliveryPartner.totalDeliveries}+ deliveries</span>
                                <span className="stat">🚲 {orderDetails.deliveryPartner.vehicleType}</span>
                            </div>
                            <div className="partner-actions">
                                <button className="contact-partner-btn-enhanced" onClick={handleContactPartner}>
                                    📞 Contact
                                </button>
                                <button className="message-partner-btn">💬 Message</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Restaurant Info */}
            {showRestaurantInfo && (
                <div className="restaurant-info-enhanced">
                    <h3 className="restaurant-title">
                        <span>🏪 Restaurant Details</span>
                        {orderDetails?.restaurant.rating && (
                            <span className="restaurant-rating">⭐ {orderDetails.restaurant.rating}</span>
                        )}
                    </h3>
                    <div className="restaurant-details-enhanced">
                        <div className="restaurant-basic">
                            <div className="restaurant-name">{orderDetails?.restaurant.name}</div>
                            <div className="restaurant-cuisine">{orderDetails?.restaurant.cuisine}</div>
                            <div className="restaurant-address">
                                <span className="address-icon">📍</span>
                                {orderDetails?.restaurant.address}
                            </div>
                        </div>
                        <button className="call-restaurant-btn-enhanced" onClick={handleCallRestaurant}>
                            📞 Call Restaurant
                        </button>
                    </div>
                </div>
            )}

            {/* Enhanced Order Summary */}
            {showOrderSummary && (
                <div className="order-summary-enhanced">
                    <h3 className="summary-title">Order Summary</h3>
                    <div className="order-items-enhanced">
                        {orderDetails?.items.map((item, index) => (
                            <div key={index} className="order-item-enhanced">
                                <div className="item-image">{item.image}</div>
                                <div className="item-details">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-meta">
                                        <span className="item-qty">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                                <div className="item-price">₹{item.price * item.quantity}</div>
                            </div>
                        ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>Subtotal</span>
                            <span>₹{orderDetails?.subtotal}</span>
                        </div>
                        <div className="price-row">
                            <span>Delivery Fee</span>
                            <span>₹{orderDetails?.deliveryFee}</span>
                        </div>
                        <div className="price-row">
                            <span>Tax & Charges</span>
                            <span>₹{orderDetails?.tax}</span>
                        </div>
                        <div className="price-row total">
                            <span>Total</span>
                            <span>₹{orderDetails?.total}</span>
                        </div>
                    </div>

                    <div className="order-meta">
                        <div className="meta-item">
                            <span className="meta-icon">💳</span>
                            <span>Paid via {orderDetails?.paymentMethod}</span>
                        </div>
                        {orderDetails?.specialInstructions && (
                            <div className="meta-item special">
                                <span className="meta-icon">📝</span>
                                <span>Special Instructions: {orderDetails.specialInstructions}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Enhanced Help Section */}
            <div className="help-section-enhanced">
                <div className="help-icon-enhanced">❓</div>
                <div className="help-content">
                    <div className="help-title">Need help with your order?</div>
                    <div className="help-buttons">
                        <button className="help-btn-support">💬 Live Chat</button>
                        <button className="help-btn-faq">📖 FAQs</button>
                    </div>
                </div>
            </div>

            {/* Voice Update Toggle (if supported) */}
            {enableVoiceUpdates && voiceEnabled && (
                <div className="voice-toggle">
                    <span className="voice-icon">🔊</span>
                    <span>Voice updates active</span>
                </div>
            )}

            {/* Delivery Celebration Animation */}
            {isDelivered && (
                <div className="delivery-celebration-overlay">
                    <div className="confetti"></div>
                    <div className="celebration-card">
                        <div className="celebration-emoji">🎉🍕🎉</div>
                        <div className="celebration-title">Order Delivered!</div>
                        <div className="celebration-message">Thank you for ordering with us!</div>
                        <button className="rate-order-btn-enhanced" onClick={() => window.location.href = '/rate-order'}>
                            ⭐ Rate Your Experience
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Status Badge Component
export const StatusBadge = ({ status, size = 'medium', animated = false }) => {
    const getStatusConfig = () => {
        const configs = {
            confirmed: { label: 'Confirmed', color: '#2196f3', icon: '✓', gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)' },
            preparing: { label: 'Preparing', color: '#ff9800', icon: '👨‍🍳', gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)' },
            quality_check: { label: 'Quality Check', color: '#00bcd4', icon: '🔍', gradient: 'linear-gradient(135deg, #00bcd4, #4dd0e1)' },
            ready: { label: 'Ready', color: '#9c27b0', icon: '📦', gradient: 'linear-gradient(135deg, #9c27b0, #ce93d8)' },
            picked_up: { label: 'Picked Up', color: '#ff4757', icon: '🛵', gradient: 'linear-gradient(135deg, #ff4757, #ff7675)' },
            on_the_way: { label: 'On The Way', color: '#ff4757', icon: '🚚', gradient: 'linear-gradient(135deg, #ff4757, #ff7675)' },
            nearby: { label: 'Nearby', color: '#ff9800', icon: '📍', gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)' },
            delivered: { label: 'Delivered', color: '#4caf50', icon: '🎉', gradient: 'linear-gradient(135deg, #4caf50, #81c784)' }
        };
        return configs[status] || configs.confirmed;
    };

    const config = getStatusConfig();

    return (
        <div className={`status-badge-enhanced ${size} ${animated ? 'pulse-animation' : ''}`} style={{ background: config.gradient }}>
            <span className="badge-icon">{config.icon}</span>
            <span className="badge-label">{config.label}</span>
        </div>
    );
};

// Timeline Component for Mini Display
export const MiniDeliveryTimeline = ({ status, compact = false }) => {
    const statusOrder = ['confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    const progress = ((currentIndex + 1) / statusOrder.length) * 100;

    return (
        <div className={`mini-timeline ${compact ? 'compact' : ''}`}>
            <div className="mini-timeline-bar">
                <div className="mini-timeline-progress" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="mini-timeline-steps">
                {statusOrder.map((s, idx) => (
                    <div key={s} className={`mini-step ${idx <= currentIndex ? 'active' : ''}`}>
                        <div className="mini-step-dot"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryTracker;
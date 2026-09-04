import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './DeliveryStatus.css';

const DeliveryStatus = ({
    orderId,
    onStatusChange,
    onTrackDelivery,
    showTimeline = true,
    showETA = true,
    showInstructions = true,
    showActions = true,
    autoRefresh = true,
    refreshInterval = 10000,
    enableNotifications = false,
    theme = 'light'
}) => {
    const [currentStatus, setCurrentStatus] = useState('pending');
    const [statusHistory, setStatusHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eta, setEta] = useState(null);
    const [deliveryPartner, setDeliveryPartner] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    // Status configuration
    const statusConfig = useMemo(() => ({
        pending: {
            label: 'Order Placed',
            color: '#ff9800',
            icon: '📋',
            progress: 0,
            description: 'Your order has been placed successfully'
        },
        confirmed: {
            label: 'Order Confirmed',
            color: '#2196f3',
            icon: '✅',
            progress: 16,
            description: 'Restaurant has confirmed your order'
        },
        preparing: {
            label: 'Preparing Your Food',
            color: '#9c27b0',
            icon: '👨‍🍳',
            progress: 33,
            description: 'Chef is preparing your delicious meal'
        },
        quality_check: {
            label: 'Quality Check',
            color: '#00bcd4',
            icon: '🔍',
            progress: 50,
            description: 'Food is being quality checked'
        },
        ready: {
            label: 'Ready for Pickup',
            color: '#ff4757',
            icon: '📦',
            progress: 66,
            description: 'Your order is ready and waiting for pickup'
        },
        picked_up: {
            label: 'Order Picked Up',
            color: '#ff4757',
            icon: '🛵',
            progress: 75,
            description: 'Delivery partner has picked up your order'
        },
        on_the_way: {
            label: 'On The Way',
            color: '#ff4757',
            icon: '🚚',
            progress: 85,
            description: 'Your order is on the way to you'
        },
        nearby: {
            label: 'Nearby',
            color: '#ff9800',
            icon: '📍',
            progress: 95,
            description: 'Delivery partner is nearby'
        },
        delivered: {
            label: 'Delivered',
            color: '#4caf50',
            icon: '🏠',
            progress: 100,
            description: 'Order has been delivered successfully'
        },
        cancelled: {
            label: 'Cancelled',
            color: '#f44336',
            icon: '❌',
            progress: 0,
            description: 'Order has been cancelled'
        },
        refunded: {
            label: 'Refunded',
            color: '#607d8b',
            icon: '💰',
            progress: 0,
            description: 'Refund has been processed'
        }
    }), []);

    const statusOrder = ['pending', 'confirmed', 'preparing', 'quality_check', 'ready', 'picked_up', 'on_the_way', 'nearby', 'delivered'];

    useEffect(() => {
        fetchStatus();
        if (autoRefresh) {
            const interval = setInterval(fetchStatus, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [orderId, autoRefresh, refreshInterval]);

    useEffect(() => {
        if (onStatusChange && currentStatus) {
            onStatusChange(currentStatus);
        }
    }, [currentStatus, onStatusChange]);

    const fetchStatus = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate API call - replace with actual API
            const response = await simulateApiCall(orderId);

            const newStatus = response.currentStatus;
            const newHistory = response.statusHistory;
            const newEta = response.eta;
            const newDeliveryPartner = response.deliveryPartner;

            // Check for status change for notifications
            if (enableNotifications && newStatus !== currentStatus && currentStatus !== 'pending') {
                const statusChanged = statusConfig[newStatus];
                addNotification(`Order ${statusChanged.label.toLowerCase()}`, statusChanged.description);
                triggerBrowserNotification(`Order Update: ${statusChanged.label}`, statusChanged.description);
            }

            setCurrentStatus(newStatus);
            setStatusHistory(newHistory);
            setEta(newEta);
            setDeliveryPartner(newDeliveryPartner);
        } catch (error) {
            console.error('Error fetching status:', error);
            setError('Failed to fetch order status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const simulateApiCall = async (orderId) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const now = new Date();
        const mockStatusHistory = [
            { status: 'pending', timestamp: new Date(now - 45 * 60000), description: 'Order placed successfully', icon: '📋', location: 'Online' },
            { status: 'confirmed', timestamp: new Date(now - 40 * 60000), description: 'Order confirmed by restaurant', icon: '✅', location: 'Restaurant' },
            { status: 'preparing', timestamp: new Date(now - 30 * 60000), description: 'Chef is preparing your order', icon: '👨‍🍳', location: 'Kitchen' },
            { status: 'quality_check', timestamp: new Date(now - 20 * 60000), description: 'Quality check in progress', icon: '🔍', location: 'Restaurant' },
            { status: 'ready', timestamp: new Date(now - 15 * 60000), description: 'Order ready for pickup', icon: '📦', location: 'Restaurant' },
            { status: 'picked_up', timestamp: new Date(now - 10 * 60000), description: 'Picked up by delivery partner', icon: '🛵', location: 'Restaurant' },
            { status: 'on_the_way', timestamp: new Date(now - 5 * 60000), description: 'On the way to your location', icon: '🚚', location: 'En Route' },
        ];

        return {
            currentStatus: 'on_the_way',
            statusHistory: mockStatusHistory,
            eta: {
                estimated: new Date(now + 15 * 60000),
                range: { min: 15, max: 20 },
                distance: '3.2 km'
            },
            deliveryPartner: {
                name: 'John Doe',
                phone: '+1 234 567 8900',
                rating: 4.8,
                vehicle: 'Motorcycle',
                photo: 'https://via.placeholder.com/40'
            }
        };
    };

    const addNotification = (title, message) => {
        const newNotification = {
            id: Date.now(),
            title,
            message,
            timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 5));
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
    };

    const triggerBrowserNotification = (title, body) => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.ico" });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    };

    const getProgressPercentage = useCallback(() => {
        if (currentStatus === 'cancelled' || currentStatus === 'refunded') return 0;
        const currentIndex = statusOrder.indexOf(currentStatus);
        if (currentStatus === 'delivered') return 100;
        if (currentIndex === -1) return 0;
        return (currentIndex / (statusOrder.length - 1)) * 100;
    }, [currentStatus, statusOrder]);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today at ${formatTime(date)}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${formatTime(date)}`;
        }
        return date.toLocaleDateString();
    };

    const handleTrackDelivery = () => {
        if (onTrackDelivery) {
            onTrackDelivery();
        }
    };

    const getEstimatedTimeRemaining = () => {
        if (!eta || currentStatus === 'delivered') return null;
        const now = new Date();
        const diff = eta.estimated - now;
        const minutes = Math.floor(diff / 60000);

        if (minutes <= 0) return 'Arriving any moment';
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    if (isLoading) {
        return (
            <div className={`delivery-status-loading ${theme}`}>
                <div className="status-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading delivery status...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`delivery-status-error ${theme}`}>
                <div className="error-icon">⚠️</div>
                <div className="error-message">{error}</div>
                <button className="retry-btn" onClick={fetchStatus}>Try Again</button>
            </div>
        );
    }

    return (
        <div className={`delivery-status-container ${theme}`}>
            {/* Notification Toast */}
            {showNotification && notifications.length > 0 && (
                <div className="notification-toast">
                    <div className="toast-content">
                        <div className="toast-icon">🔔</div>
                        <div className="toast-text">
                            <div className="toast-title">{notifications[0].title}</div>
                            <div className="toast-message">{notifications[0].message}</div>
                        </div>
                        <button className="toast-close" onClick={() => setShowNotification(false)}>✕</button>
                    </div>
                </div>
            )}

            {/* Current Status Banner */}
            <div className="status-banner" style={{ background: `linear-gradient(135deg, ${statusConfig[currentStatus]?.color}, ${statusConfig[currentStatus]?.color}dd)` }}>
                <div className="banner-glow"></div>
                <div className="status-icon-wrapper">
                    <div className="status-icon">{statusConfig[currentStatus]?.icon}</div>
                </div>
                <div className="status-info">
                    <div className="status-label">Current Status</div>
                    <div className="status-value">{statusConfig[currentStatus]?.label}</div>
                    <div className="status-description">{statusConfig[currentStatus]?.description}</div>
                </div>
                {currentStatus === 'on_the_way' && onTrackDelivery && (
                    <button className="track-btn" onClick={handleTrackDelivery}>
                        Track Live 📍
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-header">
                    <span className="progress-title">Delivery Progress</span>
                    <span className="progress-percentage">{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="progress-bar-wrapper">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${getProgressPercentage()}%` }}
                        >
                            <div className="progress-shimmer"></div>
                        </div>
                    </div>
                    <div className="progress-milestones">
                        {statusOrder.slice(0, -1).map((status, index) => (
                            <div
                                key={status}
                                className={`milestone ${statusOrder.indexOf(currentStatus) >= index ? 'active' : ''}`}
                                style={{ left: `${(index / (statusOrder.length - 2)) * 100}%` }}
                            >
                                <div className="milestone-dot"></div>
                                <span className="milestone-label">{statusConfig[status]?.label.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Delivery Partner Info */}
            {deliveryPartner && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <div className="delivery-partner-card">
                    <div className="partner-header">
                        <div className="partner-avatar">
                            {deliveryPartner.photo ? (
                                <img src={deliveryPartner.photo} alt={deliveryPartner.name} />
                            ) : (
                                <div className="avatar-placeholder">{deliveryPartner.name.charAt(0)}</div>
                            )}
                        </div>
                        <div className="partner-info">
                            <div className="partner-name">{deliveryPartner.name}</div>
                            <div className="partner-rating">
                                {'★'.repeat(Math.floor(deliveryPartner.rating))}
                                {'☆'.repeat(5 - Math.floor(deliveryPartner.rating))}
                                <span className="rating-value">{deliveryPartner.rating}</span>
                            </div>
                            <div className="partner-vehicle">
                                <span className="vehicle-icon">🚲</span>
                                <span>{deliveryPartner.vehicle}</span>
                            </div>
                        </div>
                        <button className="contact-partner-btn" onClick={() => window.location.href = `tel:${deliveryPartner.phone}`}>
                            📞 Contact
                        </button>
                    </div>
                </div>
            )}

            {/* Status Timeline */}
            {showTimeline && (
                <div className="status-timeline">
                    <div className="timeline-header">
                        <h3>Order Timeline</h3>
                        <span className="timeline-count">{statusHistory.length} events</span>
                    </div>
                    <div className="timeline-items">
                        {statusHistory.map((statusItem, index) => (
                            <div key={index} className={`timeline-item ${statusItem.status === currentStatus ? 'current' : ''} ${index === statusHistory.length - 1 ? 'latest' : ''}`}>
                                <div className="timeline-marker" style={{ background: statusConfig[statusItem.status]?.color }}>
                                    <span className="marker-icon">{statusItem.icon}</span>
                                    {index < statusHistory.length - 1 && <div className="marker-line"></div>}
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className="timeline-status">{statusConfig[statusItem.status]?.label}</span>
                                        <span className="timeline-time">{formatTime(statusItem.timestamp)}</span>
                                    </div>
                                    <div className="timeline-description">{statusItem.description}</div>
                                    {statusItem.location && (
                                        <div className="timeline-location">
                                            <span className="location-icon">📍</span>
                                            <span>{statusItem.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estimated Delivery Time */}
            {showETA && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <div className="eta-card">
                    <div className="eta-icon">⏱️</div>
                    <div className="eta-info">
                        <div className="eta-label">Estimated Delivery Time</div>
                        <div className="eta-value">{getEstimatedTimeRemaining()}</div>
                        {eta?.range && (
                            <div className="eta-range">ETA: {eta.range.min}-{eta.range.max} minutes</div>
                        )}
                        {eta?.distance && (
                            <div className="eta-distance">Distance: {eta.distance}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Delivery Instructions */}
            {showInstructions && (
                <div className="instructions-card">
                    <div className="instructions-header">
                        <span className="instructions-icon">📝</span>
                        <span className="instructions-title">Delivery Instructions</span>
                    </div>
                    <ul className="instructions-list">
                        <li>🔔 Keep your phone handy for delivery updates</li>
                        <li>📍 Share live location for faster delivery</li>
                        <li>💬 Contact support if delivery is delayed beyond 30 minutes</li>
                        <li>💰 Have exact change ready if paying by cash</li>
                        <li>📸 Check order before accepting delivery</li>
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            {showActions && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <div className="action-buttons">
                    <button className="action-btn contact-btn" onClick={() => window.location.href = 'tel:+12345678900'}>
                        📞 Contact Restaurant
                    </button>
                    <button className="action-btn support-btn" onClick={() => window.open('/support', '_blank')}>
                        💬 Live Support
                    </button>
                    {currentStatus === 'preparing' && (
                        <button className="action-btn cancel-btn" onClick={() => {/* Handle cancellation */ }}>
                            ❌ Cancel Order
                        </button>
                    )}
                </div>
            )}

            {/* Cancelled Order Info */}
            {currentStatus === 'cancelled' && (
                <div className="cancelled-info">
                    <div className="cancelled-icon">❌</div>
                    <div className="cancelled-text">
                        <div className="cancelled-title">Order Cancelled</div>
                        <div className="cancelled-message">Your order has been cancelled. Refund will be processed within 5-7 business days.</div>
                        <button className="reorder-btn" onClick={() => window.location.href = '/restaurants'}>
                            🍔 Browse Restaurants
                        </button>
                    </div>
                </div>
            )}

            {/* Delivered Celebration */}
            {currentStatus === 'delivered' && (
                <div className="delivered-celebration">
                    <div className="celebration-icon">🎉</div>
                    <div className="celebration-text">
                        <div className="celebration-title">Order Delivered!</div>
                        <div className="celebration-message">Thank you for ordering with us!</div>
                        <button className="rate-order-btn" onClick={() => {/* Handle rating */ }}>
                            ⭐ Rate Your Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Status Badge Component
export const OrderStatusBadge = ({ status, size = 'medium', showIcon = true, animated = false }) => {
    const getStatusConfig = () => {
        const configs = {
            pending: { label: 'Pending', color: '#ff9800', icon: '⏳', gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)' },
            confirmed: { label: 'Confirmed', color: '#2196f3', icon: '✓', gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)' },
            preparing: { label: 'Preparing', color: '#9c27b0', icon: '👨‍🍳', gradient: 'linear-gradient(135deg, #9c27b0, #ce93d8)' },
            quality_check: { label: 'Quality Check', color: '#00bcd4', icon: '🔍', gradient: 'linear-gradient(135deg, #00bcd4, #4dd0e1)' },
            ready: { label: 'Ready', color: '#ff4757', icon: '📦', gradient: 'linear-gradient(135deg, #ff4757, #ff7675)' },
            picked_up: { label: 'Picked Up', color: '#ff4757', icon: '🛵', gradient: 'linear-gradient(135deg, #ff4757, #ff7675)' },
            on_the_way: { label: 'On The Way', color: '#ff4757', icon: '🚚', gradient: 'linear-gradient(135deg, #ff4757, #ff7675)' },
            nearby: { label: 'Nearby', color: '#ff9800', icon: '📍', gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)' },
            delivered: { label: 'Delivered', color: '#4caf50', icon: '✓', gradient: 'linear-gradient(135deg, #4caf50, #81c784)' },
            cancelled: { label: 'Cancelled', color: '#f44336', icon: '✗', gradient: 'linear-gradient(135deg, #f44336, #ef9a9a)' },
            refunded: { label: 'Refunded', color: '#607d8b', icon: '💰', gradient: 'linear-gradient(135deg, #607d8b, #90a4ae)' }
        };
        return configs[status] || configs.pending;
    };

    const config = getStatusConfig();

    return (
        <div className={`order-status-badge ${size} ${animated ? 'animated' : ''}`} style={{ background: config.gradient }}>
            {showIcon && <span className="badge-icon">{config.icon}</span>}
            <span className="badge-label">{config.label}</span>
            {animated && <div className="badge-pulse"></div>}
        </div>
    );
};

// Compact Status Component for Lists
export const CompactDeliveryStatus = ({ status, eta, onClick }) => {
    const statusConfig = {
        pending: { icon: '⏳', color: '#ff9800' },
        preparing: { icon: '👨‍🍳', color: '#9c27b0' },
        on_the_way: { icon: '🚚', color: '#ff4757' },
        delivered: { icon: '✅', color: '#4caf50' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <div className="compact-status" onClick={onClick}>
            <div className="compact-status-icon" style={{ background: config.color }}>
                {config.icon}
            </div>
            <div className="compact-status-info">
                <div className="compact-status-label">{status}</div>
                {eta && <div className="compact-status-eta">ETA: {eta}</div>}
            </div>
        </div>
    );
};

export default DeliveryStatus;
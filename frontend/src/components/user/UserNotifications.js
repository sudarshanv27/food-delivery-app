// src/components/profile/UserNotifications.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../common/Button';
import './UserNotifications.css';

const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef();
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotionalOffers: true,
        restaurantNews: false
    });
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [page, filter]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockNotifications = [
                {
                    id: 1,
                    type: 'order',
                    title: 'Order Delivered',
                    message: 'Your order #ORD-001 has been delivered successfully. Enjoy your meal! We hope you loved the food. Rate your experience and earn 50 loyalty points.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    read: false,
                    icon: '✅',
                    color: '#4caf50',
                    priority: 'high',
                    data: { orderId: 'ORD-001', status: 'delivered', ratingLink: '/order/ORD-001/rate' }
                },
                {
                    id: 2,
                    type: 'offer',
                    title: 'Special Discount!',
                    message: 'Get 20% off on your next order over ₹500. Use code: SAVE20. Limited time offer!',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    read: false,
                    icon: '🎉',
                    color: '#ff9800',
                    priority: 'medium',
                    data: { code: 'SAVE20', discount: 20, minOrder: 500, validTill: '2024-12-31' }
                },
                {
                    id: 3,
                    type: 'order',
                    title: 'Order Accepted',
                    message: 'Your order #ORD-002 has been accepted by the restaurant. Preparing your food! Estimated delivery: 30-40 minutes.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    read: true,
                    icon: '👨‍🍳',
                    color: '#2196f3',
                    priority: 'high',
                    data: { orderId: 'ORD-002', status: 'accepted', eta: '30-40 min' }
                },
                {
                    id: 4,
                    type: 'promotion',
                    title: 'New Restaurant Alert',
                    message: 'Sushi Master has joined our platform! Get 15% off on first order. Authentic Japanese cuisine now available.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
                    read: true,
                    icon: '🏪',
                    color: '#9c27b0',
                    priority: 'low',
                    data: { restaurantId: 5, name: 'Sushi Master', discount: 15 }
                },
                {
                    id: 5,
                    type: 'delivery',
                    title: 'Delivery Partner Assigned',
                    message: 'Your delivery partner, Raj Kumar, has been assigned to deliver your order. Track your order in real-time.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
                    read: true,
                    icon: '🚚',
                    color: '#ff4757',
                    priority: 'high',
                    data: { partner: 'Raj Kumar', orderId: 'ORD-003', trackingLink: '/track/ORD-003' }
                },
                {
                    id: 6,
                    type: 'system',
                    title: 'Payment Successful',
                    message: 'Your payment of ₹450 for order #ORD-004 has been successfully processed.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
                    read: true,
                    icon: '💰',
                    color: '#00bcd4',
                    priority: 'medium',
                    data: { orderId: 'ORD-004', amount: 450, paymentMethod: 'UPI' }
                }
            ];

            const start = (page - 1) * 10;
            const end = start + 10;
            const paginatedNotifications = mockNotifications.slice(start, end);

            if (page === 1) {
                setNotifications(paginatedNotifications);
            } else {
                setNotifications(prev => [...prev, ...paginatedNotifications]);
            }

            setHasMore(paginatedNotifications.length === 10);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreNotifications = useCallback(() => {
        if (hasMore && !isLoading) {
            setPage(prev => prev + 1);
        }
    }, [hasMore, isLoading]);

    const lastNotificationRef = useCallback(node => {
        if (isLoading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreNotifications();
            }
        });
        if (node) observerRef.current.observe(node);
    }, [isLoading, hasMore, loadMoreNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setNotifications(prev => prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications([]);
            setHasMore(false);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        setShowDetailsModal(true);
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
    };

    const handleUpdateSettings = async (setting, value) => {
        setNotificationSettings(prev => ({ ...prev, [setting]: value }));
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
    };

    const getFilteredNotifications = () => {
        if (filter === 'all') return notifications;
        if (filter === 'unread') return notifications.filter(n => !n.read);
        return notifications.filter(n => n.type === filter);
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return timestamp.toLocaleDateString();
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': return <span className="priority-badge high">High Priority</span>;
            case 'medium': return <span className="priority-badge medium">Medium</span>;
            case 'low': return <span className="priority-badge low">Low</span>;
            default: return null;
        }
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="user-notifications">
            <div className="notifications-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">🔔</span>
                        Notifications
                    </h2>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount} unread</span>
                    )}
                </div>
                <div className="header-actions">
                    <button
                        className={`settings-btn ${showSettings ? 'active' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                        title="Notification Settings"
                    >
                        ⚙️
                    </button>
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button className="delete-all-btn" onClick={() => setShowDeleteConfirm(true)}>
                            Delete all
                        </button>
                    )}
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-panel">
                    <h3>Notification Preferences</h3>
                    <div className="settings-list">
                        <label className="setting-item">
                            <input
                                type="checkbox"
                                checked={notificationSettings.emailNotifications}
                                onChange={(e) => handleUpdateSettings('emailNotifications', e.target.checked)}
                            />
                            <span>Email Notifications</span>
                        </label>
                        <label className="setting-item">
                            <input
                                type="checkbox"
                                checked={notificationSettings.pushNotifications}
                                onChange={(e) => handleUpdateSettings('pushNotifications', e.target.checked)}
                            />
                            <span>Push Notifications</span>
                        </label>
                        <label className="setting-item">
                            <input
                                type="checkbox"
                                checked={notificationSettings.orderUpdates}
                                onChange={(e) => handleUpdateSettings('orderUpdates', e.target.checked)}
                            />
                            <span>Order Updates</span>
                        </label>
                        <label className="setting-item">
                            <input
                                type="checkbox"
                                checked={notificationSettings.promotionalOffers}
                                onChange={(e) => handleUpdateSettings('promotionalOffers', e.target.checked)}
                            />
                            <span>Promotional Offers</span>
                        </label>
                        <label className="setting-item">
                            <input
                                type="checkbox"
                                checked={notificationSettings.restaurantNews}
                                onChange={(e) => handleUpdateSettings('restaurantNews', e.target.checked)}
                            />
                            <span>Restaurant News</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="notifications-filters">
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All
                </button>
                <button className={`filter-btn ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                    Unread
                </button>
                <button className={`filter-btn ${filter === 'order' ? 'active' : ''}`} onClick={() => setFilter('order')}>
                    Orders
                </button>
                <button className={`filter-btn ${filter === 'offer' ? 'active' : ''}`} onClick={() => setFilter('offer')}>
                    Offers
                </button>
                <button className={`filter-btn ${filter === 'promotion' ? 'active' : ''}`} onClick={() => setFilter('promotion')}>
                    Promotions
                </button>
                <button className={`filter-btn ${filter === 'delivery' ? 'active' : ''}`} onClick={() => setFilter('delivery')}>
                    Delivery
                </button>
                <button className={`filter-btn ${filter === 'system' ? 'active' : ''}`} onClick={() => setFilter('system')}>
                    System
                </button>
            </div>

            {filteredNotifications.length === 0 && !isLoading ? (
                <div className="notifications-empty">
                    <div className="empty-icon">🔔</div>
                    <h3>No Notifications</h3>
                    <p>You're all caught up! Check back later for updates.</p>
                </div>
            ) : (
                <div className="notifications-list">
                    {filteredNotifications.map((notification, index) => (
                        <div
                            key={notification.id}
                            ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-icon" style={{ background: notification.color + '20' }}>
                                <span style={{ color: notification.color }}>{notification.icon}</span>
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4 className="notification-title">{notification.title}</h4>
                                    <span className="notification-time">{formatTime(notification.timestamp)}</span>
                                </div>
                                <p className="notification-message">{notification.message}</p>
                                {getPriorityBadge(notification.priority)}
                            </div>
                            <div className="notification-actions">
                                {!notification.read && (
                                    <button
                                        className="mark-read-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsRead(notification.id);
                                        }}
                                        title="Mark as read"
                                    >
                                        ✓
                                    </button>
                                )}
                                <button
                                    className="delete-notif-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(notification.id);
                                    }}
                                    title="Delete"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="loading-more">
                            <div className="loading-spinner-small">
                                <div className="spinner-ring-small"></div>
                            </div>
                            <span>Loading more...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Delete All Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Delete All Notifications?</h3>
                        <p>This action cannot be undone. All notifications will be permanently deleted.</p>
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={handleDeleteAll}>Delete All</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Details Modal */}
            {showDetailsModal && selectedNotification && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon" style={{ background: selectedNotification.color + '20' }}>
                                <span style={{ color: selectedNotification.color }}>{selectedNotification.icon}</span>
                            </div>
                            <div className="modal-title">
                                <h3>{selectedNotification.title}</h3>
                                {getPriorityBadge(selectedNotification.priority)}
                            </div>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p>{selectedNotification.message}</p>
                            <div className="modal-time">
                                <span className="time-icon">📅</span>
                                <span>{selectedNotification.timestamp.toLocaleString()}</span>
                            </div>
                            {selectedNotification.data && (
                                <div className="modal-data">
                                    <h4>Details:</h4>
                                    <div className="data-content">
                                        {Object.entries(selectedNotification.data).map(([key, value]) => (
                                            <div key={key} className="data-row">
                                                <span className="data-key">{key}:</span>
                                                <span className="data-value">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserNotifications;
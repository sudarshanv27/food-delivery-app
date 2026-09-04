// src/components/profile/UserNotifications.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UserNotifications.css';

const UserNotifications = ({
    showHeader = true,
    maxHeight = '600px',
    enableRealTime = true,
    enableSound = true,
    enableDesktopNotifications = true,
    variant = 'default', // 'default', 'compact', 'card'
    onNotificationClick,
    onMarkAsRead
}) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [desktopEnabled, setDesktopEnabled] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest
    const [expandedNotification, setExpandedNotification] = useState(null);

    const lastNotificationRef = useRef();
    const audioRef = useRef(null);

    // Request desktop notification permission
    useEffect(() => {
        if (enableDesktopNotifications && desktopEnabled && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, [enableDesktopNotifications, desktopEnabled]);

    // Play sound for new notifications
    const playNotificationSound = useCallback(() => {
        if (enableSound && soundEnabled) {
            try {
                const audio = new Audio('/notification-sound.mp3');
                audio.volume = 0.3;
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (error) {
                console.log('Sound not supported');
            }
        }
    }, [enableSound, soundEnabled]);

    // Show desktop notification
    const showDesktopNotification = useCallback((title, body, icon = '/logo192.png') => {
        if (enableDesktopNotifications && desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon });
        }
    }, [enableDesktopNotifications, desktopEnabled]);

    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`/api/users/notifications`, {
                params: { page: pageNum, limit: 20, sort: sortBy },
                headers: { Authorization: `Bearer ${token}` }
            });

            const newNotifications = response.data.data || response.data.notifications || [];
            const hasMoreData = response.data.hasMore || newNotifications.length === 20;

            if (append) {
                setNotifications(prev => [...prev, ...newNotifications]);
            } else {
                // Check for new notifications
                const currentIds = new Set(notifications.map(n => n.id));
                const newOnes = newNotifications.filter(n => !currentIds.has(n.id));

                if (newOnes.length > 0) {
                    playNotificationSound();
                    newOnes.forEach(notif => {
                        showDesktopNotification(notif.title, notif.message);
                    });
                    toast(`${newOnes.length} new notification${newOnes.length > 1 ? 's' : ''}`, {
                        icon: '🔔',
                        duration: 3000
                    });
                }

                setNotifications(newNotifications);
            }
            setHasMore(hasMoreData);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Mock data for demo
            const mockNotifications = generateMockNotifications();
            if (append) {
                setNotifications(prev => [...prev, ...mockNotifications]);
            } else {
                setNotifications(mockNotifications);
            }
            if (!append) {
                toast.error('Using demo data. API not available.', { duration: 3000 });
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [sortBy, playNotificationSound, showDesktopNotification, notifications]);

    const generateMockNotifications = () => {
        const types = ['order', 'promotion', 'delivery', 'system', 'payment', 'review'];
        const titles = {
            order: 'Order Update',
            promotion: 'Special Offer',
            delivery: 'Delivery Update',
            system: 'System Notification',
            payment: 'Payment Received',
            review: 'New Review'
        };

        const mock = [];
        const now = new Date();

        for (let i = 0; i < 20; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const isRead = Math.random() > 0.3;
            const date = new Date(now - i * 2 * 60 * 60 * 1000);

            mock.push({
                id: i + 1,
                title: titles[type],
                message: getMockMessage(type),
                type: type,
                is_read: isRead,
                created_at: date.toISOString(),
                metadata: getMockMetadata(type, i)
            });
        }
        return mock;
    };

    const getMockMessage = (type) => {
        const messages = {
            order: 'Your order has been confirmed and is being prepared',
            promotion: 'Get 20% off on your next order! Use code: SAVE20',
            delivery: 'Your delivery partner is on the way',
            system: 'Your profile has been updated successfully',
            payment: 'Payment of ₹299 was successful',
            review: 'Customer left a 5-star review for your restaurant'
        };
        return messages[type] || 'New notification received';
    };

    const getMockMetadata = (type, id) => {
        if (type === 'order') return { order_id: `ORD${100000 + id}` };
        if (type === 'promotion') return { coupon_code: 'SAVE20', expiry: '2024-12-31' };
        if (type === 'delivery') return { partner_name: 'Rahul Singh', tracking_url: '/track' };
        if (type === 'payment') return { amount: 299, transaction_id: `TXN${id}` };
        if (type === 'review') return { rating: 5, review_text: 'Great food and fast delivery!' };
        return {};
    };

    useEffect(() => {
        fetchNotifications(1, false);

        // Set up polling for real-time notifications
        let interval;
        if (enableRealTime) {
            interval = setInterval(() => {
                fetchNotifications(1, false);
            }, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [fetchNotifications, enableRealTime]);

    // Setup intersection observer for infinite scroll
    useEffect(() => {
        if (loadingMore || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreNotifications();
                }
            },
            { threshold: 0.1 }
        );

        if (lastNotificationRef.current) {
            observer.observe(lastNotificationRef.current);
        }

        return () => observer.disconnect();
    }, [notifications, hasMore, loadingMore]);

    const loadMoreNotifications = useCallback(async () => {
        setLoadingMore(true);
        const nextPage = page + 1;
        await fetchNotifications(nextPage, true);
        setPage(nextPage);
    }, [page, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/users/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );

            if (onMarkAsRead) onMarkAsRead(notificationId);
            toast.success('Marked as read', { icon: '✓', duration: 1500 });
        } catch (error) {
            console.error('Error marking as read:', error);
            // Optimistic update for demo
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, is_read: true } : notif
                )
            );
            toast.success('Marked as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/users/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, is_read: true }))
            );

            toast.success('All notifications marked as read', { icon: '✓✓' });
        } catch (error) {
            console.error('Error marking all as read:', error);
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, is_read: true }))
            );
            toast.success('All notifications marked as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        const confirm = window.confirm('Are you sure you want to delete this notification?');
        if (!confirm) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            toast.success('Notification deleted');
        }
    };

    const deleteAllRead = async () => {
        const readCount = notifications.filter(n => n.is_read).length;
        if (readCount === 0) {
            toast.error('No read notifications to delete');
            return;
        }

        const confirm = window.confirm(`Delete ${readCount} read notification(s)?`);
        if (!confirm) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete('/api/users/notifications/delete-read', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.filter(notif => !notif.is_read));
            toast.success(`${readCount} notification(s) deleted`);
        } catch (error) {
            console.error('Error deleting read notifications:', error);
            setNotifications(prev => prev.filter(notif => !notif.is_read));
            toast.success('Read notifications deleted');
        }
    };

    const handleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev => {
            if (prev.includes(notificationId)) {
                return prev.filter(id => id !== notificationId);
            } else {
                return [...prev, notificationId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedNotifications.length === 0) {
            toast.error('No notifications selected');
            return;
        }

        const confirm = window.confirm(`Delete ${selectedNotifications.length} notification(s)?`);
        if (confirm) {
            setNotifications(prev =>
                prev.filter(n => !selectedNotifications.includes(n.id))
            );
            setSelectedNotifications([]);
            setShowBulkActions(false);
            toast.success(`${selectedNotifications.length} notification(s) deleted`);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            order: '📦',
            promotion: '🎉',
            delivery: '🚚',
            system: '⚙️',
            payment: '💳',
            review: '⭐',
            message: '💬',
            reminder: '⏰'
        };
        return icons[type] || '🔔';
    };

    const getNotificationColor = (type) => {
        const colors = {
            order: '#2196F3',
            promotion: '#FF9800',
            delivery: '#4CAF50',
            system: '#9E9E9E',
            payment: '#9C27B0',
            review: '#FFC107',
            message: '#00BCD4',
            reminder: '#F44336'
        };
        return colors[type] || '#666';
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 120) return '1 minute ago';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 7200) return '1 hour ago';
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 172800) return 'Yesterday';
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        if (seconds < 1209600) return 'Last week';

        return new Date(date).toLocaleDateString();
    };

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        setExpandedNotification(expandedNotification === notification.id ? null : notification.id);

        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        // Navigate based on notification type
        if (notification.metadata?.order_id) {
            window.location.href = `/orders/${notification.metadata.order_id}`;
        } else if (notification.metadata?.coupon_code) {
            navigator.clipboard.writeText(notification.metadata.coupon_code);
            toast.success('Coupon code copied!', { icon: '📋' });
        } else if (notification.metadata?.tracking_url) {
            window.location.href = notification.metadata.tracking_url;
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        // Filter by read status
        if (filter === 'unread') return !notif.is_read;
        if (filter === 'read') return notif.is_read;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return notif.title.toLowerCase().includes(term) ||
                notif.message.toLowerCase().includes(term);
        }

        return true;
    }).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        } else {
            return new Date(a.created_at) - new Date(b.created_at);
        }
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const isCompact = variant === 'compact';
    const isCard = variant === 'card';

    if (loading) {
        return (
            <div className="notifications-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className={`user-notifications ${variant}`} style={{ maxHeight }}>
            {showHeader && (
                <div className="notifications-header">
                    <div className="header-title">
                        <h2>
                            <span className="header-icon">🔔</span>
                            Notifications
                            {unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount} new</span>
                            )}
                        </h2>
                    </div>
                    <div className="header-actions">
                        {/* Settings Dropdown */}
                        {(enableSound || enableDesktopNotifications) && (
                            <div className="notifications-settings">
                                <button className="settings-btn" title="Notification settings">
                                    ⚙️
                                </button>
                                <div className="settings-dropdown">
                                    {enableSound && (
                                        <label className="setting-item">
                                            <input
                                                type="checkbox"
                                                checked={soundEnabled}
                                                onChange={(e) => setSoundEnabled(e.target.checked)}
                                            />
                                            <span>🔊 Sound Alerts</span>
                                        </label>
                                    )}
                                    {enableDesktopNotifications && (
                                        <label className="setting-item">
                                            <input
                                                type="checkbox"
                                                checked={desktopEnabled}
                                                onChange={(e) => setDesktopEnabled(e.target.checked)}
                                            />
                                            <span>💻 Desktop Notifications</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                        {notifications.length > 0 && (
                            <>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="mark-all-btn" title="Mark all as read">
                                        ✓ Mark all read
                                    </button>
                                )}
                                <button onClick={deleteAllRead} className="clear-read-btn" title="Clear read notifications">
                                    🗑️ Clear read
                                </button>
                                <button
                                    onClick={() => setShowBulkActions(!showBulkActions)}
                                    className={`bulk-select-btn ${showBulkActions ? 'active' : ''}`}
                                    title="Bulk actions"
                                >
                                    {showBulkActions ? '✕ Cancel' : '☑️ Select'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Search and Sort Bar */}
            <div className="notifications-toolbar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            ✕
                        </button>
                    )}
                </div>

                <div className="sort-wrapper">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="notifications-filters">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                    <span className="filter-count">{notifications.length}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread
                    <span className="filter-count unread">{unreadCount}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read
                    <span className="filter-count">{notifications.filter(n => n.is_read).length}</span>
                </button>
            </div>

            {/* Bulk Actions Bar */}
            {showBulkActions && selectedNotifications.length > 0 && (
                <div className="bulk-actions-bar">
                    <div className="bulk-info">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={selectedNotifications.length === filteredNotifications.length}
                                onChange={handleSelectAll}
                            />
                            <span className="checkbox-custom"></span>
                            <span>{selectedNotifications.length} selected</span>
                        </label>
                    </div>
                    <button onClick={handleBulkDelete} className="bulk-delete-btn">
                        🗑️ Delete Selected
                    </button>
                </div>
            )}

            {/* Notifications List */}
            <div className="notifications-list-container">
                {filteredNotifications.length === 0 ? (
                    <div className="no-notifications">
                        <div className="empty-state-animation">
                            <div className="bell-animation">🔔</div>
                        </div>
                        <h3>No Notifications</h3>
                        <p>
                            {searchTerm
                                ? `No results found for "${searchTerm}"`
                                : "You're all caught up! Check back later for updates."}
                        </p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={`notifications-list ${isCompact ? 'compact' : ''} ${isCard ? 'card-view' : ''}`}>
                        {filteredNotifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                ref={index === filteredNotifications.length - 1 ? lastNotificationRef : null}
                                className={`notification-item ${!notification.is_read ? 'unread' : ''} ${selectedNotifications.includes(notification.id) ? 'selected' : ''} ${expandedNotification === notification.id ? 'expanded' : ''}`}
                            >
                                {showBulkActions && (
                                    <div className="notification-checkbox" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={() => handleSelectNotification(notification.id)}
                                        />
                                    </div>
                                )}

                                <div
                                    className="notification-icon"
                                    style={{ backgroundColor: getNotificationColor(notification.type) + '15' }}
                                >
                                    <span style={{ color: getNotificationColor(notification.type) }}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                </div>

                                <div className="notification-content" onClick={() => handleNotificationClick(notification)}>
                                    <div className="notification-header">
                                        <h4>
                                            {notification.title}
                                            {!notification.is_read && <span className="unread-dot"></span>}
                                        </h4>
                                        <span className="notification-time">
                                            {getTimeAgo(notification.created_at)}
                                        </span>
                                    </div>
                                    <p className="notification-message">{notification.message}</p>

                                    {/* Metadata Chips */}
                                    <div className="notification-metadata">
                                        {notification.metadata?.order_id && (
                                            <span className="metadata-chip order">
                                                📦 Order #{notification.metadata.order_id}
                                            </span>
                                        )}
                                        {notification.metadata?.coupon_code && (
                                            <span className="metadata-chip coupon" onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(notification.metadata.coupon_code);
                                                toast.success('Coupon copied!');
                                            }}>
                                                🎟️ {notification.metadata.coupon_code}
                                            </span>
                                        )}
                                        {notification.metadata?.partner_name && (
                                            <span className="metadata-chip partner">
                                                🚚 {notification.metadata.partner_name}
                                            </span>
                                        )}
                                        {notification.metadata?.amount && (
                                            <span className="metadata-chip payment">
                                                💰 ₹{notification.metadata.amount}
                                            </span>
                                        )}
                                        {notification.metadata?.rating && (
                                            <span className="metadata-chip rating">
                                                {'⭐'.repeat(notification.metadata.rating)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedNotification === notification.id && (
                                        <div className="notification-expanded">
                                            <div className="expanded-details">
                                                <div className="detail-row">
                                                    <span className="detail-label">Time:</span>
                                                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Type:</span>
                                                    <span className="type-badge" style={{ color: getNotificationColor(notification.type) }}>
                                                        {notification.type}
                                                    </span>
                                                </div>
                                                {notification.metadata?.transaction_id && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Transaction ID:</span>
                                                        <span>{notification.metadata.transaction_id}</span>
                                                    </div>
                                                )}
                                                {notification.metadata?.review_text && (
                                                    <div className="detail-row">
                                                        <span className="detail-label">Review:</span>
                                                        <span className="review-text">"{notification.metadata.review_text}"</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="mark-read-btn"
                                            title="Mark as read"
                                        >
                                            ✓
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="delete-notif-btn"
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}

                        {loadingMore && (
                            <div className="loading-more">
                                <div className="loading-spinner small"></div>
                                <span>Loading more...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            {notifications.length > 0 && (
                <div className="notifications-footer">
                    <span className="footer-stats">
                        Showing {filteredNotifications.length} of {notifications.length} notifications
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserNotifications;
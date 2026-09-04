// src/components/profile/admin/AdminHeader.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = ({ onToggleSidebar, onToggleMobile, sidebarCollapsed }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef();
    const notificationRef = useRef();
    const userMenuRef = useRef();
    const navigate = useNavigate();

    // Mock notifications
    useEffect(() => {
        const mockNotifications = [
            { id: 1, title: 'New Order #ORD123', message: 'Order received from Pizza Hut', time: '2 min ago', read: false, type: 'order', icon: '📦' },
            { id: 2, title: 'Delivery Completed', message: 'Order #ORD122 delivered successfully', time: '15 min ago', read: false, type: 'delivery', icon: '✅' },
            { id: 3, title: 'New User Registration', message: 'John Doe joined as delivery partner', time: '1 hour ago', read: true, type: 'user', icon: '👤' },
            { id: 4, title: 'System Update', message: 'New features available', time: '2 hours ago', read: true, type: 'system', icon: '🔧' },
            { id: 5, title: 'Payment Received', message: '₹1,234 received from order #ORD121', time: '3 hours ago', read: false, type: 'payment', icon: '💰' }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search functionality
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.length > 1) {
            // Mock search results
            const results = [
                { type: 'order', id: 'ORD123', label: 'Order #ORD123', icon: '📦' },
                { type: 'user', id: 1, label: 'John Doe (Customer)', icon: '👤' },
                { type: 'restaurant', id: 1, label: 'Pizza Hut', icon: '🍕' },
                { type: 'delivery', id: 1, label: 'Delivery Partner - Mohan', icon: '🚚' }
            ].filter(r => r.label.toLowerCase().includes(query.toLowerCase()));
            setSearchResults(results);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => prev - 1);
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const [currentTime, setCurrentTime] = useState(getCurrentTime());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTime());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="admin-header">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
                >
                    ☰
                </button>
                <button
                    className="mobile-menu-toggle"
                    onClick={onToggleMobile}
                >
                    ☰
                </button>

                <div className="search-container" ref={searchRef}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search orders, users, restaurants..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => handleSearch('')}>
                            ✕
                        </button>
                    )}

                    {showSearchResults && searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map(result => (
                                <button
                                    key={result.id}
                                    className="search-result-item"
                                    onClick={() => {
                                        navigate(`/admin/${result.type}s/${result.id}`);
                                        setShowSearchResults(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <span className="result-icon">{result.icon}</span>
                                    <span className="result-label">{result.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div className="header-time">
                    <span className="time-icon">🕐</span>
                    <span>{currentTime}</span>
                </div>

                <div className="notifications-container" ref={notificationRef}>
                    <button
                        className="notifications-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <div className="notifications-header">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="mark-all-read">
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="notifications-list">
                                {notifications.length === 0 ? (
                                    <div className="no-notifications">
                                        <span>🔔</span>
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="notification-icon">{notification.icon}</div>
                                            <div className="notification-content">
                                                <div className="notification-title">{notification.title}</div>
                                                <div className="notification-message">{notification.message}</div>
                                                <div className="notification-time">{notification.time}</div>
                                            </div>
                                            {!notification.read && <div className="notification-dot"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="notifications-footer">
                                <button onClick={() => navigate('/admin/notifications')}>
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-menu-container" ref={userMenuRef}>
                    <button
                        className="user-menu-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div className="user-avatar">
                            <img src="/admin-avatar.jpg" alt="Admin" onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">John Doe</span>
                            <span className="user-role">Super Admin</span>
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-dropdown-avatar">
                                    <img src="/admin-avatar.jpg" alt="Admin" onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }} />
                                </div>
                                <div className="user-dropdown-info">
                                    <h4>John Doe</h4>
                                    <p>john.doe@example.com</p>
                                </div>
                            </div>
                            <div className="user-dropdown-menu">
                                <button onClick={() => navigate('/admin/profile')}>
                                    <span>👤</span> My Profile
                                </button>
                                <button onClick={() => navigate('/admin/settings')}>
                                    <span>⚙️</span> Settings
                                </button>
                                <button onClick={() => navigate('/admin/security')}>
                                    <span>🔒</span> Security
                                </button>
                                <button onClick={() => navigate('/admin/help')}>
                                    <span>❓</span> Help Center
                                </button>
                                <hr />
                                <button onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }} className="logout-option">
                                    <span>🚪</span> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
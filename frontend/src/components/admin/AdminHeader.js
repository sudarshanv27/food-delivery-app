import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = ({
    onMenuClick,
    onNotificationClick,
    onSearch,
    title = 'Dashboard',
    userName = 'John Doe',
    userEmail = 'admin@fooddelivery.com',
    userRole = 'Super Admin',
    companyName = 'FoodDelivery Admin'
}) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Order #1234', message: 'A new order has been placed', time: '2 min ago', read: false, type: 'order', priority: 'high' },
        { id: 2, title: 'New Restaurant Registration', message: 'Pizza Palace wants to join', time: '15 min ago', read: false, type: 'restaurant', priority: 'medium' },
        { id: 3, title: 'Payment Received', message: 'Order #1230 payment confirmed', time: '1 hour ago', read: true, type: 'payment', priority: 'low' },
        { id: 4, title: 'Delivery Partner Available', message: '10 new delivery partners registered', time: '3 hours ago', read: true, type: 'delivery', priority: 'medium' },
        { id: 5, title: 'System Update', message: 'New version 2.0.1 is available', time: '5 hours ago', read: false, type: 'system', priority: 'high' }
    ]);

    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);
    const searchRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Apply theme
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const searchSuggestions = [
        { type: 'order', id: 'ORD-1234', label: 'Order #ORD-1234' },
        { type: 'order', id: 'ORD-1235', label: 'Order #ORD-1235' },
        { type: 'user', id: 'USR-001', label: 'John Doe (Customer)' },
        { type: 'restaurant', id: 'REST-456', label: 'Pizza Palace' },
        { type: 'delivery', id: 'DEL-789', label: 'Mike Johnson (Delivery Partner)' }
    ];

    const filteredSuggestions = searchQuery.length > 1
        ? searchSuggestions.filter(s =>
            s.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch?.(searchQuery);
        setShowSearchSuggestions(false);
    };

    const handleSearchSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.label);
        onSearch?.(suggestion.label);
        setShowSearchSuggestions(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const markSingleNotificationAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'low': return '#26de81';
            default: return '#747d8c';
        }
    };

    const formatTime = () => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = () => {
        return currentTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className={`admin-header ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <div className="logo-area">
                    <div className="logo">🍔</div>
                    <div className="brand-info">
                        <h1 className="page-title">{title}</h1>
                        <span className="company-name">{companyName}</span>
                    </div>
                </div>
            </div>

            <div className="header-center" ref={searchRef}>
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search orders, users, restaurants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSearchSuggestions(true)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>
                                ✕
                            </button>
                        )}
                        <button type="submit" className="search-submit">Search</button>
                    </div>

                    {showSearchSuggestions && filteredSuggestions.length > 0 && (
                        <div className="search-suggestions">
                            {filteredSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => handleSearchSuggestionClick(suggestion)}
                                >
                                    <span className="suggestion-icon">
                                        {suggestion.type === 'order' && '📦'}
                                        {suggestion.type === 'user' && '👤'}
                                        {suggestion.type === 'restaurant' && '🏪'}
                                        {suggestion.type === 'delivery' && '🚚'}
                                    </span>
                                    <span className="suggestion-text">{suggestion.label}</span>
                                    <span className="suggestion-type">{suggestion.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </form>
            </div>

            <div className="header-right">
                {/* Date & Time */}
                <div className="datetime-display">
                    <div className="time">{formatTime()}</div>
                    <div className="date">{formatDate()}</div>
                </div>

                {/* Language Selector */}
                <div className="language-selector">
                    <select className="lang-select" defaultValue="en">
                        <option value="en">🌐 English</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="ar">🇸🇦 العربية</option>
                    </select>
                </div>

                {/* Dark Mode Toggle */}
                <button
                    className="theme-toggle"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Toggle Dark Mode"
                >
                    {isDarkMode ? '☀️' : '🌙'}
                </button>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <button className="quick-action-btn" title="Quick Add Order">
                        ➕
                    </button>
                    <button className="quick-action-btn" title="Export Data">
                        📊
                    </button>
                    <button className="quick-action-btn" title="Print Report">
                        🖨️
                    </button>
                </div>

                {/* Notifications */}
                <div className="notifications-dropdown" ref={notificationRef}>
                    <button
                        className="notifications-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                    >
                        <span className="notification-icon">🔔</span>
                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount}
                                {highPriorityCount > 0 && (
                                    <span className="priority-indicator"></span>
                                )}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notifications-panel">
                            <div className="panel-header">
                                <div>
                                    <h3>Notifications</h3>
                                    <span className="unread-count">{unreadCount} unread</span>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        className="mark-all-read"
                                        onClick={markAllNotificationsAsRead}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="notifications-list">
                                {notifications.length === 0 ? (
                                    <div className="no-notifications">
                                        <span>🔕</span>
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                            onClick={() => markSingleNotificationAsRead(notif.id)}
                                        >
                                            <div className="notification-icon" style={{ borderColor: getPriorityColor(notif.priority) }}>
                                                {notif.type === 'order' && '📦'}
                                                {notif.type === 'restaurant' && '🏪'}
                                                {notif.type === 'payment' && '💳'}
                                                {notif.type === 'delivery' && '🚚'}
                                                {notif.type === 'system' && '⚙️'}
                                            </div>
                                            <div className="notification-content">
                                                <div className="notification-header">
                                                    <div className="notification-title">{notif.title}</div>
                                                    <button
                                                        className="delete-notification"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notif.id);
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="notification-message">{notif.message}</div>
                                                <div className="notification-time">{notif.time}</div>
                                            </div>
                                            {!notif.read && <div className="unread-dot"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="panel-footer">
                                <Link to="/admin/notifications">View all notifications</Link>
                                <Link to="/admin/notifications/settings" className="settings-link">
                                    ⚙️ Settings
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="user-menu-dropdown" ref={userMenuRef}>
                    <button
                        className="user-menu-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        aria-label="User Menu"
                    >
                        <img
                            src={`https://ui-avatars.com/api/?name=${userName.split(' ')[0]}&background=ff4757&color=fff&bold=true`}
                            alt={userName}
                            className="user-avatar"
                        />
                        <div className="user-info-header">
                            <span className="user-name">{userName.split(' ')[0]}</span>
                            <span className="user-role-badge">{userRole}</span>
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {showUserMenu && (
                        <div className="user-menu-panel">
                            <div className="user-info">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=ff4757&color=fff&size=80&bold=true`}
                                    alt={userName}
                                    className="user-avatar-large"
                                />
                                <div>
                                    <div className="user-fullname">{userName}</div>
                                    <div className="user-email">{userEmail}</div>
                                    <div className="user-role">{userRole}</div>
                                </div>
                            </div>
                            <div className="greeting">{getGreeting()}!</div>
                            <div className="menu-divider"></div>

                            <Link to="/admin/profile" className="menu-item">
                                <span className="menu-icon">👤</span>
                                <span>My Profile</span>
                                <span className="menu-shortcut">⌘P</span>
                            </Link>
                            <Link to="/admin/dashboard-stats" className="menu-item">
                                <span className="menu-icon">📊</span>
                                <span>Dashboard Stats</span>
                            </Link>
                            <Link to="/admin/analytics" className="menu-item">
                                <span className="menu-icon">📈</span>
                                <span>Analytics</span>
                            </Link>
                            <Link to="/admin/settings" className="menu-item">
                                <span className="menu-icon">⚙️</span>
                                <span>Settings</span>
                                <span className="menu-shortcut">⌘S</span>
                            </Link>
                            <Link to="/admin/security" className="menu-item">
                                <span className="menu-icon">🔒</span>
                                <span>Security</span>
                            </Link>
                            <Link to="/admin/help" className="menu-item">
                                <span className="menu-icon">❓</span>
                                <span>Help & Support</span>
                            </Link>

                            <div className="menu-divider"></div>

                            <div className="menu-item status-indicator">
                                <span className="menu-icon">🟢</span>
                                <span>Status: Online</span>
                                <button className="status-toggle">Change</button>
                            </div>

                            <button onClick={handleLogout} className="menu-item logout">
                                <span className="menu-icon">🚪</span>
                                <span>Logout</span>
                                <span className="menu-shortcut">⌘Q</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import useTheme from '../../hooks/useTheme';
import ThemeSwitcher from '../common/ThemeSwitcher';
import SearchBar from '../common/SearchBar';
import './Navbar.css';

const Navbar = ({
    sticky = true,
    showProgress = true,
    enableNotifications = true,
    variant = 'default' // 'default', 'compact', 'glass'
}) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount, totalAmount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);

    const mobileMenuRef = useRef(null);
    const userDropdownRef = useRef(null);
    const notificationRef = useRef(null);

    // Handle scroll effect and progress
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setIsScrolled(scrolled);

            if (showProgress) {
                const winScroll = document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolledProgress = (winScroll / height) * 100;
                setScrollProgress(scrolledProgress);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showProgress]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu and dropdowns on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
        setIsUserDropdownOpen(false);
        setIsNotificationOpen(false);
    }, [location]);

    // Simulate notifications
    useEffect(() => {
        if (enableNotifications) {
            const mockNotifications = [
                { id: 1, title: 'New Offer!', message: 'Get 20% off on orders above ₹499', type: 'offer', time: '5 min ago', read: false },
                { id: 2, title: 'Order Delivered', message: 'Your order #12345 has been delivered', type: 'order', time: '1 hour ago', read: false },
                { id: 3, title: 'Payment Success', message: 'Payment of ₹450 was successful', type: 'payment', time: '2 hours ago', read: true }
            ];
            setNotifications(mockNotifications);
        }
    }, [enableNotifications]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
    };

    const handleSearch = (query) => {
        if (query) {
            navigate(`/restaurants?search=${encodeURIComponent(query)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleNotificationClick = (notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
        // Handle notification action based on type
        setIsNotificationOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠', activeIcon: '🏡' },
        { path: '/restaurants', label: 'Explore', icon: '🍔', activeIcon: '🍕' },
        { path: '/offers', label: 'Offers', icon: '🎁', activeIcon: '🎉' },
        { path: '/about', label: 'About', icon: 'ℹ️', activeIcon: '📖' },
        { path: '/contact', label: 'Contact', icon: '📞', activeIcon: '📱' },
    ];

    const authLinks = isAuthenticated ? [
        { path: '/orders', label: 'My Orders', icon: '📦', activeIcon: '🎁' },
        { path: '/favorites', label: 'Favorites', icon: '❤️', activeIcon: '💖' },
    ] : [];

    const roleLinks = [];
    if (user?.role === 'admin') {
        roleLinks.push({ path: '/admin', label: 'Admin Panel', icon: '⚙️', activeIcon: '🔧' });
    } else if (user?.role === 'restaurant_owner') {
        roleLinks.push({ path: '/restaurant-panel', label: 'Restaurant Panel', icon: '🏪', activeIcon: '🏪' });
    } else if (user?.role === 'delivery_partner') {
        roleLinks.push({ path: '/delivery-panel', label: 'Delivery Panel', icon: '🚚', activeIcon: '🚛' });
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <nav className={`navbar ${variant} ${isScrolled ? 'scrolled' : ''} ${isDarkMode ? 'dark' : 'light'} ${sticky ? 'sticky' : ''}`}>
            {/* Scroll Progress Bar */}
            {showProgress && (
                <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>
            )}

            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-wrapper">
                        <span className="logo-icon">🍔</span>
                        <div className="logo-text-wrapper">
                            <span className="logo-text">FoodDelivery</span>
                            <span className="logo-tagline">Fast & Fresh</span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-nav desktop-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">
                                {location.pathname === link.path ? (link.activeIcon || link.icon) : link.icon}
                            </span>
                            <span className="nav-label">{link.label}</span>
                            {location.pathname === link.path && <span className="nav-active-dot"></span>}
                        </Link>
                    ))}

                    {authLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">
                                {location.pathname === link.path ? (link.activeIcon || link.icon) : link.icon}
                            </span>
                            <span className="nav-label">{link.label}</span>
                        </Link>
                    ))}

                    {roleLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link role-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span className="nav-label">{link.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Right Section */}
                <div className="navbar-actions">
                    {/* Search Bar (Desktop) */}
                    <div className="desktop-search-wrapper">
                        <SearchBar
                            placeholder="Search restaurants, dishes..."
                            onSearch={handleSearch}
                            size="small"
                            variant="rounded"
                        />
                    </div>

                    {/* Search Button (Mobile) */}
                    <button
                        className="search-toggle-btn"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Search"
                    >
                        <span className="btn-icon">🔍</span>
                    </button>

                    {/* Notifications */}
                    {enableNotifications && isAuthenticated && (
                        <div className="notification-dropdown" ref={notificationRef}>
                            <button
                                className={`notification-btn ${unreadCount > 0 ? 'has-notifications' : ''}`}
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                aria-label="Notifications"
                            >
                                <span className="btn-icon">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="notification-panel">
                                    <div className="notification-header">
                                        <h3>Notifications</h3>
                                        <button className="mark-all-read">Mark all read</button>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="notification-empty">
                                                <span className="empty-icon">🔔</span>
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                                    onClick={() => handleNotificationClick(notif.id)}
                                                >
                                                    <div className={`notification-icon ${notif.type}`}>
                                                        {notif.type === 'offer' ? '🎁' : notif.type === 'order' ? '📦' : '💰'}
                                                    </div>
                                                    <div className="notification-content">
                                                        <div className="notification-title">{notif.title}</div>
                                                        <div className="notification-message">{notif.message}</div>
                                                        <div className="notification-time">{notif.time}</div>
                                                    </div>
                                                    {!notif.read && <div className="notification-unread-dot"></div>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="notification-footer">
                                        <Link to="/notifications">View all notifications</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cart Icon */}
                    <Link to="/cart" className="cart-link">
                        <span className="cart-icon">🛒</span>
                        {itemCount > 0 && (
                            <>
                                <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>
                                {totalAmount > 0 && <span className="cart-amount">₹{totalAmount}</span>}
                            </>
                        )}
                    </Link>

                    {/* Theme Switcher */}
                    <ThemeSwitcher variant="compact" showLabels={false} />

                    {/* Auth Buttons / User Menu */}
                    {isAuthenticated ? (
                        <div className="user-menu" ref={userDropdownRef}>
                            <button
                                className={`user-menu-btn ${isUserDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            >
                                <div className="user-avatar-wrapper">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.name || 'User')}&background=ff4757&color=fff&length=2`}
                                        alt="User avatar"
                                        className="user-avatar"
                                    />
                                    <div className="user-status online"></div>
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user?.full_name?.split(' ')[0] || user?.name || 'User'}</span>
                                    <span className="user-greeting">{getGreeting()}</span>
                                </div>
                                <span className="dropdown-arrow">▼</span>
                            </button>

                            {isUserDropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-info">
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.name || 'User')}&background=ff4757&color=fff`}
                                                alt="User avatar"
                                                className="dropdown-user-avatar"
                                            />
                                            <div>
                                                <div className="dropdown-user-name">{user?.full_name || user?.name}</div>
                                                <div className="dropdown-user-email">{user?.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/profile" className="dropdown-item">
                                        <span className="dropdown-icon">👤</span>
                                        <div>
                                            <div>My Profile</div>
                                            <span className="dropdown-desc">Manage your account</span>
                                        </div>
                                    </Link>
                                    <Link to="/orders" className="dropdown-item">
                                        <span className="dropdown-icon">📦</span>
                                        <div>
                                            <div>My Orders</div>
                                            <span className="dropdown-desc">Track your orders</span>
                                        </div>
                                    </Link>
                                    <Link to="/favorites" className="dropdown-item">
                                        <span className="dropdown-icon">❤️</span>
                                        <div>
                                            <div>Favorites</div>
                                            <span className="dropdown-desc">Saved restaurants</span>
                                        </div>
                                    </Link>
                                    <Link to="/wallet" className="dropdown-item">
                                        <span className="dropdown-icon">💰</span>
                                        <div>
                                            <div>Wallet</div>
                                            <span className="dropdown-desc">₹0.00 available</span>
                                        </div>
                                    </Link>
                                    <Link to="/settings" className="dropdown-item">
                                        <span className="dropdown-icon">⚙️</span>
                                        <div>
                                            <div>Settings</div>
                                            <span className="dropdown-desc">Preferences & privacy</span>
                                        </div>
                                    </Link>
                                    <hr className="dropdown-divider" />
                                    <button onClick={handleLogout} className="dropdown-item logout-item">
                                        <span className="dropdown-icon">🚪</span>
                                        <div>
                                            <div>Logout</div>
                                            <span className="dropdown-desc">Sign out of your account</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login">Login</Link>
                            <Link to="/signup" className="btn-signup">Sign Up</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Search Bar (Mobile) */}
            {isSearchOpen && (
                <div className="mobile-search">
                    <SearchBar
                        placeholder="Search restaurants, dishes..."
                        onSearch={handleSearch}
                        autoFocus
                        size="medium"
                        fullWidth
                    />
                </div>
            )}

            {/* Mobile Menu */}
            <div ref={mobileMenuRef} className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    {isAuthenticated && (
                        <div className="mobile-user-info">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.name || 'User')}&background=ff4757&color=fff&length=2`}
                                alt="User avatar"
                                className="mobile-user-avatar"
                            />
                            <div className="mobile-user-details">
                                <div className="mobile-user-name">{user?.full_name || user?.name}</div>
                                <div className="mobile-user-email">{user?.email}</div>
                                <div className="mobile-user-greeting">{getGreeting()}! 👋</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mobile-menu-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="mobile-link-icon">{link.icon}</span>
                            <span className="mobile-link-label">{link.label}</span>
                            {location.pathname === link.path && <span className="mobile-link-active"></span>}
                        </Link>
                    ))}

                    {authLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="mobile-link-icon">{link.icon}</span>
                            <span className="mobile-link-label">{link.label}</span>
                        </Link>
                    ))}

                    {roleLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`mobile-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="mobile-link-icon">{link.icon}</span>
                            <span className="mobile-link-label">{link.label}</span>
                        </Link>
                    ))}
                </div>

                {!isAuthenticated && (
                    <div className="mobile-auth-buttons">
                        <Link to="/login" className="mobile-login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                            Login
                        </Link>
                        <Link to="/signup" className="mobile-signup-btn" onClick={() => setIsMobileMenuOpen(false)}>
                            Sign Up
                        </Link>
                    </div>
                )}

                {isAuthenticated && (
                    <div className="mobile-menu-footer">
                        <Link to="/profile" className="mobile-footer-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>👤</span> Profile
                        </Link>
                        <Link to="/orders" className="mobile-footer-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>📦</span> Orders
                        </Link>
                        <Link to="/wallet" className="mobile-footer-link" onClick={() => setIsMobileMenuOpen(false)}>
                            <span>💰</span> Wallet
                        </Link>
                        <button onClick={handleLogout} className="mobile-logout-btn">
                            <span>🚪</span> Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}
        </nav>
    );
};

export default Navbar;
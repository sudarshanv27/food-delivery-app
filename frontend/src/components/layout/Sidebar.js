import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import './Sidebar.css';

const Sidebar = ({
    isOpen,
    onClose,
    variant = 'default', // 'default', 'compact', 'mini'
    position = 'left', // 'left', 'right'
    showTooltips = true,
    enableQuickActions = true
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('');
    const [expandedMenus, setExpandedMenus] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        const path = location.pathname;

        // Parse active section from path
        if (path.includes('/admin')) {
            const section = path.split('/admin/')[1] || 'dashboard';
            setActiveSection(section);
        } else if (path.includes('/restaurant-panel')) {
            const section = path.split('/restaurant-panel/')[1] || 'dashboard';
            setActiveSection(section);
        } else if (path.includes('/delivery-panel')) {
            const section = path.split('/delivery-panel/')[1] || 'dashboard';
            setActiveSection(section);
        } else if (path.includes('/profile')) setActiveSection('profile');
        else if (path.includes('/orders')) setActiveSection('orders');
        else if (path.includes('/settings')) setActiveSection('settings');
        else setActiveSection('');
    }, [location]);

    const handleLogout = async () => {
        await logout();
        onClose();
        navigate('/login');
    };

    const toggleSubmenu = (menuId) => {
        setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    };

    // Enhanced Admin Sidebar Menu with Submenus
    const adminMenu = [
        {
            section: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/admin',
            description: 'View analytics and metrics'
        },
        {
            section: 'users',
            label: 'Users',
            icon: '👥',
            path: '/admin/users',
            description: 'Manage user accounts',
            submenu: [
                { section: 'all-users', label: 'All Users', path: '/admin/users' },
                { section: 'add-user', label: 'Add User', path: '/admin/users/add' },
                { section: 'roles', label: 'Roles & Permissions', path: '/admin/users/roles' }
            ]
        },
        {
            section: 'restaurants',
            label: 'Restaurants',
            icon: '🏪',
            path: '/admin/restaurants',
            description: 'Manage restaurants',
            submenu: [
                { section: 'all-restaurants', label: 'All Restaurants', path: '/admin/restaurants' },
                { section: 'pending', label: 'Pending Approval', path: '/admin/restaurants/pending', badge: 12 },
                { section: 'categories', label: 'Categories', path: '/admin/restaurants/categories' }
            ]
        },
        {
            section: 'orders',
            label: 'Orders',
            icon: '📋',
            path: '/admin/orders',
            description: 'Track all orders',
            badge: 24
        },
        {
            section: 'delivery',
            label: 'Delivery',
            icon: '🚚',
            path: '/admin/delivery',
            description: 'Manage deliveries'
        },
        {
            section: 'offers',
            label: 'Offers',
            icon: '🎫',
            path: '/admin/offers',
            description: 'Promotions & discounts'
        },
        {
            section: 'analytics',
            label: 'Analytics',
            icon: '📈',
            path: '/admin/analytics',
            description: 'Business insights'
        },
        {
            section: 'reports',
            label: 'Reports',
            icon: '📄',
            path: '/admin/reports',
            description: 'Generate reports'
        },
        {
            section: 'settings',
            label: 'Settings',
            icon: '⚙️',
            path: '/admin/settings',
            description: 'System configuration'
        }
    ];

    // Enhanced User Sidebar Menu
    const userMenu = [
        {
            section: 'profile',
            label: 'My Profile',
            icon: '👤',
            path: '/profile',
            description: 'View and edit profile'
        },
        {
            section: 'orders',
            label: 'My Orders',
            icon: '📦',
            path: '/orders',
            description: 'Track your orders',
            badge: 3
        },
        {
            section: 'addresses',
            label: 'Addresses',
            icon: '📍',
            path: '/addresses',
            description: 'Manage delivery addresses'
        },
        {
            section: 'payments',
            label: 'Payment Methods',
            icon: '💳',
            path: '/payments',
            description: 'Manage payment options'
        },
        {
            section: 'wishlist',
            label: 'Wishlist',
            icon: '❤️',
            path: '/wishlist',
            description: 'Saved restaurants'
        },
        {
            section: 'reviews',
            label: 'My Reviews',
            icon: '⭐',
            path: '/reviews',
            description: 'Your feedback'
        },
        {
            section: 'notifications',
            label: 'Notifications',
            icon: '🔔',
            path: '/notifications',
            description: 'View alerts',
            badge: 5
        },
        {
            section: 'settings',
            label: 'Settings',
            icon: '⚙️',
            path: '/settings',
            description: 'App preferences'
        }
    ];

    // Enhanced Restaurant Owner Sidebar Menu
    const restaurantMenu = [
        {
            section: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/restaurant-panel',
            description: 'Overview & stats'
        },
        {
            section: 'orders',
            label: 'Orders',
            icon: '📋',
            path: '/restaurant-panel/orders',
            description: 'Manage incoming orders',
            badge: 8
        },
        {
            section: 'menu',
            label: 'Menu Management',
            icon: '🍕',
            path: '/restaurant-panel/menu',
            description: 'Update your menu',
            submenu: [
                { section: 'items', label: 'Menu Items', path: '/restaurant-panel/menu' },
                { section: 'categories', label: 'Categories', path: '/restaurant-panel/menu/categories' },
                { section: 'offers', label: 'Special Offers', path: '/restaurant-panel/menu/offers' }
            ]
        },
        {
            section: 'analytics',
            label: 'Analytics',
            icon: '📈',
            path: '/restaurant-panel/analytics',
            description: 'Performance metrics'
        },
        {
            section: 'reviews',
            label: 'Reviews',
            icon: '⭐',
            path: '/restaurant-panel/reviews',
            description: 'Customer feedback',
            badge: 16
        },
        {
            section: 'settings',
            label: 'Settings',
            icon: '⚙️',
            path: '/restaurant-panel/settings',
            description: 'Restaurant settings'
        }
    ];

    // Enhanced Delivery Partner Sidebar Menu
    const deliveryMenu = [
        {
            section: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/delivery-panel',
            description: 'Your stats'
        },
        {
            section: 'active',
            label: 'Active Deliveries',
            icon: '🚚',
            path: '/delivery-panel/active',
            description: 'Current deliveries',
            badge: 2
        },
        {
            section: 'history',
            label: 'Delivery History',
            icon: '📜',
            path: '/delivery-panel/history',
            description: 'Past deliveries'
        },
        {
            section: 'earnings',
            label: 'Earnings',
            icon: '💰',
            path: '/delivery-panel/earnings',
            description: 'Your income'
        },
        {
            section: 'profile',
            label: 'Profile',
            icon: '👤',
            path: '/delivery-panel/profile',
            description: 'Update your info'
        },
        {
            section: 'settings',
            label: 'Settings',
            icon: '⚙️',
            path: '/delivery-panel/settings',
            description: 'App preferences'
        }
    ];

    const getMenuItems = () => {
        if (!isAuthenticated) return [];

        if (user?.role === 'admin') return adminMenu;
        if (user?.role === 'restaurant_owner') return restaurantMenu;
        if (user?.role === 'delivery_partner') return deliveryMenu;
        return userMenu;
    };

    const menuItems = getMenuItems();
    const isAdminRoute = location.pathname.includes('/admin');
    const isRestaurantRoute = location.pathname.includes('/restaurant-panel');
    const isDeliveryRoute = location.pathname.includes('/delivery-panel');

    const isMini = variant === 'mini';
    const isCompact = variant === 'compact';

    // Quick Actions based on role
    const quickActions = enableQuickActions ? [
        { id: 'profile', icon: '👤', label: 'Profile', action: () => navigate('/profile') },
        { id: 'orders', icon: '📦', label: 'Orders', action: () => navigate('/orders') },
        { id: 'support', icon: '💬', label: 'Support', action: () => navigate('/support') },
        { id: 'settings', icon: '⚙️', label: 'Settings', action: () => navigate('/settings') }
    ] : [];

    return (
        <>
            {/* Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? 'open' : ''} ${variant} ${position} ${isDarkMode ? 'dark' : 'light'}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    {isAuthenticated && user ? (
                        <div className="user-info">
                            <div className="user-avatar-wrapper">
                                <img
                                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.name || 'User')}&background=ff4757&color=fff&size=128&length=2`}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                                <div className="user-status online"></div>
                            </div>
                            {!isMini && (
                                <div className="user-details">
                                    <h3 className="user-name">{user?.full_name || user?.name}</h3>
                                    <p className="user-role">
                                        {user?.role?.replace('_', ' ').toUpperCase()}
                                    </p>
                                    <p className="user-email">{user?.email}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="guest-info">
                            <div className="guest-icon-wrapper">
                                <div className="guest-icon">👤</div>
                            </div>
                            {!isMini && (
                                <>
                                    <h3 className="guest-title">Welcome Guest</h3>
                                    <p className="guest-text">Please login to access your account</p>
                                    <div className="guest-actions">
                                        <Link to="/login" className="guest-login-btn" onClick={onClose}>
                                            Login
                                        </Link>
                                        <Link to="/signup" className="guest-signup-btn" onClick={onClose}>
                                            Sign Up
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
                        ✕
                    </button>
                </div>

                {/* Quick Actions */}
                {enableQuickActions && isAuthenticated && !isMini && (
                    <div className="quick-actions-sidebar">
                        {quickActions.map(action => (
                            <button key={action.id} className="quick-action" onClick={action.action}>
                                <span className="quick-action-icon">{action.icon}</span>
                                <span className="quick-action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Navigation Menu */}
                {isAuthenticated && (
                    <nav className="sidebar-nav">
                        {menuItems.map((item) => (
                            <div key={item.section} className="nav-item-wrapper">
                                {item.submenu ? (
                                    <>
                                        <button
                                            className={`nav-item ${item.submenu.some(sub => activeSection === sub.section) ? 'active' : ''}`}
                                            onClick={() => toggleSubmenu(item.section)}
                                        >
                                            <span className="nav-icon">{item.icon}</span>
                                            {!isMini && (
                                                <>
                                                    <span className="nav-label">{item.label}</span>
                                                    {item.badge > 0 && (
                                                        <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                                    )}
                                                    <span className={`submenu-arrow ${expandedMenus[item.section] ? 'expanded' : ''}`}>
                                                        ▶
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        {!isMini && expandedMenus[item.section] && (
                                            <div className="submenu">
                                                {item.submenu.map(sub => (
                                                    <Link
                                                        key={sub.section}
                                                        to={sub.path}
                                                        className={`submenu-item ${activeSection === sub.section ? 'active' : ''}`}
                                                        onClick={onClose}
                                                    >
                                                        <span className="submenu-icon">•</span>
                                                        <span className="submenu-label">{sub.label}</span>
                                                        {sub.badge > 0 && (
                                                            <span className="submenu-badge">{sub.badge}</span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`nav-item ${activeSection === item.section ? 'active' : ''}`}
                                        onClick={onClose}
                                        onMouseEnter={() => setHoveredItem(item.section)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        {!isMini && (
                                            <>
                                                <span className="nav-label">{item.label}</span>
                                                {item.badge > 0 && (
                                                    <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                                )}
                                            </>
                                        )}
                                        {showTooltips && isMini && hoveredItem === item.section && (
                                            <div className="nav-tooltip">{item.label}</div>
                                        )}
                                    </Link>
                                )}
                                {!isMini && item.description && (
                                    <div className="nav-description">{item.description}</div>
                                )}
                            </div>
                        ))}
                    </nav>
                )}

                {/* Quick Stats Cards */}
                {!isMini && (
                    <>
                        {isAdminRoute && isAuthenticated && user?.role === 'admin' && (
                            <div className="sidebar-stats">
                                <div className="stat-header">
                                    <span className="stat-header-icon">📊</span>
                                    <span>Quick Stats</span>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">👥</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">1,248</span>
                                        <span className="stat-label">Total Users</span>
                                        <span className="stat-trend up">↑ 12%</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">🏪</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">156</span>
                                        <span className="stat-label">Restaurants</span>
                                        <span className="stat-trend up">↑ 8%</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">📦</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">8,926</span>
                                        <span className="stat-label">Total Orders</span>
                                        <span className="stat-trend up">↑ 23%</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">💰</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">₹12.4L</span>
                                        <span className="stat-label">Revenue</span>
                                        <span className="stat-trend up">↑ 18%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isRestaurantRoute && isAuthenticated && user?.role === 'restaurant_owner' && (
                            <div className="sidebar-stats">
                                <div className="stat-header">
                                    <span className="stat-header-icon">📈</span>
                                    <span>Today's Stats</span>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">📋</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">24</span>
                                        <span className="stat-label">Orders Received</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">💰</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">₹12,450</span>
                                        <span className="stat-label">Revenue</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">⏳</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">8</span>
                                        <span className="stat-label">Pending Orders</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">⭐</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">4.7</span>
                                        <span className="stat-label">Rating</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isDeliveryRoute && isAuthenticated && user?.role === 'delivery_partner' && (
                            <div className="sidebar-stats">
                                <div className="stat-header">
                                    <span className="stat-header-icon">🚚</span>
                                    <span>Your Performance</span>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">🚚</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">8</span>
                                        <span className="stat-label">Today's Deliveries</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">💰</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">₹640</span>
                                        <span className="stat-label">Today's Earnings</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">⭐</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">4.8</span>
                                        <span className="stat-label">Rating</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon-wrapper">
                                        <span className="stat-icon">🎯</span>
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">98%</span>
                                        <span className="stat-label">On-time Delivery</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    {!isMini && (
                        <div className="theme-section">
                            <ThemeSwitcher variant="full" showLabels={true} />
                        </div>
                    )}

                    {isAuthenticated && (
                        <button className="logout-btn" onClick={handleLogout}>
                            <span className="logout-icon">🚪</span>
                            {!isMini && <span className="logout-text">Logout</span>}
                        </button>
                    )}

                    {isMini && (
                        <button className="expand-btn" onClick={() => onClose()} aria-label="Expand">
                            →
                        </button>
                    )}
                </div>

                {/* Version Info */}
                {!isMini && (
                    <div className="sidebar-version">
                        <span>Version 2.0.0</span>
                        <span>© 2024 FoodDelivery</span>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;
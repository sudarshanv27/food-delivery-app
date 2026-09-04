import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, onClose, onCollapse, userName = 'John Doe', userRole = 'Super Admin' }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    // Save collapse state to localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
            setIsCollapsed(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
        onCollapse?.(isCollapsed);
    }, [isCollapsed, onCollapse]);

    const menuSections = [
        {
            title: 'Main',
            items: [
                { path: '/admin', label: 'Dashboard', icon: '📊', section: 'dashboard', notifications: 0, isActive: true },
                { path: '/admin/analytics', label: 'Analytics', icon: '📈', section: 'analytics', notifications: 0 }
            ]
        },
        {
            title: 'Management',
            items: [
                { path: '/admin/users', label: 'Users', icon: '👥', section: 'users', badge: 24, notifications: 5 },
                { path: '/admin/restaurants', label: 'Restaurants', icon: '🏪', section: 'restaurants', badge: 156, notifications: 12 },
                { path: '/admin/orders', label: 'Orders', icon: '📋', section: 'orders', badge: 23, notifications: 8 },
                { path: '/admin/delivery', label: 'Delivery Partners', icon: '🚚', section: 'delivery', badge: 45, notifications: 3 }
            ]
        },
        {
            title: 'Marketing',
            items: [
                { path: '/admin/offers', label: 'Offers & Promotions', icon: '🎫', section: 'offers', badge: 8 },
                { path: '/admin/campaigns', label: 'Campaigns', icon: '📢', section: 'campaigns', badge: 3 },
                { path: '/admin/reviews', label: 'Reviews', icon: '⭐', section: 'reviews', badge: 127 }
            ]
        },
        {
            title: 'Reports',
            items: [
                { path: '/admin/reports', label: 'Reports', icon: '📄', section: 'reports' },
                { path: '/admin/logs', label: 'System Logs', icon: '📝', section: 'logs' },
                { path: '/admin/audit', label: 'Audit Trail', icon: '🔍', section: 'audit' }
            ]
        },
        {
            title: 'System',
            items: [
                { path: '/admin/settings', label: 'Settings', icon: '⚙️', section: 'settings' },
                { path: '/admin/backup', label: 'Backup', icon: '💾', section: 'backup' },
                { path: '/admin/security', label: 'Security', icon: '🔒', section: 'security' }
            ]
        }
    ];

    const quickActions = [
        { icon: '➕', label: 'Add Restaurant', action: '/admin/restaurants/add' },
        { icon: '👤', label: 'Add User', action: '/admin/users/add' },
        { icon: '🎫', label: 'Create Offer', action: '/admin/offers/create' },
        { icon: '📊', label: 'Generate Report', action: '/admin/reports/generate' }
    ];

    const handleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleSection = (sectionTitle) => {
        if (!isCollapsed) {
            setExpandedSections(prev => ({
                ...prev,
                [sectionTitle]: !prev[sectionTitle]
            }));
        }
    };

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <>
            {isOpen && <div className="admin-sidebar-overlay" onClick={onClose} />}

            <aside className={`admin-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    {!isCollapsed && (
                        <div className="logo-area">
                            <div className="logo-icon-container">
                                <span className="logo-icon">🍔</span>
                                <span className="logo-badge">PRO</span>
                            </div>
                            <div className="logo-text-container">
                                <span className="logo-text">FoodDelivery</span>
                                <span className="logo-subtitle">Admin Panel</span>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="logo-mini-container">
                            <span className="logo-icon-mini">🍔</span>
                            <span className="logo-badge-mini">P</span>
                        </div>
                    )}

                    <button className="collapse-btn" onClick={handleCollapse} aria-label="Toggle Sidebar">
                        <span className="collapse-icon">{isCollapsed ? '→' : '←'}</span>
                    </button>
                </div>

                {/* Admin Profile */}
                {!isCollapsed && (
                    <div className="admin-profile">
                        <div className="admin-avatar-container">
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName.split(' ')[0]}&background=ff4757&color=fff&bold=true&size=60`}
                                alt={userName}
                                className="admin-avatar"
                            />
                            <div className="online-indicator"></div>
                        </div>
                        <div className="admin-info">
                            <div className="admin-name">{userName}</div>
                            <div className="admin-role">{userRole}</div>
                            <div className="admin-status">
                                <span className="status-dot"></span>
                                <span className="status-text">Active</span>
                            </div>
                        </div>
                    </div>
                )}

                {isCollapsed && (
                    <div className="admin-profile-collapsed">
                        <div className="admin-avatar-mini">
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName.split(' ')[0]}&background=ff4757&color=fff&size=40`}
                                alt={userName}
                            />
                            <div className="online-indicator-mini"></div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                {!isCollapsed && (
                    <div className="quick-actions-section">
                        <div className="section-header">
                            <span className="section-title">Quick Actions</span>
                            <span className="section-icon">⚡</span>
                        </div>
                        <div className="quick-actions-grid">
                            {quickActions.map((action, index) => (
                                <Link key={index} to={action.action} className="quick-action-btn" title={action.label}>
                                    <span className="action-icon">{action.icon}</span>
                                    <span className="action-label">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    {menuSections.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            {!isCollapsed && (
                                <div
                                    className="nav-section-header"
                                    onClick={() => toggleSection(section.title)}
                                >
                                    <span className="section-title">{section.title}</span>
                                    <span className="section-toggle">
                                        {expandedSections[section.title] ? '▼' : '▶'}
                                    </span>
                                </div>
                            )}

                            {(isCollapsed || expandedSections[section.title] !== false) && (
                                <div className="nav-items">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                            onMouseEnter={() => setHoveredItem(item.path)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <span className="nav-icon">{item.icon}</span>

                                            {!isCollapsed && (
                                                <>
                                                    <span className="nav-label">{item.label}</span>

                                                    {item.badge && (
                                                        <span className="nav-badge">{item.badge}</span>
                                                    )}

                                                    {item.notifications > 0 && (
                                                        <span className="nav-notification">
                                                            {item.notifications}
                                                        </span>
                                                    )}

                                                    {isActive(item.path) && (
                                                        <span className="active-indicator"></span>
                                                    )}
                                                </>
                                            )}

                                            {isCollapsed && (
                                                <div className="nav-tooltip">
                                                    <span className="tooltip-label">{item.label}</span>
                                                    {item.badge && (
                                                        <span className="tooltip-badge">{item.badge}</span>
                                                    )}
                                                </div>
                                            )}

                                            {isCollapsed && item.badge && (
                                                <span className="nav-badge-mini">{item.badge}</span>
                                            )}

                                            {isCollapsed && item.notifications > 0 && (
                                                <span className="nav-notification-mini"></span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    {!isCollapsed && (
                        <>
                            <div className="footer-section">
                                <div className="footer-item support">
                                    <span className="footer-icon">❓</span>
                                    <span className="footer-label">Help Center</span>
                                    <span className="footer-shortcut">F1</span>
                                </div>
                                <div className="footer-item settings">
                                    <span className="footer-icon">⚙️</span>
                                    <span className="footer-label">Preferences</span>
                                    <span className="footer-shortcut">⌘,</span>
                                </div>
                                <div className="footer-item logout" onClick={handleLogout}>
                                    <span className="footer-icon">🚪</span>
                                    <span className="footer-label">Logout</span>
                                    <span className="footer-shortcut">⌘Q</span>
                                </div>
                            </div>

                            <div className="sidebar-footer-info">
                                <div className="version-info">
                                    <span className="version-badge">v2.0.1</span>
                                    <span className="update-available">Update available</span>
                                </div>
                                <div className="storage-info">
                                    <div className="storage-bar">
                                        <div className="storage-used" style={{ width: '65%' }}></div>
                                    </div>
                                    <span className="storage-text">65% used</span>
                                </div>
                            </div>
                        </>
                    )}

                    {isCollapsed && (
                        <div className="footer-icons">
                            <div className="footer-icon-item" title="Help Center (F1)">
                                <span>❓</span>
                                <span className="footer-tooltip">Help Center</span>
                            </div>
                            <div className="footer-icon-item" title="Preferences (⌘,)">
                                <span>⚙️</span>
                                <span className="footer-tooltip">Preferences</span>
                            </div>
                            <div className="footer-icon-item logout" title="Logout (⌘Q)" onClick={handleLogout}>
                                <span>🚪</span>
                                <span className="footer-tooltip">Logout</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
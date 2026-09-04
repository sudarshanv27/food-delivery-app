// src/components/profile/ProfileSidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProfileTabs } from './index';
import './ProfileSidebar.css';

const ProfileSidebar = ({
    user,
    activeTab,
    onTabChange,
    isMobileOpen = false,
    onMobileClose,
    variant = 'default', // 'default', 'compact', 'mini'
    showUserInfo = true,
    showStats = true,
    showProgress = true
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredTab, setHoveredTab] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    const tabs = getProfileTabs();

    // Add notification counts to tabs
    const tabsWithCounts = tabs.map(tab => {
        if (tab.id === 'orders' && user?.pending_orders) {
            return { ...tab, badge: user.pending_orders };
        }
        if (tab.id === 'messages' && user?.unread_messages) {
            return { ...tab, badge: user.unread_messages };
        }
        if (tab.id === 'notifications' && user?.unread_notifications) {
            return { ...tab, badge: user.unread_notifications };
        }
        return tab;
    });

    const isActive = (tabId) => {
        if (onTabChange) return activeTab === tabId;
        return location.pathname.includes(`/profile/${tabId}`);
    };

    const handleTabClick = (tabId, e) => {
        if (onTabChange) {
            e.preventDefault();
            onTabChange(tabId);
            if (isMobileOpen && onMobileClose) {
                setIsClosing(true);
                setTimeout(() => {
                    onMobileClose();
                    setIsClosing(false);
                }, 300);
            }
        }
    };

    const handleClose = () => {
        if (onMobileClose) {
            setIsClosing(true);
            setTimeout(() => {
                onMobileClose();
                setIsClosing(false);
            }, 300);
        }
    };

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        if (!user) return 0;
        let completed = 0;
        const fields = ['full_name', 'email', 'phone', 'address', 'birth_date'];
        fields.forEach(field => {
            if (user[field]) completed++;
        });
        return Math.round((completed / fields.length) * 100);
    };

    const profileCompletion = calculateProfileCompletion();

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!user?.full_name) return 'U';
        return user.full_name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get member since date
    const getMemberSince = () => {
        if (!user?.created_at) return 'Recent';
        const date = new Date(user.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Quick stats for user
    const userStats = {
        orders: user?.orders_count || 0,
        reviews: user?.reviews_count || 0,
        favorites: user?.favorites_count || 0,
        saved: user?.saved_items || 0
    };

    return (
        <>
            {/* Mobile Close Overlay */}
            {isMobileOpen && (
                <div
                    className={`profile-sidebar-mobile-overlay ${isClosing ? 'closing' : ''}`}
                    onClick={handleClose}
                />
            )}

            <aside className={`profile-sidebar ${variant} ${isMobileOpen ? 'mobile-open' : ''} ${isClosing ? 'closing' : ''}`}>
                {/* Mobile Close Button */}
                <button className="mobile-sidebar-close" onClick={handleClose} aria-label="Close sidebar">
                    ✕
                </button>

                {/* User Profile Section */}
                {showUserInfo && (
                    <div className="profile-sidebar-user">
                        <div className="user-avatar-wrapper">
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user?.full_name || 'User'}
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=ff4757&color=fff&length=2`;
                                        }}
                                    />
                                ) : (
                                    <div className="avatar-initials">
                                        {getUserInitials()}
                                    </div>
                                )}
                                <div className="user-status online"></div>
                            </div>
                            <div className="user-info">
                                <h4 className="user-name">{user?.full_name || 'Guest User'}</h4>
                                <p className="user-email">{user?.email || 'Not logged in'}</p>
                                <div className="user-member-since">
                                    <span className="member-icon">🎂</span>
                                    <span>Member since {getMemberSince()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Completion Progress */}
                        {showProgress && user && (
                            <div className="profile-completion">
                                <div className="completion-header">
                                    <span className="completion-label">Profile Strength</span>
                                    <span className="completion-value">{profileCompletion}%</span>
                                </div>
                                <div className="completion-bar">
                                    <div
                                        className="completion-fill"
                                        style={{ width: `${profileCompletion}%` }}
                                    >
                                        <div className="completion-glow"></div>
                                    </div>
                                </div>
                                {profileCompletion < 100 && (
                                    <p className="completion-tip">
                                        Complete your profile to get better recommendations
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Stats */}
                {showStats && user && (
                    <div className="profile-quick-stats">
                        <div className="stat-card">
                            <span className="stat-icon">📦</span>
                            <div className="stat-info">
                                <span className="stat-value">{userStats.orders}</span>
                                <span className="stat-label">Orders</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">⭐</span>
                            <div className="stat-info">
                                <span className="stat-value">{userStats.reviews}</span>
                                <span className="stat-label">Reviews</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon">❤️</span>
                            <div className="stat-info">
                                <span className="stat-value">{userStats.favorites}</span>
                                <span className="stat-label">Favorites</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="profile-sidebar-nav">
                    {tabsWithCounts.map(tab => (
                        <Link
                            key={tab.id}
                            to={`/profile/${tab.id}`}
                            className={`nav-item ${isActive(tab.id) ? 'active' : ''} ${hoveredTab === tab.id ? 'hovered' : ''}`}
                            onClick={(e) => handleTabClick(tab.id, e)}
                            onMouseEnter={() => setHoveredTab(tab.id)}
                            onMouseLeave={() => setHoveredTab(null)}
                        >
                            <div className="nav-icon-wrapper">
                                <span className="nav-icon">{tab.icon}</span>
                                {tab.badge > 0 && (
                                    <span className="nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
                                )}
                                {isActive(tab.id) && <span className="active-indicator"></span>}
                            </div>
                            <span className="nav-label">{tab.label}</span>
                            {variant === 'mini' && hoveredTab === tab.id && (
                                <div className="nav-tooltip">{tab.label}</div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Additional Links */}
                <div className="profile-sidebar-footer">
                    <Link to="/support" className="footer-link">
                        <span className="footer-icon">❓</span>
                        <span className="footer-label">Help & Support</span>
                    </Link>
                    <Link to="/settings" className="footer-link">
                        <span className="footer-icon">⚙️</span>
                        <span className="footer-label">Settings</span>
                    </Link>
                    <Link to="/logout" className="footer-link logout-link">
                        <span className="footer-icon">🚪</span>
                        <span className="footer-label">Logout</span>
                    </Link>
                </div>

                {/* Version Info */}
                <div className="sidebar-version">
                    <span>Version 2.0.0</span>
                    <span>© 2024 FoodDelivery</span>
                </div>
            </aside>
        </>
    );
};

export default ProfileSidebar;
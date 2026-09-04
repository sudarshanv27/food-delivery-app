// src/components/profile/ProfileLayout.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileSidebar from './ProfileSidebar';
import { getProfileComponent } from './index';
import './ProfileLayout.css';

const ProfileLayout = ({
    user,
    children,
    activeTab: propActiveTab,
    onTabChange,
    showBreadcrumb = true,
    showHeader = true,
    variant = 'default', // 'default', 'compact', 'minimal'
    enableAnimations = true,
    onProfileUpdate
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(propActiveTab || 'info');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [greeting, setGreeting] = useState('');

    // Get greeting based on time of day
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Handle scroll for back to top button
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync active tab with URL query param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['info', 'orders', 'addresses', 'payments', 'security', 'preferences'].includes(tabParam)) {
            setActiveTab(tabParam);
            if (onTabChange) onTabChange(tabParam);
        }
    }, [location, onTabChange]);

    // Update URL when tab changes
    const handleTabChangeWithUrl = useCallback((tabId) => {
        setActiveTab(tabId);
        if (onTabChange) onTabChange(tabId);

        // Update URL without page reload
        const params = new URLSearchParams(location.search);
        params.set('tab', tabId);
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, [onTabChange, navigate, location]);

    // Handle profile update
    const handleProfileUpdate = async (updatedData) => {
        setIsLoading(true);
        try {
            if (onProfileUpdate) {
                await onProfileUpdate(updatedData);
            }
            // Show success message
            const event = new CustomEvent('showToast', {
                detail: { message: 'Profile updated successfully!', type: 'success' }
            });
            window.dispatchEvent(event);
        } catch (error) {
            const event = new CustomEvent('showToast', {
                detail: { message: 'Failed to update profile', type: 'error' }
            });
            window.dispatchEvent(event);
        } finally {
            setIsLoading(false);
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const ActiveComponent = children || getProfileComponent(activeTab);
    const isCompact = variant === 'compact';
    const isMinimal = variant === 'minimal';

    // Profile completion percentage
    const profileCompletion = user ? calculateProfileCompletion(user) : 0;

    function calculateProfileCompletion(userData) {
        let completed = 0;
        const fields = ['full_name', 'email', 'phone', 'address', 'birth_date', 'avatar'];
        fields.forEach(field => {
            if (userData[field]) completed++;
        });
        return Math.round((completed / fields.length) * 100);
    }

    return (
        <div className={`profile-layout ${variant} ${enableAnimations ? 'animations-enabled' : ''}`}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="profile-loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Updating...</p>
                </div>
            )}

            {/* Header Section */}
            {showHeader && !isMinimal && (
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-greeting">
                            <span className="greeting-icon">👋</span>
                            <div className="greeting-text">
                                <span className="greeting-message">{greeting},</span>
                                <span className="greeting-name">{user?.full_name?.split(' ')[0] || 'User'}!</span>
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-card">
                                <span className="stat-value">{user?.orders_count || 0}</span>
                                <span className="stat-label">Orders</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{user?.reviews_count || 0}</span>
                                <span className="stat-label">Reviews</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{user?.saved_items || 0}</span>
                                <span className="stat-label">Saved</span>
                            </div>
                        </div>

                        <div className="profile-completion">
                            <div className="completion-info">
                                <span className="completion-label">Profile Completion</span>
                                <span className="completion-percentage">{profileCompletion}%</span>
                            </div>
                            <div className="completion-bar">
                                <div
                                    className="completion-fill"
                                    style={{ width: `${profileCompletion}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isMinimal && (
                <button
                    className={`mobile-profile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle profile menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            )}

            {/* Breadcrumb Navigation */}
            {showBreadcrumb && !isMinimal && (
                <div className="profile-breadcrumb">
                    <div className="breadcrumb-items">
                        <button onClick={() => navigate('/')} className="breadcrumb-link">
                            Home
                        </button>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-current">My Profile</span>
                        {activeTab !== 'info' && (
                            <>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-current">
                                    {getProfileComponent(activeTab)?.displayName || activeTab}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="profile-layout-container">
                {/* Sidebar */}
                <ProfileSidebar
                    user={user}
                    activeTab={activeTab}
                    onTabChange={handleTabChangeWithUrl}
                    isMobileOpen={isMobileMenuOpen}
                    onMobileClose={() => setIsMobileMenuOpen(false)}
                    variant={variant}
                />

                {/* Main Content */}
                <main className="profile-main-content">
                    <div className="profile-content-wrapper">
                        {typeof ActiveComponent === 'function' ? (
                            <ActiveComponent
                                user={user}
                                onUpdate={handleProfileUpdate}
                                isLoading={isLoading}
                            />
                        ) : (
                            ActiveComponent
                        )}
                    </div>
                </main>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button className="profile-back-to-top" onClick={scrollToTop} aria-label="Back to top">
                    <span className="back-to-top-icon">↑</span>
                </button>
            )}

            {/* Quick Tips Section */}
            {!isMinimal && (
                <div className="profile-tips">
                    <div className="tips-header">
                        <span className="tips-icon">💡</span>
                        <span className="tips-title">Quick Tips</span>
                    </div>
                    <div className="tips-list">
                        <div className="tip-item">
                            <span className="tip-bullet">•</span>
                            <span>Complete your profile to get better recommendations</span>
                        </div>
                        <div className="tip-item">
                            <span className="tip-bullet">•</span>
                            <span>Add your favorite payment methods for faster checkout</span>
                        </div>
                        <div className="tip-item">
                            <span className="tip-bullet">•</span>
                            <span>Enable notifications to never miss an offer</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Export additional helper components
export const ProfileErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const errorHandler = (error) => {
            console.error('Profile Error:', error);
            setHasError(true);
        };
        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) {
        return (
            <div className="profile-error">
                <div className="error-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>Unable to load profile data. Please try refreshing the page.</p>
                <button onClick={() => window.location.reload()} className="error-retry-btn">
                    Refresh Page
                </button>
            </div>
        );
    }

    return children;
};

export const ProfileSkeleton = () => (
    <div className="profile-skeleton">
        <div className="skeleton-header"></div>
        <div className="skeleton-sidebar"></div>
        <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
        </div>
    </div>
);

export default ProfileLayout;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import UserProfile from '../../components/user/UserProfile';
import UserAddressBook from '../../components/user/UserAddressBook';
import UserOrderHistory from '../../components/user/UserOrderHistory';
import UserPaymentMethods from '../../components/user/UserPaymentMethods';
import UserWishlist from '../../components/user/UserWishlist';
import UserReviews from '../../components/user/UserReviews';
import UserNotifications from '../../components/user/UserNotifications';
import UserPreferences from '../../components/user/UserPreferences';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [stats, setStats] = useState({
        totalOrders: 0,
        wishlistCount: 0,
        reviewsCount: 0,
        unreadNotifications: 0
    });

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setStats({
                totalOrders: 12,
                wishlistCount: 5,
                reviewsCount: 8,
                unreadNotifications: 3
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'orders', label: 'Orders', icon: '📦', badge: stats.totalOrders },
        { id: 'addresses', label: 'Addresses', icon: '📍' },
        { id: 'payments', label: 'Payments', icon: '💳' },
        { id: 'wishlist', label: 'Wishlist', icon: '❤️', badge: stats.wishlistCount },
        { id: 'reviews', label: 'Reviews', icon: '⭐', badge: stats.reviewsCount },
        { id: 'notifications', label: 'Notifications', icon: '🔔', badge: stats.unreadNotifications },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <UserProfile />;
            case 'orders':
                return <UserOrderHistory />;
            case 'addresses':
                return <UserAddressBook />;
            case 'payments':
                return <UserPaymentMethods />;
            case 'wishlist':
                return <UserWishlist />;
            case 'reviews':
                return <UserReviews />;
            case 'notifications':
                return <UserNotifications />;
            case 'preferences':
                return <UserPreferences />;
            default:
                return <UserProfile />;
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-avatar">
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.full_name || user?.name}&background=ff4757&color=fff&size=128`}
                            alt={user?.full_name || user?.name}
                        />
                        <div className="profile-role-badge">
                            {user?.role === 'user' && 'Customer'}
                            {user?.role === 'restaurant_owner' && 'Restaurant Owner'}
                            {user?.role === 'delivery_partner' && 'Delivery Partner'}
                            {user?.role === 'admin' && 'Admin'}
                        </div>
                    </div>

                    <div className="profile-info">
                        <h3 className="profile-name">{user?.full_name || user?.name}</h3>
                        <p className="profile-email">{user?.email}</p>
                        {user?.phone && <p className="profile-phone">📞 {user.phone}</p>}
                        <p className="profile-member-since">
                            Member since: {new Date(user?.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <nav className="profile-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="nav-icon">{tab.icon}</span>
                                <span className="nav-label">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="nav-badge">{tab.badge}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="profile-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
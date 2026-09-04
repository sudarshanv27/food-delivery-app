// src/components/layout/Settings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateUser, changePassword, deleteAccount } = useAuth();
    const { isDarkMode, toggleTheme, setThemePreference } = useTheme();

    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        birth_date: '',
        gender: '',
        language: 'en'
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    // Notification Preferences
    const [notificationPrefs, setNotificationPrefs] = useState({
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        order_updates: true,
        promotional_emails: true,
        delivery_updates: true,
        offer_alerts: true
    });

    // Privacy Settings
    const [privacySettings, setPrivacySettings] = useState({
        show_online_status: true,
        show_last_seen: true,
        share_location: true,
        allow_messages: true,
        public_profile: false
    });

    // Language Options
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ];

    // Load user data
    useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || '',
                birth_date: user.birth_date || '',
                gender: user.gender || '',
                language: user.language || 'en'
            });
        }
    }, [user]);

    const showToast = (message) => {
        setSuccessMessage(message);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateUser(profileForm);
            showToast('Profile updated successfully!');
        } catch (error) {
            showToast('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const errors = {};

        if (passwordForm.new_password.length < 6) {
            errors.new_password = 'Password must be at least 6 characters';
        }
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            errors.confirm_password = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(passwordForm.current_password, passwordForm.new_password);
            showToast('Password changed successfully!');
            setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
            setPasswordErrors({});
        } catch (error) {
            showToast('Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            await deleteAccount();
            showToast('Account deleted successfully');
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            showToast('Failed to delete account');
        } finally {
            setIsLoading(false);
            setShowDeleteModal(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'privacy', label: 'Privacy', icon: '🛡️' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' },
        { id: 'danger', label: 'Danger Zone', icon: '⚠️' }
    ];

    return (
        <div className={`settings-container ${isDarkMode ? 'dark' : 'light'}`}>
            {/* Header */}
            <div className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Manage your account preferences and settings</p>
            </div>

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="success-toast">
                    <span className="toast-icon">✅</span>
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="settings-content">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    <div className="user-info-card">
                        <div className="user-avatar-large">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.full_name || 'User')}&background=ff4757&color=fff&length=2&size=100`}
                                alt="Profile"
                            />
                            <button className="change-avatar-btn" aria-label="Change avatar">
                                📷
                            </button>
                        </div>
                        <h3 className="user-name">{profileForm.full_name || 'User Name'}</h3>
                        <p className="user-email">{profileForm.email}</p>
                        <div className="user-membership">
                            <span className="membership-badge">Premium Member</span>
                        </div>
                    </div>

                    <div className="settings-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="tab-icon">{tab.icon}</span>
                                <span className="tab-label">{tab.label}</span>
                                {activeTab === tab.id && <span className="tab-active-indicator"></span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="settings-main">
                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Profile Information</h2>
                                <p>Update your personal information and how others see you</p>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="settings-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">👤</span>
                                            <input
                                                type="text"
                                                value={profileForm.full_name}
                                                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">✉️</span>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                placeholder="Enter your email"
                                                disabled
                                            />
                                        </div>
                                        <small className="form-hint">Email cannot be changed</small>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">📞</span>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🎂</span>
                                            <input
                                                type="date"
                                                value={profileForm.birth_date}
                                                onChange={(e) => setProfileForm({ ...profileForm, birth_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={profileForm.gender === 'male'}
                                                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                />
                                                <span>Male</span>
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={profileForm.gender === 'female'}
                                                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                />
                                                <span>Female</span>
                                            </label>
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="other"
                                                    checked={profileForm.gender === 'other'}
                                                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                />
                                                <span>Other</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Language</label>
                                        <div className="select-wrapper">
                                            <span className="select-icon">🌐</span>
                                            <select
                                                value={profileForm.language}
                                                onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                                            >
                                                {languages.map(lang => (
                                                    <option key={lang.code} value={lang.code}>
                                                        {lang.flag} {lang.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📝</span>
                                        <textarea
                                            value={profileForm.bio}
                                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                            placeholder="Tell us a little about yourself"
                                            rows="4"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📍</span>
                                        <input
                                            type="text"
                                            value={profileForm.location}
                                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Security Settings</h2>
                                <p>Manage your password and security preferences</p>
                            </div>

                            {/* Change Password */}
                            <div className="security-card">
                                <h3>Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="settings-form">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🔑</span>
                                            <input
                                                type="password"
                                                value={passwordForm.current_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                placeholder="Enter current password"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>New Password</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🔒</span>
                                            <input
                                                type="password"
                                                value={passwordForm.new_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                placeholder="Enter new password"
                                                required
                                            />
                                        </div>
                                        {passwordErrors.new_password && (
                                            <span className="error-message">{passwordErrors.new_password}</span>
                                        )}
                                        <div className="password-strength">
                                            <div className="strength-meter">
                                                <div className="strength-fill" style={{ width: '0%' }}></div>
                                            </div>
                                            <span className="strength-text">Password strength: Weak</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">✅</span>
                                            <input
                                                type="password"
                                                value={passwordForm.confirm_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                        </div>
                                        {passwordErrors.confirm_password && (
                                            <span className="error-message">{passwordErrors.confirm_password}</span>
                                        )}
                                    </div>

                                    <button type="submit" className="btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="security-card">
                                <div className="card-header">
                                    <div>
                                        <h3>Two-Factor Authentication</h3>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                    <button className="btn-outline">Enable 2FA</button>
                                </div>
                            </div>

                            {/* Active Sessions */}
                            <div className="security-card">
                                <h3>Active Sessions</h3>
                                <div className="sessions-list">
                                    <div className="session-item">
                                        <div className="session-info">
                                            <span className="session-icon">💻</span>
                                            <div>
                                                <div className="session-device">Chrome on Windows</div>
                                                <div className="session-location">New York, USA</div>
                                            </div>
                                        </div>
                                        <div className="session-status active">Active now</div>
                                    </div>
                                    <div className="session-item">
                                        <div className="session-info">
                                            <span className="session-icon">📱</span>
                                            <div>
                                                <div className="session-device">Safari on iPhone</div>
                                                <div className="session-location">New York, USA</div>
                                            </div>
                                        </div>
                                        <div className="session-status">Last active 2 hours ago</div>
                                    </div>
                                </div>
                                <button className="btn-danger-outline">Logout All Devices</button>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Notification Preferences</h2>
                                <p>Choose what notifications you want to receive</p>
                            </div>

                            <div className="notifications-settings">
                                <div className="notification-group">
                                    <h3>Push Notifications</h3>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-icon">🔔</span>
                                            <div>
                                                <div className="toggle-label">Enable Push Notifications</div>
                                                <div className="toggle-description">Receive push notifications on your device</div>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationPrefs.push_notifications}
                                                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, push_notifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="notification-group">
                                    <h3>Email Notifications</h3>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-icon">✉️</span>
                                            <div>
                                                <div className="toggle-label">Order Updates</div>
                                                <div className="toggle-description">Get email updates about your orders</div>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationPrefs.order_updates}
                                                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, order_updates: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-icon">🎁</span>
                                            <div>
                                                <div className="toggle-label">Promotional Emails</div>
                                                <div className="toggle-description">Receive offers and discounts via email</div>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationPrefs.promotional_emails}
                                                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, promotional_emails: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="notification-group">
                                    <h3>SMS Notifications</h3>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-icon">📱</span>
                                            <div>
                                                <div className="toggle-label">SMS Alerts</div>
                                                <div className="toggle-description">Receive SMS alerts for delivery updates</div>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationPrefs.sms_notifications}
                                                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, sms_notifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Settings */}
                    {activeTab === 'privacy' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>Privacy & Security</h2>
                                <p>Control your privacy preferences</p>
                            </div>

                            <div className="privacy-settings">
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">🟢</span>
                                        <div>
                                            <div className="toggle-label">Show Online Status</div>
                                            <div className="toggle-description">Let others see when you're online</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.show_online_status}
                                            onChange={(e) => setPrivacySettings({ ...privacySettings, show_online_status: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">👁️</span>
                                        <div>
                                            <div className="toggle-label">Show Last Seen</div>
                                            <div className="toggle-description">Show when you were last active</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.show_last_seen}
                                            onChange={(e) => setPrivacySettings({ ...privacySettings, show_last_seen: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">📍</span>
                                        <div>
                                            <div className="toggle-label">Share Location</div>
                                            <div className="toggle-description">Share your location for better delivery experience</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.share_location}
                                            onChange={(e) => setPrivacySettings({ ...privacySettings, share_location: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">💬</span>
                                        <div>
                                            <div className="toggle-label">Allow Messages</div>
                                            <div className="toggle-description">Allow other users to message you</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.allow_messages}
                                            onChange={(e) => setPrivacySettings({ ...privacySettings, allow_messages: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Data Download */}
                            <div className="privacy-card">
                                <h3>Download Your Data</h3>
                                <p>Get a copy of your data in JSON format</p>
                                <button className="btn-outline">Download Data →</button>
                            </div>
                        </div>
                    )}

                    {/* Preferences */}
                    {activeTab === 'preferences' && (
                        <div className="settings-section">
                            <div className="section-header">
                                <h2>App Preferences</h2>
                                <p>Customize your app experience</p>
                            </div>

                            <div className="preferences-settings">
                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">🌙</span>
                                        <div>
                                            <div className="toggle-label">Dark Mode</div>
                                            <div className="toggle-description">Switch between light and dark theme</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={isDarkMode}
                                            onChange={toggleTheme}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">🔊</span>
                                        <div>
                                            <div className="toggle-label">Sound Effects</div>
                                            <div className="toggle-description">Play sounds for notifications</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">📱</span>
                                        <div>
                                            <div className="toggle-label">Auto-play Videos</div>
                                            <div className="toggle-description">Automatically play videos in feed</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div className="toggle-item">
                                    <div className="toggle-info">
                                        <span className="toggle-icon">💾</span>
                                        <div>
                                            <div className="toggle-label">Save Data Mode</div>
                                            <div className="toggle-description">Reduce data usage for images and videos</div>
                                        </div>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Currency Preference */}
                            <div className="preference-card">
                                <h3>Currency Preference</h3>
                                <div className="select-wrapper">
                                    <select defaultValue="INR">
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="INR">INR - Indian Rupee</option>
                                    </select>
                                </div>
                            </div>

                            {/* Distance Unit */}
                            <div className="preference-card">
                                <h3>Distance Unit</h3>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input type="radio" name="distance" defaultChecked />
                                        <span>Kilometers (km)</span>
                                    </label>
                                    <label className="radio-label">
                                        <input type="radio" name="distance" />
                                        <span>Miles (mi)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'danger' && (
                        <div className="settings-section">
                            <div className="section-header danger">
                                <h2>Danger Zone</h2>
                                <p>Irreversible actions for your account</p>
                            </div>

                            <div className="danger-card">
                                <div className="danger-info">
                                    <div className="danger-icon">⚠️</div>
                                    <div>
                                        <h3>Delete Account</h3>
                                        <p>Permanently delete your account and all associated data</p>
                                        <ul className="danger-list">
                                            <li>All your orders will be permanently deleted</li>
                                            <li>Your saved addresses and payment methods will be removed</li>
                                            <li>Your reviews and ratings will be anonymized</li>
                                            <li>You cannot recover your account once deleted</li>
                                        </ul>
                                    </div>
                                </div>
                                <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                                    Delete Account
                                </button>
                            </div>

                            {/* Deactivate Account */}
                            <div className="danger-card">
                                <div className="danger-info">
                                    <div className="danger-icon">⏸️</div>
                                    <div>
                                        <h3>Deactivate Account</h3>
                                        <p>Temporarily deactivate your account</p>
                                        <p className="danger-note">Your data will be preserved and you can reactivate anytime</p>
                                    </div>
                                </div>
                                <button className="btn-warning">Deactivate Account</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Account</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="warning-icon">⚠️</div>
                            <p>Are you sure you want to delete your account?</p>
                            <p className="warning-text">This action cannot be undone. All your data will be permanently lost.</p>
                            <input
                                type="text"
                                placeholder="Type 'DELETE' to confirm"
                                className="confirm-input"
                                id="confirm-delete"
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn-danger" onClick={handleDeleteAccount} disabled={isLoading}>
                                {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
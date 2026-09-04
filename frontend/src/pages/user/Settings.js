import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import ThemeSwitcher from '../../components/common/ThemeSwitcher';
import './Settings.css';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('account');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotionalEmails: false,
        twoFactorAuth: false,
        language: 'en',
        currency: 'INR'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const sections = [
        { id: 'account', label: 'Account Settings', icon: '👤' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateAccountForm = () => {
        const newErrors = {};

        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required';
        } else if (formData.full_name.length < 2) {
            newErrors.full_name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSecurityForm = () => {
        const newErrors = {};

        if (formData.newPassword) {
            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
                newErrors.newPassword = 'Password must contain uppercase, lowercase and number';
            }

            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }

            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAccount = async () => {
        if (!validateAccountForm()) return;

        setIsLoading(true);
        try {
            await updateUser({
                full_name: formData.full_name,
                phone: formData.phone
            });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Error saving account settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSecurity = async () => {
        if (!validateSecurityForm()) return;

        setIsLoading(true);
        try {
            // API call to change password
            await new Promise(resolve => setTimeout(resolve, 1000));
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Error saving security settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Error saving notification settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'account':
                return (
                    <div className="settings-section">
                        <h3>Account Information</h3>
                        <p className="section-description">Update your account details and personal information</p>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className={errors.full_name ? 'error' : ''}
                            />
                            {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                                className="disabled"
                            />
                            <small>Email cannot be changed. Contact support for assistance.</small>
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>

                        <div className="form-actions">
                            <Button variant="primary" onClick={handleSaveAccount} isLoading={isLoading}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="settings-section">
                        <h3>Security Settings</h3>
                        <p className="section-description">Manage your password and security preferences</p>

                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className={errors.currentPassword ? 'error' : ''}
                            />
                            {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className={errors.newPassword ? 'error' : ''}
                            />
                            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    name="twoFactorAuth"
                                    checked={formData.twoFactorAuth}
                                    onChange={handleChange}
                                />
                                Enable Two-Factor Authentication
                            </label>
                            <small>Add an extra layer of security to your account</small>
                        </div>

                        <div className="form-actions">
                            <Button variant="primary" onClick={handleSaveSecurity} isLoading={isLoading}>
                                Update Password
                            </Button>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="settings-section">
                        <h3>Notification Preferences</h3>
                        <p className="section-description">Choose what notifications you want to receive</p>

                        <div className="setting-group toggle">
                            <div className="toggle-label">
                                <span>Email Notifications</span>
                                <p>Receive order updates and offers via email</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={formData.emailNotifications}
                                    onChange={handleChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-group toggle">
                            <div className="toggle-label">
                                <span>Push Notifications</span>
                                <p>Get real-time updates on your device</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="pushNotifications"
                                    checked={formData.pushNotifications}
                                    onChange={handleChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-group toggle">
                            <div className="toggle-label">
                                <span>Order Updates</span>
                                <p>Get notifications about your order status</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="orderUpdates"
                                    checked={formData.orderUpdates}
                                    onChange={handleChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-group toggle">
                            <div className="toggle-label">
                                <span>Promotional Emails</span>
                                <p>Receive exclusive offers and discounts</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="promotionalEmails"
                                    checked={formData.promotionalEmails}
                                    onChange={handleChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="form-actions">
                            <Button variant="primary" onClick={handleSaveNotifications} isLoading={isLoading}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="settings-section">
                        <h3>App Preferences</h3>
                        <p className="section-description">Customize your app experience</p>

                        <div className="form-group">
                            <label>Language</label>
                            <select name="language" value={formData.language} onChange={handleChange}>
                                <option value="en">English</option>
                                <option value="hi">हिन्दी (Hindi)</option>
                                <option value="bn">বাংলা (Bengali)</option>
                                <option value="te">తెలుగు (Telugu)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Currency</label>
                            <select name="currency" value={formData.currency} onChange={handleChange}>
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <Button variant="primary" onClick={handleSavePreferences} isLoading={isLoading}>
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="settings-section">
                        <h3>Appearance</h3>
                        <p className="section-description">Customize how the app looks</p>

                        <ThemeSwitcher variant="full" showLabels={true} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <p>Manage your account preferences and settings</p>
                </div>

                {isSaved && (
                    <div className="save-success">
                        <span className="success-icon">✅</span>
                        <span>Settings saved successfully!</span>
                    </div>
                )}

                <div className="settings-wrapper">
                    <div className="settings-sidebar">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                className={`sidebar-btn ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <span className="sidebar-icon">{section.icon}</span>
                                <span className="sidebar-label">{section.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="settings-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
// src/components/profile/UserPreferences.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserPreferences = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        // Notification Preferences
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        order_updates: true,
        promotional_emails: false,
        newsletter: false,

        // Appearance Preferences
        theme: 'light',
        fontSize: 'medium',
        reducedMotion: false,

        // Language & Region
        language: 'en',
        currency: 'INR',
        timezone: 'Asia/Kolkata',

        // Privacy Preferences
        share_activity: true,
        show_online_status: true,
        save_search_history: true,

        // Order Preferences
        default_payment_method: null,
        save_address_history: true,
        auto_apply_coupons: true,

        // Accessibility
        high_contrast: false,
        large_buttons: false,
        screen_reader_optimized: false
    });

    const applyTheme = useCallback((theme) => {
        const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    const applyFontSize = useCallback((fontSize) => {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        document.body.style.fontSize = sizes[fontSize] || '16px';
        document.documentElement.setAttribute('data-font-size', fontSize);
    }, []);

    const applyHighContrast = useCallback((enabled) => {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }, []);

    const applyLargeButtons = useCallback((enabled) => {
        if (enabled) {
            document.body.classList.add('large-buttons');
        } else {
            document.body.classList.remove('large-buttons');
        }
    }, []);

    const applyReducedMotion = useCallback((enabled) => {
        if (enabled) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }, []);

    const fetchPreferences = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/users/preferences', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = response.data.data || response.data.preferences || response.data;
            setPreferences(prev => ({ ...prev, ...data }));

            // Apply saved preferences
            if (data.theme) applyTheme(data.theme);
            if (data.fontSize) applyFontSize(data.fontSize);
            if (data.highContrast) applyHighContrast(data.highContrast);
            if (data.largeButtons) applyLargeButtons(data.largeButtons);
            if (data.reducedMotion) applyReducedMotion(data.reducedMotion);

        } catch (error) {
            console.error('Error fetching preferences:', error);
            toast.error('Using default preferences. API not available.', { duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [applyTheme, applyFontSize, applyHighContrast, applyLargeButtons, applyReducedMotion]);

    useEffect(() => {
        fetchPreferences();

        // Listen for system theme changes
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
            if (preferences.theme === 'system') {
                applyTheme('system');
            }
        };

        darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, [fetchPreferences, preferences.theme, applyTheme]);

    const savePreferences = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/users/preferences', preferences, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Preferences saved successfully', {
                icon: '✅',
                duration: 2000
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error(error.response?.data?.message || 'Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (key) => {
        const newValue = !preferences[key];
        setPreferences(prev => ({ ...prev, [key]: newValue }));

        // Apply immediate effects for certain preferences
        if (key === 'highContrast') applyHighContrast(newValue);
        if (key === 'largeButtons') applyLargeButtons(newValue);
        if (key === 'reducedMotion') applyReducedMotion(newValue);
    };

    const handleThemeChange = (theme) => {
        setPreferences(prev => ({ ...prev, theme }));
        applyTheme(theme);
    };

    const handleFontSizeChange = (fontSize) => {
        setPreferences(prev => ({ ...prev, fontSize }));
        applyFontSize(fontSize);
    };

    const handleChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const resetToDefaults = async () => {
        if (window.confirm('Are you sure you want to reset all preferences to default values?')) {
            const defaultPreferences = {
                email_notifications: true,
                push_notifications: true,
                sms_notifications: false,
                order_updates: true,
                promotional_emails: false,
                newsletter: false,
                theme: 'light',
                fontSize: 'medium',
                reducedMotion: false,
                language: 'en',
                currency: 'INR',
                timezone: 'Asia/Kolkata',
                share_activity: true,
                show_online_status: true,
                save_search_history: true,
                save_address_history: true,
                auto_apply_coupons: true,
                high_contrast: false,
                large_buttons: false,
                screen_reader_optimized: false
            };

            setPreferences(defaultPreferences);

            // Apply default settings
            applyTheme('light');
            applyFontSize('medium');
            applyHighContrast(false);
            applyLargeButtons(false);
            applyReducedMotion(false);

            toast.success('Preferences reset to defaults');
        }
    };

    if (loading) {
        return (
            <div className="preferences-loading">
                <div className="loading-spinner"></div>
                <p>Loading preferences...</p>
            </div>
        );
    }

    return (
        <div className="user-preferences">
            <div className="preferences-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">⚙️</span>
                        Preferences
                    </h2>
                    <p className="header-subtitle">Customize your app experience</p>
                </div>
                <div className="header-actions">
                    <button onClick={resetToDefaults} className="reset-btn" title="Reset to defaults">
                        🔄 Reset to Defaults
                    </button>
                    <button onClick={savePreferences} disabled={saving} className="save-all-btn">
                        {saving ? 'Saving...' : '💾 Save All Changes'}
                    </button>
                </div>
            </div>

            <div className="preferences-container">
                {/* Notification Preferences */}
                <div className="preference-section">
                    <div className="section-header">
                        <h3>
                            <span className="section-icon">🔔</span>
                            Notifications
                        </h3>
                        <p className="section-description">Manage how you receive updates</p>
                    </div>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Email Notifications</label>
                                <p>Receive notifications via email</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.email_notifications}
                                    onChange={() => handleToggle('email_notifications')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Push Notifications</label>
                                <p>Receive browser push notifications</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.push_notifications}
                                    onChange={() => handleToggle('push_notifications')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>SMS Notifications</label>
                                <p>Receive text message updates</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.sms_notifications}
                                    onChange={() => handleToggle('sms_notifications')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Order Updates</label>
                                <p>Get real-time order status updates</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.order_updates}
                                    onChange={() => handleToggle('order_updates')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Promotional Emails</label>
                                <p>Receive offers and discounts</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.promotional_emails}
                                    onChange={() => handleToggle('promotional_emails')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Newsletter</label>
                                <p>Weekly newsletter with updates</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.newsletter}
                                    onChange={() => handleToggle('newsletter')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Appearance Preferences */}
                <div className="preference-section">
                    <div className="section-header">
                        <h3>
                            <span className="section-icon">🎨</span>
                            Appearance
                        </h3>
                        <p className="section-description">Customize how the app looks</p>
                    </div>
                    <div className="preferences-grid">
                        <div className="preference-item full-width">
                            <div className="preference-info">
                                <label>Theme</label>
                                <p>Choose your preferred color theme</p>
                            </div>
                            <div className="theme-options">
                                <button
                                    className={`theme-btn ${preferences.theme === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    <span className="theme-icon">☀️</span>
                                    Light
                                </button>
                                <button
                                    className={`theme-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    <span className="theme-icon">🌙</span>
                                    Dark
                                </button>
                                <button
                                    className={`theme-btn ${preferences.theme === 'system' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('system')}
                                >
                                    <span className="theme-icon">💻</span>
                                    System
                                </button>
                            </div>
                        </div>

                        <div className="preference-item full-width">
                            <div className="preference-info">
                                <label>Font Size</label>
                                <p>Adjust text size for better readability</p>
                            </div>
                            <div className="font-size-options">
                                <button
                                    className={`size-btn ${preferences.fontSize === 'small' ? 'active' : ''}`}
                                    onClick={() => handleFontSizeChange('small')}
                                >
                                    <span className="size-demo">A</span>
                                    <span className="size-label">Small</span>
                                </button>
                                <button
                                    className={`size-btn ${preferences.fontSize === 'medium' ? 'active' : ''}`}
                                    onClick={() => handleFontSizeChange('medium')}
                                >
                                    <span className="size-demo">Aa</span>
                                    <span className="size-label">Medium</span>
                                </button>
                                <button
                                    className={`size-btn ${preferences.fontSize === 'large' ? 'active' : ''}`}
                                    onClick={() => handleFontSizeChange('large')}
                                >
                                    <span className="size-demo">Aa</span>
                                    <span className="size-label">Large</span>
                                </button>
                            </div>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Reduced Motion</label>
                                <p>Minimize animations and transitions</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.reducedMotion}
                                    onChange={() => handleToggle('reducedMotion')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Language & Region */}
                <div className="preference-section">
                    <div className="section-header">
                        <h3>
                            <span className="section-icon">🌐</span>
                            Language & Region
                        </h3>
                        <p className="section-description">Set your language and regional preferences</p>
                    </div>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Language</label>
                                <p>Choose your preferred language</p>
                            </div>
                            <select
                                value={preferences.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="preference-select"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी (Hindi)</option>
                                <option value="bn">বাংলা (Bengali)</option>
                                <option value="te">తెలుగు (Telugu)</option>
                                <option value="mr">मराठी (Marathi)</option>
                                <option value="ta">தமிழ் (Tamil)</option>
                                <option value="ur">اردو (Urdu)</option>
                                <option value="gu">ગુજરાતી (Gujarati)</option>
                                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                <option value="ml">മലയാളം (Malayalam)</option>
                            </select>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Currency</label>
                                <p>Select your preferred currency</p>
                            </div>
                            <select
                                value={preferences.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="preference-select"
                            >
                                <option value="INR">Indian Rupee (₹)</option>
                                <option value="USD">US Dollar ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">British Pound (£)</option>
                                <option value="AED">UAE Dirham (د.إ)</option>
                            </select>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Time Zone</label>
                                <p>Set your local time zone</p>
                            </div>
                            <select
                                value={preferences.timezone}
                                onChange={(e) => handleChange('timezone', e.target.value)}
                                className="preference-select"
                            >
                                <option value="Asia/Kolkata">IST (India)</option>
                                <option value="America/New_York">EST (USA)</option>
                                <option value="Europe/London">GMT (UK)</option>
                                <option value="Asia/Dubai">GST (UAE)</option>
                                <option value="Australia/Sydney">AEST (Australia)</option>
                                <option value="Asia/Tokyo">JST (Japan)</option>
                                <option value="Europe/Paris">CET (France)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Privacy Preferences */}
                <div className="preference-section">
                    <div className="section-header">
                        <h3>
                            <span className="section-icon">🔒</span>
                            Privacy
                        </h3>
                        <p className="section-description">Control your privacy settings</p>
                    </div>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Share Activity</label>
                                <p>Allow others to see your activity</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.share_activity}
                                    onChange={() => handleToggle('share_activity')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Show Online Status</label>
                                <p>Let others see when you're online</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.show_online_status}
                                    onChange={() => handleToggle('show_online_status')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Save Search History</label>
                                <p>Store your search queries for better recommendations</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.save_search_history}
                                    onChange={() => handleToggle('save_search_history')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Order Preferences */}
                <div className="preference-section">
                    <div className="section-header">
                        <h3>
                            <span className="section-icon">🛒</span>
                            Order Preferences
                        </h3>
                        <p className="section-description">Customize your ordering experience</p>
                    </div>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Save Address History</label>
                                <p>Remember addresses for future orders</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.save_address_history}
                                    onChange={() => handleToggle('save_address_history')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Auto-apply Coupons</label>
                                <p>Automatically apply best available coupons at checkout</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.auto_apply_coupons}
                                    onChange={() => handleToggle('auto_apply_coupons')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Accessibility */}
                <div className="preference-section">
                    <div className="section-header">
                        <h3>
                            <span className="section-icon">♿</span>
                            Accessibility
                        </h3>
                        <p className="section-description">Make the app more accessible</p>
                    </div>
                    <div className="preferences-grid">
                        <div className="preference-item">
                            <div className="preference-info">
                                <label>High Contrast</label>
                                <p>Increase contrast for better visibility</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.high_contrast}
                                    onChange={() => handleToggle('high_contrast')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Large Buttons</label>
                                <p>Increase button size for easier tapping</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.large_buttons}
                                    onChange={() => handleToggle('large_buttons')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <label>Screen Reader Optimized</label>
                                <p>Optimize interface for screen readers</p>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences.screen_reader_optimized}
                                    onChange={() => handleToggle('screen_reader_optimized')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPreferences;
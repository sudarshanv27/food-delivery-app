// src/components/profile/admin/AdminSettings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminSettings.css';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [backupConfig, setBackupConfig] = useState({
        include_database: true,
        include_uploads: true,
        include_logs: false,
        backup_format: 'zip'
    });
    const [settings, setSettings] = useState({
        general: {
            site_name: 'FoodieDash',
            site_logo: '',
            site_favicon: '',
            site_description: 'Online food delivery platform',
            contact_email: 'support@foodiedash.com',
            contact_phone: '+91 98765 43210',
            address: '123 Business Park, Mumbai',
            timezone: 'Asia/Kolkata',
            currency: 'INR',
            date_format: 'DD/MM/YYYY',
            time_format: '24h',
            language: 'en',
            meta_keywords: 'food delivery, online ordering, restaurants',
            meta_description: 'Best online food delivery platform'
        },
        payment: {
            razorpay_key_id: '',
            razorpay_key_secret: '',
            stripe_publishable_key: '',
            stripe_secret_key: '',
            paypal_client_id: '',
            paypal_secret: '',
            cod_enabled: true,
            online_payment_enabled: true,
            default_currency: 'INR',
            test_mode: true,
            payment_gateway: 'razorpay'
        },
        email: {
            smtp_host: 'smtp.gmail.com',
            smtp_port: '587',
            smtp_user: '',
            smtp_password: '',
            smtp_encryption: 'tls',
            from_email: 'noreply@foodiedash.com',
            from_name: 'FoodieDash',
            welcome_email_enabled: true,
            order_confirmation_enabled: true,
            delivery_update_enabled: true,
            password_reset_enabled: true,
            email_verification_required: true
        },
        commission: {
            default_commission_rate: 15,
            delivery_commission_rate: 10,
            minimum_payout: 500,
            payout_frequency: 'weekly',
            tax_rate: 18,
            service_fee: 10,
            platform_fee: 5,
            gst_enabled: true
        },
        features: {
            user_registration_enabled: true,
            restaurant_registration_enabled: true,
            delivery_partner_registration_enabled: true,
            guest_checkout_enabled: false,
            reviews_enabled: true,
            wishlist_enabled: true,
            referrals_enabled: true,
            live_tracking_enabled: true,
            social_login_enabled: false,
            multi_language_enabled: false
        },
        security: {
            two_factor_auth: false,
            session_timeout: 60,
            max_login_attempts: 5,
            password_expiry_days: 90,
            api_rate_limit: 100,
            maintenance_mode: false,
            force_https: true,
            allowed_ips: [],
            blocked_ips: []
        },
        notifications: {
            push_notifications: true,
            email_notifications: true,
            sms_notifications: false,
            order_alerts: true,
            promo_notifications: true,
            low_stock_alerts: true,
            new_restaurant_alerts: true,
            admin_alerts: true
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(response.data.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError('Failed to load settings. Using default values.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSaveSettings = async (section) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/settings/${section}`,
                settings[section],
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/settings/test-email',
                { email: settings.general.contact_email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Test email sent to ${settings.general.contact_email}`);
        } catch (error) {
            console.error('Error sending test email:', error);
            toast.error('Failed to send test email. Check SMTP settings.');
        }
    };

    const handleCreateBackup = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/admin/settings/backup', backupConfig, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_${new Date().toISOString()}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Backup created successfully');
            setShowBackupModal(false);
        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error('Failed to create backup');
        }
    };

    const handleClearCache = async () => {
        if (window.confirm('Are you sure you want to clear all system cache? This may temporarily slow down the system.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('/api/admin/settings/clear-cache', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Cache cleared successfully');
            } catch (error) {
                console.error('Error clearing cache:', error);
                toast.error('Failed to clear cache');
            }
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️', description: 'Basic site information' },
        { id: 'payment', label: 'Payment', icon: '💳', description: 'Payment gateways' },
        { id: 'email', label: 'Email', icon: '📧', description: 'SMTP configuration' },
        { id: 'commission', label: 'Commission', icon: '💰', description: 'Fees & taxes' },
        { id: 'features', label: 'Features', icon: '🎯', description: 'Platform features' },
        { id: 'security', label: 'Security', icon: '🔒', description: 'Security settings' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Alert settings' }
    ];

    if (loading) {
        return (
            <div className="settings-loading-container">
                <div className="loading-spinner"></div>
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="admin-settings">
            <div className="section-header">
                <div className="header-title">
                    <h2>⚙️ System Settings</h2>
                </div>
                <div className="header-actions">
                    <button className="backup-btn" onClick={() => setShowBackupModal(true)}>
                        💾 Backup System
                    </button>
                    <button className="cache-btn" onClick={handleClearCache}>
                        🗑️ Clear Cache
                    </button>
                </div>
            </div>

            {error && (
                <div className="settings-error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={fetchSettings} className="retry-btn">Retry</button>
                </div>
            )}

            <div className="settings-container">
                {/* Sidebar Tabs */}
                <div className="settings-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <div className="tab-content">
                                <span className="tab-label">{tab.label}</span>
                                <span className="tab-desc">{tab.description}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="settings-content">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>General Settings</h3>
                                <span className="section-badge">Basic Configuration</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('general'); }}>
                                <div className="form-group">
                                    <label>Site Name</label>
                                    <input
                                        type="text"
                                        value={settings.general.site_name}
                                        onChange={(e) => handleInputChange('general', 'site_name', e.target.value)}
                                        placeholder="Enter site name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Site Description</label>
                                    <textarea
                                        value={settings.general.site_description}
                                        onChange={(e) => handleInputChange('general', 'site_description', e.target.value)}
                                        rows="3"
                                        placeholder="Enter site description"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Contact Email</label>
                                        <input
                                            type="email"
                                            value={settings.general.contact_email}
                                            onChange={(e) => handleInputChange('general', 'contact_email', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={settings.general.contact_phone}
                                            onChange={(e) => handleInputChange('general', 'contact_phone', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={settings.general.address}
                                        onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                                        rows="2"
                                        placeholder="Enter business address"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Timezone</label>
                                        <select
                                            value={settings.general.timezone}
                                            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Currency</label>
                                        <select
                                            value={settings.general.currency}
                                            onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                                        >
                                            <option value="INR">Indian Rupee (₹)</option>
                                            <option value="USD">US Dollar ($)</option>
                                            <option value="EUR">Euro (€)</option>
                                            <option value="GBP">British Pound (£)</option>
                                            <option value="AED">UAE Dirham (د.إ)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date Format</label>
                                        <select
                                            value={settings.general.date_format}
                                            onChange={(e) => handleInputChange('general', 'date_format', e.target.value)}
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Time Format</label>
                                        <select
                                            value={settings.general.time_format}
                                            onChange={(e) => handleInputChange('general', 'time_format', e.target.value)}
                                        >
                                            <option value="12h">12 Hour (AM/PM)</option>
                                            <option value="24h">24 Hour</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Meta Keywords (SEO)</label>
                                    <input
                                        type="text"
                                        value={settings.general.meta_keywords}
                                        onChange={(e) => handleInputChange('general', 'meta_keywords', e.target.value)}
                                        placeholder="Enter comma-separated keywords"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Meta Description (SEO)</label>
                                    <textarea
                                        value={settings.general.meta_description}
                                        onChange={(e) => handleInputChange('general', 'meta_description', e.target.value)}
                                        rows="2"
                                        placeholder="Enter meta description"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '💾 Save General Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Payment Settings */}
                    {activeTab === 'payment' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>Payment Gateway Settings</h3>
                                <span className="section-badge warning">{settings.payment.test_mode ? 'Test Mode' : 'Live Mode'}</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('payment'); }}>
                                <div className="form-group">
                                    <label>Payment Gateway</label>
                                    <div className="gateway-selector">
                                        {['razorpay', 'stripe', 'paypal'].map(gateway => (
                                            <label key={gateway} className="gateway-option">
                                                <input
                                                    type="radio"
                                                    name="payment_gateway"
                                                    value={gateway}
                                                    checked={settings.payment.payment_gateway === gateway}
                                                    onChange={(e) => handleInputChange('payment', 'payment_gateway', e.target.value)}
                                                />
                                                <span className="gateway-label">
                                                    {gateway === 'razorpay' && '💳 Razorpay'}
                                                    {gateway === 'stripe' && '⚡ Stripe'}
                                                    {gateway === 'paypal' && '💰 PayPal'}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {settings.payment.payment_gateway === 'razorpay' && (
                                    <>
                                        <div className="form-group">
                                            <label>Razorpay Key ID</label>
                                            <input
                                                type="text"
                                                value={settings.payment.razorpay_key_id}
                                                onChange={(e) => handleInputChange('payment', 'razorpay_key_id', e.target.value)}
                                                placeholder="rzp_test_xxxxxx"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Razorpay Key Secret</label>
                                            <input
                                                type="password"
                                                value={settings.payment.razorpay_key_secret}
                                                onChange={(e) => handleInputChange('payment', 'razorpay_key_secret', e.target.value)}
                                                placeholder="••••••••••••••••"
                                            />
                                        </div>
                                    </>
                                )}

                                {settings.payment.payment_gateway === 'stripe' && (
                                    <>
                                        <div className="form-group">
                                            <label>Stripe Publishable Key</label>
                                            <input
                                                type="text"
                                                value={settings.payment.stripe_publishable_key}
                                                onChange={(e) => handleInputChange('payment', 'stripe_publishable_key', e.target.value)}
                                                placeholder="pk_test_xxxxxx"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Stripe Secret Key</label>
                                            <input
                                                type="password"
                                                value={settings.payment.stripe_secret_key}
                                                onChange={(e) => handleInputChange('payment', 'stripe_secret_key', e.target.value)}
                                                placeholder="sk_test_xxxxxx"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-row">
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.payment.online_payment_enabled}
                                                onChange={(e) => handleInputChange('payment', 'online_payment_enabled', e.target.checked)}
                                            />
                                            Enable Online Payments
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.payment.cod_enabled}
                                                onChange={(e) => handleInputChange('payment', 'cod_enabled', e.target.checked)}
                                            />
                                            Enable Cash on Delivery
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.payment.test_mode}
                                            onChange={(e) => handleInputChange('payment', 'test_mode', e.target.checked)}
                                        />
                                        Test Mode (Use test credentials)
                                    </label>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '💳 Save Payment Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Email Settings */}
                    {activeTab === 'email' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>Email Configuration</h3>
                                <span className="section-badge">SMTP Settings</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('email'); }}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>SMTP Host</label>
                                        <input
                                            type="text"
                                            value={settings.email.smtp_host}
                                            onChange={(e) => handleInputChange('email', 'smtp_host', e.target.value)}
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SMTP Port</label>
                                        <input
                                            type="text"
                                            value={settings.email.smtp_port}
                                            onChange={(e) => handleInputChange('email', 'smtp_port', e.target.value)}
                                            placeholder="587"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>SMTP Username</label>
                                        <input
                                            type="text"
                                            value={settings.email.smtp_user}
                                            onChange={(e) => handleInputChange('email', 'smtp_user', e.target.value)}
                                            placeholder="your-email@gmail.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>SMTP Password</label>
                                        <input
                                            type="password"
                                            value={settings.email.smtp_password}
                                            onChange={(e) => handleInputChange('email', 'smtp_password', e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>From Email</label>
                                        <input
                                            type="email"
                                            value={settings.email.from_email}
                                            onChange={(e) => handleInputChange('email', 'from_email', e.target.value)}
                                            placeholder="noreply@foodiedash.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>From Name</label>
                                        <input
                                            type="text"
                                            value={settings.email.from_name}
                                            onChange={(e) => handleInputChange('email', 'from_name', e.target.value)}
                                            placeholder="FoodieDash"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.email.welcome_email_enabled}
                                                onChange={(e) => handleInputChange('email', 'welcome_email_enabled', e.target.checked)}
                                            />
                                            Send Welcome Email
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.email.order_confirmation_enabled}
                                                onChange={(e) => handleInputChange('email', 'order_confirmation_enabled', e.target.checked)}
                                            />
                                            Send Order Confirmation
                                        </label>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.email.delivery_update_enabled}
                                                onChange={(e) => handleInputChange('email', 'delivery_update_enabled', e.target.checked)}
                                            />
                                            Send Delivery Updates
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.email.password_reset_enabled}
                                                onChange={(e) => handleInputChange('email', 'password_reset_enabled', e.target.checked)}
                                            />
                                            Enable Password Reset
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.email.email_verification_required}
                                            onChange={(e) => handleInputChange('email', 'email_verification_required', e.target.checked)}
                                        />
                                        Require Email Verification for New Users
                                    </label>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '📧 Save Email Settings'}
                                    </button>
                                    <button type="button" className="test-btn" onClick={handleTestEmail}>
                                        Send Test Email
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Commission Settings */}
                    {activeTab === 'commission' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>Commission & Fees</h3>
                                <span className="section-badge">Revenue Configuration</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('commission'); }}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Default Commission Rate (%)</label>
                                        <input
                                            type="number"
                                            value={settings.commission.default_commission_rate}
                                            onChange={(e) => handleInputChange('commission', 'default_commission_rate', parseFloat(e.target.value))}
                                            step="0.5"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Delivery Commission Rate (%)</label>
                                        <input
                                            type="number"
                                            value={settings.commission.delivery_commission_rate}
                                            onChange={(e) => handleInputChange('commission', 'delivery_commission_rate', parseFloat(e.target.value))}
                                            step="0.5"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Minimum Payout (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.commission.minimum_payout}
                                            onChange={(e) => handleInputChange('commission', 'minimum_payout', parseFloat(e.target.value))}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Payout Frequency</label>
                                        <select
                                            value={settings.commission.payout_frequency}
                                            onChange={(e) => handleInputChange('commission', 'payout_frequency', e.target.value)}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tax Rate (%)</label>
                                        <input
                                            type="number"
                                            value={settings.commission.tax_rate}
                                            onChange={(e) => handleInputChange('commission', 'tax_rate', parseFloat(e.target.value))}
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Service Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.commission.service_fee}
                                            onChange={(e) => handleInputChange('commission', 'service_fee', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Platform Fee (₹)</label>
                                        <input
                                            type="number"
                                            value={settings.commission.platform_fee}
                                            onChange={(e) => handleInputChange('commission', 'platform_fee', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.commission.gst_enabled}
                                                onChange={(e) => handleInputChange('commission', 'gst_enabled', e.target.checked)}
                                            />
                                            Enable GST
                                        </label>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '💰 Save Commission Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Features Settings */}
                    {activeTab === 'features' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>Platform Features</h3>
                                <span className="section-badge">Feature Toggles</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('features'); }}>
                                <div className="features-grid">
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.user_registration_enabled}
                                                onChange={(e) => handleInputChange('features', 'user_registration_enabled', e.target.checked)}
                                            />
                                            👤 User Registration
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.restaurant_registration_enabled}
                                                onChange={(e) => handleInputChange('features', 'restaurant_registration_enabled', e.target.checked)}
                                            />
                                            🏪 Restaurant Registration
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.delivery_partner_registration_enabled}
                                                onChange={(e) => handleInputChange('features', 'delivery_partner_registration_enabled', e.target.checked)}
                                            />
                                            🚚 Delivery Partner Registration
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.guest_checkout_enabled}
                                                onChange={(e) => handleInputChange('features', 'guest_checkout_enabled', e.target.checked)}
                                            />
                                            🛒 Guest Checkout
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.reviews_enabled}
                                                onChange={(e) => handleInputChange('features', 'reviews_enabled', e.target.checked)}
                                            />
                                            ⭐ Reviews & Ratings
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.wishlist_enabled}
                                                onChange={(e) => handleInputChange('features', 'wishlist_enabled', e.target.checked)}
                                            />
                                            ❤️ Wishlist Feature
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.referrals_enabled}
                                                onChange={(e) => handleInputChange('features', 'referrals_enabled', e.target.checked)}
                                            />
                                            🎁 Referral Program
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.live_tracking_enabled}
                                                onChange={(e) => handleInputChange('features', 'live_tracking_enabled', e.target.checked)}
                                            />
                                            📍 Live Order Tracking
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.social_login_enabled}
                                                onChange={(e) => handleInputChange('features', 'social_login_enabled', e.target.checked)}
                                            />
                                            🔐 Social Login (Google/Facebook)
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.features.multi_language_enabled}
                                                onChange={(e) => handleInputChange('features', 'multi_language_enabled', e.target.checked)}
                                            />
                                            🌐 Multi-language Support
                                        </label>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '🎯 Save Feature Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>Security Configuration</h3>
                                <span className="section-badge warning">Security Level: {settings.security.maintenance_mode ? 'Maintenance Mode' : 'Normal'}</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('security'); }}>
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.security.two_factor_auth}
                                            onChange={(e) => handleInputChange('security', 'two_factor_auth', e.target.checked)}
                                        />
                                        🔐 Enable Two-Factor Authentication for Admin
                                    </label>
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.security.maintenance_mode}
                                            onChange={(e) => handleInputChange('security', 'maintenance_mode', e.target.checked)}
                                        />
                                        🔧 Maintenance Mode (Site will be unavailable to users)
                                    </label>
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={settings.security.force_https}
                                            onChange={(e) => handleInputChange('security', 'force_https', e.target.checked)}
                                        />
                                        🔒 Force HTTPS (SSL Required)
                                    </label>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Session Timeout (minutes)</label>
                                        <input
                                            type="number"
                                            value={settings.security.session_timeout}
                                            onChange={(e) => handleInputChange('security', 'session_timeout', parseInt(e.target.value))}
                                            min="1"
                                            max="1440"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Max Login Attempts</label>
                                        <input
                                            type="number"
                                            value={settings.security.max_login_attempts}
                                            onChange={(e) => handleInputChange('security', 'max_login_attempts', parseInt(e.target.value))}
                                            min="3"
                                            max="20"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Password Expiry (days)</label>
                                        <input
                                            type="number"
                                            value={settings.security.password_expiry_days}
                                            onChange={(e) => handleInputChange('security', 'password_expiry_days', parseInt(e.target.value))}
                                            min="30"
                                            max="365"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>API Rate Limit (requests/minute)</label>
                                        <input
                                            type="number"
                                            value={settings.security.api_rate_limit}
                                            onChange={(e) => handleInputChange('security', 'api_rate_limit', parseInt(e.target.value))}
                                            min="10"
                                            max="1000"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '🔒 Save Security Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <div className="section-header-inline">
                                <h3>Notification Settings</h3>
                                <span className="section-badge">Alert Configuration</span>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings('notifications'); }}>
                                <div className="features-grid">
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.push_notifications}
                                                onChange={(e) => handleInputChange('notifications', 'push_notifications', e.target.checked)}
                                            />
                                            📱 Push Notifications
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.email_notifications}
                                                onChange={(e) => handleInputChange('notifications', 'email_notifications', e.target.checked)}
                                            />
                                            📧 Email Notifications
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.sms_notifications}
                                                onChange={(e) => handleInputChange('notifications', 'sms_notifications', e.target.checked)}
                                            />
                                            📱 SMS Notifications
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.order_alerts}
                                                onChange={(e) => handleInputChange('notifications', 'order_alerts', e.target.checked)}
                                            />
                                            🛒 Order Alerts
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.promo_notifications}
                                                onChange={(e) => handleInputChange('notifications', 'promo_notifications', e.target.checked)}
                                            />
                                            🎉 Promotional Notifications
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.low_stock_alerts}
                                                onChange={(e) => handleInputChange('notifications', 'low_stock_alerts', e.target.checked)}
                                            />
                                            📦 Low Stock Alerts
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.new_restaurant_alerts}
                                                onChange={(e) => handleInputChange('notifications', 'new_restaurant_alerts', e.target.checked)}
                                            />
                                            🏪 New Restaurant Alerts
                                        </label>
                                    </div>
                                    <div className="form-group checkbox">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.admin_alerts}
                                                onChange={(e) => handleInputChange('notifications', 'admin_alerts', e.target.checked)}
                                            />
                                            👑 Admin Alerts
                                        </label>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="save-settings-btn" disabled={saving}>
                                        {saving ? 'Saving...' : '🔔 Save Notification Settings'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Backup Modal */}
            {showBackupModal && (
                <div className="modal-overlay" onClick={() => setShowBackupModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>💾 Create System Backup</h3>
                            <button className="close-modal" onClick={() => setShowBackupModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Select what to include in the backup:</p>
                            <div className="backup-options">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={backupConfig.include_database}
                                        onChange={(e) => setBackupConfig(prev => ({ ...prev, include_database: e.target.checked }))}
                                    />
                                    Database
                                </label>
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={backupConfig.include_uploads}
                                        onChange={(e) => setBackupConfig(prev => ({ ...prev, include_uploads: e.target.checked }))}
                                    />
                                    Uploads (Images, Files)
                                </label>
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={backupConfig.include_logs}
                                        onChange={(e) => setBackupConfig(prev => ({ ...prev, include_logs: e.target.checked }))}
                                    />
                                    System Logs
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Backup Format</label>
                                <select
                                    value={backupConfig.backup_format}
                                    onChange={(e) => setBackupConfig(prev => ({ ...prev, backup_format: e.target.value }))}
                                >
                                    <option value="zip">ZIP Archive</option>
                                    <option value="tar">TAR Archive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowBackupModal(false)}>Cancel</button>
                            <button className="backup-confirm-btn" onClick={handleCreateBackup}>Create Backup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
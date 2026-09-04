import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import ThemeSwitcher from '../../components/common/ThemeSwitcher';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'FoodDelivery',
    siteEmail: 'admin@fooddelivery.com',
    sitePhone: '+1 234 567 890',
    siteAddress: '123 Main Street, New York, NY 10001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    
    // Commission Settings
    commissionRate: 15,
    deliveryFee: 40,
    minOrderAmount: 100,
    freeDeliveryThreshold: 500,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@fooddelivery.com',
    smtpPassword: '********',
    senderEmail: 'noreply@fooddelivery.com',
    senderName: 'FoodDelivery',
    
    // Payment Settings
    stripePublicKey: 'pk_test_xxxxxxxxxxxxx',
    stripeSecretKey: 'sk_test_xxxxxxxxxxxxx',
    razorpayKeyId: 'rzp_test_xxxxxxxx',
    razorpayKeySecret: 'xxxxxxxxxxxxxxx',
    cashOnDelivery: true,
    upiEnabled: true,
    cardEnabled: true,
    netbankingEnabled: true,
    
    // Notification Settings
    newOrderEmail: true,
    orderStatusEmail: true,
    newRestaurantEmail: true,
    weeklyReportEmail: true,
    smsNotifications: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordExpiry: 90
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Settings already set in state
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'commission', label: 'Commission & Fees', icon: '💰' },
    { id: 'email', label: 'Email Settings', icon: '📧' },
    { id: 'payment', label: 'Payment Gateway', icon: '💳' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' }
  ];

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure system settings and preferences</p>
      </div>

      {isSaved && (
        <div className="save-success">
          <span className="success-icon">✅</span>
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h3>General Settings</h3>
              
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Site Email</label>
                  <input
                    type="email"
                    name="siteEmail"
                    value={settings.siteEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Site Phone</label>
                  <input
                    type="tel"
                    name="sitePhone"
                    value={settings.sitePhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Site Address</label>
                <textarea
                  name="siteAddress"
                  value={settings.siteAddress}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Currency</label>
                  <select name="currency" value={settings.currency} onChange={handleChange}>
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select name="timezone" value={settings.timezone} onChange={handleChange}>
                    <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                    <option value="America/New_York">EST (UTC-5)</option>
                    <option value="Europe/London">GMT (UTC+0)</option>
                    <option value="Asia/Dubai">GST (UTC+4)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Commission & Fees Settings */}
          {activeTab === 'commission' && (
            <div className="settings-panel">
              <h3>Commission & Fees</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Commission Rate (%)</label>
                  <input
                    type="number"
                    name="commissionRate"
                    value={settings.commissionRate}
                    onChange={handleChange}
                    min="0"
                    max="50"
                  />
                  <small>Percentage charged per order</small>
                </div>
                <div className="form-group">
                  <label>Delivery Fee (₹)</label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={settings.deliveryFee}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={settings.minOrderAmount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Free Delivery Threshold (₹)</label>
                  <input
                    type="number"
                    name="freeDeliveryThreshold"
                    value={settings.freeDeliveryThreshold}
                    onChange={handleChange}
                    min="0"
                  />
                  <small>Orders above this amount get free delivery</small>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-panel">
              <h3>Email Configuration</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    name="smtpHost"
                    value={settings.smtpHost}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Port</label>
                  <input
                    type="text"
                    name="smtpPort"
                    value={settings.smtpPort}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SMTP Username</label>
                  <input
                    type="text"
                    name="smtpUser"
                    value={settings.smtpUser}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Password</label>
                  <input
                    type="password"
                    name="smtpPassword"
                    value={settings.smtpPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sender Email</label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={settings.senderEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Sender Name</label>
                  <input
                    type="text"
                    name="senderName"
                    value={settings.senderName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Gateway Settings */}
          {activeTab === 'payment' && (
            <div className="settings-panel">
              <h3>Payment Gateway Configuration</h3>
              
              <div className="form-group">
                <label>Stripe Public Key</label>
                <input
                  type="text"
                  name="stripePublicKey"
                  value={settings.stripePublicKey}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Stripe Secret Key</label>
                <input
                  type="password"
                  name="stripeSecretKey"
                  value={settings.stripeSecretKey}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Razorpay Key ID</label>
                  <input
                    type="text"
                    name="razorpayKeyId"
                    value={settings.razorpayKeyId}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Razorpay Key Secret</label>
                  <input
                    type="password"
                    name="razorpayKeySecret"
                    value={settings.razorpayKeySecret}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="payment-methods">
                <h4>Enabled Payment Methods</h4>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="cashOnDelivery"
                    checked={settings.cashOnDelivery}
                    onChange={handleChange}
                  />
                  Cash on Delivery
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="upiEnabled"
                    checked={settings.upiEnabled}
                    onChange={handleChange}
                  />
                  UPI (Google Pay, PhonePe, Paytm)
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="cardEnabled"
                    checked={settings.cardEnabled}
                    onChange={handleChange}
                  />
                  Credit/Debit Cards
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="netbankingEnabled"
                    checked={settings.netbankingEnabled}
                    onChange={handleChange}
                  />
                  Net Banking
                </label>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h3>Notification Settings</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="newOrderEmail"
                    checked={settings.newOrderEmail}
                    onChange={handleChange}
                  />
                  Send email on new order
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="orderStatusEmail"
                    checked={settings.orderStatusEmail}
                    onChange={handleChange}
                  />
                  Send email on order status update
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="newRestaurantEmail"
                    checked={settings.newRestaurantEmail}
                    onChange={handleChange}
                  />
                  Notify on new restaurant registration
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="weeklyReportEmail"
                    checked={settings.weeklyReportEmail}
                    onChange={handleChange}
                  />
                  Send weekly report
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={handleChange}
                  />
                  Enable SMS notifications
                </label>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-panel">
              <h3>Security Settings</h3>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onChange={handleChange}
                />
                Enable Two-Factor Authentication for Admin
              </label>

              <div className="form-row">
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    min="15"
                    max="480"
                  />
                </div>
                <div className="form-group">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    min="3"
                    max="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password Expiry (days)</label>
                <input
                  type="number"
                  name="passwordExpiry"
                  value={settings.passwordExpiry}
                  onChange={handleChange}
                  min="30"
                  max="365"
                />
                <small>Set to 0 for no expiry</small>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-panel">
              <h3>Appearance</h3>
              <p>Customize the look and feel of the admin panel</p>
              
              <div className="theme-section">
                <h4>Theme Mode</h4>
                <ThemeSwitcher variant="full" showLabels={true} />
              </div>
            </div>
          )}

          <div className="settings-actions">
            <Button variant="primary" onClick={handleSave} isLoading={isLoading}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
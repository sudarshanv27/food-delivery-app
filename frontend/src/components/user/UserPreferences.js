import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './UserPreferences.css';

const UserPreferences = () => {
    const [preferences, setPreferences] = useState({
        language: 'en',
        currency: 'INR',
        distanceUnit: 'km',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotionalEmails: false,
        newsletterSubscription: true,
        darkMode: false,
        autoPlayVideos: true,
        savePaymentInfo: true,
        defaultSortBy: 'rating',
        defaultCuisineFilter: [],
        priceRange: [0, 1000],
        dietaryPreferences: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [activeSection, setActiveSection] = useState('general');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        setIsLoading(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));
            // Mock data would be loaded here
        } catch (error) {
            console.error('Error fetching preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setIsSaved(false);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setPreferences({
            language: 'en',
            currency: 'INR',
            distanceUnit: 'km',
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            orderUpdates: true,
            promotionalEmails: false,
            newsletterSubscription: true,
            darkMode: false,
            autoPlayVideos: true,
            savePaymentInfo: true,
            defaultSortBy: 'rating',
            defaultCuisineFilter: [],
            priceRange: [0, 1000],
            dietaryPreferences: []
        });
        setIsSaved(false);
    };

    const sections = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        { id: 'food', label: 'Food Preferences', icon: '🍔' },
        { id: 'privacy', label: 'Privacy', icon: '🔒' }
    ];

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'हिन्दी (Hindi)' },
        { value: 'bn', label: 'বাংলা (Bengali)' },
        { value: 'te', label: 'తెలుగు (Telugu)' },
        { value: 'mr', label: 'मराठी (Marathi)' }
    ];

    const currencies = [
        { value: 'INR', label: 'Indian Rupee (₹)' },
        { value: 'USD', label: 'US Dollar ($)' },
        { value: 'EUR', label: 'Euro (€)' },
        { value: 'GBP', label: 'British Pound (£)' }
    ];

    const sortOptions = [
        { value: 'rating', label: 'Highest Rating' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'distance', label: 'Nearest First' },
        { value: 'delivery_time', label: 'Fastest Delivery' }
    ];

    const cuisines = [
        'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
        'Japanese', 'Thai', 'Mediterranean', 'American', 'Healthy'
    ];

    const dietaryOptions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Halal'
    ];

    return (
        <div className="user-preferences">
            <div className="preferences-header">
                <h2>Preferences</h2>
                <p>Customize your app experience</p>
            </div>

            {isSaved && (
                <div className="save-success">
                    <span className="success-icon">✅</span>
                    <span>Preferences saved successfully!</span>
                </div>
            )}

            <div className="preferences-container">
                <div className="preferences-sidebar">
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

                <div className="preferences-content">
                    {/* General Section */}
                    {activeSection === 'general' && (
                        <div className="preferences-section">
                            <h3>General Settings</h3>

                            <div className="setting-group">
                                <label>Language</label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => handleChange('language', e.target.value)}
                                >
                                    {languages.map(lang => (
                                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                                    ))}
                                </select>
                                <p className="setting-description">Choose your preferred language</p>
                            </div>

                            <div className="setting-group">
                                <label>Currency</label>
                                <select
                                    value={preferences.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                >
                                    {currencies.map(curr => (
                                        <option key={curr.value} value={curr.value}>{curr.label}</option>
                                    ))}
                                </select>
                                <p className="setting-description">Select your preferred currency</p>
                            </div>

                            <div className="setting-group">
                                <label>Distance Unit</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            value="km"
                                            checked={preferences.distanceUnit === 'km'}
                                            onChange={(e) => handleChange('distanceUnit', e.target.value)}
                                        />
                                        Kilometers (km)
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            value="miles"
                                            checked={preferences.distanceUnit === 'miles'}
                                            onChange={(e) => handleChange('distanceUnit', e.target.value)}
                                        />
                                        Miles (mi)
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <div className="preferences-section">
                            <h3>Notification Settings</h3>

                            <div className="setting-group toggle">
                                <div className="toggle-label">
                                    <span>Email Notifications</span>
                                    <p>Receive order updates and offers via email</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.emailNotifications}
                                        onChange={(e) => handleChange('emailNotifications', e.target.checked)}
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
                                        checked={preferences.pushNotifications}
                                        onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-group toggle">
                                <div className="toggle-label">
                                    <span>SMS Notifications</span>
                                    <p>Receive text message updates</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.smsNotifications}
                                        onChange={(e) => handleChange('smsNotifications', e.target.checked)}
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
                                        checked={preferences.orderUpdates}
                                        onChange={(e) => handleChange('orderUpdates', e.target.checked)}
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
                                        checked={preferences.promotionalEmails}
                                        onChange={(e) => handleChange('promotionalEmails', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-group toggle">
                                <div className="toggle-label">
                                    <span>Newsletter Subscription</span>
                                    <p>Get weekly updates and new restaurant alerts</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.newsletterSubscription}
                                        onChange={(e) => handleChange('newsletterSubscription', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <div className="preferences-section">
                            <h3>Appearance Settings</h3>

                            <div className="setting-group toggle">
                                <div className="toggle-label">
                                    <span>Dark Mode</span>
                                    <p>Switch between light and dark theme</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.darkMode}
                                        onChange={(e) => handleChange('darkMode', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-group toggle">
                                <div className="toggle-label">
                                    <span>Auto-play Videos</span>
                                    <p>Automatically play promotional videos</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.autoPlayVideos}
                                        onChange={(e) => handleChange('autoPlayVideos', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-group">
                                <label>Default Sort By</label>
                                <select
                                    value={preferences.defaultSortBy}
                                    onChange={(e) => handleChange('defaultSortBy', e.target.value)}
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Food Preferences Section */}
                    {activeSection === 'food' && (
                        <div className="preferences-section">
                            <h3>Food Preferences</h3>

                            <div className="setting-group">
                                <label>Preferred Cuisines</label>
                                <div className="checkbox-group">
                                    {cuisines.map(cuisine => (
                                        <label key={cuisine} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={cuisine}
                                                checked={preferences.defaultCuisineFilter.includes(cuisine)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const newValue = preferences.defaultCuisineFilter.includes(value)
                                                        ? preferences.defaultCuisineFilter.filter(c => c !== value)
                                                        : [...preferences.defaultCuisineFilter, value];
                                                    handleChange('defaultCuisineFilter', newValue);
                                                }}
                                            />
                                            <span>{cuisine}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Dietary Preferences</label>
                                <div className="checkbox-group">
                                    {dietaryOptions.map(option => (
                                        <label key={option} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={option}
                                                checked={preferences.dietaryPreferences.includes(option)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const newValue = preferences.dietaryPreferences.includes(value)
                                                        ? preferences.dietaryPreferences.filter(d => d !== value)
                                                        : [...preferences.dietaryPreferences, value];
                                                    handleChange('dietaryPreferences', newValue);
                                                }}
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <label>Price Range (per person)</label>
                                <div className="price-range">
                                    <span>₹{preferences.priceRange[0]}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        step="50"
                                        value={preferences.priceRange[1]}
                                        onChange={(e) => handleChange('priceRange', [preferences.priceRange[0], parseInt(e.target.value)])}
                                    />
                                    <span>₹{preferences.priceRange[1]}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Section */}
                    {activeSection === 'privacy' && (
                        <div className="preferences-section">
                            <h3>Privacy Settings</h3>

                            <div className="setting-group toggle">
                                <div className="toggle-label">
                                    <span>Save Payment Information</span>
                                    <p>Store your payment details for faster checkout</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.savePaymentInfo}
                                        onChange={(e) => handleChange('savePaymentInfo', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-group">
                                <button className="data-request-btn">
                                    Request My Data
                                </button>
                                <p className="setting-description">Download a copy of your personal data</p>
                            </div>

                            <div className="setting-group">
                                <button className="delete-account-btn">
                                    Delete Account
                                </button>
                                <p className="setting-description warning">
                                    Permanently delete your account and all associated data
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="preferences-actions">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            isLoading={isLoading}
                        >
                            Save Preferences
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={isLoading}
                        >
                            Reset to Default
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPreferences;
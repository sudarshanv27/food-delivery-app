// src/components/auth/Signup.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        agreeTerms: false,
        receiveUpdates: true
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [touchedFields, setTouchedFields] = useState({});

    const validatePassword = (password) => {
        return {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            specialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
    };

    const validateForm = () => {
        const newErrors = {};
        const passwordChecks = validatePassword(formData.password);

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        else if (formData.fullName.length < 2) newErrors.fullName = 'Name must be at least 2 characters';

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';

        if (!formData.phone) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (!passwordChecks.minLength) newErrors.password = 'Password must be at least 8 characters';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const userData = {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                receive_updates: formData.receiveUpdates
            };
            await signup(userData);
            navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Failed to create account' });
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && formData.fullName && formData.email && formData.phone) {
            setCurrentStep(2);
        } else if (currentStep === 1) {
            setErrors({ step1: 'Please fill in all required fields' });
        }
    };

    const prevStep = () => {
        setCurrentStep(1);
        setErrors({});
    };

    const passwordStrength = () => {
        const checks = validatePassword(formData.password);
        const met = Object.values(checks).filter(Boolean).length;
        if (!formData.password) return { label: 'No Password', color: '#e0e0e0', width: 0 };
        if (met <= 2) return { label: 'Weak', color: '#f44336', width: 25 };
        if (met <= 3) return { label: 'Fair', color: '#ff9800', width: 50 };
        if (met <= 4) return { label: 'Good', color: '#2196f3', width: 75 };
        return { label: 'Strong', color: '#4caf50', width: 100 };
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                {/* Left Panel - Brand Section */}
                <div className="signup-left">
                    <div className="signup-brand">
                        <div className="brand-icon">🍕</div>
                        <h1>FoodDelivery</h1>
                        <p>Join Us Today!</p>
                        <span className="brand-tagline">Create an account to start ordering</span>
                    </div>
                    <div className="signup-stats">
                        <div className="stat-item">
                            <span className="stat-icon">🚚</span>
                            <div>
                                <h4>Fast Delivery</h4>
                                <p>30 min or less</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">🏪</span>
                            <div>
                                <h4>500+ Restaurants</h4>
                                <p>Top rated options</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">🎉</span>
                            <div>
                                <h4>Best Offers</h4>
                                <p>Exclusive Discounts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Section */}
                <div className="signup-right">
                    <div className="signup-card">
                        <div className="signup-header">
                            <h2>Create Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="signup-form">
                            {currentStep === 1 ? (
                                <>
                                    <div className="form-group">
                                        <label>Full Name <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">👤</span>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('fullName')}
                                                placeholder="Enter your full name"
                                                className={errors.fullName ? 'error' : ''}
                                            />
                                            {formData.fullName && !errors.fullName && <span className="input-validation">✓</span>}
                                        </div>
                                        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Email Address <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">📧</span>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('email')}
                                                placeholder="Enter your email"
                                                className={errors.email ? 'error' : ''}
                                            />
                                            {formData.email && !errors.email && <span className="input-validation">✓</span>}
                                        </div>
                                        {errors.email && <span className="error-message">{errors.email}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">📞</span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('phone')}
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                                className={errors.phone ? 'error' : ''}
                                            />
                                            {formData.phone && !errors.phone && <span className="input-validation">✓</span>}
                                        </div>
                                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                                    </div>

                                    {errors.step1 && <div className="submit-error">{errors.step1}</div>}

                                    <Button type="button" variant="primary" fullWidth onClick={nextStep} className="next-btn">
                                        Continue →
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Password <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🔒</span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('password')}
                                                placeholder="Create a strong password"
                                                className={errors.password ? 'error' : ''}
                                            />
                                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {errors.password && <span className="error-message">{errors.password}</span>}

                                        {formData.password && (
                                            <div className="password-strength">
                                                <div className="strength-bar">
                                                    <div className="strength-fill" style={{ width: `${passwordStrength().width}%`, backgroundColor: passwordStrength().color }} />
                                                </div>
                                                <span className="strength-label" style={{ color: passwordStrength().color }}>
                                                    {passwordStrength().label} Password
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm Password <span className="required">*</span></label>
                                        <div className="input-wrapper">
                                            <span className="input-icon">🔒</span>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('confirmPassword')}
                                                placeholder="Confirm your password"
                                                className={errors.confirmPassword ? 'error' : ''}
                                            />
                                            <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                        {formData.confirmPassword && formData.password && (
                                            <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'mismatch'}`}>
                                                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>I want to</label>
                                        <div className="role-selection">
                                            <label className={`role-option ${formData.role === 'user' ? 'selected' : ''}`}>
                                                <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} />
                                                <div className="role-card">
                                                    <span className="role-icon">🍔</span>
                                                    <h4>Order Food</h4>
                                                    <p>As a customer</p>
                                                </div>
                                            </label>
                                            <label className={`role-option ${formData.role === 'restaurant_owner' ? 'selected' : ''}`}>
                                                <input type="radio" name="role" value="restaurant_owner" checked={formData.role === 'restaurant_owner'} onChange={handleChange} />
                                                <div className="role-card">
                                                    <span className="role-icon">🏪</span>
                                                    <h4>Own Restaurant</h4>
                                                    <p>As a partner</p>
                                                </div>
                                            </label>
                                            <label className={`role-option ${formData.role === 'delivery_partner' ? 'selected' : ''}`}>
                                                <input type="radio" name="role" value="delivery_partner" checked={formData.role === 'delivery_partner'} onChange={handleChange} />
                                                <div className="role-card">
                                                    <span className="role-icon">🚚</span>
                                                    <h4>Deliver Food</h4>
                                                    <p>As a delivery partner</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input type="checkbox" name="receiveUpdates" checked={formData.receiveUpdates} onChange={handleChange} />
                                            <span>📧 Send me updates about new restaurants and offers</span>
                                        </label>
                                    </div>

                                    <div className="form-group">
                                        <label className={`checkbox-label ${errors.agreeTerms ? 'error' : ''}`}>
                                            <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
                                            <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link> <span className="required">*</span></span>
                                        </label>
                                        {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                                    </div>

                                    {errors.submit && <div className="submit-error">{errors.submit}</div>}

                                    <div className="form-actions">
                                        <Button type="button" variant="outline" onClick={prevStep} className="back-btn">
                                            ← Back
                                        </Button>
                                        <Button type="submit" variant="primary" isLoading={isLoading} className="signup-btn">
                                            {isLoading ? 'Creating Account...' : 'Create Account'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </form>

                        <div className="divider">
                            <span>Or sign up with</span>
                        </div>

                        <div className="social-signup">
                            <button type="button" className="social-btn google">
                                <svg className="social-icon" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button type="button" className="social-btn facebook">
                                <svg className="social-icon" viewBox="0 0 24 24">
                                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.54-4.68 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" fill="#1877F2" />
                                </svg>
                                Facebook
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>Already have an account? <Link to="/login" className="login-link">Sign in</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
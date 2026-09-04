import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase and number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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
                role: formData.role
            };
            const result = await signup(userData);
            if (result.success) {
                // Navigation will happen in useEffect after isAuthenticated becomes true
            }
        } catch (error) {
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const percentage = Math.min((strength / 6) * 100, 100);

        let label = 'Weak';
        let color = '#f44336';
        if (percentage >= 50) {
            label = 'Medium';
            color = '#ff9800';
        }
        if (percentage >= 75) {
            label = 'Strong';
            color = '#4caf50';
        }
        if (percentage >= 90) {
            label = 'Very Strong';
            color = '#2196f3';
        }

        return { percentage, label, color };
    };

    const passwordStrength = calculatePasswordStrength(formData.password);

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-left">
                    <div className="signup-brand">
                        <span className="brand-icon">🍔</span>
                        <span className="brand-name">FoodDelivery</span>
                    </div>
                    <div className="signup-features">
                        <h2>Join Us Today!</h2>
                        <p>Create an account to start ordering</p>
                        <div className="feature-list">
                            <div className="feature">
                                <span className="feature-icon">🚚</span>
                                <span>Fast Delivery</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🍽️</span>
                                <span>500+ Restaurants</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">💰</span>
                                <span>Best Offers</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">⭐</span>
                                <span>Exclusive Discounts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="signup-right">
                    <div className="signup-form-wrapper">
                        <div className="form-header">
                            <h2>Create Account</h2>
                            <p>Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="signup-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className={errors.fullName ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📧</span>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className={errors.email ? 'error' : ''}
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📞</span>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        className={errors.phone ? 'error' : ''}
                                    />
                                </div>
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">Password *</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create a password"
                                            className={errors.password ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {errors.password && <span className="error-message">{errors.password}</span>}

                                    {formData.password && (
                                        <div className="password-strength">
                                            <div className="strength-bar">
                                                <div
                                                    className="strength-bar-fill"
                                                    style={{
                                                        width: `${passwordStrength.percentage}%`,
                                                        background: passwordStrength.color
                                                    }}
                                                />
                                            </div>
                                            <span className="strength-text" style={{ color: passwordStrength.color }}>
                                                Password Strength: {passwordStrength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password *</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            className={errors.confirmPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>I want to</label>
                                <div className="role-selection">
                                    <label className="role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="user"
                                            checked={formData.role === 'user'}
                                            onChange={handleChange}
                                        />
                                        <div className="role-card">
                                            <span className="role-icon">🍔</span>
                                            <h4>Order Food</h4>
                                            <p>As a customer</p>
                                        </div>
                                    </label>

                                    <label className="role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="restaurant_owner"
                                            checked={formData.role === 'restaurant_owner'}
                                            onChange={handleChange}
                                        />
                                        <div className="role-card">
                                            <span className="role-icon">🏪</span>
                                            <h4>Own Restaurant</h4>
                                            <p>As a partner</p>
                                        </div>
                                    </label>

                                    <label className="role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="delivery_partner"
                                            checked={formData.role === 'delivery_partner'}
                                            onChange={handleChange}
                                        />
                                        <div className="role-card">
                                            <span className="role-icon">🚚</span>
                                            <h4>Deliver Food</h4>
                                            <p>As a delivery partner</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                                        <Link to="/privacy">Privacy Policy</Link>
                                    </span>
                                </label>
                                {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                fullWidth
                                isLoading={isLoading}
                                className="signup-btn"
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="divider">
                            <span>Or sign up with</span>
                        </div>

                        <div className="social-signup">
                            <button type="button" className="social-btn google">
                                <span className="social-icon">G</span>
                                Google
                            </button>
                            <button type="button" className="social-btn facebook">
                                <span className="social-icon">f</span>
                                Facebook
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>
                                Already have an account?{' '}
                                <Link to="/login" className="login-link">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
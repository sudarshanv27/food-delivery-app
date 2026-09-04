import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const result = await login(formData.email, formData.password);
            if (result.success) {
                // Navigation will happen in useEffect after isAuthenticated becomes true
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        // Implement social login logic
        console.log(`Login with ${provider}`);
    };

    const handleDemoLogin = () => {
        setFormData({
            email: 'demo@fooddelivery.com',
            password: 'demo123',
            rememberMe: false
        });
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="login-brand">
                        <span className="brand-icon">🍔</span>
                        <span className="brand-name">FoodDelivery</span>
                    </div>
                    <div className="login-features">
                        <h2>Welcome Back!</h2>
                        <p>Sign in to continue your food journey</p>
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
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-form-wrapper">
                        <div className="form-header">
                            <h2>Login</h2>
                            <p>Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
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

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
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
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot Password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="large"
                                fullWidth
                                isLoading={isLoading}
                                className="login-btn"
                            >
                                Login
                            </Button>
                        </form>

                        <div className="demo-login">
                            <button type="button" className="demo-btn" onClick={handleDemoLogin}>
                                Try Demo Account
                            </button>
                        </div>

                        <div className="divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-login">
                            <button
                                type="button"
                                className="social-btn google"
                                onClick={() => handleSocialLogin('google')}
                            >
                                <span className="social-icon">G</span>
                                Google
                            </button>
                            <button
                                type="button"
                                className="social-btn facebook"
                                onClick={() => handleSocialLogin('facebook')}
                            >
                                <span className="social-icon">f</span>
                                Facebook
                            </button>
                        </div>

                        <div className="form-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/signup" className="signup-link">
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
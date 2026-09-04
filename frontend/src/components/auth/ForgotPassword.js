// src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleLogin, facebookLogin } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(null);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorId, setTwoFactorId] = useState(null);

    const from = location.state?.from?.pathname || '/';

    // Load remembered email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
        }
    }, []);

    // Check lockout status
    useEffect(() => {
        const savedLockout = localStorage.getItem('loginLockout');
        if (savedLockout) {
            const lockoutEnd = parseInt(savedLockout);
            if (Date.now() < lockoutEnd) {
                setIsLocked(true);
                setLockoutTime(lockoutEnd);
            } else {
                localStorage.removeItem('loginLockout');
                setLoginAttempts(0);
                setIsLocked(false);
            }
        }
    }, []);

    // Update lockout timer
    useEffect(() => {
        if (isLocked && lockoutTime) {
            const timer = setInterval(() => {
                if (Date.now() >= lockoutTime) {
                    setIsLocked(false);
                    setLoginAttempts(0);
                    localStorage.removeItem('loginLockout');
                    setShowCaptcha(false);
                    clearInterval(timer);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isLocked, lockoutTime]);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(result);
        setCaptchaInput('');
    };

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

        if (showCaptcha) {
            if (!captchaInput) {
                newErrors.captcha = 'Please enter the security code';
            } else if (captchaInput.toUpperCase() !== captcha.toUpperCase()) {
                newErrors.captcha = 'Invalid security code';
                generateCaptcha();
            }
        }

        if (showTwoFactor && !twoFactorCode) {
            newErrors.twoFactor = 'Please enter the verification code';
        } else if (showTwoFactor && !/^\d{6}$/.test(twoFactorCode)) {
            newErrors.twoFactor = 'Please enter a valid 6-digit code';
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFailedLogin = () => {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 3 && !showCaptcha) {
            setShowCaptcha(true);
            generateCaptcha();
        }

        if (newAttempts >= 5) {
            const lockoutDuration = 15 * 60 * 1000;
            const lockoutEnd = Date.now() + lockoutDuration;
            localStorage.setItem('loginLockout', lockoutEnd.toString());
            setIsLocked(true);
            setLockoutTime(lockoutEnd);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLocked) return;
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            let result;

            if (showTwoFactor) {
                result = await login.verifyTwoFactor?.(twoFactorId, twoFactorCode);
            } else {
                result = await login(formData.email, formData.password);
            }

            if (result?.requiresTwoFactor) {
                setShowTwoFactor(true);
                setTwoFactorId(result.twoFactorId);
                setIsLoading(false);
                return;
            }

            if (result?.success || result?.user) {
                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                setLoginAttempts(0);
                localStorage.removeItem('loginLockout');
                navigate(from, { replace: true });
            } else {
                handleFailedLogin();
                setErrors({ submit: result?.message || 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Login error:', error);
            handleFailedLogin();
            setErrors({ submit: error.response?.data?.message || 'Login failed. Please try again.' });
        } finally {
            if (!showTwoFactor) {
                setIsLoading(false);
            }
        }
    };

    const handleSocialLogin = async (provider) => {
        if (isLocked) return;

        setSocialLoading(provider);
        try {
            if (provider === 'google') {
                await googleLogin();
            } else if (provider === 'facebook') {
                await facebookLogin();
            }
            navigate(from, { replace: true });
        } catch (error) {
            console.error(`${provider} login error:`, error);
            setErrors({ submit: `Failed to login with ${provider}` });
        } finally {
            setSocialLoading(null);
        }
    };

    const handleDemoLogin = () => {
        setFormData({
            email: 'demo@foodapp.com',
            password: 'demo123',
            rememberMe: false
        });
    };

    const getRemainingLockoutTime = () => {
        if (!lockoutTime) return null;
        const remaining = Math.ceil((lockoutTime - Date.now()) / 60000);
        return remaining > 0 ? `${remaining} minute${remaining > 1 ? 's' : ''}` : null;
    };

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-brand">
                    <div className="brand-icon">🍕</div>
                    <h1>FoodDelivery</h1>
                    <p>Delicious food delivered to your doorstep</p>
                </div>
                <div className="login-features">
                    <div className="feature">
                        <span className="feature-icon">🚚</span>
                        <div>
                            <h4>Fast Delivery</h4>
                            <p>Get your food within 30 minutes</p>
                        </div>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">⭐</span>
                        <div>
                            <h4>Top Restaurants</h4>
                            <p>Best rated restaurants in town</p>
                        </div>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">💰</span>
                        <div>
                            <h4>Best Prices</h4>
                            <p>Exclusive deals and offers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <div className="login-header">
                        <h2>{showTwoFactor ? 'Two-Factor Authentication' : 'Login'}</h2>
                        <p>
                            {showTwoFactor
                                ? 'Enter the verification code from your authenticator app'
                                : 'Enter your credentials to access your account'
                            }
                        </p>
                    </div>

                    {isLocked && (
                        <div className="security-banner error">
                            <span className="banner-icon">⚠️</span>
                            <span>Too many failed attempts. Please try again in {getRemainingLockoutTime()}.</span>
                        </div>
                    )}

                    {showCaptcha && !showTwoFactor && !isLocked && (
                        <div className="security-banner warning">
                            <span className="banner-icon">🔒</span>
                            <span>For security, please verify you are human.</span>
                        </div>
                    )}

                    {!showTwoFactor ? (
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📧</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@foodapp.com"
                                        className={errors.email ? 'error' : ''}
                                        autoComplete="email"
                                        disabled={isLocked}
                                    />
                                </div>
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="password"
                                        className={errors.password ? 'error' : ''}
                                        autoComplete="current-password"
                                        disabled={isLocked}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            {showCaptcha && (
                                <div className="form-group">
                                    <label>Security Verification</label>
                                    <div className="captcha-container">
                                        <div className="captcha-code" onClick={generateCaptcha}>
                                            <span className="captcha-text">{captcha}</span>
                                            <button type="button" className="captcha-refresh">🔄</button>
                                        </div>
                                        <input
                                            type="text"
                                            value={captchaInput}
                                            onChange={(e) => setCaptchaInput(e.target.value)}
                                            placeholder="Enter code above"
                                            className={errors.captcha ? 'error' : ''}
                                            disabled={isLocked}
                                        />
                                    </div>
                                    {errors.captcha && <span className="error-message">{errors.captcha}</span>}
                                </div>
                            )}

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        disabled={isLocked}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot Password?
                                </Link>
                            </div>

                            {errors.submit && (
                                <div className="submit-error">
                                    <span className="error-icon">⚠️</span>
                                    <span>{errors.submit}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                isLoading={isLoading}
                                disabled={isLocked}
                                className="login-btn"
                            >
                                Login
                            </Button>

                            <button
                                type="button"
                                className="demo-btn"
                                onClick={handleDemoLogin}
                                disabled={isLocked}
                            >
                                Try Demo Account
                            </button>

                            <div className="divider">
                                <span>Or continue with</span>
                            </div>

                            <div className="social-buttons">
                                <button
                                    type="button"
                                    className="social-btn google"
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={socialLoading === 'google' || isLocked}
                                >
                                    {socialLoading === 'google' ? (
                                        <span className="social-spinner"></span>
                                    ) : (
                                        <>
                                            <svg className="social-icon" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span>Google</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="social-btn facebook"
                                    onClick={() => handleSocialLogin('facebook')}
                                    disabled={socialLoading === 'facebook' || isLocked}
                                >
                                    {socialLoading === 'facebook' ? (
                                        <span className="social-spinner"></span>
                                    ) : (
                                        <>
                                            <svg className="social-icon" viewBox="0 0 24 24">
                                                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.54-4.68 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" fill="#1877F2" />
                                            </svg>
                                            <span>Facebook</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="signup-prompt">
                                Don't have an account?{' '}
                                <Link to="/register" className="signup-link">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="two-factor-form">
                            <div className="two-factor-icon">🔐</div>
                            <div className="form-group">
                                <label>Verification Code</label>
                                <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    className={errors.twoFactor ? 'error' : ''}
                                    autoFocus
                                />
                                {errors.twoFactor && <span className="error-message">{errors.twoFactor}</span>}
                            </div>
                            {errors.submit && (
                                <div className="submit-error">
                                    <span className="error-icon">⚠️</span>
                                    <span>{errors.submit}</span>
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="primary"
                                fullWidth
                                isLoading={isLoading}
                                onClick={handleSubmit}
                                className="verify-btn"
                            >
                                Verify
                            </Button>
                            <button
                                type="button"
                                className="back-to-login"
                                onClick={() => {
                                    setShowTwoFactor(false);
                                    setTwoFactorCode('');
                                    setErrors({});
                                }}
                            >
                                ← Back to login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
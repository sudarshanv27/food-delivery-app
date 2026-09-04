import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import './LoginForm.css';

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(null);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [securityMessage, setSecurityMessage] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorId, setTwoFactorId] = useState(null);
    const [rememberedEmail, setRememberedEmail] = useState('');

    const from = location.state?.from?.pathname || '/';

    // Load remembered email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
            setRememberedEmail(savedEmail);
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
                const remainingMinutes = Math.ceil((lockoutEnd - Date.now()) / 60000);
                setSecurityMessage(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`);
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
                    setSecurityMessage('');
                    clearInterval(timer);
                } else {
                    const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 60000);
                    setSecurityMessage(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isLocked, lockoutTime]);

    // Password strength checker
    const checkPasswordStrength = (password) => {
        if (!password) return null;

        let strength = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        strength = Object.values(checks).filter(Boolean).length;

        const strengthMap = {
            0: { label: 'Very Weak', color: '#f44336', score: 0 },
            1: { label: 'Weak', color: '#ff9800', score: 20 },
            2: { label: 'Fair', color: '#ffc107', score: 40 },
            3: { label: 'Good', color: '#2196f3', score: 60 },
            4: { label: 'Strong', color: '#4caf50', score: 80 },
            5: { label: 'Very Strong', color: '#4caf50', score: 100 }
        };

        return strengthMap[strength];
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setFormData(prev => ({ ...prev, password }));
        setPasswordStrength(checkPasswordStrength(password));
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

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
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (showCaptcha) {
            if (!captchaInput) {
                newErrors.captcha = 'Please enter the security code';
            } else if (captchaInput.toUpperCase() !== captcha.toUpperCase()) {
                newErrors.captcha = 'Invalid security code. Please try again.';
                generateCaptcha();
            }
        }

        if (showTwoFactor && !twoFactorCode) {
            newErrors.twoFactor = 'Please enter the 2FA code';
        } else if (showTwoFactor && !/^\d{6}$/.test(twoFactorCode)) {
            newErrors.twoFactor = 'Please enter a valid 6-digit code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLocked) {
            return;
        }

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            let result;

            if (showTwoFactor) {
                // Verify 2FA code
                result = await login.verifyTwoFactor(twoFactorId, twoFactorCode);
            } else {
                // Normal login
                result = await login(formData.email, formData.password);
            }

            if (result.success) {
                // Check if 2FA is required
                if (result.requiresTwoFactor) {
                    setShowTwoFactor(true);
                    setTwoFactorId(result.twoFactorId);
                    setIsLoading(false);
                    return;
                }

                // Save remember me preference
                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Reset login attempts on success
                setLoginAttempts(0);
                localStorage.removeItem('loginLockout');

                // Redirect to intended page
                navigate(from, { replace: true });
            } else {
                // Handle failed login
                handleFailedLogin();
                setErrors({ submit: result.message || 'Invalid email or password' });
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

    const handleFailedLogin = () => {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // Show captcha after 3 failed attempts
        if (newAttempts >= 3 && !showCaptcha) {
            setShowCaptcha(true);
            generateCaptcha();
            setSecurityMessage('For security, please verify you are human.');
        }

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
            const lockoutDuration = 15 * 60 * 1000; // 15 minutes
            const lockoutEnd = Date.now() + lockoutDuration;
            localStorage.setItem('loginLockout', lockoutEnd.toString());
            setIsLocked(true);
            setLockoutTime(lockoutEnd);
            setSecurityMessage(`Too many failed attempts. Please try again in 15 minutes.`);
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            setIsLoading(true);
            const result = await login.socialLogin(provider);
            if (result.success) {
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error(`${provider} login error:`, error);
            setErrors({ submit: `Failed to login with ${provider}. Please try again.` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            await login.resendVerification(formData.email);
            setSecurityMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            setErrors({ submit: 'Failed to resend verification email.' });
        }
    };

    const handleClearLockout = () => {
        localStorage.removeItem('loginLockout');
        setLoginAttempts(0);
        setIsLocked(false);
        setLockoutTime(null);
        setSecurityMessage('');
        setShowCaptcha(false);
    };

    return (
        <div className="login-form-container">
            <div className="login-form-wrapper">
                {/* Security Banner */}
                {securityMessage && (
                    <div className={`security-banner ${isLocked ? 'error' : 'warning'}`}>
                        <span className="banner-icon">{isLocked ? '⚠️' : '🔒'}</span>
                        <span>{securityMessage}</span>
                        {isLocked && (
                            <button onClick={handleClearLockout} className="clear-lockout">
                                Clear
                            </button>
                        )}
                    </div>
                )}

                <div className="form-header">
                    <div className="logo-container">
                        <div className="logo-icon">🍔</div>
                    </div>
                    <h2>Welcome Back!</h2>
                    <p>Sign in to continue to your dashboard</p>
                </div>

                {!showTwoFactor ? (
                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="email">
                                Email Address
                                <span className="required-star">*</span>
                            </label>
                            <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={errors.email ? 'error' : ''}
                                    disabled={isLoading || isLocked}
                                    autoComplete="email"
                                    autoFocus
                                />
                                {formData.email && !errors.email && (
                                    <span className="input-validation valid">✓</span>
                                )}
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                                <span className="required-star">*</span>
                            </label>
                            <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your password"
                                    className={errors.password ? 'error' : ''}
                                    disabled={isLoading || isLocked}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading || isLocked}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}

                            {/* Password Strength Indicator */}
                            {passwordStrength && formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div
                                            className="strength-fill"
                                            style={{
                                                width: `${passwordStrength.score}%`,
                                                backgroundColor: passwordStrength.color
                                            }}
                                        />
                                    </div>
                                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* CAPTCHA Section */}
                        {showCaptcha && (
                            <div className="form-group captcha-group">
                                <label>Security Verification</label>
                                <div className="captcha-container">
                                    <div className="captcha-code" onClick={generateCaptcha}>
                                        <span className="captcha-text">{captcha}</span>
                                        <button type="button" className="captcha-refresh">🔄</button>
                                    </div>
                                    <div className="captcha-input-wrapper">
                                        <input
                                            type="text"
                                            value={captchaInput}
                                            onChange={(e) => setCaptchaInput(e.target.value)}
                                            placeholder="Enter code above"
                                            className={errors.captcha ? 'error' : ''}
                                            disabled={isLoading || isLocked}
                                        />
                                    </div>
                                </div>
                                {errors.captcha && <span className="error-message">{errors.captcha}</span>}
                            </div>
                        )}

                        {/* Remember Me & Forgot Password */}
                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    disabled={isLoading || isLocked}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="submit-error">
                                <span className="error-icon">⚠️</span>
                                <span>{errors.submit}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLocked}
                            className="login-btn"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>

                        {/* Resend Verification Link */}
                        {errors.submit && errors.submit.includes('verify') && (
                            <div className="resend-verification">
                                <button type="button" onClick={handleResendVerification}>
                                    Resend verification email
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    // Two-Factor Authentication Form
                    <div className="two-factor-form">
                        <div className="two-factor-header">
                            <div className="two-factor-icon">🔐</div>
                            <h3>Two-Factor Authentication</h3>
                            <p>Please enter the verification code from your authenticator app</p>
                        </div>

                        <div className="form-group">
                            <label>Verification Code</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    className={errors.twoFactor ? 'error' : ''}
                                    autoFocus
                                />
                            </div>
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
                            size="large"
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
                            onClick={() => setShowTwoFactor(false)}
                        >
                            ← Back to login
                        </button>
                    </div>
                )}

                {/* Divider */}
                {!showTwoFactor && (
                    <>
                        <div className="divider">
                            <span>Or continue with</span>
                        </div>

                        {/* Social Login */}
                        <div className="social-login">
                            <button
                                type="button"
                                className="social-btn google"
                                onClick={() => handleSocialLogin('google')}
                                disabled={isLoading || isLocked}
                            >
                                <svg className="social-icon" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                className="social-btn facebook"
                                onClick={() => handleSocialLogin('facebook')}
                                disabled={isLoading || isLocked}
                            >
                                <svg className="social-icon" viewBox="0 0 24 24">
                                    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.54-4.68 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.95.92-1.95 1.87v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" fill="#1877F2" />
                                </svg>
                                Facebook
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="form-footer">
                            <p>
                                Don't have an account?{' '}
                                <Link to="/signup" className="signup-link">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginForm;
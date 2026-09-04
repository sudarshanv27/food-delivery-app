import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import './ResetPassword.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const [tokenChecking, setTokenChecking] = useState(true);
    const [showPasswordTips, setShowPasswordTips] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [passwordHistory, setPasswordHistory] = useState([]);

    useEffect(() => {
        // Extract token from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const tokenParam = queryParams.get('token');

        if (tokenParam) {
            setToken(tokenParam);
            validateToken(tokenParam);
        } else {
            setTokenValid(false);
            setTokenChecking(false);
        }
    }, [location]);

    const validateToken = async (tokenParam) => {
        try {
            // API call to validate token
            // const response = await api.get(`/auth/validate-reset-token?token=${tokenParam}`);

            // Simulate token validation
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if token is expired (simulated)
            const isValid = true; // Replace with actual validation
            const isExpired = false; // Replace with actual check

            if (!isValid || isExpired) {
                setTokenValid(false);
            }
        } catch (error) {
            console.error('Token validation error:', error);
            setTokenValid(false);
        } finally {
            setTokenChecking(false);
        }
    };

    const validatePassword = (password) => {
        const checks = {
            minLength: password.length >= 8,
            maxLength: password.length <= 128,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            specialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            noCommonPatterns: !/(password|123456|qwerty|abc123)/i.test(password),
            noRepeating: !/(.)\1{3,}/.test(password) // No 4+ repeating chars
        };

        return checks;
    };

    const checkPasswordHistory = async (password) => {
        try {
            // API call to check if password was used before
            // const response = await api.post('/auth/check-password-history', { token, password });
            // return !response.data.isReused;
            return true; // Simulated
        } catch (error) {
            console.error('Password history check error:', error);
            return true;
        }
    };

    const validateForm = async () => {
        const newErrors = {};
        const passwordChecks = validatePassword(formData.password);

        // Password validations
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!passwordChecks.minLength) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!passwordChecks.uppercase) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!passwordChecks.lowercase) {
            newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!passwordChecks.numbers) {
            newErrors.password = 'Password must contain at least one number';
        } else if (!passwordChecks.specialChars) {
            newErrors.password = 'Password must contain at least one special character';
        } else if (!passwordChecks.noCommonPatterns) {
            newErrors.password = 'Password contains common patterns. Please choose a stronger password';
        } else if (!passwordChecks.noRepeating) {
            newErrors.password = 'Password contains too many repeating characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Check password history if no other errors
        if (Object.keys(newErrors).length === 0 && formData.password) {
            const isNotReused = await checkPasswordHistory(formData.password);
            if (!isNotReused) {
                newErrors.password = 'You have used this password recently. Please choose a different password';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Clear submit error
        if (errors.submit) {
            setErrors(prev => ({ ...prev, submit: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (attempts >= 3) {
            setErrors({ submit: 'Too many attempts. Please request a new password reset link.' });
            return;
        }

        const isValid = await validateForm();
        if (!isValid) return;

        setIsLoading(true);
        setAttempts(prev => prev + 1);

        try {
            // API call to reset password
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setIsSubmitted(true);

            // Clear sensitive data
            setFormData({ password: '', confirmPassword: '' });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Password reset successful! Please login with your new password.' }
                });
            }, 3000);

        } catch (error) {
            console.error('Reset password error:', error);
            setErrors({ submit: error.message || 'Failed to reset password. Please try again or request a new reset link.' });
        } finally {
            setIsLoading(false);
        }
    };

    const calculatePasswordStrength = (password) => {
        if (!password) return { percentage: 0, label: 'No Password', color: '#e0e0e0', score: 0 };

        let strength = 0;
        const checks = validatePassword(password);

        if (checks.minLength) strength += 10;
        if (checks.uppercase) strength += 10;
        if (checks.lowercase) strength += 10;
        if (checks.numbers) strength += 10;
        if (checks.specialChars) strength += 15;
        if (checks.noCommonPatterns) strength += 15;
        if (checks.noRepeating) strength += 10;
        if (password.length >= 12) strength += 10;
        if (password.length >= 16) strength += 10;

        let label = 'Very Weak';
        let color = '#f44336';
        let score = 0;

        if (strength >= 80) {
            label = 'Very Strong';
            color = '#4caf50';
            score = 100;
        } else if (strength >= 60) {
            label = 'Strong';
            color = '#2196f3';
            score = 80;
        } else if (strength >= 40) {
            label = 'Medium';
            color = '#ff9800';
            score = 60;
        } else if (strength >= 20) {
            label = 'Weak';
            color = '#ffc107';
            score = 30;
        }

        return { percentage: strength, label, color, score };
    };

    const passwordStrength = calculatePasswordStrength(formData.password);
    const passwordChecks = validatePassword(formData.password);

    const getRequirementsMetCount = () => {
        const checks = Object.values(passwordChecks);
        return checks.filter(check => check === true).length;
    };

    if (tokenChecking) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-wrapper">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <h3>Verifying reset link...</h3>
                        <p>Please wait while we verify your request</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-wrapper">
                    <div className="error-content">
                        <div className="error-icon">⚠️</div>
                        <h2>Invalid or Expired Link</h2>
                        <p>
                            The password reset link is invalid or has expired.
                        </p>
                        <p className="instruction-text">
                            Please request a new password reset link.
                        </p>
                        <div className="error-actions">
                            <Link to="/forgot-password" className="request-new-btn">
                                Request New Link
                            </Link>
                            <Link to="/login" className="back-to-login">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="reset-password-container">
                <div className="reset-password-wrapper">
                    <div className="success-content">
                        <div className="success-animation">
                            <div className="checkmark-circle">
                                <div className="checkmark">✓</div>
                            </div>
                        </div>
                        <h2>Password Reset Successful!</h2>
                        <p>
                            Your password has been successfully reset.
                        </p>
                        <div className="security-tip">
                            <span className="tip-icon">💡</span>
                            <span>For better security, avoid using this password on multiple sites.</span>
                        </div>
                        <p className="redirect-text">
                            Redirecting to login page...
                        </p>
                        <div className="success-actions">
                            <Link to="/login" className="login-now-btn">
                                Login Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-container">
            <div className="reset-password-wrapper">
                <div className="form-header">
                    <div className="header-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                    <h2>Create New Password</h2>
                    <p>
                        Create a strong password that you haven't used before.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="reset-password-form" noValidate>
                    {/* New Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">
                            New Password
                            <span className="required-star">*</span>
                        </label>
                        <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className={errors.password ? 'error' : ''}
                                disabled={isLoading}
                                autoComplete="new-password"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <button
                                type="button"
                                className="password-tips-toggle"
                                onClick={() => setShowPasswordTips(!showPasswordTips)}
                                disabled={isLoading}
                                title="Password tips"
                            >
                                💡
                            </button>
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-bar-fill"
                                        style={{
                                            width: `${passwordStrength.percentage}%`,
                                            backgroundColor: passwordStrength.color,
                                            transition: 'width 0.3s ease'
                                        }}
                                    />
                                </div>
                                <div className="strength-info">
                                    <span className="strength-text" style={{ color: passwordStrength.color }}>
                                        Strength: {passwordStrength.label}
                                    </span>
                                    <span className="strength-score">
                                        {getRequirementsMetCount()}/8 requirements met
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Password Tips Popup */}
                        {showPasswordTips && (
                            <div className="password-tips-popup">
                                <div className="tips-header">
                                    <span>📝</span>
                                    <h4>Tips for a strong password</h4>
                                    <button onClick={() => setShowPasswordTips(false)}>✕</button>
                                </div>
                                <ul>
                                    <li>Use at least 8 characters</li>
                                    <li>Mix uppercase and lowercase letters</li>
                                    <li>Include numbers and special characters</li>
                                    <li>Avoid common words and patterns</li>
                                    <li>Don't reuse passwords from other sites</li>
                                    <li>Consider using a passphrase</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm New Password
                            <span className="required-star">*</span>
                        </label>
                        <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                            <span className="input-icon">🔒</span>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className={errors.confirmPassword ? 'error' : ''}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

                        {/* Match indicator */}
                        {formData.confirmPassword && formData.password && (
                            <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'mismatch'}`}>
                                {formData.password === formData.confirmPassword ? (
                                    <span>✓ Passwords match</span>
                                ) : (
                                    <span>✗ Passwords do not match</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="password-requirements">
                        <p className="requirements-title">
                            Password requirements:
                            <span className={`requirements-status ${getRequirementsMetCount() === 8 ? 'complete' : ''}`}>
                                {getRequirementsMetCount()}/8 met
                            </span>
                        </p>
                        <div className="requirements-grid">
                            <div className={`requirement-item ${passwordChecks.minLength ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.minLength ? '✓' : '○'}
                                </span>
                                <span>At least 8 characters</span>
                            </div>
                            <div className={`requirement-item ${passwordChecks.uppercase ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.uppercase ? '✓' : '○'}
                                </span>
                                <span>Uppercase letter (A-Z)</span>
                            </div>
                            <div className={`requirement-item ${passwordChecks.lowercase ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.lowercase ? '✓' : '○'}
                                </span>
                                <span>Lowercase letter (a-z)</span>
                            </div>
                            <div className={`requirement-item ${passwordChecks.numbers ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.numbers ? '✓' : '○'}
                                </span>
                                <span>Number (0-9)</span>
                            </div>
                            <div className={`requirement-item ${passwordChecks.specialChars ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.specialChars ? '✓' : '○'}
                                </span>
                                <span>Special character (!@#$%)</span>
                            </div>
                            <div className={`requirement-item ${passwordChecks.noCommonPatterns ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.noCommonPatterns ? '✓' : '○'}
                                </span>
                                <span>No common patterns</span>
                            </div>
                            <div className={`requirement-item ${passwordChecks.noRepeating ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {passwordChecks.noRepeating ? '✓' : '○'}
                                </span>
                                <span>No repeating characters</span>
                            </div>
                            <div className={`requirement-item ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'met' : ''}`}>
                                <span className="requirement-icon">
                                    {formData.password === formData.confirmPassword && formData.confirmPassword ? '✓' : '○'}
                                </span>
                                <span>Passwords match</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="submit-error">
                            <span className="error-icon">⚠️</span>
                            <span>{errors.submit}</span>
                            {errors.submit.includes('request a new') && (
                                <Link to="/forgot-password" className="error-link">
                                    Request new link
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        isLoading={isLoading}
                        disabled={isLoading || getRequirementsMetCount() < 8}
                        className="reset-btn"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>

                    {/* Security Note */}
                    <div className="security-note">
                        <span className="note-icon">🔒</span>
                        <p>
                            Your password is encrypted and stored securely.
                            We never store your password in plain text.
                        </p>
                    </div>

                    {/* Back to Login */}
                    <div className="form-footer">
                        <Link to="/login" className="back-link">
                            ← Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
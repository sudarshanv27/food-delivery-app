import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitted(true);
        } catch (error) {
            console.error('Forgot password error:', error);
            setErrors({ submit: error.response?.data?.message || 'Failed to send reset email' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setEmail('');
        setIsSubmitted(false);
        setErrors({});
    };

    if (isSubmitted) {
        return (
            <div className="forgot-password-page">
                <div className="forgot-password-card">
                    <div className="success-content">
                        <div className="success-icon">✉️</div>
                        <h2>Check Your Email</h2>
                        <p>
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="instruction-text">
                            Please check your inbox and follow the instructions to reset your password.
                            The link will expire in 1 hour.
                        </p>
                        <div className="success-actions">
                            <Button
                                variant="primary"
                                onClick={handleResend}
                                className="resend-btn"
                            >
                                Send Again
                            </Button>
                            <Link to="/login" className="back-to-login">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">
                <div className="form-header">
                    <div className="header-icon">🔒</div>
                    <h2>Forgot Password?</h2>
                    <p>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your registered email"
                                className={errors.email ? 'error' : ''}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.email && <span className="error-message">{errors.email}</span>}
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
                        size="large"
                        fullWidth
                        isLoading={isLoading}
                        className="reset-btn"
                    >
                        Send Reset Link
                    </Button>

                    <div className="form-footer">
                        <Link to="/login" className="back-link">
                            ← Back to Login
                        </Link>
                    </div>
                </form>

                <div className="help-section">
                    <p className="help-title">Need help?</p>
                    <div className="help-links">
                        <Link to="/contact">Contact Support</Link>
                        <span className="separator">|</span>
                        <Link to="/faq">FAQ</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
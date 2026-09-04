// src/components/layout/Footer.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import './Footer.css';

const Footer = ({
    showNewsletter = true,
    showBackToTop = true,
    showSocialLinks = true,
    showAppLinks = true,
    showPaymentMethods = true,
    variant = 'default', // 'default', 'compact', 'minimal'
    onSubscribe
}) => {
    const { isDarkMode } = useTheme();
    const currentYear = new Date().getFullYear();
    const location = useLocation();
    const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState(null);
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 300;
            setShowBackToTopBtn(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const footerLinks = {
        company: [
            { name: 'About Us', path: '/about', icon: '🏢', description: 'Learn about our story' },
            { name: 'Contact Us', path: '/contact', icon: '📧', description: 'Get in touch' },
            { name: 'Careers', path: '/careers', icon: '💼', description: 'Join our team' },
            { name: 'Blog', path: '/blog', icon: '📝', description: 'Latest updates' },
            { name: 'Press', path: '/press', icon: '📰', description: 'Media resources' }
        ],
        support: [
            { name: 'Help Center', path: '/help', icon: '❓', description: 'FAQs & support' },
            { name: 'FAQs', path: '/faqs', icon: '📋', description: 'Common questions' },
            { name: 'Privacy Policy', path: '/privacy', icon: '🔒', description: 'Your privacy matters' },
            { name: 'Terms of Service', path: '/terms', icon: '📜', description: 'Terms & conditions' },
            { name: 'Refund Policy', path: '/refund', icon: '💰', description: 'Refund information' }
        ],
        food: [
            { name: 'Restaurants', path: '/restaurants', icon: '🍔', description: 'Browse restaurants' },
            { name: 'Offers', path: '/offers', icon: '🎁', description: 'Special deals' },
            { name: 'Near Me', path: '/near-me', icon: '📍', description: 'Find nearby' },
            { name: 'Delivery', path: '/delivery', icon: '🚚', description: 'Delivery info' },
            { name: 'Cuisines', path: '/cuisines', icon: '🍜', description: 'Explore cuisines' }
        ]
    };

    const socialLinks = [
        { name: 'Facebook', icon: '📘', url: 'https://facebook.com', color: '#1877f2', username: '@FoodDelivery' },
        { name: 'Instagram', icon: '📷', url: 'https://instagram.com', color: '#e4405f', username: '@fooddelivery' },
        { name: 'Twitter', icon: '🐦', url: 'https://twitter.com', color: '#1da1f2', username: '@FoodDelivery' },
        { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com', color: '#0077b5', username: 'FoodDelivery' },
        { name: 'YouTube', icon: '📺', url: 'https://youtube.com', color: '#ff0000', username: 'FoodDelivery' },
        { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com', color: '#000000', username: '@fooddelivery' }
    ];

    const appLinks = [
        { name: 'App Store', icon: '📱', url: '#', badge: 'Download on the', platform: 'iOS' },
        { name: 'Google Play', icon: '🤖', url: '#', badge: 'Get it on', platform: 'Android' },
        { name: 'App Gallery', icon: '📲', url: '#', badge: 'Available on', platform: 'Huawei' }
    ];

    const paymentMethods = [
        { name: 'Visa', icon: '💳', color: '#1a1f71' },
        { name: 'Mastercard', icon: '💳', color: '#eb001b' },
        { name: 'PayPal', icon: '💰', color: '#003087' },
        { name: 'Apple Pay', icon: '📱', color: '#000000' },
        { name: 'Google Pay', icon: '🤖', color: '#4285f4' },
        { name: 'Amex', icon: '💳', color: '#2e77bb' }
    ];

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
            setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address' });
            setTimeout(() => setNewsletterStatus(null), 3000);
            return;
        }

        setIsSubscribing(true);

        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (onSubscribe) {
                await onSubscribe(newsletterEmail);
            }

            setNewsletterStatus({ type: 'success', message: 'Successfully subscribed!' });
            setNewsletterEmail('');
            setTimeout(() => setNewsletterStatus(null), 3000);
        } catch (error) {
            setNewsletterStatus({ type: 'error', message: 'Subscription failed. Please try again.' });
            setTimeout(() => setNewsletterStatus(null), 3000);
        } finally {
            setIsSubscribing(false);
        }
    };

    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isCompact = variant === 'compact';
    const isMinimal = variant === 'minimal';

    return (
        <footer className={`footer ${isDarkMode ? 'dark' : 'light'} ${variant}`}>
            <div className="footer-container">
                {/* Main Footer Content */}
                {!isMinimal && (
                    <div className="footer-main">
                        {/* Brand Section */}
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <div className="logo-wrapper">
                                    <span className="logo-icon">🍔</span>
                                    <div className="logo-text-wrapper">
                                        <span className="logo-text">FoodDelivery</span>
                                        <span className="logo-tagline">Fast & Fresh</span>
                                    </div>
                                </div>
                            </Link>
                            <p className="footer-description">
                                Order food from your favorite restaurants with lightning-fast delivery.
                                We bring the best culinary experiences right to your doorstep.
                            </p>
                            <div className="footer-stats">
                                <div className="stat-item">
                                    <span className="stat-value">10k+</span>
                                    <span className="stat-label">Restaurants</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">5M+</span>
                                    <span className="stat-label">Happy Customers</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">30min</span>
                                    <span className="stat-label">Avg Delivery</span>
                                </div>
                            </div>
                            <div className="footer-rating">
                                <div className="rating-stars">★★★★★</div>
                                <div className="rating-details">
                                    <span className="rating-value">4.8</span>
                                    <span className="rating-text">(10k+ reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        {!isCompact && (
                            <div className="footer-links">
                                <div className="links-column">
                                    <h3 className="links-title">
                                        <span className="title-icon">🏢</span>
                                        Company
                                    </h3>
                                    <ul className="links-list">
                                        {footerLinks.company.map((link) => (
                                            <li key={link.path}>
                                                <Link to={link.path} className="footer-link">
                                                    <span className="link-icon">{link.icon}</span>
                                                    <div className="link-content">
                                                        <span className="link-name">{link.name}</span>
                                                        <span className="link-desc">{link.description}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="links-column">
                                    <h3 className="links-title">
                                        <span className="title-icon">🎧</span>
                                        Support
                                    </h3>
                                    <ul className="links-list">
                                        {footerLinks.support.map((link) => (
                                            <li key={link.path}>
                                                <Link to={link.path} className="footer-link">
                                                    <span className="link-icon">{link.icon}</span>
                                                    <div className="link-content">
                                                        <span className="link-name">{link.name}</span>
                                                        <span className="link-desc">{link.description}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="links-column">
                                    <h3 className="links-title">
                                        <span className="title-icon">🍕</span>
                                        Quick Links
                                    </h3>
                                    <ul className="links-list">
                                        {footerLinks.food.map((link) => (
                                            <li key={link.path}>
                                                <Link to={link.path} className="footer-link">
                                                    <span className="link-icon">{link.icon}</span>
                                                    <div className="link-content">
                                                        <span className="link-name">{link.name}</span>
                                                        <span className="link-desc">{link.description}</span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Contact & Social */}
                        <div className="footer-contact">
                            <div className="contact-info">
                                <h3 className="contact-title">
                                    <span className="title-icon">📞</span>
                                    Contact Us
                                </h3>
                                <div className="contact-details">
                                    <div className="contact-item">
                                        <span className="contact-icon">📞</span>
                                        <div>
                                            <div className="contact-label">Phone</div>
                                            <a href="tel:+1234567890" className="contact-value">+1 (234) 567-890</a>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <span className="contact-icon">✉️</span>
                                        <div>
                                            <div className="contact-label">Email</div>
                                            <a href="mailto:support@fooddelivery.com" className="contact-value">support@fooddelivery.com</a>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <span className="contact-icon">📍</span>
                                        <div>
                                            <div className="contact-label">Address</div>
                                            <span className="contact-value">123 Food Street, NYC 10001</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {showSocialLinks && (
                                <div className="social-section">
                                    <h3 className="social-title">
                                        <span className="title-icon">📱</span>
                                        Follow Us
                                    </h3>
                                    <div className="social-links">
                                        {socialLinks.map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link"
                                                style={{ '--social-color': social.color }}
                                                aria-label={social.name}
                                            >
                                                <span className="social-icon">{social.icon}</span>
                                                <span className="social-name">{social.name}</span>
                                                <span className="social-username">{social.username}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showAppLinks && !isCompact && (
                                <div className="app-section">
                                    <h3 className="app-title">
                                        <span className="title-icon">📲</span>
                                        Download App
                                    </h3>
                                    <div className="app-links">
                                        {appLinks.map((app) => (
                                            <a key={app.name} href={app.url} className="app-link">
                                                <div className="app-badge">
                                                    <span className="app-badge-text">{app.badge}</span>
                                                    <div className="app-name-wrapper">
                                                        <span className="app-icon">{app.icon}</span>
                                                        <span className="app-name">{app.name}</span>
                                                    </div>
                                                    <span className="app-platform">{app.platform}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Compact Version Footer */}
                {isCompact && (
                    <div className="footer-compact">
                        <div className="compact-brand">
                            <Link to="/" className="footer-logo">
                                <span className="logo-icon">🍔</span>
                                <span className="logo-text">FoodDelivery</span>
                            </Link>
                            <p className="compact-description">Fast food delivery at your doorstep</p>
                        </div>
                        <div className="compact-links">
                            <Link to="/about">About</Link>
                            <Link to="/contact">Contact</Link>
                            <Link to="/privacy">Privacy</Link>
                            <Link to="/terms">Terms</Link>
                            <Link to="/help">Help</Link>
                        </div>
                        <div className="compact-social">
                            {socialLinks.slice(0, 4).map((social) => (
                                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Newsletter Section */}
                {showNewsletter && !isMinimal && !isCompact && (
                    <div className="footer-newsletter">
                        <div className="newsletter-content">
                            <div className="newsletter-icon">📧</div>
                            <div>
                                <h3 className="newsletter-title">Subscribe to our Newsletter</h3>
                                <p className="newsletter-text">
                                    Get exclusive offers, discounts, and updates delivered to your inbox.
                                    <span className="newsletter-guarantee">No spam, unsubscribe anytime.</span>
                                </p>
                            </div>
                        </div>
                        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <div className="newsletter-input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="newsletter-input"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    disabled={isSubscribing}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="newsletter-btn"
                                disabled={isSubscribing}
                            >
                                {isSubscribing ? (
                                    <span className="btn-spinner"></span>
                                ) : (
                                    <>
                                        <span>Subscribe</span>
                                        <span className="btn-arrow">→</span>
                                    </>
                                )}
                            </button>
                        </form>
                        {newsletterStatus && (
                            <div className={`newsletter-status ${newsletterStatus.type}`}>
                                {newsletterStatus.type === 'success' ? '✅' : '❌'} {newsletterStatus.message}
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="bottom-content">
                        <div className="copyright">
                            <p>
                                © {currentYear} FoodDelivery. All rights reserved.
                                <span className="copyright-heart">Made with ❤️ for food lovers</span>
                            </p>
                        </div>

                        <div className="footer-theme">
                            <ThemeSwitcher variant={isCompact ? "compact" : "default"} showLabels={!isCompact} />
                        </div>

                        {showPaymentMethods && !isMinimal && (
                            <div className="payment-methods">
                                <span className="payment-label">Secure Payments:</span>
                                <div className="payment-icons">
                                    {paymentMethods.map((method) => (
                                        <div key={method.name} className="payment-icon-wrapper" title={method.name}>
                                            <span className="payment-icon" style={{ color: method.color }}>
                                                {method.icon}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="secure-badge">
                                    <span className="secure-icon">🔒</span>
                                    <span className="secure-text">SSL Secure</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isMinimal && (
                        <div className="footer-legal">
                            <Link to="/privacy">Privacy Policy</Link>
                            <span className="legal-separator">•</span>
                            <Link to="/terms">Terms of Service</Link>
                            <span className="legal-separator">•</span>
                            <Link to="/cookies">Cookie Policy</Link>
                            <span className="legal-separator">•</span>
                            <Link to="/sitemap">Sitemap</Link>
                            <span className="legal-separator">•</span>
                            <Link to="/accessibility">Accessibility</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    className={`back-to-top ${showBackToTopBtn ? 'visible' : ''}`}
                    onClick={handleBackToTop}
                    aria-label="Back to top"
                >
                    <span className="back-to-top-icon">↑</span>
                    <span className="back-to-top-text">Top</span>
                </button>
            )}
        </footer>
    );
};

export default Footer;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';
import './MobileFooter.css';

const MobileFooter = ({
    showFloatingCart = true,
    animateOnTap = true,
    showTooltips = false,
    variant = 'default' // 'default', 'rounded', 'compact'
}) => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { itemCount, totalAmount } = useCart();
    const [showCartPreview, setShowCartPreview] = useState(false);
    const [activeItem, setActiveItem] = useState(null);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Hide on these pages
    const hideOnPages = [
        '/login',
        '/signup',
        '/forgot-password',
        '/admin',
        '/delivery-panel',
        '/restaurant-panel',
        '/checkout'
    ];

    const shouldHide = hideOnPages.includes(location.pathname) ||
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/delivery') ||
        location.pathname.startsWith('/restaurant-panel');

    // Auto-hide on scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY;
            const scrolledPastThreshold = currentScrollY > 100;

            if (scrollingDown && scrolledPastThreshold) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Cart preview timer
    useEffect(() => {
        let timer;
        if (showCartPreview) {
            timer = setTimeout(() => setShowCartPreview(false), 3000);
        }
        return () => clearTimeout(timer);
    }, [showCartPreview]);

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: '🏠',
            activeIcon: '🏡',
            path: '/',
            active: location.pathname === '/',
            description: 'Go to homepage'
        },
        {
            id: 'search',
            label: 'Search',
            icon: '🔍',
            activeIcon: '🔎',
            path: '/search',
            active: location.pathname === '/search',
            description: 'Search restaurants'
        },
        {
            id: 'restaurants',
            label: 'Food',
            icon: '🍔',
            activeIcon: '🍕',
            path: '/restaurants',
            active: location.pathname === '/restaurants',
            description: 'Browse restaurants'
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: '🛒',
            activeIcon: '🛍️',
            path: '/cart',
            active: location.pathname === '/cart',
            badge: itemCount,
            description: 'View cart',
            highlight: itemCount > 0
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: '📦',
            activeIcon: '🎁',
            path: '/orders',
            active: location.pathname === '/orders',
            auth: true,
            description: 'Your orders'
        },
        {
            id: 'favorites',
            label: 'Favorites',
            icon: '❤️',
            activeIcon: '💖',
            path: '/favorites',
            active: location.pathname === '/favorites',
            auth: true,
            description: 'Saved items'
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: '👤',
            activeIcon: '👨',
            path: '/profile',
            active: location.pathname === '/profile',
            auth: true,
            description: 'Account settings'
        }
    ];

    // Filter items based on authentication and visibility
    const filteredNavItems = navItems.filter(item => {
        if (item.auth && !isAuthenticated) return false;
        return true;
    });

    // Determine which items to show (max 5 for bottom nav)
    const visibleNavItems = variant === 'compact'
        ? filteredNavItems.slice(0, 4)
        : filteredNavItems.slice(0, 5);

    const handleNavClick = (itemId) => {
        if (animateOnTap) {
            setActiveItem(itemId);
            setTimeout(() => setActiveItem(null), 300);
        }
    };

    const handleCartClick = () => {
        if (itemCount > 0) {
            setShowCartPreview(true);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (shouldHide) return null;

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className={`mobile-bottom-nav ${variant} ${!isVisible ? 'hidden' : ''}`}>
                <div className="nav-container">
                    {visibleNavItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`mobile-nav-item ${item.active ? 'active' : ''} ${item.highlight ? 'highlight' : ''} ${activeItem === item.id ? 'tap-animation' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                            onMouseEnter={() => showTooltips && setActiveItem(item.id)}
                            onMouseLeave={() => showTooltips && setActiveItem(null)}
                        >
                            <div className="nav-icon-wrapper">
                                <span className="nav-icon">
                                    {item.active ? (item.activeIcon || item.icon) : item.icon}
                                </span>
                                {item.badge > 0 && (
                                    <span className={`nav-badge ${item.badge > 9 ? 'double-digit' : ''}`}>
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                                {item.active && <div className="active-indicator"></div>}
                            </div>
                            <span className="nav-label">{item.label}</span>
                            {showTooltips && activeItem === item.id && (
                                <div className="nav-tooltip">{item.description}</div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Cart Preview Modal */}
                {showCartPreview && itemCount > 0 && (
                    <div className="cart-preview" onClick={() => setShowCartPreview(false)}>
                        <div className="cart-preview-content">
                            <div className="cart-preview-header">
                                <span className="cart-preview-icon">🛒</span>
                                <span className="cart-preview-title">Cart ({itemCount} items)</span>
                                <button className="cart-preview-close">&times;</button>
                            </div>
                            <div className="cart-preview-body">
                                <div className="cart-preview-total">
                                    <span>Total Amount:</span>
                                    <strong>₹{totalAmount}</strong>
                                </div>
                                <Link to="/cart" className="cart-preview-btn">
                                    View Cart →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {showFloatingCart && location.pathname.includes('/restaurant/') && (
                <div className="floating-actions">
                    <Link to="/cart" className="floating-cart-btn">
                        <span className="cart-icon">🛒</span>
                        {itemCount > 0 && (
                            <>
                                <span className="cart-count">{itemCount}</span>
                                <span className="cart-amount">₹{totalAmount}</span>
                            </>
                        )}
                    </Link>

                    {/* Quick Order Button */}
                    {itemCount > 0 && (
                        <Link to="/checkout" className="floating-checkout-btn">
                            <span>Order Now</span>
                            <span className="checkout-arrow">→</span>
                        </Link>
                    )}
                </div>
            )}

            {/* Gesture Hint for New Users */}
            {!localStorage.getItem('footerGestureHintShown') && (
                <div className="gesture-hint" onClick={() => {
                    localStorage.setItem('footerGestureHintShown', 'true');
                }}>
                    <div className="hint-content">
                        <span className="hint-icon">👆</span>
                        <span className="hint-text">Tap to navigate</span>
                        <button className="hint-close">Got it</button>
                    </div>
                </div>
            )}

            {/* Voice Navigation Button (Optional) */}
            {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <button className="voice-nav-btn" aria-label="Voice navigation">
                    <span className="voice-icon">🎤</span>
                </button>
            )}
        </>
    );
};

// Bottom Sheet Component for Additional Actions
export const BottomActionSheet = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="bottom-sheet-overlay" onClick={onClose}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="bottom-sheet-handle"></div>
                <div className="bottom-sheet-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Quick Actions Component
export const QuickActions = ({ onAction }) => {
    const actions = [
        { id: 'search', icon: '🔍', label: 'Search', color: '#4caf50' },
        { id: 'offers', icon: '🎁', label: 'Offers', color: '#ff9800' },
        { id: 'favorites', icon: '❤️', label: 'Favorites', color: '#f44336' },
        { id: 'reorder', icon: '🔄', label: 'Reorder', color: '#2196f3' }
    ];

    return (
        <div className="quick-actions">
            {actions.map(action => (
                <button
                    key={action.id}
                    className="quick-action-btn"
                    style={{ '--action-color': action.color }}
                    onClick={() => onAction?.(action.id)}
                >
                    <span className="action-icon">{action.icon}</span>
                    <span className="action-label">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default MobileFooter;
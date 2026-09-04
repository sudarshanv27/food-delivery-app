import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './CartSummary.css';

const CartSummary = ({ cart, onApplyCoupon, onRemoveCoupon, onCheckout, onSaveForLater, isCheckout = false }) => {
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [showMoreDetails, setShowMoreDetails] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showCouponList, setShowCouponList] = useState(false);
    const [estimatedDelivery, setEstimatedDelivery] = useState(null);

    useEffect(() => {
        // Load available coupons
        loadAvailableCoupons();
        // Calculate estimated delivery
        calculateEstimatedDelivery();
    }, []);

    const loadAvailableCoupons = async () => {
        try {
            const response = await fetch('/api/coupons/available');
            const data = await response.json();
            setAvailableCoupons(data.coupons || []);
        } catch (error) {
            console.error('Error loading coupons:', error);
        }
    };

    const calculateEstimatedDelivery = () => {
        const now = new Date();
        const estimated = new Date(now.getTime() + 35 * 60000); // 35 minutes
        setEstimatedDelivery(estimated);
    };

    const calculateSubtotal = () => {
        return cart.items.reduce((sum, item) => {
            const itemPrice = item.discountPrice || item.price;
            const addonsTotal = item.addons?.reduce((addonSum, addon) => addonSum + (addon.price * (addon.quantity || 1)), 0) || 0;
            const customizationTotal = item.customizations?.reduce((customSum, custom) => customSum + (custom.price || 0), 0) || 0;
            return sum + (itemPrice + addonsTotal + customizationTotal) * item.quantity;
        }, 0);
    };

    const calculateTax = (subtotal) => {
        const CGST = subtotal * 0.025; // 2.5% CGST
        const SGST = subtotal * 0.025; // 2.5% SGST
        return { total: CGST + SGST, cgst: CGST, sgst: SGST };
    };

    const calculateDeliveryFee = (subtotal) => {
        if (subtotal >= 500) return 0;
        if (subtotal >= 300) return 20;
        return 40;
    };

    const calculatePackagingFee = () => {
        const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        return totalItems * 2; // ₹2 per item
    };

    const calculatePlatformFee = () => {
        return 5; // ₹5 platform fee
    };

    const calculateDiscount = (subtotal) => {
        if (cart.coupon) {
            if (cart.coupon.type === 'percentage') {
                return (subtotal * cart.coupon.value) / 100;
            } else if (cart.coupon.type === 'fixed') {
                return Math.min(cart.coupon.value, subtotal);
            }
        }
        return 0;
    };

    const calculateMemberDiscount = (subtotal) => {
        if (cart.isMember) {
            return subtotal * 0.1; // 10% member discount
        }
        return 0;
    };

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const deliveryFee = calculateDeliveryFee(subtotal);
    const packagingFee = calculatePackagingFee();
    const platformFee = calculatePlatformFee();
    const couponDiscount = calculateDiscount(subtotal);
    const memberDiscount = calculateMemberDiscount(subtotal);
    const totalDiscount = couponDiscount + memberDiscount;
    const total = subtotal + tax.total + deliveryFee + packagingFee + platformFee - totalDiscount;

    const savings = cart.items.reduce((sum, item) => {
        if (item.originalPrice && item.price) {
            return sum + (item.originalPrice - item.price) * item.quantity;
        }
        return sum;
    }, 0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError('');
        setCouponSuccess('');

        try {
            const result = await onApplyCoupon?.(couponCode);
            if (result?.success) {
                setCouponSuccess(`Coupon applied! You saved ₹${result.discount}`);
                setCouponCode('');
                setShowCouponList(false);
            } else {
                setCouponError(result?.message || 'Invalid coupon code');
            }
        } catch (error) {
            setCouponError('Failed to apply coupon. Please try again.');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            await onRemoveCoupon?.();
            setCouponSuccess('');
        } catch (error) {
            console.error('Error removing coupon:', error);
        }
    };

    const handleQuickCouponApply = async (coupon) => {
        setCouponCode(coupon.code);
        setIsApplyingCoupon(true);
        setCouponError('');
        setCouponSuccess('');

        try {
            const result = await onApplyCoupon?.(coupon.code);
            if (result?.success) {
                setCouponSuccess(`Coupon applied! You saved ₹${result.discount}`);
                setCouponCode('');
                setShowCouponList(false);
            } else {
                setCouponError(result?.message || 'Invalid coupon code');
            }
        } catch (error) {
            setCouponError('Failed to apply coupon. Please try again.');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const formatDeliveryTime = () => {
        if (!estimatedDelivery) return '';
        return estimatedDelivery.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>

            {/* Estimated Delivery */}
            <div className="delivery-estimate">
                <div className="estimate-icon">⏰</div>
                <div className="estimate-content">
                    <div className="estimate-title">Estimated Delivery Time</div>
                    <div className="estimate-time">{formatDeliveryTime()}</div>
                    <div className="estimate-note">Delivery within 30-40 minutes</div>
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="price-breakdown">
                <div className="breakdown-header" onClick={() => setShowMoreDetails(!showMoreDetails)}>
                    <span>Price Details</span>
                    <span className="toggle-icon">{showMoreDetails ? '▲' : '▼'}</span>
                </div>

                <div className={`breakdown-content ${showMoreDetails ? 'expanded' : ''}`}>
                    <div className="breakdown-row">
                        <span>Subtotal ({cart.items.length} items)</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    {savings > 0 && (
                        <div className="breakdown-row savings">
                            <span>Total Savings</span>
                            <span>- ₹{savings.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="breakdown-row">
                        <span>Packaging Fee</span>
                        <span>₹{packagingFee.toFixed(2)}</span>
                    </div>

                    <div className="breakdown-row">
                        <span>Delivery Fee</span>
                        {deliveryFee === 0 ? (
                            <span className="free-delivery">Free</span>
                        ) : (
                            <span>₹{deliveryFee.toFixed(2)}</span>
                        )}
                    </div>

                    <div className="breakdown-row">
                        <span>Platform Fee</span>
                        <span>₹{platformFee.toFixed(2)}</span>
                    </div>

                    <div className="breakdown-row tax-row">
                        <span>Tax (5% GST)</span>
                        <div className="tax-details">
                            <div className="tax-item">CGST: ₹{tax.cgst.toFixed(2)}</div>
                            <div className="tax-item">SGST: ₹{tax.sgst.toFixed(2)}</div>
                        </div>
                    </div>

                    {memberDiscount > 0 && (
                        <div className="breakdown-row member-discount">
                            <span>Member Discount (10%)</span>
                            <span>- ₹{memberDiscount.toFixed(2)}</span>
                        </div>
                    )}

                    {couponDiscount > 0 && (
                        <div className="breakdown-row discount">
                            <span>Coupon Discount</span>
                            <span>- ₹{couponDiscount.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
                {cart.coupon ? (
                    <div className="applied-coupon">
                        <div className="coupon-info">
                            <span className="coupon-icon">🎫</span>
                            <div>
                                <div className="coupon-code">{cart.coupon.code}</div>
                                <div className="coupon-description">{cart.coupon.description}</div>
                                <div className="coupon-savings">Saved: ₹{couponDiscount.toFixed(2)}</div>
                            </div>
                        </div>
                        <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="coupon-container">
                        <div className="coupon-input-group">
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className={couponError ? 'error' : ''}
                                disabled={isApplyingCoupon}
                            />
                            <Button
                                variant="outline"
                                onClick={handleApplyCoupon}
                                isLoading={isApplyingCoupon}
                                disabled={!couponCode.trim()}
                                size="small"
                            >
                                Apply
                            </Button>
                        </div>

                        {availableCoupons.length > 0 && (
                            <div className="available-coupons">
                                <button
                                    className="show-coupons-btn"
                                    onClick={() => setShowCouponList(!showCouponList)}
                                >
                                    {showCouponList ? 'Hide available coupons' : 'Show available coupons'}
                                </button>

                                {showCouponList && (
                                    <div className="coupons-list">
                                        {availableCoupons.map((coupon, index) => (
                                            <div key={index} className="coupon-card">
                                                <div className="coupon-card-info">
                                                    <div className="coupon-card-code">{coupon.code}</div>
                                                    <div className="coupon-card-desc">{coupon.description}</div>
                                                    <div className="coupon-card-save">
                                                        Save {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                                    </div>
                                                </div>
                                                <button
                                                    className="apply-coupon-quick"
                                                    onClick={() => handleQuickCouponApply(coupon)}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {couponError && <div className="coupon-error">{couponError}</div>}
                        {couponSuccess && <div className="coupon-success">{couponSuccess}</div>}
                    </div>
                )}
            </div>

            {/* Member Savings Info */}
            {!cart.isMember && subtotal > 200 && (
                <div className="member-savings-promo">
                    <div className="promo-icon">⭐</div>
                    <div className="promo-content">
                        <div className="promo-title">Become a Member & Save 10%</div>
                        <div className="promo-text">
                            Join now and get 10% off on this order. You'll save ₹{memberDiscount.toFixed(2)} instantly!
                        </div>
                        <button className="join-membership-btn">Join Membership</button>
                    </div>
                </div>
            )}

            {/* Free Delivery Progress */}
            {deliveryFee > 0 && (
                <div className="free-delivery-progress">
                    <div className="progress-header">
                        <span className="progress-icon">🚚</span>
                        <span>Add ₹{(500 - subtotal).toFixed(2)} more to get FREE delivery</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Total */}
            <div className="total-row">
                <div className="total-label">
                    <span>Total Amount</span>
                    <span className="total-note">(inclusive of all taxes)</span>
                </div>
                <div className="total-value">₹{total.toFixed(2)}</div>
            </div>

            {/* Checkout Button */}
            {!isCheckout && (
                <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={onCheckout}
                    className="checkout-btn"
                >
                    Proceed to Checkout
                </Button>
            )}

            {/* Secure Payment Note */}
            <div className="secure-note">
                <span className="secure-icon">🔒</span>
                <span>100% Secure Payment Gateway</span>
                <span className="secure-badge">PCI DSS Compliant</span>
            </div>

            {/* Accepted Payment Methods */}
            <div className="payment-methods">
                <span className="payment-label">Accepted Payments:</span>
                <div className="payment-icons">
                    <span className="payment-icon" title="Credit/Debit Cards">💳</span>
                    <span className="payment-icon" title="UPI">📱</span>
                    <span className="payment-icon" title="Net Banking">🏦</span>
                    <span className="payment-icon" title="Cash on Delivery">💵</span>
                    <span className="payment-icon" title="Digital Wallets">👛</span>
                    <span className="payment-icon" title="BNPL">📊</span>
                </div>
            </div>

            {/* Terms */}
            <div className="terms-note">
                By placing this order, you agree to our
                <a href="/terms"> Terms of Service</a> and
                <a href="/privacy"> Privacy Policy</a>
            </div>
        </div>
    );
};

// Order Summary for Checkout Page
export const OrderSummary = ({ cart, showDetails = true, compact = false }) => {
    const calculateSubtotal = () => {
        return cart.items?.reduce((sum, item) => {
            const itemPrice = item.discountPrice || item.price;
            const addonsTotal = item.addons?.reduce((addonSum, addon) => addonSum + (addon.price * (addon.quantity || 1)), 0) || 0;
            return sum + (itemPrice + addonsTotal) * item.quantity;
        }, 0) || 0;
    };

    const subtotal = calculateSubtotal();
    const tax = subtotal * 0.05;
    const deliveryFee = subtotal >= 500 ? 0 : 40;
    const packagingFee = subtotal > 0 ? 10 : 0;
    const total = subtotal + tax + deliveryFee + packagingFee;

    if (compact) {
        return (
            <div className="order-summary-compact">
                <div className="compact-row">
                    <span>Total Amount</span>
                    <span className="compact-total">₹{total.toFixed(2)}</span>
                </div>
                {deliveryFee === 0 && (
                    <div className="compact-free-delivery">✨ Free Delivery</div>
                )}
            </div>
        );
    }

    return (
        <div className="order-summary">
            <h3 className="summary-title">Order Summary</h3>

            {showDetails && cart.items && (
                <div className="order-items-preview">
                    {cart.items.map((item, index) => (
                        <div key={index} className="order-item-preview">
                            <div className="item-info">
                                <span className="item-quantity">{item.quantity}x</span>
                                <span className="item-name">{item.name}</span>
                            </div>
                            <span className="item-price">
                                ₹{((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="price-breakdown">
                <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                    <span>Tax (5% GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                    <span>Packaging Fee</span>
                    <span>₹{packagingFee.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? (
                        <span className="free-delivery">Free</span>
                    ) : (
                        <span>₹{deliveryFee.toFixed(2)}</span>
                    )}
                </div>
            </div>

            <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-value">₹{total.toFixed(2)}</span>
            </div>
        </div>
    );
};

// Mini Cart Summary for Mobile
export const MiniCartSummary = ({ total, itemCount, onClick }) => {
    return (
        <div className="mini-cart-summary" onClick={onClick}>
            <div className="mini-cart-icon">
                🛒
                {itemCount > 0 && <span className="mini-cart-badge">{itemCount}</span>}
            </div>
            <div className="mini-cart-details">
                <div className="mini-cart-total">₹{total.toFixed(2)}</div>
                <div className="mini-cart-text">View Cart</div>
            </div>
        </div>
    );
};

export default CartSummary;
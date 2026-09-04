import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './CheckoutForm.css';

const CheckoutForm = ({ onSubmit, initialData, isLoading, savedAddresses = [], onSaveAddress }) => {
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        addressLine2: initialData?.addressLine2 || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        zipCode: initialData?.zipCode || '',
        landmark: initialData?.landmark || '',
        paymentMethod: initialData?.paymentMethod || 'card',
        saveAddress: initialData?.saveAddress || false,
        specialInstructions: initialData?.specialInstructions || '',
        sameAsBilling: initialData?.sameAsBilling !== false,
        billingAddress: initialData?.billingAddress || '',
        giftWrap: initialData?.giftWrap || false,
        giftMessage: initialData?.giftMessage || '',
        deliveryInstructions: initialData?.deliveryInstructions || '',
        scheduleDelivery: initialData?.scheduleDelivery || false,
        deliveryDate: initialData?.deliveryDate || '',
        deliveryTime: initialData?.deliveryTime || '',
        newsletterOptIn: initialData?.newsletterOptIn || false,
        smsUpdates: initialData?.smsUpdates || false
    });

    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [isValidatingPinCode, setIsValidatingPinCode] = useState(false);
    const [pinCodeInfo, setPinCodeInfo] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        } else if (formData.fullName.length > 50) {
            newErrors.fullName = 'Name must be less than 50 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.address) {
            newErrors.address = 'Street address is required';
        }

        if (!formData.city) {
            newErrors.city = 'City is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (!formData.zipCode) {
            newErrors.zipCode = 'ZIP code is required';
        } else if (!/^\d{6}$/.test(formData.zipCode)) {
            newErrors.zipCode = 'ZIP code must be 6 digits';
        }

        if (formData.scheduleDelivery) {
            if (!formData.deliveryDate) {
                newErrors.deliveryDate = 'Please select delivery date';
            }
            if (!formData.deliveryTime) {
                newErrors.deliveryTime = 'Please select delivery time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit?.(formData);
        }
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

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
        if (selectedAddress) {
            setFormData(prev => ({
                ...prev,
                fullName: selectedAddress.fullName || prev.fullName,
                address: selectedAddress.address,
                addressLine2: selectedAddress.addressLine2 || '',
                city: selectedAddress.city,
                state: selectedAddress.state,
                zipCode: selectedAddress.zipCode,
                landmark: selectedAddress.landmark || ''
            }));
        }
    };

    const validatePinCode = async (pinCode) => {
        if (pinCode.length === 6) {
            setIsValidatingPinCode(true);
            try {
                const response = await fetch(`/api/validate-pincode?pincode=${pinCode}`);
                const data = await response.json();
                setPinCodeInfo(data);
                if (!data.isServiceable) {
                    setErrors(prev => ({ ...prev, zipCode: 'Delivery not available in this area' }));
                }
            } catch (error) {
                console.error('Pin code validation error:', error);
            } finally {
                setIsValidatingPinCode(false);
            }
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        try {
            const response = await fetch('/api/apply-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await response.json();
            if (data.success) {
                // Handle coupon application
            }
        } catch (error) {
            console.error('Coupon error:', error);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const getMinDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    const getDeliveryTimeSlots = () => {
        return [
            '11:00 AM - 12:00 PM',
            '12:00 PM - 1:00 PM',
            '1:00 PM - 2:00 PM',
            '2:00 PM - 3:00 PM',
            '5:00 PM - 6:00 PM',
            '6:00 PM - 7:00 PM',
            '7:00 PM - 8:00 PM',
            '8:00 PM - 9:00 PM',
            '9:00 PM - 10:00 PM'
        ];
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            {savedAddresses.length > 0 && (
                <div className="form-section">
                    <h3 className="section-title">Saved Addresses</h3>
                    <div className="saved-addresses-grid">
                        {savedAddresses.map(address => (
                            <div
                                key={address.id}
                                className={`saved-address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                                onClick={() => handleAddressSelect(address.id)}
                            >
                                <div className="address-card-content">
                                    <div className="address-name">{address.name}</div>
                                    <div className="address-details">{address.address}</div>
                                    <div className="address-city">
                                        {address.city}, {address.state} - {address.zipCode}
                                    </div>
                                </div>
                                {selectedAddressId === address.id && (
                                    <div className="address-selected-badge">✓</div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="or-divider">OR</div>
                </div>
            )}

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Personal Information
                </h3>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fullName">
                            Full Name <span className="required-star">*</span>
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            onBlur={() => handleBlur('fullName')}
                            placeholder="Enter your full name"
                            className={errors.fullName && touchedFields.fullName ? 'error' : ''}
                        />
                        {errors.fullName && touchedFields.fullName && (
                            <span className="error-message">{errors.fullName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">
                            Email Address <span className="required-star">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur('email')}
                            placeholder="your@email.com"
                            className={errors.email && touchedFields.email ? 'error' : ''}
                        />
                        {errors.email && touchedFields.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="phone">
                        Phone Number <span className="required-star">*</span>
                    </label>
                    <div className="phone-input-wrapper">
                        <span className="country-code">+91</span>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={() => handleBlur('phone')}
                            placeholder="10-digit mobile number"
                            className={errors.phone && touchedFields.phone ? 'error' : ''}
                            maxLength="10"
                        />
                    </div>
                    {errors.phone && touchedFields.phone && (
                        <span className="error-message">{errors.phone}</span>
                    )}
                </div>
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">📍</span>
                    Delivery Address
                </h3>

                <div className="form-group">
                    <label htmlFor="address">
                        Street Address <span className="required-star">*</span>
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={() => handleBlur('address')}
                        placeholder="House number and street name"
                        className={errors.address && touchedFields.address ? 'error' : ''}
                    />
                    {errors.address && touchedFields.address && (
                        <span className="error-message">{errors.address}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
                    <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Apartment, suite, unit, etc."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="landmark">Landmark (Optional)</label>
                    <input
                        type="text"
                        id="landmark"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        placeholder="Near any landmark"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">
                            City <span className="required-star">*</span>
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            onBlur={() => handleBlur('city')}
                            className={errors.city && touchedFields.city ? 'error' : ''}
                        />
                        {errors.city && touchedFields.city && (
                            <span className="error-message">{errors.city}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="state">
                            State <span className="required-star">*</span>
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            onBlur={() => handleBlur('state')}
                            className={errors.state && touchedFields.state ? 'error' : ''}
                        />
                        {errors.state && touchedFields.state && (
                            <span className="error-message">{errors.state}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="zipCode">
                            ZIP Code <span className="required-star">*</span>
                        </label>
                        <div className="zip-input-wrapper">
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={(e) => {
                                    handleChange(e);
                                    validatePinCode(e.target.value);
                                }}
                                onBlur={() => handleBlur('zipCode')}
                                placeholder="6-digit code"
                                className={errors.zipCode && touchedFields.zipCode ? 'error' : ''}
                                maxLength="6"
                            />
                            {isValidatingPinCode && <span className="validating-spinner">⌛</span>}
                        </div>
                        {errors.zipCode && touchedFields.zipCode && (
                            <span className="error-message">{errors.zipCode}</span>
                        )}
                        {pinCodeInfo && pinCodeInfo.isServiceable && (
                            <span className="valid-message">✓ Delivery available in this area</span>
                        )}
                    </div>
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="saveAddress"
                            checked={formData.saveAddress}
                            onChange={handleChange}
                        />
                        <span>Save this address for future orders</span>
                    </label>
                </div>
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">⏰</span>
                    Delivery Schedule
                </h3>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="scheduleDelivery"
                            checked={formData.scheduleDelivery}
                            onChange={handleChange}
                        />
                        <span>Schedule for later</span>
                    </label>
                </div>

                {formData.scheduleDelivery && (
                    <div className="schedule-options">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="deliveryDate">Delivery Date *</label>
                                <input
                                    type="date"
                                    id="deliveryDate"
                                    name="deliveryDate"
                                    value={formData.deliveryDate}
                                    onChange={handleChange}
                                    min={getMinDeliveryDate()}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="deliveryTime">Delivery Time *</label>
                                <select
                                    id="deliveryTime"
                                    name="deliveryTime"
                                    value={formData.deliveryTime}
                                    onChange={handleChange}
                                >
                                    <option value="">Select time slot</option>
                                    {getDeliveryTimeSlots().map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">💳</span>
                    Payment Method
                </h3>

                <div className="payment-methods-grid">
                    <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={handleChange}
                        />
                        <div className="payment-option-content">
                            <span className="payment-icon">💳</span>
                            <div>
                                <div className="payment-title">Credit/Debit Card</div>
                                <div className="payment-description">Pay securely with your card</div>
                            </div>
                        </div>
                    </label>

                    <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="upi"
                            checked={formData.paymentMethod === 'upi'}
                            onChange={handleChange}
                        />
                        <div className="payment-option-content">
                            <span className="payment-icon">📱</span>
                            <div>
                                <div className="payment-title">UPI</div>
                                <div className="payment-description">Google Pay, PhonePe, Paytm</div>
                            </div>
                        </div>
                    </label>

                    <label className={`payment-option ${formData.paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="netbanking"
                            checked={formData.paymentMethod === 'netbanking'}
                            onChange={handleChange}
                        />
                        <div className="payment-option-content">
                            <span className="payment-icon">🏦</span>
                            <div>
                                <div className="payment-title">Net Banking</div>
                                <div className="payment-description">All major banks</div>
                            </div>
                        </div>
                    </label>

                    <label className={`payment-option ${formData.paymentMethod === 'wallet' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="wallet"
                            checked={formData.paymentMethod === 'wallet'}
                            onChange={handleChange}
                        />
                        <div className="payment-option-content">
                            <span className="payment-icon">👛</span>
                            <div>
                                <div className="payment-title">Digital Wallet</div>
                                <div className="payment-description">Paytm, Amazon Pay, Mobikwik</div>
                            </div>
                        </div>
                    </label>

                    <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={handleChange}
                        />
                        <div className="payment-option-content">
                            <span className="payment-icon">💵</span>
                            <div>
                                <div className="payment-title">Cash on Delivery</div>
                                <div className="payment-description">Pay when you receive</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">🎫</span>
                    Apply Coupon
                </h3>
                <div className="coupon-input-group">
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">📝</span>
                    Special Instructions
                </h3>

                <div className="form-group">
                    <label htmlFor="specialInstructions">Restaurant Instructions</label>
                    <textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleChange}
                        placeholder="Any special requests for the restaurant? (e.g., less spicy, no onions, extra sauce)"
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="deliveryInstructions">Delivery Instructions</label>
                    <textarea
                        id="deliveryInstructions"
                        name="deliveryInstructions"
                        value={formData.deliveryInstructions}
                        onChange={handleChange}
                        placeholder="Instructions for the delivery partner (e.g., gate code, floor number)"
                        rows={2}
                    />
                </div>
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">🎁</span>
                    Gift Options
                </h3>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="giftWrap"
                            checked={formData.giftWrap}
                            onChange={handleChange}
                        />
                        <span>Add gift wrapping (+₹20)</span>
                    </label>
                </div>

                {formData.giftWrap && (
                    <div className="form-group">
                        <label htmlFor="giftMessage">Gift Message (Optional)</label>
                        <input
                            type="text"
                            id="giftMessage"
                            name="giftMessage"
                            value={formData.giftMessage}
                            onChange={handleChange}
                            placeholder="Write a heartfelt message"
                            maxLength="100"
                        />
                        <span className="char-count">{formData.giftMessage.length}/100</span>
                    </div>
                )}
            </div>

            <div className="form-section">
                <h3 className="section-title">
                    <span className="section-icon">📧</span>
                    Communication Preferences
                </h3>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="smsUpdates"
                            checked={formData.smsUpdates}
                            onChange={handleChange}
                        />
                        <span>Send SMS updates about my order</span>
                    </label>
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="newsletterOptIn"
                            checked={formData.newsletterOptIn}
                            onChange={handleChange}
                        />
                        <span>Subscribe to newsletters and exclusive offers</span>
                    </label>
                </div>
            </div>

            <div className="form-actions">
                <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    fullWidth
                    isLoading={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Place Order'}
                </Button>
            </div>
        </form>
    );
};

export default CheckoutForm;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import './Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });
    const [upiId, setUpiId] = useState('');
    const [errors, setErrors] = useState({});

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Pay securely with your card' },
        { id: 'upi', name: 'UPI', icon: '📱', description: 'Google Pay, PhonePe, Paytm' },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'All major banks' },
        { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' }
    ];

    const banks = [
        'State Bank of India',
        'HDFC Bank',
        'ICICI Bank',
        'Axis Bank',
        'Kotak Mahindra Bank',
        'Yes Bank',
        'Punjab National Bank'
    ];

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
        }
        if (name === 'expiry') {
            formattedValue = value.replace(/\//g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
        }
        if (name === 'cvv') {
            formattedValue = value.slice(0, 4);
        }

        setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateCard = () => {
        const newErrors = {};

        if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
            newErrors.number = 'Please enter a valid 16-digit card number';
        }
        if (!cardDetails.name) {
            newErrors.name = 'Name on card is required';
        }
        if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
            newErrors.expiry = 'Enter valid expiry date (MM/YY)';
        }
        if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
            newErrors.cvv = 'Enter valid CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateUPI = () => {
        if (!upiId || !/^[\w.-]+@[\w.-]+$/.test(upiId)) {
            setErrors({ upi: 'Please enter a valid UPI ID' });
            return false;
        }
        return true;
    };

    const handlePayment = async () => {
        let isValid = true;

        if (selectedMethod === 'card') {
            isValid = validateCard();
        } else if (selectedMethod === 'upi') {
            isValid = validateUPI();
        }

        if (!isValid) return;

        setIsProcessing(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            navigate('/order-confirmation');
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <h1>Payment</h1>
                    <p>Choose your preferred payment method</p>
                </div>

                <div className="payment-content">
                    {/* Payment Methods */}
                    <div className="payment-methods-section">
                        <h3>Select Payment Method</h3>
                        <div className="payment-methods-list">
                            {paymentMethods.map(method => (
                                <label
                                    key={method.id}
                                    className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={selectedMethod === method.id}
                                        onChange={(e) => setSelectedMethod(e.target.value)}
                                    />
                                    <div className="method-icon">{method.icon}</div>
                                    <div className="method-info">
                                        <div className="method-name">{method.name}</div>
                                        <div className="method-description">{method.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Payment Details Form */}
                    <div className="payment-details-section">
                        {selectedMethod === 'card' && (
                            <div className="card-form">
                                <h3>Card Details</h3>
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input
                                        type="text"
                                        name="number"
                                        value={cardDetails.number}
                                        onChange={handleCardChange}
                                        placeholder="1234 5678 9012 3456"
                                        maxLength="19"
                                        className={errors.number ? 'error' : ''}
                                    />
                                    {errors.number && <span className="error-message">{errors.number}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Name on Card</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={cardDetails.name}
                                        onChange={handleCardChange}
                                        placeholder="As printed on card"
                                        className={errors.name ? 'error' : ''}
                                    />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            value={cardDetails.expiry}
                                            onChange={handleCardChange}
                                            placeholder="MM/YY"
                                            maxLength="5"
                                            className={errors.expiry ? 'error' : ''}
                                        />
                                        {errors.expiry && <span className="error-message">{errors.expiry}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>CVV</label>
                                        <input
                                            type="password"
                                            name="cvv"
                                            value={cardDetails.cvv}
                                            onChange={handleCardChange}
                                            placeholder="123"
                                            maxLength="4"
                                            className={errors.cvv ? 'error' : ''}
                                        />
                                        {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'upi' && (
                            <div className="upi-form">
                                <h3>UPI ID</h3>
                                <div className="form-group">
                                    <label>Enter UPI ID</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="username@bankname"
                                        className={errors.upi ? 'error' : ''}
                                    />
                                    {errors.upi && <span className="error-message">{errors.upi}</span>}
                                    <small>Example: username@okhdfcbank or 9876543210@paytm</small>
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'netbanking' && (
                            <div className="netbanking-form">
                                <h3>Select Bank</h3>
                                <div className="form-group">
                                    <select>
                                        <option value="">Select your bank</option>
                                        {banks.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {selectedMethod === 'cod' && (
                            <div className="cod-info">
                                <div className="info-icon">💵</div>
                                <h3>Cash on Delivery</h3>
                                <p>Pay with cash when your order arrives at your doorstep.</p>
                                <div className="cod-note">
                                    <span className="note-icon">ℹ️</span>
                                    <span>Please keep exact change ready for smoother delivery</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="payment-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹420</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax (5% GST)</span>
                                <span>₹21</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Fee</span>
                                <span>₹9</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Amount</span>
                                <span>₹450</span>
                            </div>
                        </div>
                    </div>

                    {/* Secure Payment Note */}
                    <div className="secure-note">
                        <div className="secure-icon">🔒</div>
                        <div>
                            <div className="secure-title">Secure Payment</div>
                            <div className="secure-text">Your payment information is encrypted and secure</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="payment-actions">
                        <Button
                            variant="primary"
                            size="large"
                            fullWidth
                            onClick={handlePayment}
                            isLoading={isProcessing}
                        >
                            Pay ₹450
                        </Button>
                        <Button
                            variant="outline"
                            size="large"
                            fullWidth
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
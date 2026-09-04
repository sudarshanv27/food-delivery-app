import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import CheckoutForm from '../../components/cart/CheckoutForm';
import { OrderSummary } from '../../components/cart/CartSummary';
import Button from '../../components/common/Button';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, clearCart, totalAmount } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(1);
    const [orderData, setOrderData] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
        fetchSavedAddresses();
    }, [cartItems, navigate]);

    const fetchSavedAddresses = async () => {
        // Simulate fetching saved addresses
        const mockAddresses = [
            {
                id: 1,
                name: 'Home',
                fullName: 'John Doe',
                phone: '1234567890',
                street: '123 Main Street',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                landmark: 'Near Central Park',
                isDefault: true
            },
            {
                id: 2,
                name: 'Office',
                fullName: 'John Doe',
                phone: '0987654321',
                street: '456 Business Ave',
                city: 'New York',
                state: 'NY',
                zipCode: '10002',
                landmark: 'Near Times Square',
                isDefault: false
            }
        ];
        setSavedAddresses(mockAddresses);
        setSelectedAddress(mockAddresses.find(a => a.isDefault) || mockAddresses[0]);
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
    };

    const handleAddNewAddress = () => {
        setStep(2);
    };

    const handleSubmitOrder = async (formData) => {
        setIsProcessing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            const order = {
                id: 'ORD-' + Date.now(),
                items: cartItems,
                total: totalAmount,
                address: selectedAddress || formData,
                paymentMethod: formData.paymentMethod,
                status: 'confirmed',
                date: new Date().toISOString()
            };

            setOrderData(order);
            await clearCart();
            setStep(3);
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Proceed to next step or order confirmation
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0 && step !== 3) {
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Progress Steps */}
                <div className="checkout-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Address</div>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Payment</div>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <div className="step-label">Confirm</div>
                    </div>
                </div>

                <div className="checkout-content">
                    {/* Step 1: Address Selection */}
                    {step === 1 && (
                        <div className="checkout-step">
                            <div className="step-title">Select Delivery Address</div>

                            {savedAddresses.length > 0 && (
                                <div className="saved-addresses">
                                    <h4>Saved Addresses</h4>
                                    <div className="address-list">
                                        {savedAddresses.map(address => (
                                            <div
                                                key={address.id}
                                                className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                                                onClick={() => handleAddressSelect(address)}
                                            >
                                                <div className="address-radio">
                                                    <input
                                                        type="radio"
                                                        checked={selectedAddress?.id === address.id}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="address-details">
                                                    <div className="address-name">{address.name}</div>
                                                    <div className="address-text">
                                                        {address.street}, {address.city}, {address.state} - {address.zipCode}
                                                    </div>
                                                    {address.landmark && (
                                                        <div className="address-landmark">📍 {address.landmark}</div>
                                                    )}
                                                    <div className="address-contact">
                                                        📞 {address.phone} • 👤 {address.fullName}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="new-address-btn" onClick={handleAddNewAddress}>
                                        + Add New Address
                                    </button>
                                </div>
                            )}

                            <div className="step-actions">
                                <Button
                                    variant="primary"
                                    onClick={() => setStep(2)}
                                    disabled={!selectedAddress}
                                >
                                    Continue to Payment
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <div className="checkout-step">
                            <div className="step-title">Payment Method</div>

                            <CheckoutForm
                                onSubmit={handleSubmitOrder}
                                initialData={selectedAddress}
                                isLoading={isProcessing}
                            />
                        </div>
                    )}

                    {/* Step 3: Order Confirmation */}
                    {step === 3 && orderData && (
                        <div className="checkout-step confirmation-step">
                            <div className="confirmation-icon">✅</div>
                            <div className="confirmation-title">Order Placed Successfully!</div>
                            <div className="confirmation-message">
                                Thank you for your order! Your food will be delivered soon.
                            </div>

                            <div className="order-details-summary">
                                <div className="order-number">Order #{orderData.id}</div>
                                <div className="order-total">Total: ₹{orderData.total}</div>
                            </div>

                            <div className="delivery-estimate">
                                <div className="estimate-icon">⏱️</div>
                                <div>
                                    <div className="estimate-label">Estimated Delivery Time</div>
                                    <div className="estimate-value">25-35 minutes</div>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/orders')}
                                >
                                    View My Orders
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                {step !== 3 && (
                    <div className="checkout-sidebar">
                        <OrderSummary cart={{ items: cartItems }} showDetails={true} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
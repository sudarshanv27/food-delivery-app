import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';
import './UserPaymentMethods.css';

const UserPaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        type: 'card',
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false,
        upiId: '',
        bankName: '',
        accountNumber: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockPaymentMethods = [
                {
                    id: 1,
                    type: 'card',
                    last4: '4242',
                    cardName: 'John Doe',
                    expiryMonth: '12',
                    expiryYear: '2025',
                    isDefault: true,
                    brand: 'visa'
                },
                {
                    id: 2,
                    type: 'upi',
                    upiId: 'john@okhdfcbank',
                    isDefault: false
                }
            ];
            setPaymentMethods(mockPaymentMethods);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateCardForm = () => {
        const newErrors = {};

        if (!formData.cardNumber) {
            newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = 'Invalid card number';
        }

        if (!formData.cardName) {
            newErrors.cardName = 'Name on card is required';
        }

        if (!formData.expiryMonth) {
            newErrors.expiryMonth = 'Expiry month is required';
        }

        if (!formData.expiryYear) {
            newErrors.expiryYear = 'Expiry year is required';
        }

        if (!formData.cvv) {
            newErrors.cvv = 'CVV is required';
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = 'Invalid CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateUPIForm = () => {
        const newErrors = {};

        if (!formData.upiId) {
            newErrors.upiId = 'UPI ID is required';
        } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
            newErrors.upiId = 'Invalid UPI ID format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'cardNumber') {
            // Format card number with spaces
            const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = false;
        if (formData.type === 'card') {
            isValid = validateCardForm();
        } else {
            isValid = validateUPIForm();
        }

        if (!isValid) return;

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (editingCard) {
                setPaymentMethods(prev => prev.map(method =>
                    method.id === editingCard.id ? { ...formData, id: method.id } : method
                ));
            } else {
                const newMethod = {
                    id: Date.now(),
                    ...formData,
                    last4: formData.cardNumber?.slice(-4)
                };
                setPaymentMethods(prev => [...prev, newMethod]);
            }

            setShowCardModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving payment method:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setPaymentMethods(prev => prev.filter(method => method.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting payment method:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetDefault = async (methodId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setPaymentMethods(prev => prev.map(method => ({
                ...method,
                isDefault: method.id === methodId
            })));
        } catch (error) {
            console.error('Error setting default payment method:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'card',
            cardNumber: '',
            cardName: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            isDefault: false,
            upiId: '',
            bankName: '',
            accountNumber: ''
        });
        setEditingCard(null);
        setErrors({});
    };

    const getCardBrandIcon = (brand, last4) => {
        const brandIcons = {
            visa: '💳',
            mastercard: '💳',
            amex: '💳',
            rupay: '💳'
        };
        return brandIcons[brand] || '💳';
    };

    const getCurrentYear = () => new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 10 }, (_, i) => getCurrentYear() + i);

    return (
        <div className="payment-methods">
            <div className="payment-header">
                <h2>Payment Methods</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        resetForm();
                        setShowCardModal(true);
                    }}
                >
                    + Add Payment Method
                </Button>
            </div>

            {isLoading && paymentMethods.length === 0 ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading payment methods...</p>
                </div>
            ) : paymentMethods.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💳</div>
                    <h3>No Payment Methods</h3>
                    <p>Add a payment method to make ordering faster and easier</p>
                    <Button
                        variant="primary"
                        onClick={() => {
                            resetForm();
                            setShowCardModal(true);
                        }}
                    >
                        Add Payment Method
                    </Button>
                </div>
            ) : (
                <div className="payment-methods-list">
                    {paymentMethods.map((method) => (
                        <div key={method.id} className={`payment-card ${method.isDefault ? 'default' : ''}`}>
                            {method.isDefault && <span className="default-badge">Default</span>}

                            <div className="payment-card-header">
                                <div className="payment-type">
                                    <span className="payment-icon">
                                        {method.type === 'card' ? getCardBrandIcon(method.brand, method.last4) : '📱'}
                                    </span>
                                    <span className="payment-type-name">
                                        {method.type === 'card' ? 'Credit/Debit Card' : 'UPI'}
                                    </span>
                                </div>
                                <div className="payment-actions">
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => setDeleteConfirm(method)}
                                        aria-label="Delete payment method"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div className="payment-card-body">
                                {method.type === 'card' ? (
                                    <>
                                        <p className="card-number">•••• •••• •••• {method.last4}</p>
                                        <p className="card-name">{method.cardName}</p>
                                        <p className="card-expiry">Expires: {method.expiryMonth}/{method.expiryYear}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="upi-id">{method.upiId}</p>
                                    </>
                                )}
                            </div>

                            <div className="payment-card-footer">
                                {!method.isDefault && (
                                    <button
                                        className="set-default-btn"
                                        onClick={() => handleSetDefault(method.id)}
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Payment Method Modal */}
            <Modal
                isOpen={showCardModal}
                onClose={() => setShowCardModal(false)}
                title={editingCard ? 'Edit Payment Method' : 'Add Payment Method'}
                size="medium"
            >
                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="payment-type-selector">
                        <label className={`type-option ${formData.type === 'card' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="card"
                                checked={formData.type === 'card'}
                                onChange={handleChange}
                            />
                            <span className="type-icon">💳</span>
                            <span>Credit/Debit Card</span>
                        </label>
                        <label className={`type-option ${formData.type === 'upi' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="type"
                                value="upi"
                                checked={formData.type === 'upi'}
                                onChange={handleChange}
                            />
                            <span className="type-icon">📱</span>
                            <span>UPI</span>
                        </label>
                    </div>

                    {formData.type === 'card' ? (
                        <>
                            <div className="form-group">
                                <label>Card Number *</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    className={errors.cardNumber ? 'error' : ''}
                                />
                                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                            </div>

                            <div className="form-group">
                                <label>Name on Card *</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={formData.cardName}
                                    onChange={handleChange}
                                    placeholder="As printed on card"
                                    className={errors.cardName ? 'error' : ''}
                                />
                                {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry Month *</label>
                                    <select
                                        name="expiryMonth"
                                        value={formData.expiryMonth}
                                        onChange={handleChange}
                                        className={errors.expiryMonth ? 'error' : ''}
                                    >
                                        <option value="">Month</option>
                                        {months.map(month => (
                                            <option key={month} value={month.toString().padStart(2, '0')}>
                                                {month.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.expiryMonth && <span className="error-message">{errors.expiryMonth}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Expiry Year *</label>
                                    <select
                                        name="expiryYear"
                                        value={formData.expiryYear}
                                        onChange={handleChange}
                                        className={errors.expiryYear ? 'error' : ''}
                                    >
                                        <option value="">Year</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    {errors.expiryYear && <span className="error-message">{errors.expiryYear}</span>}
                                </div>

                                <div className="form-group">
                                    <label>CVV *</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleChange}
                                        placeholder="123"
                                        maxLength="4"
                                        className={errors.cvv ? 'error' : ''}
                                    />
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label>UPI ID *</label>
                            <input
                                type="text"
                                name="upiId"
                                value={formData.upiId}
                                onChange={handleChange}
                                placeholder="username@bankname"
                                className={errors.upiId ? 'error' : ''}
                            />
                            {errors.upiId && <span className="error-message">{errors.upiId}</span>}
                            <small className="helper-text">Example: username@okhdfcbank or mobilenumber@paytm</small>
                        </div>
                    )}

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                            Set as default payment method
                        </label>
                    </div>

                    <div className="secure-note">
                        <span className="secure-icon">🔒</span>
                        <span>Your payment information is secure and encrypted</span>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            {editingCard ? 'Update' : 'Add'} Payment Method
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCardModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Delete Payment Method"
                message={`Are you sure you want to delete this payment method?`}
                confirmText="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserPaymentMethods;
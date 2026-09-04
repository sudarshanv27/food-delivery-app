// src/components/profile/UserPaymentMethods.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UserPaymentMethods.css';

const UserPaymentMethods = ({
    onMethodSelect,
    selectable = false,
    showDefaultBadge = true,
    enableAddNew = true,
    maxMethods = 5,
    variant = 'default' // 'default', 'compact', 'detailed'
}) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);
    const [selectedMethodId, setSelectedMethodId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [formData, setFormData] = useState({
        type: 'card',
        card_number: '',
        card_holder: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        upi_id: '',
        bank_name: '',
        save_for_future: true,
        is_default: false,
        nickname: ''
    });

    const fetchPaymentMethods = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/users/payment-methods', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const methods = response.data.data || response.data.payment_methods || [];
            setPaymentMethods(methods);

            // Auto-select default method if in selectable mode
            if (selectable && methods.length > 0 && !selectedMethodId) {
                const defaultMethod = methods.find(m => m.is_default);
                if (defaultMethod) {
                    setSelectedMethodId(defaultMethod.id);
                    if (onMethodSelect) onMethodSelect(defaultMethod);
                }
            }

            // Fetch recent transactions
            fetchRecentTransactions();
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            const mockMethods = generateMockMethods();
            setPaymentMethods(mockMethods);
            setRecentTransactions(generateMockTransactions());
            toast.error('Using demo data. API not available.', { duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [selectable, selectedMethodId, onMethodSelect]);

    const fetchRecentTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/users/recent-transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentTransactions(response.data.data || []);
        } catch (error) {
            // Mock data
            setRecentTransactions(generateMockTransactions());
        }
    };

    const generateMockMethods = () => {
        return [
            {
                id: 1,
                type: 'card',
                last4: '4242',
                card_holder: 'John Doe',
                expiry_month: '12',
                expiry_year: '2025',
                brand: 'visa',
                is_default: true,
                nickname: 'Primary Visa',
                created_at: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                type: 'card',
                last4: '5555',
                card_holder: 'John Doe',
                expiry_month: '08',
                expiry_year: '2026',
                brand: 'mastercard',
                is_default: false,
                nickname: 'Mastercard',
                created_at: '2024-02-20T14:45:00Z'
            },
            {
                id: 3,
                type: 'upi',
                upi_id: 'john@okhdfcbank',
                is_default: false,
                nickname: 'HDFC UPI',
                created_at: '2024-03-10T09:15:00Z'
            }
        ];
    };

    const generateMockTransactions = () => {
        return [
            { id: 1, amount: 450, merchant: 'Pizza Hut', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'success', method_id: 1 },
            { id: 2, amount: 799, merchant: 'McDonalds', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'success', method_id: 1 },
            { id: 3, amount: 299, merchant: 'Starbucks', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: 'success', method_id: 3 }
        ];
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    const validateCardDetails = () => {
        const errors = {};

        if (!formData.card_number) {
            errors.card_number = 'Card number is required';
        } else if (formData.card_number.replace(/\s/g, '').length !== 16) {
            errors.card_number = 'Please enter a valid 16-digit card number';
        }

        if (!formData.card_holder) {
            errors.card_holder = 'Card holder name is required';
        }

        if (!formData.expiry_month) {
            errors.expiry_month = 'Expiry month is required';
        }

        if (!formData.expiry_year) {
            errors.expiry_year = 'Expiry year is required';
        }

        // Check if card is expired
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (formData.expiry_year && formData.expiry_month) {
            const expYear = parseInt(formData.expiry_year);
            const expMonth = parseInt(formData.expiry_month);
            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                errors.expiry_date = 'Card has expired';
            }
        }

        if (!formData.cvv) {
            errors.cvv = 'CVV is required';
        } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
            errors.cvv = 'Please enter a valid CVV';
        }

        return errors;
    };

    const validateUpiDetails = () => {
        const errors = {};

        if (!formData.upi_id) {
            errors.upi_id = 'UPI ID is required';
        } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upi_id)) {
            errors.upi_id = 'Please enter a valid UPI ID (e.g., username@bankname)';
        }

        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const detectCardBrand = (cardNumber) => {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'amex';
        if (/^6(?:011|5)/.test(cleaned)) return 'discover';
        if (/^352[8-9]|^35[3-8][0-9]/.test(cleaned)) return 'jcb';
        if (/^508[5-9]|^6069|^607|^608|^609|^6036|^6040|^6042|^6044|^6046|^6048|^6050|^6052|^6054|^6056|^6058|^6060|^6062|^6064|^6066|^6068|^6070|^6072|^6074|^6076|^6078|^6080|^6082|^6084|^6086|^6088|^6090|^6092|^6094|^6096|^6098|^6100|^6102|^6104|^6106|^6108|^6110|^6112|^6114|^6116|^6118|^6120|^6122|^6124|^6126|^6128|^6130|^6132|^6134|^6136|^6138|^6140|^6142|^6144|^6146|^6148|^6150|^6152|^6154|^6156|^6158|^6160|^6162|^6164|^6166|^6168|^6170|^6172|^6174|^6176|^6178|^6180|^6182|^6184|^6186|^6188|^6190|^6192|^6194|^6196|^6198|^6200/.test(cleaned)) return 'rupay';
        return 'unknown';
    };

    const getCardBrandIcon = (brand) => {
        const brands = {
            visa: { icon: '💳', name: 'Visa', color: '#1A1F71', bgColor: '#1A1F7110' },
            mastercard: { icon: '💳', name: 'Mastercard', color: '#EB001B', bgColor: '#EB001B10' },
            amex: { icon: '💳', name: 'American Express', color: '#2E77BC', bgColor: '#2E77BC10' },
            rupay: { icon: '💳', name: 'RuPay', color: '#1C7E3A', bgColor: '#1C7E3A10' },
            discover: { icon: '💳', name: 'Discover', color: '#FF6600', bgColor: '#FF660010' },
            jcb: { icon: '💳', name: 'JCB', color: '#1A8C47', bgColor: '#1A8C4710' },
            unknown: { icon: '💳', name: 'Card', color: '#666', bgColor: '#666610' }
        };
        return brands[brand] || brands.unknown;
    };

    const getPaymentIcon = (type) => {
        const icons = {
            card: '💳',
            upi: '📱',
            netbanking: '🏦',
            wallet: '👛'
        };
        return icons[type] || '💰';
    };

    const getPaymentTypeText = (type) => {
        const texts = {
            card: 'Credit/Debit Card',
            upi: 'UPI ID',
            netbanking: 'Net Banking',
            wallet: 'Digital Wallet'
        };
        return texts[type] || 'Payment Method';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let errors = {};
        if (formData.type === 'card') {
            errors = validateCardDetails();
        } else if (formData.type === 'upi') {
            errors = validateUpiDetails();
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            let submitData = { ...formData };

            if (editingMethod && formData.type === 'card') {
                delete submitData.cvv;
                delete submitData.card_number;
            }

            if (formData.type === 'card' && submitData.card_number) {
                submitData.card_number = submitData.card_number.replace(/\s/g, '');
                submitData.brand = detectCardBrand(submitData.card_number);
            }

            if (editingMethod) {
                await axios.put(`/api/users/payment-methods/${editingMethod.id}`, submitData, config);
                toast.success('Payment method updated successfully');
            } else {
                await axios.post('/api/users/payment-methods', submitData, config);
                toast.success('Payment method added successfully');
            }

            await fetchPaymentMethods();
            resetForm();
        } catch (error) {
            console.error('Error saving payment method:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save payment method';
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (methodId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/payment-methods/${methodId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Payment method removed successfully');

            if (selectedMethodId === methodId) {
                setSelectedMethodId(null);
                if (onMethodSelect) onMethodSelect(null);
            }

            await fetchPaymentMethods();
            setShowConfirmDelete(null);
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast.error(error.response?.data?.message || 'Failed to delete payment method');
        }
    };

    const handleSetDefault = async (methodId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/users/payment-methods/${methodId}/default`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Default payment method updated');
            await fetchPaymentMethods();
        } catch (error) {
            console.error('Error setting default payment method:', error);
            toast.error(error.response?.data?.message || 'Failed to set default payment method');
        }
    };

    const handleMethodSelect = (method) => {
        setSelectedMethodId(method.id);
        if (onMethodSelect) {
            onMethodSelect(method);
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setEditingMethod(null);
        setFormErrors({});
        setFormData({
            type: 'card',
            card_number: '',
            card_holder: '',
            expiry_month: '',
            expiry_year: '',
            cvv: '',
            upi_id: '',
            bank_name: '',
            save_for_future: true,
            is_default: false,
            nickname: ''
        });
    };

    const editMethod = (method) => {
        setEditingMethod(method);
        if (method.type === 'card') {
            setFormData({
                type: 'card',
                card_number: '',
                card_holder: method.card_holder || '',
                expiry_month: method.expiry_month || '',
                expiry_year: method.expiry_year || '',
                cvv: '',
                upi_id: '',
                bank_name: '',
                save_for_future: true,
                is_default: method.is_default || false,
                nickname: method.nickname || ''
            });
        } else if (method.type === 'upi') {
            setFormData({
                type: 'upi',
                card_number: '',
                card_holder: '',
                expiry_month: '',
                expiry_year: '',
                cvv: '',
                upi_id: method.upi_id || '',
                bank_name: '',
                save_for_future: true,
                is_default: method.is_default || false,
                nickname: method.nickname || ''
            });
        }
        setShowAddForm(true);
        setShowCardDetails(false);
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        }
        return value;
    };

    const getMethodTransactions = (methodId) => {
        return recentTransactions.filter(t => t.method_id === methodId).slice(0, 3);
    };

    const formatDate = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    if (loading) {
        return (
            <div className="payment-methods-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading payment methods...</p>
            </div>
        );
    }

    const isCompact = variant === 'compact';

    return (
        <div className={`user-payment-methods ${variant}`}>
            {/* Header */}
            <div className="payment-methods-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">💳</span>
                        Payment Methods
                        <span className="method-count">{paymentMethods.length}/{maxMethods}</span>
                    </h2>
                </div>
                {enableAddNew && !selectable && paymentMethods.length < maxMethods && (
                    <button onClick={() => setShowAddForm(true)} className="add-payment-btn">
                        <span className="btn-icon">+</span>
                        Add Payment Method
                    </button>
                )}
            </div>

            {/* Payment Methods List */}
            {paymentMethods.length === 0 ? (
                <div className="no-payment-methods">
                    <div className="empty-state-animation">
                        <div className="empty-icon">💳</div>
                    </div>
                    <h3>No Payment Methods</h3>
                    <p>Add a payment method for faster checkout</p>
                    {enableAddNew && !selectable && (
                        <button onClick={() => setShowAddForm(true)} className="add-first-btn">
                            + Add Your First Payment Method
                        </button>
                    )}
                </div>
            ) : (
                <div className={`payment-methods-list ${isCompact ? 'compact' : ''}`}>
                    {paymentMethods.map(method => {
                        const cardBrand = method.type === 'card' ? getCardBrandIcon(method.brand) : null;
                        const isSelected = selectable && selectedMethodId === method.id;
                        const transactions = getMethodTransactions(method.id);
                        const isExpired = method.type === 'card' && method.expiry_year && method.expiry_month
                            ? new Date() > new Date(method.expiry_year, method.expiry_month - 1)
                            : false;

                        return (
                            <div
                                key={method.id}
                                className={`payment-card ${method.is_default ? 'default' : ''} ${isSelected ? 'selected' : ''} ${selectable ? 'selectable' : ''} ${isExpired ? 'expired' : ''}`}
                                onClick={() => selectable && handleMethodSelect(method)}
                            >
                                {/* Card Header */}
                                <div className="payment-card-header">
                                    <div className="payment-type">
                                        <span className="payment-icon">{getPaymentIcon(method.type)}</span>
                                        <div>
                                            <span className="payment-type-text">
                                                {getPaymentTypeText(method.type)}
                                            </span>
                                            {method.nickname && (
                                                <span className="payment-nickname">{method.nickname}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="payment-badges">
                                        {isExpired && (
                                            <span className="expired-badge">Expired</span>
                                        )}
                                        {showDefaultBadge && method.is_default && (
                                            <span className="default-badge">✓ Default</span>
                                        )}
                                        {isSelected && (
                                            <span className="selected-badge">✓ Selected</span>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="payment-details">
                                    {method.type === 'card' && (
                                        <div className="card-info" style={{ background: cardBrand?.bgColor }}>
                                            <div className="card-brand-row">
                                                <div className="card-brand" style={{ color: cardBrand?.color }}>
                                                    {cardBrand?.icon} {cardBrand?.name}
                                                </div>
                                                <div className="card-chip">💳</div>
                                            </div>
                                            <div className="card-number">
                                                •••• •••• •••• {method.last4}
                                            </div>
                                            <div className="card-holder-row">
                                                <div className="card-holder-label">Card Holder</div>
                                                <div className="card-holder">{method.card_holder}</div>
                                            </div>
                                            <div className="card-expiry-row">
                                                <div className="expiry-label">Expires</div>
                                                <div className="expiry-date">
                                                    {method.expiry_month}/{method.expiry_year}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {method.type === 'upi' && (
                                        <div className="upi-info">
                                            <div className="upi-id">
                                                <span className="upi-icon">📱</span>
                                                <span className="upi-value">{method.upi_id}</span>
                                            </div>
                                            <div className="upi-note">
                                                *Verify with your UPI app
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Recent Transactions */}
                                {transactions.length > 0 && !isCompact && (
                                    <div className="recent-transactions">
                                        <div className="transactions-header">
                                            <span className="transactions-icon">🕐</span>
                                            <span>Recent Transactions</span>
                                        </div>
                                        {transactions.map(tx => (
                                            <div key={tx.id} className="transaction-item">
                                                <div className="tx-merchant">{tx.merchant}</div>
                                                <div className="tx-details">
                                                    <span className="tx-amount">₹{tx.amount}</span>
                                                    <span className="tx-date">{formatDate(tx.date)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Card Footer */}
                                <div className="payment-card-footer">
                                    <div className="payment-meta">
                                        <span className="meta-item">
                                            Added {new Date(method.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {!selectable && (
                                        <div className="payment-actions">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    editMethod(method);
                                                }}
                                                className="edit-payment-btn"
                                                title="Edit payment method"
                                            >
                                                ✏️ Edit
                                            </button>
                                            {!method.is_default && !isExpired && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetDefault(method.id);
                                                    }}
                                                    className="set-default-payment-btn"
                                                    title="Set as default"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowConfirmDelete(method.id);
                                                }}
                                                className="delete-payment-btn"
                                                title="Delete payment method"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Payment Method Modal */}
            {(showAddForm || editingMethod) && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <span className="modal-icon">{editingMethod ? '✏️' : '➕'}</span>
                                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                            </h3>
                            <button className="close-modal" onClick={resetForm}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="payment-form">
                            {/* Payment Type Selection */}
                            <div className="form-group">
                                <label>Payment Type</label>
                                <div className="payment-type-buttons">
                                    <button
                                        type="button"
                                        className={`type-btn ${formData.type === 'card' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'card' })}
                                    >
                                        💳 Card
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn ${formData.type === 'upi' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'upi' })}
                                    >
                                        📱 UPI
                                    </button>
                                </div>
                            </div>

                            {/* Nickname */}
                            <div className="form-group">
                                <label>Nickname (Optional)</label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Primary Visa, Office Card"
                                />
                            </div>

                            {formData.type === 'card' && (
                                <>
                                    <div className="form-group">
                                        <label>Card Number *</label>
                                        <div className="card-input-wrapper">
                                            <input
                                                type="text"
                                                name="card_number"
                                                value={formData.card_number}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    card_number: formatCardNumber(e.target.value)
                                                })}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                className={formErrors.card_number ? 'error' : ''}
                                                disabled={!!editingMethod}
                                            />
                                            {formData.card_number && detectCardBrand(formData.card_number) !== 'unknown' && (
                                                <div className="card-brand-indicator">
                                                    {getCardBrandIcon(detectCardBrand(formData.card_number)).icon}
                                                </div>
                                            )}
                                        </div>
                                        {formErrors.card_number && <span className="error-message">{formErrors.card_number}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Card Holder Name *</label>
                                        <input
                                            type="text"
                                            name="card_holder"
                                            value={formData.card_holder}
                                            onChange={handleInputChange}
                                            placeholder="As printed on card"
                                            className={formErrors.card_holder ? 'error' : ''}
                                        />
                                        {formErrors.card_holder && <span className="error-message">{formErrors.card_holder}</span>}
                                    </div>

                                    <div className="form-row three-col">
                                        <div className="form-group">
                                            <label>Expiry Month</label>
                                            <select
                                                name="expiry_month"
                                                value={formData.expiry_month}
                                                onChange={handleInputChange}
                                                className={formErrors.expiry_month ? 'error' : ''}
                                            >
                                                <option value="">Month</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                                        {month.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Expiry Year</label>
                                            <select
                                                name="expiry_year"
                                                value={formData.expiry_year}
                                                onChange={handleInputChange}
                                                className={formErrors.expiry_year ? 'error' : ''}
                                            >
                                                <option value="">Year</option>
                                                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>CVV</label>
                                            <div className="cvv-wrapper">
                                                <input
                                                    type={showCardDetails ? "text" : "password"}
                                                    name="cvv"
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    placeholder="123"
                                                    maxLength="4"
                                                    className={formErrors.cvv ? 'error' : ''}
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-cvv"
                                                    onClick={() => setShowCardDetails(!showCardDetails)}
                                                >
                                                    {showCardDetails ? '🙈' : '👁️'}
                                                </button>
                                            </div>
                                            {formErrors.cvv && <span className="error-message">{formErrors.cvv}</span>}
                                        </div>
                                    </div>
                                    {formErrors.expiry_date && <span className="error-message">{formErrors.expiry_date}</span>}
                                </>
                            )}

                            {formData.type === 'upi' && (
                                <div className="form-group">
                                    <label>UPI ID *</label>
                                    <input
                                        type="text"
                                        name="upi_id"
                                        value={formData.upi_id}
                                        onChange={handleInputChange}
                                        placeholder="username@bankname"
                                        className={formErrors.upi_id ? 'error' : ''}
                                    />
                                    {formErrors.upi_id && <span className="error-message">{formErrors.upi_id}</span>}
                                    <small className="form-hint">Example: john@okhdfcbank, 9876543210@paytm</small>
                                </div>
                            )}

                            {/* Save for Future */}
                            {!editingMethod && (
                                <div className="form-group checkbox">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="save_for_future"
                                            checked={formData.save_for_future}
                                            onChange={handleInputChange}
                                        />
                                        <span className="checkbox-custom"></span>
                                        <span>Save this payment method for future purchases</span>
                                    </label>
                                </div>
                            )}

                            {/* Set as Default */}
                            <div className="form-group checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="is_default"
                                        checked={formData.is_default}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span>Set as default payment method</span>
                                </label>
                            </div>

                            {/* Security Note */}
                            <div className="security-note">
                                <span className="security-icon">🔒</span>
                                <span>Your payment information is encrypted and secure</span>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingMethod ? 'Update' : 'Add'} Payment Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {showConfirmDelete && (
                <div className="modal-overlay" onClick={() => setShowConfirmDelete(null)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon">⚠️</div>
                        <h3>Delete Payment Method?</h3>
                        <p>This action cannot be undone. This payment method will be permanently removed.</p>
                        <div className="confirm-modal-actions">
                            <button onClick={() => setShowConfirmDelete(null)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(showConfirmDelete)} className="delete-confirm-btn">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPaymentMethods;
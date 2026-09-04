// frontend/src/services/paymentService.js
import API from './api';

// ================= PAYMENT SERVICE =================
const paymentService = {
    // ================= PAYMENT INITIATION =================

    /**
     * Initialize a payment transaction
     * @param {Object} paymentData - Payment details
     * @returns {Promise}
     */
    initPayment: async (paymentData) => {
        try {
            const response = await API.post('/payments/initiate', paymentData);

            return {
                success: response.data.success,
                message: response.data.message,
                payment_id: response.data.payment_id,
                order_id: response.data.order_id,
                amount: response.data.amount,
                razorpay_order_id: response.data.razorpay_order_id,
                razorpay_key: response.data.razorpay_key
            };
        } catch (error) {
            console.error('Init Payment Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to initiate payment',
                error: error.response?.data?.error
            };
        }
    },

    /**
     * Verify payment after successful transaction
     * @param {Object} verificationData - Payment verification details
     * @returns {Promise}
     */
    verifyPayment: async (verificationData) => {
        try {
            const response = await API.post('/payments/verify', verificationData);

            return {
                success: response.data.success,
                message: response.data.message,
                payment_status: response.data.payment_status,
                order_id: response.data.order_id
            };
        } catch (error) {
            console.error('Verify Payment Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Payment verification failed'
            };
        }
    },

    // ================= PAYMENT METHODS =================

    /**
     * Get all saved payment methods for the user
     * @returns {Promise}
     */
    getPaymentMethods: async () => {
        try {
            const response = await API.get('/users/payment-methods');

            return {
                success: response.data.success,
                methods: response.data.data || [],
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Payment Methods Error:', error);
            return {
                success: false,
                methods: [],
                message: error.response?.data?.message || 'Failed to fetch payment methods'
            };
        }
    },

    /**
     * Add a new payment method
     * @param {Object} paymentMethod - Payment method details
     * @returns {Promise}
     */
    addPaymentMethod: async (paymentMethod) => {
        try {
            const response = await API.post('/users/payment-methods', paymentMethod);

            return {
                success: response.data.success,
                method: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Add Payment Method Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add payment method'
            };
        }
    },

    /**
     * Update an existing payment method
     * @param {string} methodId - Payment method ID
     * @param {Object} paymentMethod - Updated payment method details
     * @returns {Promise}
     */
    updatePaymentMethod: async (methodId, paymentMethod) => {
        try {
            const response = await API.put(`/users/payment-methods/${methodId}`, paymentMethod);

            return {
                success: response.data.success,
                method: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Update Payment Method Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update payment method'
            };
        }
    },

    /**
     * Delete a payment method
     * @param {string} methodId - Payment method ID
     * @returns {Promise}
     */
    deletePaymentMethod: async (methodId) => {
        try {
            const response = await API.delete(`/users/payment-methods/${methodId}`);

            return {
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            console.error('Delete Payment Method Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete payment method'
            };
        }
    },

    /**
     * Set a payment method as default
     * @param {string} methodId - Payment method ID
     * @returns {Promise}
     */
    setDefaultPaymentMethod: async (methodId) => {
        try {
            const response = await API.put(`/users/payment-methods/${methodId}/default`);

            return {
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            console.error('Set Default Payment Method Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to set default payment method'
            };
        }
    },

    // ================= PAYMENT HISTORY =================

    /**
     * Get payment history for the user
     * @param {Object} params - Query parameters (page, limit, status)
     * @returns {Promise}
     */
    getPaymentHistory: async (params = {}) => {
        try {
            const response = await API.get('/payments/history', { params });

            return {
                success: response.data.success,
                payments: response.data.data || [],
                pagination: response.data.pagination,
                total: response.data.total,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Payment History Error:', error);
            return {
                success: false,
                payments: [],
                message: error.response?.data?.message || 'Failed to fetch payment history'
            };
        }
    },

    /**
     * Get payment details by ID
     * @param {string} paymentId - Payment ID
     * @returns {Promise}
     */
    getPaymentDetails: async (paymentId) => {
        try {
            const response = await API.get(`/payments/${paymentId}`);

            return {
                success: response.data.success,
                payment: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Payment Details Error:', error);
            return {
                success: false,
                payment: null,
                message: error.response?.data?.message || 'Payment not found'
            };
        }
    },

    // ================= REFUNDS =================

    /**
     * Request a refund for a payment
     * @param {string} paymentId - Payment ID
     * @param {string} reason - Refund reason
     * @returns {Promise}
     */
    requestRefund: async (paymentId, reason) => {
        try {
            const response = await API.post(`/payments/${paymentId}/refund`, { reason });

            return {
                success: response.data.success,
                refund_id: response.data.refund_id,
                amount: response.data.amount,
                message: response.data.message
            };
        } catch (error) {
            console.error('Request Refund Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to request refund'
            };
        }
    },

    /**
     * Get refund status
     * @param {string} refundId - Refund ID
     * @returns {Promise}
     */
    getRefundStatus: async (refundId) => {
        try {
            const response = await API.get(`/payments/refunds/${refundId}`);

            return {
                success: response.data.success,
                status: response.data.status,
                amount: response.data.amount,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Refund Status Error:', error);
            return {
                success: false,
                status: null,
                message: error.response?.data?.message || 'Failed to get refund status'
            };
        }
    },

    // ================= WALLET / BALANCE =================

    /**
     * Get user's wallet balance
     * @returns {Promise}
     */
    getWalletBalance: async () => {
        try {
            const response = await API.get('/payments/wallet');

            return {
                success: response.data.success,
                balance: response.data.balance || 0,
                currency: response.data.currency || 'INR',
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Wallet Balance Error:', error);
            return {
                success: false,
                balance: 0,
                message: error.response?.data?.message || 'Failed to fetch wallet balance'
            };
        }
    },

    /**
     * Add money to wallet
     * @param {number} amount - Amount to add
     * @param {string} paymentMethod - Payment method ID
     * @returns {Promise}
     */
    addToWallet: async (amount, paymentMethod) => {
        try {
            const response = await API.post('/payments/wallet/add', { amount, payment_method: paymentMethod });

            return {
                success: response.data.success,
                transaction_id: response.data.transaction_id,
                new_balance: response.data.new_balance,
                message: response.data.message
            };
        } catch (error) {
            console.error('Add To Wallet Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add money to wallet'
            };
        }
    },

    // ================= UPI PAYMENTS =================

    /**
     * Initiate UPI payment
     * @param {Object} upiData - UPI payment details
     * @returns {Promise}
     */
    initiateUPIPayment: async (upiData) => {
        try {
            const response = await API.post('/payments/upi/initiate', upiData);

            return {
                success: response.data.success,
                upi_id: response.data.upi_id,
                payee_name: response.data.payee_name,
                transaction_id: response.data.transaction_id,
                message: response.data.message
            };
        } catch (error) {
            console.error('Initiate UPI Payment Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to initiate UPI payment'
            };
        }
    },

    /**
     * Verify UPI payment
     * @param {string} transactionId - Transaction ID
     * @param {string} reference - Payment reference
     * @returns {Promise}
     */
    verifyUPIPayment: async (transactionId, reference) => {
        try {
            const response = await API.post('/payments/upi/verify', { transaction_id: transactionId, reference });

            return {
                success: response.data.success,
                payment_status: response.data.payment_status,
                message: response.data.message
            };
        } catch (error) {
            console.error('Verify UPI Payment Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'UPI payment verification failed'
            };
        }
    },

    // ================= CARD PAYMENTS =================

    /**
     * Process card payment
     * @param {Object} cardData - Card payment details
     * @returns {Promise}
     */
    processCardPayment: async (cardData) => {
        try {
            const response = await API.post('/payments/card/process', cardData);

            return {
                success: response.data.success,
                payment_id: response.data.payment_id,
                transaction_id: response.data.transaction_id,
                message: response.data.message
            };
        } catch (error) {
            console.error('Process Card Payment Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Card payment failed'
            };
        }
    },

    /**
     * Validate card details
     * @param {Object} cardInfo - Card information
     * @returns {Promise}
     */
    validateCard: async (cardInfo) => {
        try {
            const response = await API.post('/payments/card/validate', cardInfo);

            return {
                success: response.data.success,
                is_valid: response.data.is_valid,
                card_type: response.data.card_type,
                message: response.data.message
            };
        } catch (error) {
            console.error('Validate Card Error:', error);
            return {
                success: false,
                is_valid: false,
                message: error.response?.data?.message || 'Card validation failed'
            };
        }
    },

    // ================= CASH ON DELIVERY =================

    /**
     * Process COD order
     * @param {string} orderId - Order ID
     * @returns {Promise}
     */
    processCODOrder: async (orderId) => {
        try {
            const response = await API.post(`/payments/cod/${orderId}`);

            return {
                success: response.data.success,
                order_id: response.data.order_id,
                message: response.data.message
            };
        } catch (error) {
            console.error('Process COD Order Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to process COD order'
            };
        }
    },

    // ================= HELPER METHODS =================

    /**
     * Format amount for display
     * @param {number} amount - Amount in rupees
     * @returns {string}
     */
    formatAmount: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Get payment method icon
     * @param {string} type - Payment method type
     * @returns {string}
     */
    getPaymentIcon: (type) => {
        const icons = {
            card: '💳',
            upi: '📱',
            cod: '💰',
            wallet: '👛',
            netbanking: '🏦'
        };
        return icons[type] || '💳';
    },

    /**
     * Get payment method display name
     * @param {string} type - Payment method type
     * @returns {string}
     */
    getPaymentMethodName: (type) => {
        const names = {
            card: 'Credit/Debit Card',
            upi: 'UPI',
            cod: 'Cash on Delivery',
            wallet: 'Wallet',
            netbanking: 'Net Banking'
        };
        return names[type] || type;
    },

    /**
     * Validate card number using Luhn algorithm
     * @param {string} cardNumber - Card number
     * @returns {boolean}
     */
    validateCardNumber: (cardNumber) => {
        const num = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(num)) return false;

        let sum = 0;
        let alternate = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let n = parseInt(num.charAt(i), 10);
            if (alternate) {
                n *= 2;
                if (n > 9) n = (n % 10) + 1;
            }
            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 === 0);
    },

    /**
     * Detect card type from number
     * @param {string} cardNumber - Card number
     * @returns {string}
     */
    detectCardType: (cardNumber) => {
        const num = cardNumber.replace(/\s/g, '');
        if (/^4/.test(num)) return 'Visa';
        if (/^5[1-5]/.test(num)) return 'Mastercard';
        if (/^3[47]/.test(num)) return 'American Express';
        if (/^6(?:011|5)/.test(num)) return 'Discover';
        if (/^352[89]|35[0-9]{3}/.test(num)) return 'JCB';
        if (/^5067|^509|^6500|^6504|^6505|^6516|^6550/.test(num)) return 'RuPay';
        return 'Unknown';
    },

    /**
     * Format card number with spaces
     * @param {string} cardNumber - Card number
     * @returns {string}
     */
    formatCardNumber: (cardNumber) => {
        const num = cardNumber.replace(/\s/g, '');
        const parts = [];
        for (let i = 0; i < num.length; i += 4) {
            parts.push(num.substring(i, i + 4));
        }
        return parts.join(' ');
    },

    /**
     * Format expiry date
     * @param {string} month - Month (MM)
     * @param {string} year - Year (YYYY)
     * @returns {string}
     */
    formatExpiryDate: (month, year) => {
        return `${month}/${year.slice(-2)}`;
    },

    /**
     * Mask card number for display
     * @param {string} cardNumber - Card number
     * @returns {string}
     */
    maskCardNumber: (cardNumber) => {
        const num = cardNumber.replace(/\s/g, '');
        const last4 = num.slice(-4);
        return `•••• •••• •••• ${last4}`;
    }
};

export default paymentService;
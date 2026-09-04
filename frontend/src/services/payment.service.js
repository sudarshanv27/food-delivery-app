import api from './api';

const paymentService = {
    /**
     * Create payment intent
     * @param {Object} paymentData - Payment details (amount, currency, orderId)
     * @returns {Promise} Payment intent data
     */
    createPaymentIntent: async (paymentData) => {
        try {
            const response = await api.post('/payments/create-intent', paymentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Process payment with Stripe
     * @param {string} paymentIntentId - Stripe payment intent ID
     * @param {Object} paymentDetails - Payment details
     * @returns {Promise} Payment result
     */
    processStripePayment: async (paymentIntentId, paymentDetails) => {
        try {
            const response = await api.post('/payments/stripe/process', {
                paymentIntentId,
                ...paymentDetails
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Process payment with Razorpay
     * @param {Object} razorpayData - Razorpay payment data
     * @returns {Promise} Payment result
     */
    processRazorpayPayment: async (razorpayData) => {
        try {
            const response = await api.post('/payments/razorpay/process', razorpayData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create Razorpay order
     * @param {Object} orderData - Order details (amount, currency)
     * @returns {Promise} Razorpay order
     */
    createRazorpayOrder: async (orderData) => {
        try {
            const response = await api.post('/payments/razorpay/order', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Verify payment signature
     * @param {Object} signatureData - Payment signature data
     * @returns {Promise} Verification result
     */
    verifyPayment: async (signatureData) => {
        try {
            const response = await api.post('/payments/verify', signatureData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get saved payment methods for user
     * @returns {Promise} List of payment methods
     */
    getPaymentMethods: async () => {
        try {
            const response = await api.get('/payments/methods');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Save payment method for future use
     * @param {Object} paymentMethod - Payment method data
     * @returns {Promise} Saved payment method
     */
    savePaymentMethod: async (paymentMethod) => {
        try {
            const response = await api.post('/payments/methods/save', paymentMethod);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete saved payment method
     * @param {string} methodId - Payment method ID
     * @returns {Promise} Deletion result
     */
    deletePaymentMethod: async (methodId) => {
        try {
            const response = await api.delete(`/payments/methods/${methodId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Process refund
     * @param {string} orderId - Order ID
     * @param {string} reason - Refund reason
     * @returns {Promise} Refund result
     */
    processRefund: async (orderId, reason) => {
        try {
            const response = await api.post(`/payments/refund/${orderId}`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get transaction history
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise} Transaction list
     */
    getTransactionHistory: async (page = 1, limit = 10) => {
        try {
            const response = await api.get('/payments/transactions', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get payment status
     * @param {string} orderId - Order ID
     * @returns {Promise} Payment status
     */
    getPaymentStatus: async (orderId) => {
        try {
            const response = await api.get(`/payments/status/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get available coupons
     * @returns {Promise} List of coupons
     */
    getAvailableCoupons: async () => {
        try {
            const response = await api.get('/payments/coupons');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Validate coupon
     * @param {string} couponCode - Coupon code
     * @param {number} orderAmount - Order amount
     * @returns {Promise} Coupon validation result
     */
    validateCoupon: async (couponCode, orderAmount) => {
        try {
            const response = await api.post('/payments/coupons/validate', {
                coupon_code: couponCode,
                order_amount: orderAmount
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default paymentService;
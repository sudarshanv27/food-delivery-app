import api from './api';

const orderService = {
    /**
     * Get user orders with pagination
     * @param {number} page - Page number
     * @param {string} status - Filter by status
     * @param {number} limit - Items per page
     * @returns {Promise} Orders list
     */
    getOrders: async (page = 1, status = 'all', limit = 10) => {
        try {
            const response = await api.get('/orders', {
                params: { page, status, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get single order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise} Order details
     */
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create new order
     * @param {Object} orderData - Order data (items, address, payment)
     * @returns {Promise} Created order
     */
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Cancel order
     * @param {string} orderId - Order ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise} Cancelled order
     */
    cancelOrder: async (orderId, reason) => {
        try {
            const response = await api.put(`/orders/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Reorder items from previous order
     * @param {string} orderId - Original order ID
     * @returns {Promise} Cart with items
     */
    reorder: async (orderId) => {
        try {
            const response = await api.post(`/orders/${orderId}/reorder`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Track order status
     * @param {string} orderId - Order ID
     * @returns {Promise} Tracking info
     */
    trackOrder: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/track`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Rate order
     * @param {string} orderId - Order ID
     * @param {number} rating - Rating (1-5)
     * @param {string} review - Review text
     * @returns {Promise} Rating response
     */
    rateOrder: async (orderId, rating, review) => {
        try {
            const response = await api.post(`/orders/${orderId}/rate`, { rating, review });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get order timeline
     * @param {string} orderId - Order ID
     * @returns {Promise} Timeline events
     */
    getOrderTimeline: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/timeline`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Download order invoice
     * @param {string} orderId - Order ID
     * @returns {Promise} Invoice PDF
     */
    downloadInvoice: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Request order support
     * @param {string} orderId - Order ID
     * @param {string} issue - Issue description
     * @returns {Promise} Support response
     */
    requestSupport: async (orderId, issue) => {
        try {
            const response = await api.post(`/orders/${orderId}/support`, { issue });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default orderService;
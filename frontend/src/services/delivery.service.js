import api from './api';

const deliveryService = {
    /**
     * Get delivery partner's assigned deliveries
     * @param {string} status - Filter by status (active, completed)
     * @returns {Promise} List of deliveries
     */
    getMyDeliveries: async (status = 'active') => {
        try {
            const response = await api.get('/delivery/my-deliveries', { params: { status } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get delivery details by ID
     * @param {string} deliveryId - Delivery ID
     * @returns {Promise} Delivery details
     */
    getDeliveryById: async (deliveryId) => {
        try {
            const response = await api.get(`/delivery/${deliveryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Accept a delivery assignment
     * @param {string} deliveryId - Delivery ID
     * @returns {Promise} Updated delivery
     */
    acceptDelivery: async (deliveryId) => {
        try {
            const response = await api.post(`/delivery/${deliveryId}/accept`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Confirm pickup of order
     * @param {string} deliveryId - Delivery ID
     * @returns {Promise} Updated delivery
     */
    confirmPickup: async (deliveryId) => {
        try {
            const response = await api.post(`/delivery/${deliveryId}/pickup`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Mark delivery as completed
     * @param {string} deliveryId - Delivery ID
     * @param {Object} data - Completion data (signature, photo)
     * @returns {Promise} Completed delivery
     */
    completeDelivery: async (deliveryId, data = {}) => {
        try {
            const response = await api.post(`/delivery/${deliveryId}/complete`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Report issue with delivery
     * @param {string} deliveryId - Delivery ID
     * @param {string} issue - Issue description
     * @returns {Promise} Issue report
     */
    reportIssue: async (deliveryId, issue) => {
        try {
            const response = await api.post(`/delivery/${deliveryId}/report`, { issue });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update delivery partner's location
     * @param {Object} location - Latitude and longitude
     * @returns {Promise} Location update status
     */
    updateLocation: async (location) => {
        try {
            const response = await api.post('/delivery/update-location', location);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get delivery partner's earnings
     * @param {string} period - Time period (today, week, month)
     * @returns {Promise} Earnings data
     */
    getEarnings: async (period = 'week') => {
        try {
            const response = await api.get('/delivery/earnings', { params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Request withdrawal of earnings
     * @param {number} amount - Withdrawal amount
     * @param {string} method - Withdrawal method
     * @returns {Promise} Withdrawal request
     */
    requestWithdrawal: async (amount, method) => {
        try {
            const response = await api.post('/delivery/withdraw', { amount, method });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get delivery partner's performance stats
     * @returns {Promise} Performance stats
     */
    getPerformanceStats: async () => {
        try {
            const response = await api.get('/delivery/performance');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get delivery history for a specific order
     * @param {string} orderId - Order ID
     * @returns {Promise} Delivery history
     */
    getOrderDeliveryHistory: async (orderId) => {
        try {
            const response = await api.get(`/delivery/order/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Rate customer (for delivery partners)
     * @param {string} deliveryId - Delivery ID
     * @param {number} rating - Rating (1-5)
     * @returns {Promise} Rating response
     */
    rateCustomer: async (deliveryId, rating) => {
        try {
            const response = await api.post(`/delivery/${deliveryId}/rate-customer`, { rating });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Toggle delivery partner online/offline status
     * @param {boolean} isOnline - Online status
     * @returns {Promise} Updated status
     */
    toggleOnlineStatus: async (isOnline) => {
        try {
            const response = await api.post('/delivery/toggle-status', { is_online: isOnline });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get delivery partner's current online status
     * @returns {Promise} Online status
     */
    getOnlineStatus: async () => {
        try {
            const response = await api.get('/delivery/status');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default deliveryService;
import api from './api';

const adminService = {
    // ==================== DASHBOARD ====================

    /**
     * Get dashboard statistics
     * @param {string} period - Time period (today, week, month, year)
     * @returns {Promise} Dashboard stats
     */
    getDashboardStats: async (period = 'week') => {
        try {
            const response = await api.get('/admin/dashboard/stats', { params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get revenue chart data
     * @param {string} period - Time period
     * @returns {Promise} Revenue data
     */
    getRevenueData: async (period = 'week') => {
        try {
            const response = await api.get('/admin/dashboard/revenue', { params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with filters
     * @param {Object} params - Query parameters (page, limit, role, status, search)
     * @returns {Promise} Users list
     */
    getUsers: async (params = {}) => {
        try {
            const response = await api.get('/admin/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise} User details
     */
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update user
     * @param {string} userId - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise} Updated user
     */
    updateUser: async (userId, userData) => {
        try {
            const response = await api.put(`/admin/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise} Deletion status
     */
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update user status
     * @param {string} userId - User ID
     * @param {string} status - New status (active, suspended, pending)
     * @returns {Promise} Updated user
     */
    updateUserStatus: async (userId, status) => {
        try {
            const response = await api.patch(`/admin/users/${userId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== RESTAURANT MANAGEMENT ====================

    /**
     * Get all restaurants with filters
     * @param {Object} params - Query parameters (page, limit, status, search)
     * @returns {Promise} Restaurants list
     */
    getRestaurants: async (params = {}) => {
        try {
            const response = await api.get('/admin/restaurants', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get restaurant by ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Restaurant details
     */
    getRestaurantById: async (restaurantId) => {
        try {
            const response = await api.get(`/admin/restaurants/${restaurantId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Approve restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Updated restaurant
     */
    approveRestaurant: async (restaurantId) => {
        try {
            const response = await api.post(`/admin/restaurants/${restaurantId}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Reject restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {string} reason - Rejection reason
     * @returns {Promise} Updated restaurant
     */
    rejectRestaurant: async (restaurantId, reason) => {
        try {
            const response = await api.post(`/admin/restaurants/${restaurantId}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Suspend restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {string} reason - Suspension reason
     * @returns {Promise} Updated restaurant
     */
    suspendRestaurant: async (restaurantId, reason) => {
        try {
            const response = await api.post(`/admin/restaurants/${restaurantId}/suspend`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete restaurant
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Deletion status
     */
    deleteRestaurant: async (restaurantId) => {
        try {
            const response = await api.delete(`/admin/restaurants/${restaurantId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== ORDER MANAGEMENT ====================

    /**
     * Get all orders with filters
     * @param {Object} params - Query parameters (page, limit, status, dateRange, search)
     * @returns {Promise} Orders list
     */
    getOrders: async (params = {}) => {
        try {
            const response = await api.get('/admin/orders', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise} Order details
     */
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/admin/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise} Updated order
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== DELIVERY MANAGEMENT ====================

    /**
     * Get all delivery partners
     * @param {Object} params - Query parameters
     * @returns {Promise} Delivery partners list
     */
    getDeliveryPartners: async (params = {}) => {
        try {
            const response = await api.get('/admin/delivery/partners', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update delivery partner status
     * @param {string} partnerId - Partner ID
     * @param {string} status - New status
     * @returns {Promise} Updated partner
     */
    updateDeliveryPartnerStatus: async (partnerId, status) => {
        try {
            const response = await api.patch(`/admin/delivery/partners/${partnerId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get active deliveries
     * @returns {Promise} Active deliveries list
     */
    getActiveDeliveries: async () => {
        try {
            const response = await api.get('/admin/delivery/active');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== REPORTS ====================

    /**
     * Generate sales report
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @param {string} groupBy - Group by (day, week, month)
     * @returns {Promise} Sales report
     */
    getSalesReport: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/admin/reports/sales', {
                params: { startDate, endDate, groupBy }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Generate user report
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise} User report
     */
    getUserReport: async (startDate, endDate) => {
        try {
            const response = await api.get('/admin/reports/users', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Generate restaurant report
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise} Restaurant report
     */
    getRestaurantReport: async (startDate, endDate) => {
        try {
            const response = await api.get('/admin/reports/restaurants', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Export report
     * @param {string} type - Report type (sales, users, restaurants)
     * @param {string} format - Export format (csv, pdf, excel)
     * @param {Object} params - Report parameters
     * @returns {Promise} Blob data
     */
    exportReport: async (type, format, params) => {
        try {
            const response = await api.get(`/admin/reports/export/${type}`, {
                params: { format, ...params },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // ==================== SYSTEM SETTINGS ====================

    /**
     * Get system settings
     * @returns {Promise} System settings
     */
    getSettings: async () => {
        try {
            const response = await api.get('/admin/settings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update system settings
     * @param {Object} settings - Updated settings
     * @returns {Promise} Updated settings
     */
    updateSettings: async (settings) => {
        try {
            const response = await api.put('/admin/settings', settings);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default adminService;
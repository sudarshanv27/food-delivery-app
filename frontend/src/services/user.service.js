import api from './api';

const userService = {
    /**
     * Get user profile
     * @returns {Promise} User profile data
     */
    getProfile: async () => {
        try {
            const response = await api.get('/user/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise} Updated profile
     */
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/user/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Upload avatar image
     * @param {File} file - Image file
     * @returns {Promise} Avatar URL
     */
    uploadAvatar: async (file) => {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await api.post('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user addresses
     * @returns {Promise} Addresses list
     */
    getAddresses: async () => {
        try {
            const response = await api.get('/user/addresses');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add new address
     * @param {Object} address - Address data
     * @returns {Promise} Added address
     */
    addAddress: async (address) => {
        try {
            const response = await api.post('/user/addresses', address);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update address
     * @param {string} addressId - Address ID
     * @param {Object} address - Updated address data
     * @returns {Promise} Updated address
     */
    updateAddress: async (addressId, address) => {
        try {
            const response = await api.put(`/user/addresses/${addressId}`, address);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete address
     * @param {string} addressId - Address ID
     * @returns {Promise} Deletion status
     */
    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/user/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Set default address
     * @param {string} addressId - Address ID
     * @returns {Promise} Updated address
     */
    setDefaultAddress: async (addressId) => {
        try {
            const response = await api.patch(`/user/addresses/${addressId}/default`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user payment methods
     * @returns {Promise} Payment methods list
     */
    getPaymentMethods: async () => {
        try {
            const response = await api.get('/user/payment-methods');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add payment method
     * @param {Object} paymentMethod - Payment method data
     * @returns {Promise} Added payment method
     */
    addPaymentMethod: async (paymentMethod) => {
        try {
            const response = await api.post('/user/payment-methods', paymentMethod);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete payment method
     * @param {string} methodId - Payment method ID
     * @returns {Promise} Deletion status
     */
    deletePaymentMethod: async (methodId) => {
        try {
            const response = await api.delete(`/user/payment-methods/${methodId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Set default payment method
     * @param {string} methodId - Payment method ID
     * @returns {Promise} Updated payment method
     */
    setDefaultPaymentMethod: async (methodId) => {
        try {
            const response = await api.patch(`/user/payment-methods/${methodId}/default`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user notifications
     * @param {number} page - Page number
     * @returns {Promise} Notifications list
     */
    getNotifications: async (page = 1) => {
        try {
            const response = await api.get('/user/notifications', { params: { page } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise} Updated notification
     */
    markNotificationRead: async (notificationId) => {
        try {
            const response = await api.patch(`/user/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Mark all notifications as read
     * @returns {Promise} Update status
     */
    markAllNotificationsRead: async () => {
        try {
            const response = await api.patch('/user/notifications/read-all');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise} Deletion status
     */
    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`/user/notifications/${notificationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user preferences
     * @returns {Promise} User preferences
     */
    getPreferences: async () => {
        try {
            const response = await api.get('/user/preferences');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update user preferences
     * @param {Object} preferences - User preferences
     * @returns {Promise} Updated preferences
     */
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/user/preferences', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete user account
     * @returns {Promise} Deletion status
     */
    deleteAccount: async () => {
        try {
            const response = await api.delete('/user/account');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default userService;
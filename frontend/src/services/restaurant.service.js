import api from './api';

const restaurantService = {
    /**
     * Get all restaurants with filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Restaurants list
     */
    getRestaurants: async (params = {}) => {
        try {
            const response = await api.get('/restaurants', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get single restaurant by ID
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Restaurant details
     */
    getRestaurantById: async (restaurantId) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get restaurant menu
     * @param {string} restaurantId - Restaurant ID
     * @param {string} category - Filter by category
     * @returns {Promise} Menu items
     */
    getMenu: async (restaurantId, category = null) => {
        try {
            const params = category ? { category } : {};
            const response = await api.get(`/restaurants/${restaurantId}/menu`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Search restaurants
     * @param {string} query - Search query
     * @param {Object} filters - Search filters
     * @returns {Promise} Search results
     */
    searchRestaurants: async (query, filters = {}) => {
        try {
            const response = await api.get('/restaurants/search', {
                params: { q: query, ...filters }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get restaurant reviews
     * @param {string} restaurantId - Restaurant ID
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise} Reviews list
     */
    getReviews: async (restaurantId, page = 1, limit = 10) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}/reviews`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add review for restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {number} rating - Rating (1-5)
     * @param {string} comment - Review comment
     * @param {Array} images - Review images
     * @returns {Promise} Added review
     */
    addReview: async (restaurantId, rating, comment, images = []) => {
        try {
            const response = await api.post(`/restaurants/${restaurantId}/reviews`, {
                rating,
                comment,
                images
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add restaurant to favorites
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Favorite status
     */
    addToFavorites: async (restaurantId) => {
        try {
            const response = await api.post(`/restaurants/${restaurantId}/favorite`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove restaurant from favorites
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Unfavorite status
     */
    removeFromFavorites: async (restaurantId) => {
        try {
            const response = await api.delete(`/restaurants/${restaurantId}/favorite`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get user's favorite restaurants
     * @returns {Promise} Favorites list
     */
    getFavorites: async () => {
        try {
            const response = await api.get('/restaurants/favorites');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get restaurant categories
     * @returns {Promise} Categories list
     */
    getCategories: async () => {
        try {
            const response = await api.get('/restaurants/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get restaurant offers
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise} Offers list
     */
    getOffers: async (restaurantId) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}/offers`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default restaurantService;
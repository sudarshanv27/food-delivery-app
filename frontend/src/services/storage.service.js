/**
 * Storage service for managing localStorage operations
 */
const storageService = {
    /**
     * Get token from localStorage
     * @returns {string|null} JWT token
     */
    getToken: () => {
        return localStorage.getItem('token');
    },

    /**
     * Set token in localStorage
     * @param {string} token - JWT token
     */
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
        }
    },

    /**
     * Remove token from localStorage
     */
    removeToken: () => {
        localStorage.removeItem('token');
    },

    /**
     * Get refresh token from localStorage
     * @returns {string|null} Refresh token
     */
    getRefreshToken: () => {
        return localStorage.getItem('refresh_token');
    },

    /**
     * Set refresh token in localStorage
     * @param {string} token - Refresh token
     */
    setRefreshToken: (token) => {
        if (token) {
            localStorage.setItem('refresh_token', token);
        }
    },

    /**
     * Remove refresh token from localStorage
     */
    removeRefreshToken: () => {
        localStorage.removeItem('refresh_token');
    },

    /**
     * Get user data from localStorage
     * @returns {Object|null} User object
     */
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Set user data in localStorage
     * @param {Object} user - User object
     */
    setUser: (user) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    /**
     * Remove user data from localStorage
     */
    removeUser: () => {
        localStorage.removeItem('user');
    },

    /**
     * Get cart items from localStorage
     * @returns {Array} Cart items array
     */
    getCart: () => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },

    /**
     * Set cart items in localStorage
     * @param {Array} cart - Cart items array
     */
    setCart: (cart) => {
        if (cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    },

    /**
     * Remove cart from localStorage
     */
    removeCart: () => {
        localStorage.removeItem('cart');
    },

    /**
     * Get saved for later items
     * @returns {Array} Saved items array
     */
    getSavedForLater: () => {
        const saved = localStorage.getItem('savedForLater');
        return saved ? JSON.parse(saved) : [];
    },

    /**
     * Set saved for later items
     * @param {Array} items - Saved items array
     */
    setSavedForLater: (items) => {
        if (items) {
            localStorage.setItem('savedForLater', JSON.stringify(items));
        }
    },

    /**
     * Get theme preference
     * @returns {string} Theme (light/dark/system)
     */
    getTheme: () => {
        return localStorage.getItem('theme') || 'system';
    },

    /**
     * Set theme preference
     * @param {string} theme - Theme value
     */
    setTheme: (theme) => {
        if (theme) {
            localStorage.setItem('theme', theme);
        }
    },

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getPreferences: () => {
        const prefs = localStorage.getItem('preferences');
        return prefs ? JSON.parse(prefs) : {};
    },

    /**
     * Set user preferences
     * @param {Object} preferences - User preferences
     */
    setPreferences: (preferences) => {
        if (preferences) {
            localStorage.setItem('preferences', JSON.stringify(preferences));
        }
    },

    /**
     * Get recent searches
     * @returns {Array} Recent searches array
     */
    getRecentSearches: () => {
        const searches = localStorage.getItem('recentSearches');
        return searches ? JSON.parse(searches) : [];
    },

    /**
     * Add recent search
     * @param {string} query - Search query
     * @param {number} limit - Max number of searches to keep
     */
    addRecentSearch: (query, limit = 10) => {
        if (!query) return;

        const searches = storageService.getRecentSearches();
        const filtered = searches.filter(s => s !== query);
        const newSearches = [query, ...filtered].slice(0, limit);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    },

    /**
     * Clear recent searches
     */
    clearRecentSearches: () => {
        localStorage.removeItem('recentSearches');
    },

    /**
     * Get address from localStorage
     * @returns {Array} Saved addresses
     */
    getAddresses: () => {
        const addresses = localStorage.getItem('addresses');
        return addresses ? JSON.parse(addresses) : [];
    },

    /**
     * Save address to localStorage
     * @param {Object} address - Address object
     */
    saveAddress: (address) => {
        const addresses = storageService.getAddresses();
        addresses.push(address);
        localStorage.setItem('addresses', JSON.stringify(addresses));
    },

    /**
     * Remove address from localStorage
     * @param {number} id - Address ID
     */
    removeAddress: (id) => {
        const addresses = storageService.getAddresses();
        const filtered = addresses.filter(a => a.id !== id);
        localStorage.setItem('addresses', JSON.stringify(filtered));
    },

    /**
     * Clear all localStorage data
     */
    clearAll: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        localStorage.removeItem('savedForLater');
        localStorage.removeItem('addresses');
        localStorage.removeItem('recentSearches');
    },
};

export default storageService;
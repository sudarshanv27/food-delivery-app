import api from './api';
import storageService from './storage.service';

const cartService = {
    /**
     * Get user's cart
     * @returns {Promise} Cart data
     */
    getCart: async () => {
        try {
            const token = storageService.getToken();
            if (!token) {
                // Return local cart for guest users
                return { items: storageService.getCart(), total: 0 };
            }
            const response = await api.get('/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Add item to cart
     * @param {Object} item - Item to add
     * @param {number} quantity - Item quantity
     * @param {Object} options - Additional options (addons, instructions)
     * @returns {Promise} Updated cart
     */
    addToCart: async (item, quantity = 1, options = {}) => {
        try {
            const token = storageService.getToken();
            if (!token) {
                // Handle guest cart
                const cart = storageService.getCart();
                const existingItem = cart.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ ...item, quantity, ...options });
                }
                storageService.setCart(cart);
                return { items: cart };
            }

            const response = await api.post('/cart/add', {
                item_id: item.id,
                quantity,
                addons: options.addons,
                special_instructions: options.specialInstructions
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update item quantity in cart
     * @param {string} itemId - Cart item ID
     * @param {number} quantity - New quantity
     * @returns {Promise} Updated cart
     */
    updateQuantity: async (itemId, quantity) => {
        try {
            const token = storageService.getToken();
            if (!token) {
                const cart = storageService.getCart();
                const item = cart.find(i => i.id === itemId || i.cart_id === itemId);
                if (item) {
                    item.quantity = quantity;
                    storageService.setCart(cart);
                }
                return { items: cart };
            }

            const response = await api.put(`/cart/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove item from cart
     * @param {string} itemId - Cart item ID
     * @returns {Promise} Updated cart
     */
    removeFromCart: async (itemId) => {
        try {
            const token = storageService.getToken();
            if (!token) {
                const cart = storageService.getCart();
                const filtered = cart.filter(i => i.id !== itemId && i.cart_id !== itemId);
                storageService.setCart(filtered);
                return { items: filtered };
            }

            const response = await api.delete(`/cart/${itemId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Clear entire cart
     * @returns {Promise} Empty cart response
     */
    clearCart: async () => {
        try {
            const token = storageService.getToken();
            if (!token) {
                storageService.removeCart();
                return { items: [] };
            }

            const response = await api.delete('/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Apply coupon to cart
     * @param {string} couponCode - Coupon code
     * @returns {Promise} Cart with discount applied
     */
    applyCoupon: async (couponCode) => {
        try {
            const response = await api.post('/cart/apply-coupon', { coupon_code: couponCode });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Remove coupon from cart
     * @returns {Promise} Cart without discount
     */
    removeCoupon: async () => {
        try {
            const response = await api.delete('/cart/coupon');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Merge guest cart with user cart after login
     * @returns {Promise} Merged cart
     */
    mergeGuestCart: async () => {
        try {
            const guestCart = storageService.getCart();
            if (guestCart.length === 0) return { items: [] };

            const response = await api.post('/cart/merge', { items: guestCart });
            storageService.removeCart();
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Get cart summary (count and total)
     * @returns {Object} Cart summary
     */
    getCartSummary: () => {
        const cart = storageService.getCart();
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { itemCount, total };
    }
};

export default cartService;
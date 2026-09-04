// frontend/src/services/orderService.js
import API, { orderAPI, deliveryAPI } from './api';

// ================= ORDER SERVICE =================
const orderService = {
    // ================= ORDER CREATION =================

    /**
     * Create a new order
     * @param {Object} orderData - Order details
     * @returns {Promise}
     */
    createOrder: async (orderData) => {
        try {
            const response = await orderAPI.createOrder(orderData);

            return {
                success: response.data.success,
                message: response.data.message,
                order: response.data.data,
                order_id: response.data.order_id,
                order_number: response.data.order_number
            };
        } catch (error) {
            console.error('Create Order Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create order',
                error: error.response?.data?.error
            };
        }
    },

    // ================= ORDER RETRIEVAL =================

    /**
     * Get all orders for the current user
     * @param {Object} params - Query parameters (status, page, limit)
     * @returns {Promise}
     */
    getOrders: async (params = {}) => {
        try {
            const response = await orderAPI.getOrders(params);

            return {
                success: response.data.success,
                orders: response.data.orders || response.data.data || [],
                pagination: response.data.pagination,
                total: response.data.total,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Orders Error:', error);
            return {
                success: false,
                orders: [],
                message: error.response?.data?.message || 'Failed to fetch orders'
            };
        }
    },

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     * @returns {Promise}
     */
    getOrderById: async (orderId) => {
        try {
            const response = await orderAPI.getOrderById(orderId);

            return {
                success: response.data.success,
                order: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Order By ID Error:', error);
            return {
                success: false,
                order: null,
                message: error.response?.data?.message || 'Order not found'
            };
        }
    },

    /**
     * Get order by order number
     * @param {string} orderNumber - Order number
     * @returns {Promise}
     */
    getOrderByNumber: async (orderNumber) => {
        try {
            const response = await orderAPI.getOrderByNumber(orderNumber);

            return {
                success: response.data.success,
                order: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Order By Number Error:', error);
            return {
                success: false,
                order: null,
                message: error.response?.data?.message || 'Order not found'
            };
        }
    },

    /**
     * Get active orders (pending, confirmed, preparing, out_for_delivery)
     * @returns {Promise}
     */
    getActiveOrders: async () => {
        const result = await orderService.getOrders({ status: 'active' });
        return result;
    },

    /**
     * Get order history (delivered and cancelled orders)
     * @returns {Promise}
     */
    getOrderHistory: async () => {
        const result = await orderService.getOrders({ status: 'history' });
        return result;
    },

    // ================= ORDER STATUS UPDATES =================

    /**
     * Cancel an order
     * @param {string} orderId - Order ID
     * @returns {Promise}
     */
    cancelOrder: async (orderId) => {
        try {
            const response = await orderAPI.cancelOrder(orderId);

            return {
                success: response.data.success,
                message: response.data.message,
                order: response.data.data
            };
        } catch (error) {
            console.error('Cancel Order Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to cancel order'
            };
        }
    },

    /**
     * Update order status (for restaurant owners and admins)
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise}
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await orderAPI.updateOrderStatus(orderId, status);

            return {
                success: response.data.success,
                message: response.data.message,
                order: response.data.data
            };
        } catch (error) {
            console.error('Update Order Status Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update order status'
            };
        }
    },

    // ================= ORDER TRACKING =================

    /**
     * Track order in real-time
     * @param {string} orderId - Order ID
     * @returns {Promise}
     */
    trackOrder: async (orderId) => {
        try {
            const response = await orderAPI.trackOrder(orderId);

            return {
                success: response.data.success,
                tracking: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Track Order Error:', error);
            return {
                success: false,
                tracking: null,
                message: error.response?.data?.message || 'Failed to track order'
            };
        }
    },

    /**
     * Get order status timeline
     * @param {string} orderId - Order ID
     * @returns {Promise}
     */
    getOrderTimeline: async (orderId) => {
        try {
            const response = await orderAPI.trackOrder(orderId);

            return {
                success: response.data.success,
                timeline: response.data.data?.status_history || [],
                current_status: response.data.data?.order_status,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Order Timeline Error:', error);
            return {
                success: false,
                timeline: [],
                current_status: null,
                message: error.response?.data?.message || 'Failed to fetch timeline'
            };
        }
    },

    // ================= RESTAURANT ORDERS =================

    /**
     * Get orders for restaurant owner
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    getRestaurantOrders: async (params = {}) => {
        try {
            const response = await orderAPI.getRestaurantOrders(params);

            return {
                success: response.data.success,
                orders: response.data.orders || response.data.data || [],
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Restaurant Orders Error:', error);
            return {
                success: false,
                orders: [],
                message: error.response?.data?.message || 'Failed to fetch restaurant orders'
            };
        }
    },

    /**
     * Update order status for restaurant
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise}
     */
    updateRestaurantOrderStatus: async (orderId, status) => {
        return await orderService.updateOrderStatus(orderId, status);
    },

    // ================= DELIVERY ORDERS =================

    /**
     * Get available orders for delivery partners
     * @returns {Promise}
     */
    getAvailableDeliveryOrders: async () => {
        try {
            const response = await deliveryAPI.getAvailableOrders();

            return {
                success: response.data.success,
                orders: response.data.data || [],
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Available Delivery Orders Error:', error);
            return {
                success: false,
                orders: [],
                message: error.response?.data?.message || 'Failed to fetch available orders'
            };
        }
    },

    /**
     * Accept a delivery order
     * @param {string} orderId - Order ID
     * @returns {Promise}
     */
    acceptDeliveryOrder: async (orderId) => {
        try {
            const response = await deliveryAPI.acceptOrder(orderId);

            return {
                success: response.data.success,
                message: response.data.message,
                delivery: response.data.data
            };
        } catch (error) {
            console.error('Accept Delivery Order Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to accept order'
            };
        }
    },

    /**
     * Get delivery partner's assigned orders
     * @returns {Promise}
     */
    getMyDeliveryOrders: async () => {
        try {
            const response = await deliveryAPI.getMyDeliveries();

            return {
                success: response.data.success,
                deliveries: response.data.data || [],
                message: response.data.message
            };
        } catch (error) {
            console.error('Get My Delivery Orders Error:', error);
            return {
                success: false,
                deliveries: [],
                message: error.response?.data?.message || 'Failed to fetch deliveries'
            };
        }
    },

    /**
     * Update delivery status
     * @param {string} orderId - Order ID
     * @param {string} status - Delivery status (picked_up, out_for_delivery, delivered)
     * @param {Object} location - Current location { lat, lng }
     * @returns {Promise}
     */
    updateDeliveryStatus: async (orderId, status, location = null) => {
        try {
            const data = { status };
            if (location) {
                data.location = location;
            }

            const response = await deliveryAPI.updateDeliveryStatus(orderId, data);

            return {
                success: response.data.success,
                message: response.data.message,
                delivery: response.data.data
            };
        } catch (error) {
            console.error('Update Delivery Status Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update delivery status'
            };
        }
    },

    /**
     * Update delivery partner's current location
     * @param {Object} location - { lat, lng }
     * @returns {Promise}
     */
    updateDeliveryLocation: async (location) => {
        try {
            const response = await deliveryAPI.updateLocation(location);

            return {
                success: response.data.success,
                message: response.data.message
            };
        } catch (error) {
            console.error('Update Delivery Location Error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update location'
            };
        }
    },

    /**
     * Get delivery partner earnings
     * @returns {Promise}
     */
    getDeliveryEarnings: async () => {
        try {
            const response = await deliveryAPI.getEarnings();

            return {
                success: response.data.success,
                earnings: response.data.data,
                message: response.data.message
            };
        } catch (error) {
            console.error('Get Delivery Earnings Error:', error);
            return {
                success: false,
                earnings: { today: 0, week: 0, total: 0, deliveries: 0 },
                message: error.response?.data?.message || 'Failed to fetch earnings'
            };
        }
    },

    // ================= HELPER METHODS =================

    /**
     * Get status display information
     * @param {string} status - Order status
     * @returns {Object}
     */
    getStatusInfo: (status) => {
        const statusMap = {
            pending: { label: 'Pending', color: '#FF9800', icon: '⏳', step: 0 },
            confirmed: { label: 'Confirmed', color: '#2196F3', icon: '✅', step: 1 },
            preparing: { label: 'Preparing', color: '#9C27B0', icon: '🍳', step: 2 },
            out_for_delivery: { label: 'Out for Delivery', color: '#00BCD4', icon: '🚚', step: 3 },
            delivered: { label: 'Delivered', color: '#4CAF50', icon: '🎉', step: 4 },
            cancelled: { label: 'Cancelled', color: '#F44336', icon: '❌', step: -1 }
        };
        return statusMap[status] || { label: status, color: '#666', icon: '📦', step: 0 };
    },

    /**
     * Check if order can be cancelled
     * @param {string} status - Order status
     * @returns {boolean}
     */
    canCancelOrder: (status) => {
        return ['pending', 'confirmed'].includes(status);
    },

    /**
     * Get progress percentage based on status
     * @param {string} status - Order status
     * @returns {number}
     */
    getProgressPercentage: (status) => {
        const progressMap = {
            pending: 0,
            confirmed: 25,
            preparing: 50,
            out_for_delivery: 75,
            delivered: 100,
            cancelled: 0
        };
        return progressMap[status] || 0;
    },

    /**
     * Calculate order totals
     * @param {Array} items - Cart items
     * @returns {Object}
     */
    calculateOrderTotals: (items) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal > 500 ? 0 : 40;
        const tax = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + tax;

        return {
            subtotal,
            delivery_fee: deliveryFee,
            tax,
            total_amount: total
        };
    },

    /**
     * Format order for display
     * @param {Object} order - Order object
     * @returns {Object}
     */
    formatOrderForDisplay: (order) => {
        const statusInfo = orderService.getStatusInfo(order.order_status);

        return {
            ...order,
            status_label: statusInfo.label,
            status_color: statusInfo.color,
            status_icon: statusInfo.icon,
            progress_percentage: orderService.getProgressPercentage(order.order_status),
            can_cancel: orderService.canCancelOrder(order.order_status),
            formatted_date: new Date(order.created_at).toLocaleString(),
            formatted_total: `₹${order.total_amount.toLocaleString()}`
        };
    }
};

export default orderService;
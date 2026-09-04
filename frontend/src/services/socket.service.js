import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnected = false;
    }

    /**
     * Initialize socket connection
     * @param {string} token - Authentication token
     */
    connect(token) {
        if (this.socket && this.isConnected) {
            console.log('Socket already connected');
            return;
        }

        const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected = true;
            this.emit('join', { userId: this.getUserId() });
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('reconnect', () => {
            console.log('Socket reconnected');
            this.isConnected = true;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
        }
    }

    /**
     * Emit event to server
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn(`Cannot emit ${event}: Socket not connected`);
        }
    }

    /**
     * Listen to event from server
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
            this.listeners.set(event, callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     */
    off(event) {
        if (this.socket && this.listeners.has(event)) {
            this.socket.off(event, this.listeners.get(event));
            this.listeners.delete(event);
        }
    }

    /**
     * Get current user ID from token
     * @returns {string|null} User ID
     */
    getUserId() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    /**
     * Join order room for real-time tracking
     * @param {string} orderId - Order ID
     */
    joinOrderRoom(orderId) {
        this.emit('join-order-room', { orderId });
    }

    /**
     * Leave order room
     * @param {string} orderId - Order ID
     */
    leaveOrderRoom(orderId) {
        this.emit('leave-order-room', { orderId });
    }

    /**
     * Join restaurant room for restaurant owners
     * @param {string} restaurantId - Restaurant ID
     */
    joinRestaurantRoom(restaurantId) {
        this.emit('join-restaurant-room', { restaurantId });
    }

    /**
     * Leave restaurant room
     * @param {string} restaurantId - Restaurant ID
     */
    leaveRestaurantRoom(restaurantId) {
        this.emit('leave-restaurant-room', { restaurantId });
    }

    /**
     * Join delivery partner room
     * @param {string} partnerId - Delivery partner ID
     */
    joinDeliveryRoom(partnerId) {
        this.emit('join-delivery-room', { partnerId });
    }

    /**
     * Leave delivery room
     * @param {string} partnerId - Delivery partner ID
     */
    leaveDeliveryRoom(partnerId) {
        this.emit('leave-delivery-room', { partnerId });
    }

    /**
     * Update delivery partner location
     * @param {Object} location - { latitude, longitude }
     */
    updateLocation(location) {
        this.emit('update-location', location);
    }

    /**
     * Send order status update (for restaurant owners)
     * @param {string} orderId - Order ID
     * @param {string} status - Order status
     */
    updateOrderStatus(orderId, status) {
        this.emit('order-status-update', { orderId, status });
    }

    /**
     * Send delivery status update (for delivery partners)
     * @param {string} deliveryId - Delivery ID
     * @param {string} status - Delivery status
     */
    updateDeliveryStatus(deliveryId, status) {
        this.emit('delivery-status-update', { deliveryId, status });
    }

    /**
     * Listen for order updates
     * @param {Function} callback - Callback function
     */
    onOrderUpdate(callback) {
        this.on('order-update', callback);
    }

    /**
     * Listen for new orders (restaurant owners)
     * @param {Function} callback - Callback function
     */
    onNewOrder(callback) {
        this.on('new-order', callback);
    }

    /**
     * Listen for delivery assignments (delivery partners)
     * @param {Function} callback - Callback function
     */
    onDeliveryAssigned(callback) {
        this.on('delivery-assigned', callback);
    }

    /**
     * Listen for driver location updates (customers)
     * @param {Function} callback - Callback function
     */
    onDriverLocation(callback) {
        this.on('driver-location', callback);
    }

    /**
     * Listen for restaurant approvals
     * @param {Function} callback - Callback function
     */
    onRestaurantApproved(callback) {
        this.on('restaurant-approved', callback);
    }

    /**
     * Listen for notifications
     * @param {Function} callback - Callback function
     */
    onNotification(callback) {
        this.on('notification', callback);
    }
}

export default new SocketService();
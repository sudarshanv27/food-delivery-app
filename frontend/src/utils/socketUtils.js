/**
 * Socket event names
 */
export const SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',

    // User events
    JOIN: 'join',
    LEAVE: 'leave',
    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',

    // Order events
    NEW_ORDER: 'new-order',
    ORDER_UPDATE: 'order-update',
    ORDER_STATUS: 'order-status',
    ORDER_CONFIRMED: 'order-confirmed',
    ORDER_PREPARING: 'order-preparing',
    ORDER_READY: 'order-ready',
    ORDER_PICKED_UP: 'order-picked-up',
    ORDER_DELIVERED: 'order-delivered',
    ORDER_CANCELLED: 'order-cancelled',

    // Delivery events
    DELIVERY_ASSIGNED: 'delivery-assigned',
    DELIVERY_ACCEPTED: 'delivery-accepted',
    DELIVERY_PICKED_UP: 'delivery-picked-up',
    DELIVERY_COMPLETED: 'delivery-completed',
    DELIVERY_LOCATION: 'delivery-location',
    DRIVER_LOCATION: 'driver-location',

    // Restaurant events
    RESTAURANT_APPROVED: 'restaurant-approved',
    RESTAURANT_SUSPENDED: 'restaurant-suspended',
    NEW_REVIEW: 'new-review',

    // Notification events
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification-read',

    // Chat events
    CHAT_MESSAGE: 'chat-message',
    CHAT_TYPING: 'chat-typing',

    // Admin events
    ADMIN_STATS_UPDATE: 'admin-stats-update',
    ADMIN_NEW_USER: 'admin-new-user',
    ADMIN_NEW_RESTAURANT: 'admin-new-restaurant',
};

/**
 * Socket room names
 */
export const SOCKET_ROOMS = {
    ADMIN: 'admin-room',
    USER: (userId) => `user-${userId}`,
    RESTAURANT: (restaurantId) => `restaurant-${restaurantId}`,
    DELIVERY: (partnerId) => `delivery-${partnerId}`,
    ORDER: (orderId) => `order-${orderId}`,
};

/**
 * Create socket event payload for order status update
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @param {Object} additionalData - Additional data to include
 * @returns {Object} Event payload
 */
export const createOrderStatusPayload = (orderId, status, additionalData = {}) => {
    return {
        orderId,
        status,
        timestamp: new Date().toISOString(),
        ...additionalData,
    };
};

/**
 * Create socket event payload for location update
 * @param {string} deliveryId - Delivery ID
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @returns {Object} Event payload
 */
export const createLocationPayload = (deliveryId, latitude, longitude) => {
    return {
        deliveryId,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
    };
};

/**
 * Create socket event payload for chat message
 * @param {string} room - Room name
 * @param {string} senderId - Sender ID
 * @param {string} senderName - Sender name
 * @param {string} message - Message content
 * @returns {Object} Event payload
 */
export const createChatMessagePayload = (room, senderId, senderName, message) => {
    return {
        room,
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Create socket event payload for typing indicator
 * @param {string} room - Room name
 * @param {string} userId - User ID
 * @param {boolean} isTyping - Whether user is typing
 * @returns {Object} Event payload
 */
export const createTypingPayload = (room, userId, isTyping) => {
    return {
        room,
        userId,
        isTyping,
        timestamp: new Date().toISOString(),
    };
};

/**
 * Validate socket event name
 * @param {string} eventName - Event name to validate
 * @returns {boolean} True if event is valid
 */
export const isValidEvent = (eventName) => {
    return Object.values(SOCKET_EVENTS).includes(eventName);
};

/**
 * Get event handler for order status
 * @param {Function} onStatusUpdate - Callback for status update
 * @returns {Function} Event handler
 */
export const orderStatusHandler = (onStatusUpdate) => {
    return (data) => {
        const { orderId, status, timestamp, ...rest } = data;
        onStatusUpdate({
            orderId,
            status,
            timestamp: new Date(timestamp),
            ...rest,
        });
    };
};

/**
 * Get event handler for driver location
 * @param {Function} onLocationUpdate - Callback for location update
 * @returns {Function} Event handler
 */
export const driverLocationHandler = (onLocationUpdate) => {
    return (data) => {
        const { deliveryId, location, timestamp } = data;
        onLocationUpdate({
            deliveryId,
            location,
            timestamp: new Date(timestamp),
        });
    };
};

/**
 * Get event handler for notifications
 * @param {Function} onNotification - Callback for notification
 * @returns {Function} Event handler
 */
export const notificationHandler = (onNotification) => {
    return (data) => {
        onNotification({
            id: data.id || Date.now(),
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            timestamp: new Date(data.timestamp || Date.now()),
            read: false,
        });
    };
};

/**
 * Reconnection delay calculator (exponential backoff)
 * @param {number} attempt - Reconnection attempt number
 * @returns {number} Delay in milliseconds
 */
export const getReconnectionDelay = (attempt) => {
    return Math.min(1000 * Math.pow(2, attempt), 30000);
};

/**
 * Check if socket is connected
 * @param {Object} socket - Socket instance
 * @returns {boolean} True if connected
 */
export const isSocketConnected = (socket) => {
    return socket && socket.connected;
};

/**
 * Get socket connection status message
 * @param {boolean} isConnected - Connection status
 * @returns {string} Status message
 */
export const getConnectionStatusMessage = (isConnected) => {
    return isConnected ? 'Connected to server' : 'Disconnected. Reconnecting...';
};

export default {
    SOCKET_EVENTS,
    SOCKET_ROOMS,
    createOrderStatusPayload,
    createLocationPayload,
    createChatMessagePayload,
    createTypingPayload,
    isValidEvent,
    orderStatusHandler,
    driverLocationHandler,
    notificationHandler,
    getReconnectionDelay,
    isSocketConnected,
    getConnectionStatusMessage,
};
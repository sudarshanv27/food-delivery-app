// frontend/src/config/socket.js

import { io } from 'socket.io-client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { useRestaurant } from '../context/RestaurantContext';
import toast from 'react-hot-toast';

// Socket configuration
const SOCKET_CONFIG = {
    url: process.env.REACT_APP_SOCKET_URL ||
        process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com'
        : 'http://localhost:5000',

    options: {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        withCredentials: true,
        auth: {
            token: null,
        },
        query: {
            clientType: 'web',
            version: '1.0.0',
        },
    },
};

// Socket events enum
export const SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    RECONNECT: 'reconnect',
    RECONNECT_ATTEMPT: 'reconnect_attempt',
    RECONNECT_ERROR: 'reconnect_error',
    RECONNECT_FAILED: 'reconnect_failed',

    // Authentication events
    AUTHENTICATE: 'authenticate',
    AUTHENTICATED: 'authenticated',
    UNAUTHORIZED: 'unauthorized',

    // Cart events
    CART_UPDATED: 'cart_updated',
    CART_ITEM_ADDED: 'cart_item_added',
    CART_ITEM_REMOVED: 'cart_item_removed',
    CART_ITEM_UPDATED: 'cart_item_updated',
    CART_CLEARED: 'cart_cleared',
    CART_SYNC_REQUEST: 'cart_sync_request',
    CART_SYNC_RESPONSE: 'cart_sync_response',

    // Order events
    NEW_ORDER: 'new_order',
    ORDER_UPDATE: 'order_update',
    ORDER_STATUS_CHANGE: 'order_status_change',
    ORDER_ACCEPTED: 'order_accepted',
    ORDER_REJECTED: 'order_rejected',
    ORDER_COMPLETED: 'order_completed',
    ORDER_CANCELLED: 'order_cancelled',
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_PREPARING: 'order_preparing',
    ORDER_READY: 'order_ready',
    ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_PLACED: 'order_placed',

    // Restaurant events
    RESTAURANT_CREATED: 'restaurant_created',
    RESTAURANT_UPDATED: 'restaurant_updated',
    RESTAURANT_DELETED: 'restaurant_deleted',
    RESTAURANT_STATUS_CHANGE: 'restaurant_status_change',
    RESTAURANT_RATING_UPDATED: 'restaurant_rating_updated',

    // Menu events
    MENU_UPDATED: 'menu_updated',
    MENU_ITEM_ADDED: 'menu_item_added',
    MENU_ITEM_UPDATED: 'menu_item_updated',
    MENU_ITEM_DELETED: 'menu_item_deleted',
    MENU_ITEM_OUT_OF_STOCK: 'menu_item_out_of_stock',
    MENU_ITEM_BACK_IN_STOCK: 'menu_item_back_in_stock',

    // Review events
    NEW_REVIEW: 'new_review',
    REVIEW_UPDATED: 'review_updated',
    REVIEW_DELETED: 'review_deleted',

    // Delivery events
    DELIVERY_LOCATION_UPDATE: 'delivery_location_update',
    DELIVERY_STATUS_UPDATE: 'delivery_status_update',
    NEW_DELIVERY_REQUEST: 'new_delivery_request',
    DELIVERY_ACCEPTED: 'delivery_accepted',
    DELIVERY_REJECTED: 'delivery_rejected',
    DELIVERY_COMPLETED: 'delivery_completed',
    DELIVERY_PICKED_UP: 'delivery_picked_up',

    // Notification events
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification_read',
    NOTIFICATION_COUNT_UPDATE: 'notification_count_update',

    // Chat events
    SEND_MESSAGE: 'send_message',
    RECEIVE_MESSAGE: 'receive_message',
    TYPING: 'typing',
    STOP_TYPING: 'stop_typing',
    MESSAGE_DELIVERED: 'message_delivered',
    MESSAGE_READ: 'message_read',

    // User events
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',
    USER_TYPING: 'user_typing',
    USER_PROFILE_UPDATE: 'user_profile_update',

    // Inventory events
    STOCK_UPDATE: 'stock_update',
    LOW_STOCK_ALERT: 'low_stock_alert',

    // Driver events
    DRIVER_LOCATION_UPDATE: 'driver_location_update',
    DRIVER_ASSIGNED: 'driver_assigned',

    // Favorites events
    FAVORITE_ADDED: 'favorite_added',
    FAVORITE_REMOVED: 'favorite_removed',

    // Error events
    ERROR: 'error',
};

// Order status mapping for UI
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected'
};

// Restaurant status mapping
export const RESTAURANT_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
    BUSY: 'busy',
    TEMPORARILY_CLOSED: 'temporarily_closed'
};

// Status colors for UI
export const STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: '#ffc107',
    [ORDER_STATUS.CONFIRMED]: '#17a2b8',
    [ORDER_STATUS.PREPARING]: '#fd7e14',
    [ORDER_STATUS.READY]: '#28a745',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: '#6f42c1',
    [ORDER_STATUS.DELIVERED]: '#28a745',
    [ORDER_STATUS.CANCELLED]: '#dc3545',
    [ORDER_STATUS.REJECTED]: '#dc3545',
    [RESTAURANT_STATUS.OPEN]: '#28a745',
    [RESTAURANT_STATUS.CLOSED]: '#dc3545',
    [RESTAURANT_STATUS.BUSY]: '#ffc107',
    [RESTAURANT_STATUS.TEMPORARILY_CLOSED]: '#fd7e14'
};

class SocketService {
    constructor() {
        this.socket = null;
        this.eventListeners = new Map();
        this.connectionCallbacks = [];
        this.isIntentionallyDisconnected = false;
        this.pendingSyncRequests = new Map();
        this.reconnectAttempts = 0;
        this.orderTrackingCallbacks = new Map();
        this.driverLocationCallbacks = new Map();
        this.restaurantSubscriptions = new Map();
    }

    // Initialize socket with auth token
    initialize(token = null) {
        if (this.socket) {
            return this.socket;
        }

        if (token) {
            SOCKET_CONFIG.options.auth.token = token;
        }

        this.socket = io(SOCKET_CONFIG.url, SOCKET_CONFIG.options);
        this.setupDefaultListeners();

        return this.socket;
    }

    // Setup default connection event listeners
    setupDefaultListeners() {
        if (!this.socket) return;

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('Socket connected:', this.socket.id);
            this.reconnectAttempts = 0;
            this.updateConnectionStatus(true);

            // Re-authenticate if we have a token
            const token = localStorage.getItem('token');
            if (token && this.socket) {
                this.socket.emit(SOCKET_EVENTS.AUTHENTICATE, { token });
            }

            // Process any pending sync requests
            this.processPendingSyncRequests();

            // Re-subscribe to order tracking
            this.resubscribeToOrderTracking();

            // Re-subscribe to restaurant updates
            this.resubscribeToRestaurants();
        });

        this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log('Socket disconnected:', reason);
            this.updateConnectionStatus(false);

            // Attempt to reconnect if not intentionally disconnected
            if (!this.isIntentionallyDisconnected && reason === 'io server disconnect') {
                this.socket?.connect();
            }
        });

        this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
            console.error('Socket connection error:', error);
            this.handleConnectionError(error);
        });

        this.socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.updateConnectionStatus(true);
        });

        this.socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attempt) => {
            this.reconnectAttempts = attempt;
            console.log('Socket reconnection attempt:', attempt);
        });

        this.socket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
            console.error('Socket reconnection failed');
            this.handleReconnectionFailed();
        });

        this.socket.on(SOCKET_EVENTS.UNAUTHORIZED, (data) => {
            console.error('Socket unauthorized:', data);
            this.handleUnauthorized();
        });

        this.socket.on(SOCKET_EVENTS.AUTHENTICATED, (data) => {
            console.log('Socket authenticated:', data);
            this.emitEvent('authenticated', data);
        });

        this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
            console.error('Socket error:', error);
            this.emitEvent('socket_error', error);
        });
    }

    // Update connection status and notify listeners
    updateConnectionStatus(isConnected) {
        this.connectionCallbacks.forEach(callback => callback(isConnected));
    }

    // Handle connection errors
    handleConnectionError(error) {
        this.emitEvent('connection_error', error);
    }

    // Handle reconnection failure
    handleReconnectionFailed() {
        this.emitEvent('reconnection_failed', null);
    }

    // Handle unauthorized access
    handleUnauthorized() {
        this.emitEvent('unauthorized', null);
    }

    // Emit event to stored listeners
    emitEvent(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => listener(data));
    }

    // Process pending sync requests
    processPendingSyncRequests() {
        this.pendingSyncRequests.forEach((resolve, requestId) => {
            resolve({ success: false, message: 'Connection restored but request expired' });
            this.pendingSyncRequests.delete(requestId);
        });
    }

    // Resubscribe to order tracking after reconnection
    resubscribeToOrderTracking() {
        this.orderTrackingCallbacks.forEach((callback, orderId) => {
            this.joinOrderRoom(orderId);
            if (callback) {
                this.on(SOCKET_EVENTS.ORDER_UPDATE, (data) => {
                    if (data.orderId === orderId) {
                        callback(data);
                    }
                });
            }
        });
    }

    // Resubscribe to restaurant updates after reconnection
    resubscribeToRestaurants() {
        this.restaurantSubscriptions.forEach((callbacks, restaurantId) => {
            this.joinRestaurantRoom(restaurantId);
            if (callbacks.menuUpdate) {
                this.on(SOCKET_EVENTS.MENU_UPDATED, (data) => {
                    if (data.restaurantId === restaurantId) {
                        callbacks.menuUpdate(data);
                    }
                });
            }
            if (callbacks.restaurantUpdate) {
                this.on(SOCKET_EVENTS.RESTAURANT_UPDATED, (data) => {
                    if (data.id === restaurantId) {
                        callbacks.restaurantUpdate(data);
                    }
                });
            }
        });
    }

    // Connect socket
    connect(token = null) {
        if (!this.socket) {
            this.initialize(token);
        }

        if (token && this.socket) {
            this.socket.auth = { ...this.socket.auth, token };
        }

        if (this.socket && !this.socket.connected) {
            this.isIntentionallyDisconnected = false;
            this.socket.connect();
        }
    }

    // Disconnect socket
    disconnect() {
        this.isIntentionallyDisconnected = true;
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // Destroy socket instance
    destroy() {
        this.disconnect();
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket = null;
        }
        this.eventListeners.clear();
        this.connectionCallbacks = [];
        this.pendingSyncRequests.clear();
        this.orderTrackingCallbacks.clear();
        this.driverLocationCallbacks.clear();
        this.restaurantSubscriptions.clear();
    }

    // Update auth token
    updateAuthToken(token) {
        if (this.socket) {
            this.socket.auth = { ...this.socket.auth, token };
            if (this.socket.connected) {
                this.socket.emit(SOCKET_EVENTS.AUTHENTICATE, { token });
            }
        }
    }

    // Generic event emitter with acknowledgment support
    emit(event, data, callback = null) {
        if (!this.socket || !this.socket.connected) {
            console.warn('Socket not connected. Event not emitted:', event);
            return false;
        }

        if (callback && typeof callback === 'function') {
            this.socket.emit(event, data, callback);
        } else {
            this.socket.emit(event, data);
        }
        return true;
    }

    // Emit with promise for async/await
    emitWithAck(event, data, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeout);

            this.socket.emit(event, data, (response) => {
                clearTimeout(timeoutId);
                resolve(response);
            });
        });
    }

    // Generic event listener
    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not initialized. Event listener not added:', event);
            return () => { };
        }

        this.socket.on(event, callback);

        // Store for cleanup
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            this.off(event, callback);
        };
    }

    // Remove event listener
    off(event, callback = null) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);
            // Remove from stored listeners
            const listeners = this.eventListeners.get(event) || [];
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        } else {
            this.socket.off(event);
            this.eventListeners.delete(event);
        }
    }

    // Remove all event listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.eventListeners.clear();
            this.setupDefaultListeners();
        }
    }

    // Check connection status
    isConnected() {
        return this.socket && this.socket.connected;
    }

    // Get socket ID
    getSocketId() {
        return this.socket && this.socket.connected ? this.socket.id : null;
    }

    // Register connection status callback
    onConnectionChange(callback) {
        this.connectionCallbacks.push(callback);
        return () => {
            this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
        };
    }

    // Cart events with real-time sync
    async syncCart(cartItems) {
        if (!this.isConnected()) {
            const requestId = Date.now().toString();
            return new Promise((resolve) => {
                this.pendingSyncRequests.set(requestId, resolve);
                setTimeout(() => {
                    if (this.pendingSyncRequests.has(requestId)) {
                        this.pendingSyncRequests.delete(requestId);
                        resolve({ success: false, message: 'Sync queued for later' });
                    }
                }, 30000);
            });
        }

        return this.emitWithAck(SOCKET_EVENTS.CART_SYNC_REQUEST, { cartItems });
    }

    // Order events
    joinOrderRoom(orderId) {
        return this.emit('join_order_room', { orderId });
    }

    leaveOrderRoom(orderId) {
        return this.emit('leave_order_room', { orderId });
    }

    updateOrderStatus(orderId, status, data = {}) {
        return this.emit(SOCKET_EVENTS.ORDER_STATUS_CHANGE, { orderId, status, ...data });
    }

    trackOrder(orderId, callback) {
        this.joinOrderRoom(orderId);
        this.orderTrackingCallbacks.set(orderId, callback);

        const unsubscribe = this.on(SOCKET_EVENTS.ORDER_UPDATE, (data) => {
            if (data.orderId === orderId) {
                callback(data);
            }
        });

        // Return function to stop tracking
        return () => {
            unsubscribe();
            this.orderTrackingCallbacks.delete(orderId);
            this.leaveOrderRoom(orderId);
        };
    }

    // Restaurant events
    joinRestaurantRoom(restaurantId) {
        return this.emit('join_restaurant_room', { restaurantId });
    }

    leaveRestaurantRoom(restaurantId) {
        return this.emit('leave_restaurant_room', { restaurantId });
    }

    updateRestaurantStatus(restaurantId, status, reason = null) {
        return this.emit(SOCKET_EVENTS.RESTAURANT_STATUS_CHANGE, { restaurantId, status, reason });
    }

    subscribeToRestaurantUpdates(restaurantId, callbacks) {
        this.joinRestaurantRoom(restaurantId);

        const subscriptions = [];

        if (callbacks.onMenuUpdate) {
            const unsubscribe = this.on(SOCKET_EVENTS.MENU_UPDATED, (data) => {
                if (data.restaurantId === restaurantId) {
                    callbacks.onMenuUpdate(data);
                }
            });
            subscriptions.push(unsubscribe);
        }

        if (callbacks.onRestaurantUpdate) {
            const unsubscribe = this.on(SOCKET_EVENTS.RESTAURANT_UPDATED, (data) => {
                if (data.id === restaurantId) {
                    callbacks.onRestaurantUpdate(data);
                }
            });
            subscriptions.push(unsubscribe);
        }

        if (callbacks.onStatusChange) {
            const unsubscribe = this.on(SOCKET_EVENTS.RESTAURANT_STATUS_CHANGE, (data) => {
                if (data.restaurantId === restaurantId) {
                    callbacks.onStatusChange(data);
                }
            });
            subscriptions.push(unsubscribe);
        }

        if (callbacks.onNewReview) {
            const unsubscribe = this.on(SOCKET_EVENTS.NEW_REVIEW, (data) => {
                if (data.restaurantId === restaurantId) {
                    callbacks.onNewReview(data);
                }
            });
            subscriptions.push(unsubscribe);
        }

        // Store subscriptions for reconnection
        this.restaurantSubscriptions.set(restaurantId, callbacks);

        // Return function to unsubscribe from all
        return () => {
            subscriptions.forEach(unsubscribe => unsubscribe());
            this.restaurantSubscriptions.delete(restaurantId);
            this.leaveRestaurantRoom(restaurantId);
        };
    }

    // Menu events
    subscribeToMenuUpdates(restaurantId, callback) {
        this.joinRestaurantRoom(restaurantId);
        return this.on(SOCKET_EVENTS.MENU_UPDATED, (data) => {
            if (data.restaurantId === restaurantId) {
                callback(data);
            }
        });
    }

    updateMenuItem(restaurantId, itemId, updates) {
        return this.emit(SOCKET_EVENTS.MENU_ITEM_UPDATED, { restaurantId, itemId, updates });
    }

    markMenuItemOutOfStock(restaurantId, itemId) {
        return this.emit(SOCKET_EVENTS.MENU_ITEM_OUT_OF_STOCK, { restaurantId, itemId });
    }

    // Delivery events
    updateDeliveryLocation(orderId, location) {
        return this.emit(SOCKET_EVENTS.DELIVERY_LOCATION_UPDATE, { orderId, location });
    }

    acceptDelivery(deliveryId) {
        return this.emit(SOCKET_EVENTS.DELIVERY_ACCEPTED, { deliveryId });
    }

    subscribeToDeliveryRequests(callback) {
        return this.on(SOCKET_EVENTS.NEW_DELIVERY_REQUEST, callback);
    }

    trackDriverLocation(driverId, callback) {
        this.driverLocationCallbacks.set(driverId, callback);
        this.emit('join_driver_room', { driverId });

        const unsubscribe = this.on(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, (data) => {
            if (data.driverId === driverId) {
                callback(data);
            }
        });

        return () => {
            unsubscribe();
            this.driverLocationCallbacks.delete(driverId);
            this.emit('leave_driver_room', { driverId });
        };
    }

    // Chat events
    sendMessage(roomId, message, messageType = 'text') {
        return this.emit(SOCKET_EVENTS.SEND_MESSAGE, {
            roomId,
            message,
            messageType,
            timestamp: new Date(),
        });
    }

    sendTyping(roomId, isTyping) {
        const event = isTyping ? SOCKET_EVENTS.TYPING : SOCKET_EVENTS.STOP_TYPING;
        return this.emit(event, { roomId });
    }

    markMessageRead(messageId, roomId) {
        return this.emit(SOCKET_EVENTS.MESSAGE_READ, { messageId, roomId });
    }

    joinChatRoom(roomId) {
        return this.emit('join_chat_room', { roomId });
    }

    leaveChatRoom(roomId) {
        return this.emit('leave_chat_room', { roomId });
    }

    // Notification events
    markNotificationRead(notificationId) {
        return this.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notificationId });
    }

    subscribeToNotifications(callback) {
        return this.on(SOCKET_EVENTS.NOTIFICATION, callback);
    }

    // Favorites events
    subscribeToFavoritesUpdates(callback) {
        return this.on(SOCKET_EVENTS.FAVORITE_ADDED, callback);
    }

    // User events
    updateUserPresence(isOnline) {
        return this.emit(isOnline ? SOCKET_EVENTS.USER_ONLINE : SOCKET_EVENTS.USER_OFFLINE, {
            userId: this.getUserId(),
            timestamp: new Date()
        });
    }

    getUserId() {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                return JSON.parse(user).id;
            }
        } catch (e) {
            return null;
        }
        return null;
    }
}

// Create singleton instance
const socketService = new SocketService();

// React hook for using socket with all contexts
export const useSocket = () => {
    const { token, isAuthenticated, user } = useAuth();
    const { fetchCart, cartItems, syncOfflineCart } = useCart();
    const { fetchOrders, getOrderById } = useOrder();
    const {
        getRestaurantById,
        fetchMenu,
        fetchFavorites,
        setRestaurants
    } = useRestaurant();
    const [isConnected, setIsConnected] = useState(false);
    const [socketId, setSocketId] = useState(null);
    const reconnectAttempts = useRef(0);

    // Handle cart sync with server
    const syncCartWithServer = useCallback(async () => {
        if (isConnected && cartItems && cartItems.length > 0) {
            try {
                const response = await socketService.syncCart(cartItems);
                if (response.success) {
                    console.log('Cart synced with server');
                    await fetchCart();
                }
            } catch (error) {
                console.error('Cart sync error:', error);
            }
        }
    }, [isConnected, cartItems, fetchCart]);

    // Auto-sync cart when connection is restored
    useEffect(() => {
        if (isConnected && cartItems) {
            syncCartWithServer();
        }
    }, [isConnected, syncCartWithServer, cartItems]);

    // Handle real-time cart updates from server
    useEffect(() => {
        if (isConnected) {
            const unsubscribeCartUpdate = socketService.on(SOCKET_EVENTS.CART_UPDATED, (data) => {
                console.log('Cart updated from server:', data);
                if (data.userId === user?.id) {
                    fetchCart();
                    toast.info('Your cart has been updated from another device');
                }
            });

            return () => {
                unsubscribeCartUpdate();
            };
        }
    }, [isConnected, fetchCart, user?.id]);

    // Handle real-time restaurant updates
    useEffect(() => {
        if (isConnected && user?.role === 'restaurant_owner' && user?.restaurant_id) {
            // Subscribe to updates for owned restaurant
            const unsubscribe = socketService.subscribeToRestaurantUpdates(
                user.restaurant_id,
                {
                    onMenuUpdate: (data) => {
                        toast.info('Menu has been updated');
                        fetchMenu(user.restaurant_id);
                    },
                    onRestaurantUpdate: (data) => {
                        toast.info('Restaurant information updated');
                        getRestaurantById(user.restaurant_id);
                    },
                    onStatusChange: (data) => {
                        toast.success(`Restaurant is now ${data.status}`);
                    },
                    onNewReview: (data) => {
                        toast.info(`New review received: ${data.rating} stars`);
                        getRestaurantById(user.restaurant_id);
                    }
                }
            );

            return () => {
                unsubscribe();
            };
        }
    }, [isConnected, user, fetchMenu, getRestaurantById]);

    // Handle real-time menu updates for customers
    useEffect(() => {
        if (isConnected && user?.role === 'customer') {
            const unsubscribeStockUpdate = socketService.on(SOCKET_EVENTS.MENU_ITEM_OUT_OF_STOCK, (data) => {
                const cartItem = cartItems.find(item => item.id === data.itemId);
                if (cartItem) {
                    toast.error(`${cartItem.name} is now out of stock and has been removed from your cart`);
                    fetchCart();
                }
                // Refresh menu if currently viewing this restaurant
                if (window.location.pathname.includes(`/restaurant/${data.restaurantId}`)) {
                    fetchMenu(data.restaurantId);
                }
            });

            const unsubscribeBackInStock = socketService.on(SOCKET_EVENTS.MENU_ITEM_BACK_IN_STOCK, (data) => {
                toast.success(`${data.itemName} is back in stock!`);
                // Refresh menu if currently viewing this restaurant
                if (window.location.pathname.includes(`/restaurant/${data.restaurantId}`)) {
                    fetchMenu(data.restaurantId);
                }
            });

            return () => {
                unsubscribeStockUpdate();
                unsubscribeBackInStock();
            };
        }
    }, [isConnected, user?.role, cartItems, fetchCart, fetchMenu]);

    // Handle real-time order updates
    useEffect(() => {
        if (isConnected && user) {
            // Listen for new orders (for restaurant owners)
            if (user.role === 'restaurant_owner') {
                const unsubscribeNewOrder = socketService.on(SOCKET_EVENTS.NEW_ORDER, (data) => {
                    toast.success(`New order #${data.orderId} received!`, {
                        duration: 5000,
                        icon: '🛵',
                    });
                    // Refresh orders list
                    fetchOrders(1, 'pending');
                });

                return () => {
                    unsubscribeNewOrder();
                };
            }

            // Listen for order status updates (for customers)
            if (user.role === 'customer') {
                const unsubscribeOrderUpdate = socketService.on(SOCKET_EVENTS.ORDER_UPDATE, async (data) => {
                    const order = await getOrderById(data.orderId);
                    if (order) {
                        // Show appropriate toast based on status
                        const statusMessages = {
                            [ORDER_STATUS.CONFIRMED]: 'Your order has been confirmed!',
                            [ORDER_STATUS.PREPARING]: 'Restaurant is preparing your order',
                            [ORDER_STATUS.READY]: 'Your order is ready for pickup',
                            [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Your order is out for delivery!',
                            [ORDER_STATUS.DELIVERED]: 'Your order has been delivered. Enjoy your meal!',
                            [ORDER_STATUS.CANCELLED]: 'Your order has been cancelled',
                        };

                        const message = statusMessages[data.status];
                        if (message) {
                            toast(message, {
                                icon: data.status === ORDER_STATUS.DELIVERED ? '🎉' : '📦',
                                duration: 5000,
                            });
                        }
                    }
                });

                return () => {
                    unsubscribeOrderUpdate();
                };
            }

            // Listen for delivery requests (for delivery partners)
            if (user.role === 'delivery_partner') {
                const unsubscribeDeliveryRequest = socketService.on(SOCKET_EVENTS.NEW_DELIVERY_REQUEST, (data) => {
                    toast.success(`New delivery request: Order #${data.orderId}`, {
                        duration: 10000,
                        icon: '🚚',
                    });
                });

                return () => {
                    unsubscribeDeliveryRequest();
                };
            }
        }
    }, [isConnected, user, fetchOrders, getOrderById]);

    // Handle real-time favorites updates
    useEffect(() => {
        if (isConnected && user) {
            const unsubscribeFavoriteAdded = socketService.on(SOCKET_EVENTS.FAVORITE_ADDED, (data) => {
                if (data.userId !== user?.id) {
                    toast.info(`${data.userName} added ${data.restaurantName} to favorites`);
                }
            });

            return () => {
                unsubscribeFavoriteAdded();
            };
        }
    }, [isConnected, user]);

    useEffect(() => {
        if (isAuthenticated && token) {
            // Connect socket when user is authenticated
            socketService.connect(token);

            // Join user-specific room
            if (user?.id) {
                socketService.emit('join_user_room', { userId: user.id });

                // Join role-specific rooms
                if (user.role === 'restaurant_owner' && user.restaurant_id) {
                    socketService.joinRestaurantRoom(user.restaurant_id);
                    // Listen for order updates for this restaurant
                    socketService.on(SOCKET_EVENTS.NEW_ORDER, () => {
                        fetchOrders(1, 'pending');
                    });
                } else if (user.role === 'delivery_partner') {
                    socketService.emit('join_delivery_partner_room', { partnerId: user.id });
                } else if (user.role === 'customer') {
                    // Fetch favorites when customer connects
                    fetchFavorites();
                }
            }

            // Sync offline cart when connecting
            syncOfflineCart();
        } else {
            // Disconnect socket when user is not authenticated
            socketService.disconnect();
        }

        // Listen for connection status
        const unsubscribe = socketService.onConnectionChange((connected) => {
            setIsConnected(connected);
            if (connected) {
                setSocketId(socketService.getSocketId());
                reconnectAttempts.current = 0;

                // Sync offline cart when connection is restored
                if (isAuthenticated) {
                    syncOfflineCart();
                    syncCartWithServer();
                    // Refresh favorites when connection is restored
                    if (user?.role === 'customer') {
                        fetchFavorites();
                    }
                }
            } else {
                setSocketId(null);
            }
        });

        // Listen for unauthorized event (token expired)
        const handleUnauthorized = () => {
            if (isAuthenticated) {
                console.warn('Socket unauthorized - token may have expired');
                toast.error('Session expired. Please login again.');
            }
        };

        const unsubscribeUnauthorized = socketService.on('unauthorized', handleUnauthorized);

        return () => {
            unsubscribe();
            unsubscribeUnauthorized();
            if (!isAuthenticated) {
                socketService.destroy();
            }
        };
    }, [isAuthenticated, token, user?.id, user?.role, user?.restaurant_id, syncOfflineCart, syncCartWithServer, fetchOrders, fetchFavorites]);

    // Update auth token when it changes
    useEffect(() => {
        if (token && isAuthenticated) {
            socketService.updateAuthToken(token);
        }
    }, [token, isAuthenticated]);

    return {
        socket: socketService,
        isConnected,
        socketId,
        reconnectAttempts: reconnectAttempts.current,
        emit: socketService.emit.bind(socketService),
        emitWithAck: socketService.emitWithAck.bind(socketService),
        on: socketService.on.bind(socketService),
        off: socketService.off.bind(socketService),
        connect: socketService.connect.bind(socketService),
        disconnect: socketService.disconnect.bind(socketService),
        syncCart: syncCartWithServer,
        joinOrderRoom: socketService.joinOrderRoom.bind(socketService),
        leaveOrderRoom: socketService.leaveOrderRoom.bind(socketService),
        updateOrderStatus: socketService.updateOrderStatus.bind(socketService),
        trackOrder: socketService.trackOrder.bind(socketService),
        joinRestaurantRoom: socketService.joinRestaurantRoom.bind(socketService),
        updateRestaurantStatus: socketService.updateRestaurantStatus.bind(socketService),
        subscribeToRestaurantUpdates: socketService.subscribeToRestaurantUpdates.bind(socketService),
        updateMenuItem: socketService.updateMenuItem.bind(socketService),
        markMenuItemOutOfStock: socketService.markMenuItemOutOfStock.bind(socketService),
        updateDeliveryLocation: socketService.updateDeliveryLocation.bind(socketService),
        sendMessage: socketService.sendMessage.bind(socketService),
        sendTyping: socketService.sendTyping.bind(socketService),
        subscribeToNotifications: socketService.subscribeToNotifications.bind(socketService),
        subscribeToDeliveryRequests: socketService.subscribeToDeliveryRequests.bind(socketService),
        trackDriverLocation: socketService.trackDriverLocation.bind(socketService),
        acceptDelivery: socketService.acceptDelivery.bind(socketService),
        subscribeToMenuUpdates: socketService.subscribeToMenuUpdates.bind(socketService),
    };
};

// Export the socket service singleton
export default socketService;
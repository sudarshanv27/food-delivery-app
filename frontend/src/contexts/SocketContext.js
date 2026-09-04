// frontend/src/context/SocketContext.js (Enhanced with Theme Support)

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useOrder } from './OrderContext';
import { useRestaurant } from './RestaurantContext';
import { useTheme } from './ThemeContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

// Socket Events Enum
export const SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    RECONNECT: 'reconnect',

    // Order events
    ORDER_UPDATE: 'order_update',
    ORDER_STATUS_CHANGE: 'order_status_change',
    NEW_ORDER: 'new_order',
    ORDER_ACCEPTED: 'order_accepted',
    ORDER_REJECTED: 'order_rejected',
    ORDER_READY: 'order_ready',
    ORDER_OUT_FOR_DELIVERY: 'order_out_for_delivery',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled',

    // Cart events
    CART_UPDATED: 'cart_updated',
    CART_ITEM_ADDED: 'cart_item_added',
    CART_ITEM_REMOVED: 'cart_item_removed',
    CART_SYNC: 'cart_sync',

    // Restaurant events
    RESTAURANT_UPDATED: 'restaurant_updated',
    RESTAURANT_STATUS_CHANGE: 'restaurant_status_change',
    MENU_UPDATED: 'menu_updated',
    MENU_ITEM_OUT_OF_STOCK: 'menu_item_out_of_stock',
    NEW_REVIEW: 'new_review',
    RESTAURANT_APPROVED: 'restaurant_approved',

    // Delivery events
    DELIVERY_ASSIGNED: 'delivery_assigned',
    DRIVER_LOCATION: 'driver_location',
    DELIVERY_STATUS_UPDATE: 'delivery_status_update',
    NEW_DELIVERY_REQUEST: 'new_delivery_request',

    // Notification events
    NOTIFICATION: 'notification',
    PROMOTION: 'promotion',

    // Chat events
    NEW_MESSAGE: 'new_message',
    TYPING: 'typing',

    // User events
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',

    // Theme events
    THEME_CHANGED: 'theme_changed',
    THEME_SYNC: 'theme_sync',
};

// Order status mapping
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
    PENDING_APPROVAL: 'pending_approval'
};

// Theme-aware toast styling
const getThemeAwareToastStyle = (isDarkMode) => ({
    style: {
        background: isDarkMode ? '#1e1e1e' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#333333',
        border: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
    },
    duration: 4000,
});

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { fetchCart, syncOfflineCart } = useCart();
    const { fetchOrders, getOrderById } = useOrder();
    const {
        getRestaurantById,
        fetchMenu,
        fetchFavorites,
        fetchRestaurants
    } = useRestaurant();
    const { isDarkMode, theme, setTheme: setAppTheme, resolvedTheme } = useTheme();

    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const socketRef = useRef(null);
    const orderTrackingRef = useRef(new Map());
    const restaurantSubscriptionRef = useRef(new Map());

    // Load notifications from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('notifications');
        if (stored) {
            const notificationsList = JSON.parse(stored);
            setNotifications(notificationsList);
            const unread = notificationsList.filter(n => !n.read).length;
            setUnreadCount(unread);
        }
    }, []);

    // Sync theme across devices when socket connects
    useEffect(() => {
        if (isConnected && socket && user?.id) {
            // Emit current theme to server for sync
            socket.emit(SOCKET_EVENTS.THEME_SYNC, {
                userId: user.id,
                theme: theme,
                resolvedTheme: resolvedTheme,
                timestamp: new Date().toISOString()
            });
        }
    }, [isConnected, socket, user?.id, theme, resolvedTheme]);

    // Initialize socket connection
    useEffect(() => {
        if (isAuthenticated && user) {
            initializeSocket();
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, user]);

    // Handle cart sync when connection is restored
    useEffect(() => {
        if (isConnected && isAuthenticated) {
            syncOfflineCart();
            // Request cart sync from server
            if (socket) {
                socket.emit(SOCKET_EVENTS.CART_SYNC, { userId: user?.id });
            }
        }
    }, [isConnected, isAuthenticated, syncOfflineCart, socket, user?.id]);

    // Toast configuration based on theme
    const showThemeAwareToast = useCallback((message, type = 'success', options = {}) => {
        const toastOptions = {
            ...getThemeAwareToastStyle(isDarkMode()),
            ...options
        };

        switch (type) {
            case 'success':
                toast.success(message, toastOptions);
                break;
            case 'error':
                toast.error(message, toastOptions);
                break;
            case 'loading':
                toast.loading(message, toastOptions);
                break;
            default:
                toast(message, toastOptions);
        }
    }, [isDarkMode]);

    const initializeSocket = useCallback(() => {
        const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
            auth: {
                token: localStorage.getItem('token'),
                theme: theme // Send current theme on connection
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        // Connection event handlers
        socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
            console.log('Socket connected');
            setIsConnected(true);
            setReconnectAttempts(0);

            // Join user-specific room with role and theme
            socketInstance.emit('join', {
                userId: user?.id,
                role: user?.role,
                restaurantId: user?.restaurant_id,
                theme: theme
            });

            // Join role-specific rooms
            if (user?.role === 'restaurant_owner' && user?.restaurant_id) {
                socketInstance.emit('join_restaurant_room', { restaurantId: user.restaurant_id });
            } else if (user?.role === 'delivery_partner') {
                socketInstance.emit('join_delivery_room', { partnerId: user.id });
            }

            // Resubscribe to order tracking
            orderTrackingRef.current.forEach((_, orderId) => {
                socketInstance.emit('join_order_room', { orderId });
            });

            // Resubscribe to restaurant updates
            restaurantSubscriptionRef.current.forEach((_, restaurantId) => {
                socketInstance.emit('join_restaurant_room', { restaurantId });
            });
        });

        socketInstance.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);

            if (reason === 'io server disconnect') {
                setTimeout(() => {
                    socketInstance.connect();
                }, 1000);
            }
        });

        socketInstance.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            setReconnectAttempts(0);
            showThemeAwareToast('Reconnected to server', 'success', { duration: 2000 });
        });

        socketInstance.on('reconnect_attempt', (attempt) => {
            setReconnectAttempts(attempt);
            console.log('Reconnection attempt:', attempt);
        });

        // Theme synchronization handlers
        socketInstance.on(SOCKET_EVENTS.THEME_CHANGED, (data) => {
            console.log('Theme changed on another device:', data);

            // Only update if the theme change is from another device
            if (data.userId !== user?.id && data.deviceId !== socketInstance.id) {
                showThemeAwareToast(
                    `Theme changed to ${data.theme} on another device`,
                    'info',
                    { duration: 3000 }
                );

                // Update theme locally
                setAppTheme(data.theme);

                // Add notification
                addNotification({
                    type: 'theme',
                    title: 'Theme Synced',
                    message: `Theme changed to ${data.theme} on another device`,
                    data: data
                });
            }
        });

        socketInstance.on(SOCKET_EVENTS.THEME_SYNC, (data) => {
            console.log('Theme sync request:', data);
            // Respond with current theme
            socketInstance.emit(SOCKET_EVENTS.THEME_SYNC, {
                userId: user?.id,
                theme: theme,
                resolvedTheme: resolvedTheme,
                timestamp: new Date().toISOString()
            });
        });

        // Order event handlers with theme-aware toasts
        socketInstance.on(SOCKET_EVENTS.ORDER_UPDATE, async (data) => {
            console.log('Order update:', data);

            const statusMessages = {
                [ORDER_STATUS.CONFIRMED]: '✅ Your order has been confirmed!',
                [ORDER_STATUS.PREPARING]: '🍳 Restaurant is preparing your order',
                [ORDER_STATUS.READY]: '✅ Your order is ready for pickup',
                [ORDER_STATUS.OUT_FOR_DELIVERY]: '🚚 Your order is out for delivery!',
                [ORDER_STATUS.DELIVERED]: '🎉 Your order has been delivered. Enjoy your meal!',
                [ORDER_STATUS.CANCELLED]: '❌ Your order has been cancelled',
            };

            const message = statusMessages[data.status];
            if (message && user?.role === 'customer') {
                showThemeAwareToast(message, 'success', { duration: 5000 });
            }

            if (data.orderId) {
                await getOrderById(data.orderId);
            }

            addNotification({
                type: 'order',
                title: 'Order Update',
                message: `Order #${data.orderId} is now ${data.status}`,
                data: data,
                orderId: data.orderId
            });
        });

        socketInstance.on(SOCKET_EVENTS.NEW_ORDER, (data) => {
            console.log('New order received:', data);

            if (user?.role === 'restaurant_owner') {
                showThemeAwareToast(
                    `🛵 New order #${data.orderId} from ${data.customerName}!`,
                    'success',
                    { duration: 10000, icon: '📦' }
                );

                fetchOrders(1, 'pending');

                addNotification({
                    type: 'order',
                    title: 'New Order',
                    message: `Order #${data.orderId} from ${data.customerName} - Total: $${data.total}`,
                    data: data,
                    orderId: data.orderId
                });
            }
        });

        socketInstance.on(SOCKET_EVENTS.ORDER_ACCEPTED, (data) => {
            if (user?.role === 'customer') {
                showThemeAwareToast(
                    `Restaurant has accepted your order #${data.orderId}`,
                    'success'
                );
            }
            fetchOrders(1);
        });

        socketInstance.on(SOCKET_EVENTS.ORDER_REJECTED, (data) => {
            if (user?.role === 'customer') {
                showThemeAwareToast(
                    `Order #${data.orderId} was rejected. Reason: ${data.reason || 'No reason provided'}`,
                    'error'
                );
            }
            fetchOrders(1);
        });

        // Cart event handlers
        socketInstance.on(SOCKET_EVENTS.CART_UPDATED, (data) => {
            if (data.userId === user?.id) {
                console.log('Cart updated from another device');
                fetchCart();
                showThemeAwareToast(
                    'Your cart has been updated from another device',
                    'info',
                    { duration: 3000 }
                );
            }
        });

        socketInstance.on(SOCKET_EVENTS.CART_ITEM_ADDED, (data) => {
            if (data.userId === user?.id && data.deviceId !== socketInstance.id) {
                showThemeAwareToast(
                    `${data.itemName} added to cart from another device`,
                    'info'
                );
                fetchCart();
            }
        });

        socketInstance.on(SOCKET_EVENTS.CART_ITEM_REMOVED, (data) => {
            if (data.userId === user?.id && data.deviceId !== socketInstance.id) {
                showThemeAwareToast(
                    `${data.itemName} removed from cart from another device`,
                    'info'
                );
                fetchCart();
            }
        });

        // Restaurant event handlers with theme-aware toasts
        socketInstance.on(SOCKET_EVENTS.RESTAURANT_UPDATED, (data) => {
            if (user?.role === 'customer' && data.restaurantId) {
                if (window.location.pathname.includes(`/restaurant/${data.restaurantId}`)) {
                    getRestaurantById(data.restaurantId);
                }
                if (window.location.pathname === '/') {
                    fetchRestaurants({ page: 1 });
                }
            }
        });

        socketInstance.on(SOCKET_EVENTS.RESTAURANT_STATUS_CHANGE, (data) => {
            const statusMessages = {
                [RESTAURANT_STATUS.OPEN]: '🟢 Restaurant is now open',
                [RESTAURANT_STATUS.CLOSED]: '🔴 Restaurant is now closed',
                [RESTAURANT_STATUS.BUSY]: '🟡 Restaurant is currently busy'
            };

            showThemeAwareToast(
                statusMessages[data.status] || `Restaurant status changed to ${data.status}`,
                'info'
            );

            if (data.restaurantId) {
                getRestaurantById(data.restaurantId);
            }
        });

        socketInstance.on(SOCKET_EVENTS.MENU_UPDATED, (data) => {
            if (data.restaurantId) {
                showThemeAwareToast('Menu has been updated', 'info');
                if (window.location.pathname.includes(`/restaurant/${data.restaurantId}`)) {
                    fetchMenu(data.restaurantId);
                }
            }
        });

        socketInstance.on(SOCKET_EVENTS.MENU_ITEM_OUT_OF_STOCK, async (data) => {
            showThemeAwareToast(`${data.itemName} is out of stock!`, 'error', { duration: 5000 });

            await fetchCart();

            if (window.location.pathname.includes(`/restaurant/${data.restaurantId}`)) {
                fetchMenu(data.restaurantId);
            }

            addNotification({
                type: 'restaurant',
                title: 'Out of Stock',
                message: `${data.itemName} is out of stock`,
                data: data
            });
        });

        socketInstance.on(SOCKET_EVENTS.NEW_REVIEW, (data) => {
            if (user?.id !== data.userId) {
                showThemeAwareToast(
                    `New ${data.rating}-star review for ${data.restaurantName}`,
                    'info'
                );
                if (window.location.pathname.includes(`/restaurant/${data.restaurantId}`)) {
                    getRestaurantById(data.restaurantId);
                }
            }
        });

        socketInstance.on(SOCKET_EVENTS.RESTAURANT_APPROVED, (data) => {
            if (user?.role === 'restaurant_owner' && user?.restaurant_id === data.restaurantId) {
                showThemeAwareToast(
                    `🎉 Your restaurant ${data.restaurantName} has been approved and is now live!`,
                    'success'
                );
                addNotification({
                    type: 'restaurant',
                    title: 'Restaurant Approved',
                    message: `Your restaurant ${data.restaurantName} is now live!`,
                    data: data
                });
            }
        });

        // Delivery event handlers
        socketInstance.on(SOCKET_EVENTS.DELIVERY_ASSIGNED, (data) => {
            if (user?.role === 'delivery_partner') {
                showThemeAwareToast(
                    `🚚 New delivery assigned: Order #${data.orderId}`,
                    'success',
                    { duration: 10000, icon: '📦' }
                );

                addNotification({
                    type: 'delivery',
                    title: 'Delivery Assigned',
                    message: `You have been assigned to deliver order #${data.orderId} from ${data.restaurantName}`,
                    data: data,
                    orderId: data.orderId
                });
            }
        });

        socketInstance.on(SOCKET_EVENTS.NEW_DELIVERY_REQUEST, (data) => {
            if (user?.role === 'delivery_partner') {
                showThemeAwareToast(
                    `New delivery request: Order #${data.orderId}`,
                    'success',
                    { duration: 15000, icon: '🚚' }
                );

                addNotification({
                    type: 'delivery',
                    title: 'New Delivery Request',
                    message: `Order #${data.orderId} from ${data.restaurantName} to ${data.deliveryAddress}`,
                    data: data,
                    orderId: data.orderId
                });
            }
        });

        socketInstance.on(SOCKET_EVENTS.DRIVER_LOCATION, (data) => {
            window.dispatchEvent(new CustomEvent('driverLocationUpdate', {
                detail: { orderId: data.orderId, location: data.location, driverName: data.driverName }
            }));
        });

        // Notification handlers with theme support
        socketInstance.on(SOCKET_EVENTS.NOTIFICATION, (data) => {
            addNotification(data);

            if (data.type === 'order') {
                toast.custom((t) => (
                    <div className={`${isDarkMode() ? 'dark' : 'light'} theme-aware-toast`}>
                        <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg ${isDarkMode() ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                            } border-l-4 border-blue-500`}>
                            <span className="text-2xl">📦</span>
                            <div>
                                <strong className="block">{data.title}</strong>
                                <p className="text-sm opacity-80">{data.message}</p>
                            </div>
                        </div>
                    </div>
                ), {
                    duration: 5000,
                    style: {
                        background: 'transparent',
                        boxShadow: 'none'
                    }
                });
            } else if (data.type === 'promotion') {
                showThemeAwareToast(data.message, 'success', { duration: 8000 });
            }
        });

        socketInstance.on(SOCKET_EVENTS.PROMOTION, (data) => {
            showThemeAwareToast(`🎉 ${data.message}`, 'success', { duration: 10000 });
            addNotification({
                type: 'promotion',
                title: 'Special Offer',
                message: data.message,
                data: data
            });
        });

        // Chat event handlers
        socketInstance.on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
            if (user?.role === 'customer' || user?.role === 'restaurant_owner') {
                showThemeAwareToast(`New message from ${data.senderName}`, 'info');
                addNotification({
                    type: 'chat',
                    title: 'New Message',
                    message: `${data.senderName}: ${data.message.substring(0, 50)}...`,
                    data: data
                });
            }
        });

        // User presence handlers
        socketInstance.on(SOCKET_EVENTS.USER_ONLINE, (data) => {
            console.log(`${data.userName} came online`);
        });

        socketInstance.on(SOCKET_EVENTS.USER_OFFLINE, (data) => {
            console.log(`${data.userName} went offline`);
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);
    }, [user, isAuthenticated, fetchCart, fetchOrders, getOrderById, fetchMenu, getRestaurantById, fetchRestaurants, showThemeAwareToast, isDarkMode, theme, resolvedTheme, setAppTheme]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            if (user?.id) {
                socketRef.current.emit('leave', { userId: user.id });
            }
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }
    }, [user?.id]);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, 100);
            return updated;
        });

        setUnreadCount(prev => prev + 1);

        const stored = localStorage.getItem('notifications');
        const notificationsList = stored ? JSON.parse(stored) : [];
        localStorage.setItem('notifications', JSON.stringify([newNotification, ...notificationsList].slice(0, 100)));
    }, []);

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        const stored = localStorage.getItem('notifications');
        if (stored) {
            const notificationsList = JSON.parse(stored);
            const updated = notificationsList.map(notif =>
                notif.id === notificationId ? { ...notif, read: true } : notif
            );
            localStorage.setItem('notifications', JSON.stringify(updated));
        }
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);

        const stored = localStorage.getItem('notifications');
        if (stored) {
            const notificationsList = JSON.parse(stored);
            const updated = notificationsList.map(notif => ({ ...notif, read: true }));
            localStorage.setItem('notifications', JSON.stringify(updated));
        }
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem('notifications');
    }, []);

    const emit = useCallback((event, data, callback) => {
        if (socket && isConnected) {
            if (callback && typeof callback === 'function') {
                socket.emit(event, data, callback);
            } else {
                socket.emit(event, data);
            }
            return true;
        } else {
            console.warn('Socket not connected - event not emitted:', event);
            return false;
        }
    }, [socket, isConnected]);

    const onEvent = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => { };
    }, [socket]);

    const offEvent = useCallback((event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    const emitWithAck = useCallback((event, data, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            if (!socket || !isConnected) {
                reject(new Error('Socket not connected'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Request timeout'));
            }, timeout);

            socket.emit(event, data, (response) => {
                clearTimeout(timeoutId);
                resolve(response);
            });
        });
    }, [socket, isConnected]);

    // Sync theme across devices
    const syncThemeAcrossDevices = useCallback((newTheme) => {
        if (socket && isConnected && user?.id) {
            socket.emit(SOCKET_EVENTS.THEME_CHANGED, {
                userId: user.id,
                theme: newTheme,
                deviceId: socket.id,
                timestamp: new Date().toISOString()
            });
        }
    }, [socket, isConnected, user?.id]);

    const trackOrderRealtime = useCallback((orderId, callback) => {
        if (socket && isConnected) {
            socket.emit('join_order_room', { orderId });
            orderTrackingRef.current.set(orderId, callback);

            const handleOrderUpdate = (data) => {
                if (data.orderId === orderId && callback) {
                    callback(data);
                }
            };

            socket.on(SOCKET_EVENTS.ORDER_UPDATE, handleOrderUpdate);

            return () => {
                socket.emit('leave_order_room', { orderId });
                orderTrackingRef.current.delete(orderId);
                socket.off(SOCKET_EVENTS.ORDER_UPDATE, handleOrderUpdate);
            };
        }
        return () => { };
    }, [socket, isConnected]);

    const subscribeToRestaurant = useCallback((restaurantId, callbacks) => {
        if (socket && isConnected) {
            socket.emit('join_restaurant_room', { restaurantId });
            restaurantSubscriptionRef.current.set(restaurantId, callbacks);

            const handlers = [];

            if (callbacks.onMenuUpdate) {
                const handler = (data) => {
                    if (data.restaurantId === restaurantId) {
                        callbacks.onMenuUpdate(data);
                    }
                };
                socket.on(SOCKET_EVENTS.MENU_UPDATED, handler);
                handlers.push({ event: SOCKET_EVENTS.MENU_UPDATED, handler });
            }

            if (callbacks.onStatusChange) {
                const handler = (data) => {
                    if (data.restaurantId === restaurantId) {
                        callbacks.onStatusChange(data);
                    }
                };
                socket.on(SOCKET_EVENTS.RESTAURANT_STATUS_CHANGE, handler);
                handlers.push({ event: SOCKET_EVENTS.RESTAURANT_STATUS_CHANGE, handler });
            }

            if (callbacks.onNewReview) {
                const handler = (data) => {
                    if (data.restaurantId === restaurantId) {
                        callbacks.onNewReview(data);
                    }
                };
                socket.on(SOCKET_EVENTS.NEW_REVIEW, handler);
                handlers.push({ event: SOCKET_EVENTS.NEW_REVIEW, handler });
            }

            return () => {
                socket.emit('leave_restaurant_room', { restaurantId });
                restaurantSubscriptionRef.current.delete(restaurantId);
                handlers.forEach(({ event, handler }) => {
                    socket.off(event, handler);
                });
            };
        }
        return () => { };
    }, [socket, isConnected]);

    const value = {
        socket,
        isConnected,
        notifications,
        unreadCount,
        reconnectAttempts,
        emit,
        onEvent,
        offEvent,
        emitWithAck,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        addNotification,
        disconnectSocket,
        initializeSocket,
        trackOrderRealtime,
        subscribeToRestaurant,
        syncThemeAcrossDevices,
        SOCKET_EVENTS,
        ORDER_STATUS,
        RESTAURANT_STATUS
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
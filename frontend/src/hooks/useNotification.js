import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for browser notifications
 * @returns {Object} Notification methods and state
 */
const useNotification = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        setSupported('Notification' in window);
    }, []);

    const requestPermission = useCallback(async () => {
        if (!supported) {
            console.warn('Notifications not supported');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, [supported]);

    const showNotification = useCallback((title, options = {}) => {
        if (!supported || permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const defaultOptions = {
            icon: '/logo192.png',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            silent: false,
            ...options
        };

        const notification = new Notification(title, defaultOptions);

        notification.onclick = (event) => {
            event.preventDefault();
            window.focus();
            if (options.onClick) {
                options.onClick(notification);
            }
            notification.close();
        };

        notification.onclose = () => {
            if (options.onClose) {
                options.onClose(notification);
            }
        };

        return notification;
    }, [supported, permission]);

    const sendOrderNotification = useCallback((orderId, status, restaurantName) => {
        const titles = {
            confirmed: 'Order Confirmed',
            preparing: 'Order Being Prepared',
            ready: 'Order Ready for Pickup',
            picked_up: 'Order Picked Up',
            delivered: 'Order Delivered'
        };

        const messages = {
            confirmed: `Your order #${orderId} has been confirmed`,
            preparing: `Your order #${orderId} is being prepared at ${restaurantName}`,
            ready: `Your order #${orderId} is ready for pickup`,
            picked_up: `Your order #${orderId} has been picked up by delivery partner`,
            delivered: `Your order #${orderId} has been delivered. Enjoy your meal!`
        };

        showNotification(titles[status] || 'Order Update', {
            body: messages[status] || `Your order #${orderId} status: ${status}`,
            tag: `order-${orderId}`,
            requireInteraction: status === 'delivered',
            data: { orderId, status, restaurantName }
        });
    }, [showNotification]);

    const sendPromotionalNotification = useCallback((title, message, offerCode = null) => {
        showNotification(title, {
            body: message,
            tag: 'promotion',
            data: { offerCode }
        });
    }, [showNotification]);

    return {
        supported,
        permission,
        requestPermission,
        showNotification,
        sendOrderNotification,
        sendPromotionalNotification
    };
};

export default useNotification;
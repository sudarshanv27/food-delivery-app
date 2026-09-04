// src/hooks/useOrderTracking.js
import { useEffect, useState, useCallback } from 'react';
import useOrder from './useOrder';
import useSocket from './useSocket';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

/**
 * Hook for real-time order tracking
 */
export const useOrderTracking = (orderId) => {
    const { getOrderById, trackOrder: fetchTrackOrder } = useOrder();
    const { isConnected, trackOrderRealtime, onEvent, SOCKET_EVENTS } = useSocket();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch initial order data
    useEffect(() => {
        if (orderId) {
            const loadOrder = async () => {
                setLoading(true);
                const orderData = await getOrderById(orderId);
                setOrder(orderData);
                setStatus(orderData?.status);
                setLoading(false);
            };
            loadOrder();
        }
    }, [orderId, getOrderById]);

    // Set up real-time tracking
    useEffect(() => {
        if (isConnected && orderId) {
            // Track order updates
            const stopTracking = trackOrderRealtime(orderId, (update) => {
                setStatus(update.status);
                setOrder(prev => ({ ...prev, ...update }));

                if (update.estimatedDeliveryTime) {
                    setEstimatedDeliveryTime(update.estimatedDeliveryTime);
                }

                // Show toast for status changes
                const statusMessages = {
                    confirmed: '✅ Order confirmed!',
                    preparing: '🍳 Restaurant is preparing your order',
                    ready: '📦 Order is ready for pickup',
                    out_for_delivery: '🚚 Order is out for delivery!',
                    delivered: '🎉 Order delivered! Enjoy your meal!'
                };

                if (statusMessages[update.status]) {
                    toast.success(statusMessages[update.status]);
                }
            });

            // Listen for driver location updates
            const handleDriverLocation = (event) => {
                if (event.detail.orderId === orderId) {
                    setDriverLocation(event.detail.location);
                    if (event.detail.estimatedArrival) {
                        setEstimatedDeliveryTime(event.detail.estimatedArrival);
                    }
                }
            };

            window.addEventListener('driverLocationUpdate', handleDriverLocation);

            return () => {
                stopTracking();
                window.removeEventListener('driverLocationUpdate', handleDriverLocation);
            };
        }
    }, [orderId, isConnected, trackOrderRealtime]);

    const getStatusProgress = useCallback(() => {
        const steps = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
        const currentIndex = steps.indexOf(status);
        return (currentIndex / (steps.length - 1)) * 100;
    }, [status]);

    const isDelivered = status === 'delivered';
    const isCancelled = status === 'cancelled';
    const isOutForDelivery = status === 'out_for_delivery';

    return {
        order,
        status,
        driverLocation,
        estimatedDeliveryTime,
        loading,
        isConnected,
        isDelivered,
        isCancelled,
        isOutForDelivery,
        getStatusProgress,
        trackOrder: fetchTrackOrder
    };
};
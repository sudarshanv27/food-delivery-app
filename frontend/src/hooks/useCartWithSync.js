// src/hooks/useCartWithSync.js
import { useEffect, useCallback } from 'react';
import useCart from './useCart';
import useSocket from './useSocket';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

/**
 * Cart hook with cross-device sync and real-time updates
 */
export const useCartWithSync = () => {
    const cart = useCart();
    const { isConnected, onEvent, offEvent, SOCKET_EVENTS } = useSocket();
    const { user } = useAuth();

    // Listen for cart updates from other devices
    useEffect(() => {
        if (isConnected && user) {
            const handleCartUpdated = (data) => {
                if (data.userId === user.id && data.deviceId !== window.socketId) {
                    cart.fetchCart();
                    toast.info('Cart updated from another device', { duration: 3000 });
                }
            };

            const handleItemAdded = (data) => {
                if (data.userId === user.id && data.deviceId !== window.socketId) {
                    toast.info(`${data.itemName} added to cart from another device`);
                    cart.fetchCart();
                }
            };

            const handleItemRemoved = (data) => {
                if (data.userId === user.id && data.deviceId !== window.socketId) {
                    toast.info(`${data.itemName} removed from cart`);
                    cart.fetchCart();
                }
            };

            onEvent(SOCKET_EVENTS.CART_UPDATED, handleCartUpdated);
            onEvent(SOCKET_EVENTS.CART_ITEM_ADDED, handleItemAdded);
            onEvent(SOCKET_EVENTS.CART_ITEM_REMOVED, handleItemRemoved);

            return () => {
                offEvent(SOCKET_EVENTS.CART_UPDATED, handleCartUpdated);
                offEvent(SOCKET_EVENTS.CART_ITEM_ADDED, handleItemAdded);
                offEvent(SOCKET_EVENTS.CART_ITEM_REMOVED, handleItemRemoved);
            };
        }
    }, [isConnected, user, onEvent, offEvent, cart, SOCKET_EVENTS]);

    const addToCartWithSync = useCallback(async (item, quantity = 1) => {
        const result = await cart.addToCart(item, quantity);

        if (result.success && isConnected) {
            // Emit event for other devices
            window.socket?.emit(SOCKET_EVENTS.CART_ITEM_ADDED, {
                userId: user?.id,
                itemName: item.name,
                quantity,
                timestamp: new Date()
            });
        }

        return result;
    }, [cart, isConnected, user, SOCKET_EVENTS]);

    const removeItemWithSync = useCallback(async (cartId, itemName) => {
        const result = await cart.removeItem(cartId);

        if (result.success && isConnected) {
            window.socket?.emit(SOCKET_EVENTS.CART_ITEM_REMOVED, {
                userId: user?.id,
                itemName,
                timestamp: new Date()
            });
        }

        return result;
    }, [cart, isConnected, user, SOCKET_EVENTS]);

    return {
        ...cart,
        addToCart: addToCartWithSync,
        removeItem: removeItemWithSync
    };
};
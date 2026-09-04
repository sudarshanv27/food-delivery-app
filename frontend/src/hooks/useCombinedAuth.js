// src/hooks/useCombinedAuth.js
import { useEffect } from 'react';
import useAuth from './useAuth';
import useSocket from './useSocket';
import useCart from './useCart';

/**
 * Combined auth hook that integrates auth state with socket and cart
 */
export const useCombinedAuth = () => {
    const auth = useAuth();
    const { isConnected, syncThemeAcrossDevices } = useSocket();
    const { syncOfflineCart } = useCart();

    // Sync cart when auth state changes
    useEffect(() => {
        if (auth.isAuthenticated && isConnected) {
            syncOfflineCart();
        }
    }, [auth.isAuthenticated, isConnected, syncOfflineCart]);

    // Sync theme across devices on login
    useEffect(() => {
        if (auth.isAuthenticated && isConnected && auth.user) {
            syncThemeAcrossDevices(auth.theme || 'system');
        }
    }, [auth.isAuthenticated, isConnected, auth.user, auth.theme, syncThemeAcrossDevices]);

    return {
        ...auth,
        isSocketConnected: isConnected,
    };
};
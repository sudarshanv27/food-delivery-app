// src/hooks/useThemeWithSync.js
import { useEffect } from 'react';
import useTheme from './useTheme';
import useSocket from './useSocket';
import useAuth from './useAuth';

/**
 * Theme hook with cross-device synchronization
 */
export const useThemeWithSync = () => {
    const theme = useTheme();
    const { isConnected, onEvent, offEvent, syncThemeAcrossDevices, SOCKET_EVENTS } = useSocket();
    const { user } = useAuth();

    // Listen for theme changes from other devices
    useEffect(() => {
        if (isConnected && user) {
            const handleThemeChanged = (data) => {
                if (data.userId !== user.id && data.deviceId !== window.socketId) {
                    theme.setTheme(data.theme);
                }
            };

            onEvent(SOCKET_EVENTS.THEME_CHANGED, handleThemeChanged);

            return () => {
                offEvent(SOCKET_EVENTS.THEME_CHANGED, handleThemeChanged);
            };
        }
    }, [isConnected, user, onEvent, offEvent, theme, SOCKET_EVENTS]);

    const setThemeWithSync = (newTheme) => {
        theme.setTheme(newTheme);

        if (isConnected && user) {
            syncThemeAcrossDevices(newTheme);
        }
    };

    return {
        ...theme,
        setTheme: setThemeWithSync
    };
};
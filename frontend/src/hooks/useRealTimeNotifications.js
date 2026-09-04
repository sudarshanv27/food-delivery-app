// src/hooks/useRealTimeNotifications.js
import { useEffect, useCallback } from 'react';
import useSocket from './useSocket';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

/**
 * Hook for managing real-time notifications
 */
export const useRealTimeNotifications = () => {
    const {
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        onEvent,
        offEvent,
        SOCKET_EVENTS
    } = useSocket();
    const { user } = useAuth();

    // Set up notification handlers
    useEffect(() => {
        if (isConnected && user) {
            const handleNotification = (data) => {
                // Show different toasts based on notification type
                switch (data.type) {
                    case 'order':
                        toast.custom((t) => (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📦</span>
                                    <div>
                                        <strong className="block text-gray-900 dark:text-white">
                                            {data.title}
                                        </strong>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {data.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ), { duration: 5000 });
                        break;

                    case 'promotion':
                        toast.success(`🎉 ${data.message}`, { duration: 8000 });
                        break;

                    case 'delivery':
                        toast.success(`🚚 ${data.message}`, { duration: 10000 });
                        break;

                    default:
                        toast.info(data.message);
                }
            };

            onEvent(SOCKET_EVENTS.NOTIFICATION, handleNotification);

            return () => {
                offEvent(SOCKET_EVENTS.NOTIFICATION, handleNotification);
            };
        }
    }, [isConnected, user, onEvent, offEvent, SOCKET_EVENTS]);

    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(n => !n.read);
    }, [notifications]);

    const getNotificationsByType = useCallback((type) => {
        return notifications.filter(n => n.type === type);
    }, [notifications]);

    const getRecentNotifications = useCallback((limit = 10) => {
        return notifications.slice(0, limit);
    }, [notifications]);

    return {
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        getUnreadNotifications,
        getNotificationsByType,
        getRecentNotifications
    };
};
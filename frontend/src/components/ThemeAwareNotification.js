// frontend/src/components/ThemeAwareNotification.jsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, X, CheckCircle, Package, Truck, Star } from 'lucide-react';

const ThemeAwareNotification = ({ notification, onClose, onMarkAsRead }) => {
    const { isDarkMode } = useTheme();

    const getIcon = () => {
        switch (notification.type) {
            case 'order':
                return <Package className="w-5 h-5 text-blue-500" />;
            case 'delivery':
                return <Truck className="w-5 h-5 text-purple-500" />;
            case 'restaurant':
                return <Star className="w-5 h-5 text-yellow-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className={`p-4 rounded-lg shadow-lg mb-3 transition-all ${isDarkMode
                ? `bg-gray-800 hover:bg-gray-750 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`
                : `bg-white hover:bg-gray-50 ${!notification.read ? 'border-l-4 border-blue-500' : ''}`
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                        {getIcon()}
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {notification.message}
                        </p>
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(notification.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!notification.read && (
                        <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className={`p-1 rounded hover:bg-opacity-20 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                        >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </button>
                    )}
                    <button
                        onClick={() => onClose(notification.id)}
                        className={`p-1 rounded hover:bg-opacity-20 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                    >
                        <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationCenter = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSocket();
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const handleMarkAsRead = (id) => {
        markAsRead(id);
    };

    const handleClose = (id) => {
        // Just close without marking as read
    };

    return (
        <div className="relative">
            {/* Notification Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
            >
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl z-50 ${isDarkMode ? 'bg-gray-900' : 'bg-white'
                        }`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Notifications
                                </h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className={`text-xs px-2 py-1 rounded ${isDarkMode
                                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearNotifications}
                                            className={`text-xs px-2 py-1 rounded ${isDarkMode
                                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <ThemeAwareNotification
                                        key={notification.id}
                                        notification={notification}
                                        onClose={handleClose}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
// frontend/src/components/RestaurantOwnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSocket, ORDER_STATUS, RESTAURANT_STATUS } from '../config/socket';
import { useRestaurant } from '../context/RestaurantContext';
import { useOrder } from '../context/OrderContext';
import { Bell, Package, Star, TrendingUp, Users } from 'lucide-react';

const RestaurantOwnerDashboard = () => {
    const { isConnected, updateRestaurantStatus, subscribeToRestaurantUpdates } = useSocket();
    const { currentRestaurant, fetchMenu, menu } = useRestaurant();
    const { orders, fetchOrders } = useOrder();
    const [restaurantStatus, setRestaurantStatus] = useState(RESTAURANT_STATUS.OPEN);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (currentRestaurant?.id) {
            // Subscribe to real-time updates for this restaurant
            const unsubscribe = subscribeToRestaurantUpdates(currentRestaurant.id, {
                onNewOrder: (data) => {
                    setNotifications(prev => [{
                        id: data.orderId,
                        message: `New order #${data.orderId}`,
                        timestamp: new Date(),
                        type: 'order'
                    }, ...prev]);
                    fetchOrders(1, 'pending');
                },
                onMenuUpdate: (data) => {
                    setNotifications(prev => [{
                        id: Date.now(),
                        message: 'Menu has been updated',
                        timestamp: new Date(),
                        type: 'menu'
                    }, ...prev]);
                    fetchMenu(currentRestaurant.id);
                },
                onNewReview: (data) => {
                    setNotifications(prev => [{
                        id: Date.now(),
                        message: `New ${data.rating}-star review received!`,
                        timestamp: new Date(),
                        type: 'review'
                    }, ...prev]);
                }
            });

            return () => unsubscribe();
        }
    }, [currentRestaurant, subscribeToRestaurantUpdates, fetchOrders, fetchMenu]);

    const handleStatusChange = async (newStatus) => {
        await updateRestaurantStatus(currentRestaurant.id, newStatus);
        setRestaurantStatus(newStatus);
    };

    const pendingOrders = orders.filter(o =>
        [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(o.status)
    );

    const preparingOrders = orders.filter(o => o.status === ORDER_STATUS.PREPARING);
    const readyOrders = orders.filter(o => o.status === ORDER_STATUS.READY);

    return (
        <div className="p-6">
            {/* Connection Status */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm">
                        {isConnected ? 'Live Updates Active' : 'Offline Mode'}
                    </span>
                </div>

                {/* Restaurant Status Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStatusChange(RESTAURANT_STATUS.OPEN)}
                        className={`px-4 py-2 rounded ${restaurantStatus === RESTAURANT_STATUS.OPEN
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200'
                            }`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => handleStatusChange(RESTAURANT_STATUS.BUSY)}
                        className={`px-4 py-2 rounded ${restaurantStatus === RESTAURANT_STATUS.BUSY
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200'
                            }`}
                    >
                        Busy
                    </button>
                    <button
                        onClick={() => handleStatusChange(RESTAURANT_STATUS.CLOSED)}
                        className={`px-4 py-2 rounded ${restaurantStatus === RESTAURANT_STATUS.CLOSED
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200'
                            }`}
                    >
                        Closed
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending Orders</p>
                            <p className="text-2xl font-bold">{pendingOrders.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Preparing</p>
                            <p className="text-2xl font-bold">{preparingOrders.length}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Ready for Pickup</p>
                            <p className="text-2xl font-bold">{readyOrders.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Rating</p>
                            <p className="text-2xl font-bold">{currentRestaurant?.rating || 0}</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">Recent Notifications</h3>
                    </div>
                    <div className="space-y-2">
                        {notifications.slice(0, 5).map(notif => (
                            <div key={notif.id} className="text-sm text-gray-600">
                                • {notif.message}
                                <span className="text-xs text-gray-400 ml-2">
                                    {new Date(notif.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Current Orders</h3>
                </div>
                <div className="divide-y">
                    {pendingOrders.map(order => (
                        <div key={order.id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">Order #{order.id}</p>
                                    <p className="text-sm text-gray-600">
                                        {order.items?.length} items • ${order.total}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateOrderStatus(order.id, ORDER_STATUS.CONFIRMED)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => updateOrderStatus(order.id, ORDER_STATUS.CANCELLED)}
                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pendingOrders.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No pending orders
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantOwnerDashboard;
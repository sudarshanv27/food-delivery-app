// src/components/OrderDetailsPage.jsx
import React from 'react';
import { useOrderTracking, useRealTimeNotifications } from '../hooks';

const OrderDetailsPage = ({ orderId }) => {
    const {
        order,
        status,
        driverLocation,
        loading,
        isConnected,
        estimatedDeliveryTime
    } = useOrderTracking(orderId);

    const { unreadCount } = useRealTimeNotifications();

    if (loading) {
        return <div className="flex justify-center p-8">Loading order details...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Order #{order?.id}</h1>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                        {isConnected ? 'Live Updates' : 'Offline Mode'}
                    </span>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {unreadCount} new
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="mb-4">
                    <h2 className="font-semibold mb-2">Order Status</h2>
                    <div className="text-2xl font-bold capitalize text-blue-600">
                        {status}
                    </div>
                </div>

                {driverLocation && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Driver Location</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Lat: {driverLocation.lat}, Lng: {driverLocation.lng}
                        </p>
                    </div>
                )}

                {estimatedDeliveryTime && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            {new Date(estimatedDeliveryTime).toLocaleString()}
                        </p>
                    </div>
                )}

                <div className="border-t dark:border-gray-700 pt-4">
                    <h3 className="font-semibold mb-2">Items</h3>
                    {order?.items?.map((item, index) => (
                        <div key={index} className="flex justify-between py-2">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t dark:border-gray-700 mt-2 pt-2 font-bold flex justify-between">
                        <span>Total</span>
                        <span>${order?.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
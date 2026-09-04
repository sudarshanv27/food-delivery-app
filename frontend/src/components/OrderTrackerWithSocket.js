// frontend/src/components/OrderTrackerWithSocket.jsx
import React, { useEffect, useState } from 'react';
import { useSocket, ORDER_STATUS } from '../context/SocketContext';
import { MapPin, Package, Bike, CheckCircle } from 'lucide-react';

const OrderTrackerWithSocket = ({ orderId }) => {
    const { isConnected, trackOrderRealtime, emit } = useSocket();
    const [orderStatus, setOrderStatus] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);

    useEffect(() => {
        if (isConnected && orderId) {
            // Track order in real-time
            const stopTracking = trackOrderRealtime(orderId, (update) => {
                setOrderStatus(update.status);
                if (update.driverLocation) {
                    setDriverLocation(update.driverLocation);
                }
            });

            // Listen for driver location updates
            const handleDriverLocation = (event) => {
                if (event.detail.orderId === orderId) {
                    setDriverLocation(event.detail.location);
                }
            };
            
            window.addEventListener('driverLocationUpdate', handleDriverLocation);

            return () => {
                stopTracking();
                window.removeEventListener('driverLocationUpdate', handleDriverLocation);
            };
        }
    }, [orderId, isConnected, trackOrderRealtime]);

    const getStatusIcon = () => {
        switch (orderStatus) {
            case ORDER_STATUS.PREPARING:
                return <Package className="w-6 h-6 text-orange-500" />;
            case ORDER_STATUS.OUT_FOR_DELIVERY:
                return <Bike className="w-6 h-6 text-purple-500" />;
            case ORDER_STATUS.DELIVERED:
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            default:
                return <MapPin className="w-6 h-6 text-blue-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order #{orderId}</h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs">
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
                {getStatusIcon()}
                <span className="capitalize font-medium">{orderStatus || 'Pending'}</span>
            </div>
            
            {driverLocation && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                        Driver Location: {driverLocation.lat}, {driverLocation.lng}
                    </p>
                </div>
            )}
        </div>
    );
};

export default OrderTrackerWithSocket;
// frontend/src/components/OrderTracker.jsx
import React, { useEffect, useState } from 'react';
import { useSocket, ORDER_STATUS, STATUS_COLORS } from '../config/socket';
import { useOrder } from '../context/OrderContext';
import { MapPin, Package, Bike, CheckCircle, XCircle } from 'lucide-react';

const OrderTracker = ({ orderId }) => {
    const { isConnected, trackOrder } = useSocket();
    const { getOrderById } = useOrder();
    const [order, setOrder] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        // Load initial order data
        const loadOrder = async () => {
            const orderData = await getOrderById(orderId);
            setOrder(orderData);
            setStatus(orderData?.status);
        };
        loadOrder();

        // Track real-time order updates
        if (isConnected && orderId) {
            const stopTracking = trackOrder(orderId, (update) => {
                setStatus(update.status);
                setOrder(prev => ({ ...prev, status: update.status }));

                if (update.driverLocation) {
                    setDriverLocation(update.driverLocation);
                }
            });

            return () => {
                stopTracking();
            };
        }
    }, [orderId, isConnected, trackOrder, getOrderById]);

    const getStatusStep = () => {
        const steps = [
            { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed', icon: CheckCircle },
            { key: ORDER_STATUS.PREPARING, label: 'Preparing', icon: Package },
            { key: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'On the Way', icon: Bike },
            { key: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: CheckCircle },
        ];

        const currentIndex = steps.findIndex(step => step.key === status);

        return (
            <div className="flex items-center justify-between mt-8">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.key} className="flex-1 text-center">
                            <div className={`relative ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                                <div className="flex justify-center mb-2">
                                    <Icon className={`w-8 h-8 ${isCurrent ? 'animate-pulse' : ''}`} />
                                </div>
                                <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                                    {step.label}
                                </p>
                                {index < steps.length - 1 && (
                                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                                        }`} style={{ transform: 'translateY(-50%)' }} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!order) {
        return <div className="flex justify-center">Loading order details...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Order #{order.id}</h2>
                <div className="mt-2 flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    <span className="text-sm text-gray-600">
                        Status: {status?.toUpperCase()}
                    </span>
                </div>
            </div>

            {getStatusStep()}

            {driverLocation && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Driver Location:</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        Lat: {driverLocation.lat}, Lng: {driverLocation.lng}
                    </p>
                </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Connection Status</h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                        {isConnected ? 'Real-time updates active' : 'Offline - updates will sync when online'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderTracker;
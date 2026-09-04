import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DeliveryTracker from '../../components/delivery/DeliveryTracker';
import DeliveryMap from '../../components/delivery/DeliveryMap';
import Button from '../../components/common/Button';
import './Tracking.css';

const Tracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tracker');

    useEffect(() => {
        fetchOrderDetails();
        // Simulate real-time updates
        const interval = setInterval(() => {
            updateLocation();
        }, 30000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockOrder = {
                id: id,
                status: 'on_the_way',
                estimatedDelivery: new Date(Date.now() + 25 * 60000),
                restaurant: {
                    name: 'Pizza Hut',
                    address: '123 Main Street, Downtown',
                    lat: 40.7128,
                    lng: -74.0060
                },
                customer: {
                    name: 'John Doe',
                    address: '456 Park Avenue, Uptown',
                    lat: 40.7580,
                    lng: -73.9855
                },
                deliveryPartner: {
                    name: 'Raj Kumar',
                    phone: '+1 234 567 890',
                    rating: 4.8,
                    vehicleNumber: 'DL 01 AB 1234',
                    currentLocation: {
                        lat: 40.7350,
                        lng: -73.9950
                    }
                },
                timeline: [
                    { status: 'Order Placed', time: new Date(Date.now() - 45 * 60000), completed: true },
                    { status: 'Order Confirmed', time: new Date(Date.now() - 40 * 60000), completed: true },
                    { status: 'Preparing', time: new Date(Date.now() - 30 * 60000), completed: true },
                    { status: 'Ready for Pickup', time: new Date(Date.now() - 15 * 60000), completed: true },
                    { status: 'Picked Up', time: new Date(Date.now() - 10 * 60000), completed: true },
                    { status: 'On The Way', time: new Date(Date.now() - 5 * 60000), completed: true },
                    { status: 'Delivered', time: null, completed: false }
                ]
            };
            setOrder(mockOrder);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateLocation = async () => {
        // Simulate location update
        console.log('Updating delivery location...');
    };

    const handleContactSupport = () => {
        navigate('/contact');
    };

    const handleViewOrderDetails = () => {
        navigate(`/orders/${id}`);
    };

    const formatTime = (date) => {
        if (!date) return 'Calculating...';
        const now = new Date();
        const diff = Math.max(0, Math.floor((date - now) / 60000));
        if (diff === 0) return 'Arriving soon';
        if (diff < 60) return `${diff} minutes`;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    if (isLoading) {
        return (
            <div className="tracking-loading">
                <div className="loading-spinner"></div>
                <p>Loading tracking details...</p>
            </div>
        );
    }

    return (
        <div className="tracking-page">
            <div className="tracking-container">
                {/* Header */}
                <div className="tracking-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h1>Track Your Order</h1>
                    <p>Order #{order.id}</p>
                </div>

                {/* Status Banner */}
                <div className="status-banner">
                    <div className="status-icon">🛵</div>
                    <div className="status-info">
                        <div className="status-label">Current Status</div>
                        <div className="status-value">On The Way</div>
                        <div className="status-estimate">
                            Estimated Delivery: {formatTime(order.estimatedDelivery)}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tracking-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tracker')}
                    >
                        📍 Tracker
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                        onClick={() => setActiveTab('map')}
                    >
                        🗺️ Map
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        📋 Details
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tracking-content">
                    {activeTab === 'tracker' && (
                        <DeliveryTracker orderId={order.id} />
                    )}

                    {activeTab === 'map' && (
                        <DeliveryMap
                            restaurantLocation={order.restaurant}
                            customerLocation={order.customer}
                            deliveryPartnerLocation={order.deliveryPartner.currentLocation}
                        />
                    )}

                    {activeTab === 'details' && (
                        <div className="details-tab">
                            <div className="detail-card">
                                <h3>Order Information</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Order ID:</span>
                                    <span className="detail-value">{order.id}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Order Date:</span>
                                    <span className="detail-value">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Payment Method:</span>
                                    <span className="detail-value">Online</span>
                                </div>
                            </div>

                            <div className="detail-card">
                                <h3>Delivery Address</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Address:</span>
                                    <span className="detail-value">{order.customer.address}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Contact:</span>
                                    <span className="detail-value">+1 234 567 890</span>
                                </div>
                            </div>

                            <div className="detail-card">
                                <h3>Restaurant Information</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{order.restaurant.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Address:</span>
                                    <span className="detail-value">{order.restaurant.address}</span>
                                </div>
                            </div>

                            <div className="detail-card">
                                <h3>Delivery Partner</h3>
                                <div className="detail-row">
                                    <span className="detail-label">Name:</span>
                                    <span className="detail-value">{order.deliveryPartner.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Rating:</span>
                                    <span className="detail-value">⭐ {order.deliveryPartner.rating}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Vehicle:</span>
                                    <span className="detail-value">{order.deliveryPartner.vehicleNumber}</span>
                                </div>
                                <button className="contact-btn">📞 Contact Partner</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="tracking-actions">
                    <Button variant="outline" onClick={handleViewOrderDetails}>
                        View Order Details
                    </Button>
                    <Button variant="outline" onClick={handleContactSupport}>
                        Need Help?
                    </Button>
                </div>

                {/* Help Section */}
                <div className="help-section">
                    <div className="help-icon">💬</div>
                    <div className="help-text">
                        <div className="help-title">Need assistance with your delivery?</div>
                        <p>Our support team is available 24/7 to help you</p>
                    </div>
                    <button className="chat-btn">Chat Now</button>
                </div>
            </div>
        </div>
    );
};

export default Tracking;
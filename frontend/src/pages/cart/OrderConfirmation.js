import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockOrder = {
                id: id || 'ORD-123456',
                date: new Date().toISOString(),
                status: 'confirmed',
                total: 450,
                subtotal: 420,
                tax: 21,
                deliveryFee: 9,
                discount: 0,
                items: [
                    { id: 1, name: 'Margherita Pizza', quantity: 1, price: 250, image: '/pizza.jpg' },
                    { id: 2, name: 'Garlic Bread', quantity: 2, price: 100, image: '/garlic-bread.jpg' }
                ],
                restaurant: {
                    id: 1,
                    name: 'Pizza Hut',
                    image: '/pizza-hut.jpg',
                    address: '123 Main Street, Downtown'
                },
                deliveryAddress: {
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    phone: '+1 234 567 890'
                },
                paymentMethod: 'Online',
                estimatedDeliveryTime: '25-35 minutes',
                deliveryPartner: {
                    name: 'Raj Kumar',
                    phone: '+1 234 567 890'
                }
            };
            setOrder(mockOrder);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="order-confirmation-loading">
                <div className="loading-spinner"></div>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-confirmation-error">
                <div className="error-icon">⚠️</div>
                <h3>Order Not Found</h3>
                <p>We couldn't find your order details.</p>
                <Link to="/orders">
                    <Button variant="primary">View My Orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="order-confirmation-page">
            <div className="confirmation-container">
                {/* Success Header */}
                <div className="confirmation-header">
                    <div className="success-animation">
                        <div className="success-checkmark">
                            <div className="check-icon">✓</div>
                        </div>
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your order. Your food will be delivered soon.</p>
                    <div className="order-number">
                        Order ID: <span>{order.id}</span>
                    </div>
                </div>

                {/* Delivery Progress */}
                <div className="delivery-progress">
                    <div className="progress-step completed">
                        <div className="step-icon">✅</div>
                        <div className="step-label">Order Confirmed</div>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-icon">👨‍🍳</div>
                        <div className="step-label">Preparing</div>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-icon">🛵</div>
                        <div className="step-label">On The Way</div>
                    </div>
                    <div className="progress-line"></div>
                    <div className="progress-step">
                        <div className="step-icon">🏠</div>
                        <div className="step-label">Delivered</div>
                    </div>
                </div>

                {/* Estimated Delivery */}
                <div className="estimated-delivery">
                    <div className="delivery-icon">⏱️</div>
                    <div className="delivery-info">
                        <div className="delivery-label">Estimated Delivery Time</div>
                        <div className="delivery-time">{order.estimatedDeliveryTime}</div>
                    </div>
                </div>

                <div className="confirmation-grid">
                    {/* Order Summary */}
                    <div className="confirmation-card">
                        <h3>Order Summary</h3>
                        <div className="order-items">
                            {order.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img src={item.image} alt={item.name} className="item-image" />
                                    <div className="item-info">
                                        <div className="item-name">{item.name}</div>
                                        <div className="item-quantity">Quantity: {item.quantity}</div>
                                    </div>
                                    <div className="item-price">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="price-row">
                                <span>Tax (5% GST)</span>
                                <span>₹{order.tax}</span>
                            </div>
                            <div className="price-row">
                                <span>Delivery Fee</span>
                                <span>₹{order.deliveryFee}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="price-row discount">
                                    <span>Discount</span>
                                    <span>-₹{order.discount}</span>
                                </div>
                            )}
                            <div className="price-row total">
                                <span>Total</span>
                                <span>₹{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="confirmation-card">
                        <h3>Delivery Details</h3>
                        <div className="delivery-details">
                            <div className="detail-row">
                                <span className="detail-label">Delivery Address:</span>
                                <span className="detail-value">
                                    {order.deliveryAddress.street}, {order.deliveryAddress.city},
                                    {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Contact Number:</span>
                                <span className="detail-value">{order.deliveryAddress.phone}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Payment Method:</span>
                                <span className="detail-value">{order.paymentMethod}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Order Date:</span>
                                <span className="detail-value">{formatDate(order.date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="confirmation-card">
                        <h3>Restaurant Details</h3>
                        <div className="restaurant-details">
                            <img src={order.restaurant.image} alt={order.restaurant.name} />
                            <div>
                                <div className="restaurant-name">{order.restaurant.name}</div>
                                <div className="restaurant-address">{order.restaurant.address}</div>
                                <button className="contact-restaurant-btn">📞 Contact Restaurant</button>
                            </div>
                        </div>
                    </div>

                    {/* Need Help */}
                    <div className="confirmation-card">
                        <h3>Need Help?</h3>
                        <div className="help-options">
                            <button className="help-btn" onClick={() => navigate(`/tracking/${order.id}`)}>
                                🚚 Track Order
                            </button>
                            <button className="help-btn" onClick={() => navigate('/contact')}>
                                💬 Contact Support
                            </button>
                            <button className="help-btn" onClick={() => window.print()}>
                                🖨️ Print Receipt
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Continue Shopping
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/orders')}>
                        View All Orders
                    </Button>
                </div>

                {/* Share Section */}
                <div className="share-section">
                    <p>Share your order and earn rewards!</p>
                    <div className="share-buttons">
                        <button className="share-btn whatsapp">📱 WhatsApp</button>
                        <button className="share-btn facebook">📘 Facebook</button>
                        <button className="share-btn twitter">🐦 Twitter</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
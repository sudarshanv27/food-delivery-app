// src/components/profile/UserOrderHistory.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import RatingStars from '../common/RatingStars';
import './UserOrderHistory.css';

const UserOrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showReorderConfirm, setShowReorderConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockOrders = [
                {
                    id: 'ORD-001',
                    date: '2024-01-15T18:30:00',
                    status: 'delivered',
                    total: 450,
                    items: [
                        { id: 1, name: 'Margherita Pizza', quantity: 1, price: 250 },
                        { id: 2, name: 'Garlic Bread', quantity: 2, price: 100 }
                    ],
                    restaurant: {
                        id: 1,
                        name: 'Pizza Hut',
                        image: '/pizza-hut.jpg',
                        deliveryTime: '30-40 min'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Online',
                    rating: 4,
                    review: 'Great pizza! The crust was perfect and toppings were fresh.',
                    trackingId: 'TRK123456',
                    estimatedDelivery: '2024-01-15T19:00:00'
                },
                {
                    id: 'ORD-002',
                    date: '2024-01-10T19:15:00',
                    status: 'delivered',
                    total: 320,
                    items: [
                        { id: 3, name: 'McChicken Burger', quantity: 2, price: 160 }
                    ],
                    restaurant: {
                        id: 2,
                        name: "McDonald's",
                        image: '/mcdonalds.jpg',
                        deliveryTime: '20-30 min'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Cash on Delivery',
                    rating: 0,
                    trackingId: 'TRK123457',
                    estimatedDelivery: '2024-01-10T19:45:00'
                },
                {
                    id: 'ORD-003',
                    date: '2024-01-05T20:00:00',
                    status: 'cancelled',
                    total: 280,
                    items: [
                        { id: 4, name: 'Chicken Biryani', quantity: 1, price: 280 }
                    ],
                    restaurant: {
                        id: 3,
                        name: 'Biryani House',
                        image: '/biryani.jpg',
                        deliveryTime: '45-60 min'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Online',
                    rating: 0,
                    cancellationReason: 'Customer requested cancellation'
                },
                {
                    id: 'ORD-004',
                    date: '2024-01-18T12:30:00',
                    status: 'processing',
                    total: 520,
                    items: [
                        { id: 5, name: 'Sushi Roll', quantity: 2, price: 260 }
                    ],
                    restaurant: {
                        id: 4,
                        name: 'Sushi Master',
                        image: '/sushi.jpg',
                        deliveryTime: '25-35 min'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Online',
                    rating: 0,
                    estimatedDelivery: '2024-01-18T13:00:00'
                }
            ];
            setOrders(mockOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const configs = {
            delivered: { class: 'delivered', icon: '✓', text: 'Delivered' },
            processing: { class: 'processing', icon: '🔄', text: 'Processing' },
            cancelled: { class: 'cancelled', icon: '✗', text: 'Cancelled' },
            pending: { class: 'pending', icon: '⏰', text: 'Pending' },
            confirmed: { class: 'confirmed', icon: '✅', text: 'Confirmed' },
            preparing: { class: 'preparing', icon: '👨‍🍳', text: 'Preparing' },
            out_for_delivery: { class: 'out_for_delivery', icon: '🚚', text: 'Out for Delivery' }
        };
        const config = configs[status] || { class: 'default', icon: '📦', text: status };
        return (
            <div className={`status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </div>
        );
    };

    const getProgressSteps = (status) => {
        const steps = [
            { key: 'confirmed', label: 'Confirmed', icon: '✅' },
            { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
            { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
            { key: 'delivered', label: 'Delivered', icon: '📦' }
        ];

        let currentStep = 0;
        switch (status) {
            case 'confirmed': currentStep = 0; break;
            case 'preparing': currentStep = 1; break;
            case 'out_for_delivery': currentStep = 2; break;
            case 'delivered': currentStep = 3; break;
            default: currentStep = -1;
        }

        return { steps, currentStep };
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const handleReorder = async (order) => {
        setSelectedOrder(order);
        setShowReorderConfirm(true);
    };

    const confirmReorder = async () => {
        console.log('Reorder:', selectedOrder);
        setShowReorderConfirm(false);
        setSelectedOrder(null);
        // Add to cart and redirect to checkout
    };

    const handleCancelOrder = async (order) => {
        setSelectedOrderToCancel(order);
        setShowCancelConfirm(true);
    };

    const confirmCancelOrder = async () => {
        console.log('Cancel order:', selectedOrderToCancel);
        setOrders(prev => prev.map(order =>
            order.id === selectedOrderToCancel.id
                ? { ...order, status: 'cancelled', cancellationReason: 'User requested cancellation' }
                : order
        ));
        setShowCancelConfirm(false);
        setSelectedOrderToCancel(null);
    };

    const handleTrackOrder = (orderId) => {
        console.log('Track order:', orderId);
        // Navigate to tracking page
    };

    const handleRateOrder = (order) => {
        setSelectedOrder(order);
        setRating(order.rating || 0);
        setReview(order.review || '');
        setShowRatingModal(true);
    };

    const submitRating = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        const updatedOrders = orders.map(order =>
            order.id === selectedOrder.id
                ? { ...order, rating, review }
                : order
        );
        setOrders(updatedOrders);
        setShowRatingModal(false);
        setSelectedOrder(null);
        setRating(0);
        setReview('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="order-history-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="order-history-empty">
                <div className="empty-icon">📦</div>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet. Start ordering your favorite food!</p>
                <Link to="/restaurants">
                    <Button variant="primary">Browse Restaurants</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="order-history">
            <div className="order-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">📋</span>
                        My Orders
                    </h2>
                    <span className="order-count">{orders.length} total</span>
                </div>
                <div className="order-filters">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All
                    </button>
                    <button className={`filter-btn ${filter === 'processing' ? 'active' : ''}`} onClick={() => setFilter('processing')}>
                        Processing
                    </button>
                    <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>
                        Delivered
                    </button>
                    <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
                        Cancelled
                    </button>
                </div>
            </div>

            <div className="orders-list">
                {filteredOrders.map((order) => {
                    const { steps, currentStep } = getProgressSteps(order.status);
                    return (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="order-info">
                                    <span className="order-id">Order #{order.id}</span>
                                    <span className="order-date">{formatDate(order.date)}</span>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            <div className="order-card-body">
                                <div className="restaurant-info">
                                    <img src={order.restaurant.image || '/default-restaurant.jpg'} alt={order.restaurant.name} className="restaurant-image" />
                                    <div className="restaurant-details">
                                        <h4>{order.restaurant.name}</h4>
                                        <p className="delivery-time">⏱️ Est. Delivery: {order.restaurant.deliveryTime}</p>
                                    </div>
                                </div>

                                <div className="order-summary">
                                    <div className="items-preview">
                                        {order.items.slice(0, 2).map((item, index) => (
                                            <div key={index} className="preview-item">
                                                <span>{item.name}</span>
                                                <span>x{item.quantity}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <button className="view-more-btn" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                                {expandedOrder === order.id ? 'Show less' : `+${order.items.length - 2} more items`}
                                            </button>
                                        )}
                                    </div>

                                    <div className="order-total">
                                        <span>Total Amount:</span>
                                        <strong>₹{order.total}</strong>
                                    </div>
                                </div>

                                {expandedOrder === order.id && (
                                    <div className="order-items-expanded">
                                        <h4>Order Items</h4>
                                        {order.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-quantity">x{item.quantity}</span>
                                                <span className="item-price">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                        <div className="delivery-details">
                                            <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                                            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                            {order.trackingId && <p><strong>Tracking ID:</strong> {order.trackingId}</p>}
                                            {order.cancellationReason && <p><strong>Cancellation Reason:</strong> {order.cancellationReason}</p>}
                                        </div>
                                    </div>
                                )}

                                {order.status === 'processing' && (
                                    <div className="order-progress">
                                        {steps.map((step, index) => (
                                            <div key={step.key} className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'current' : ''}`}>
                                                <div className="step-icon">{step.icon}</div>
                                                <div className="step-label">{step.label}</div>
                                                {index < steps.length - 1 && <div className="step-line" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="order-card-footer">
                                {order.status === 'processing' && (
                                    <>
                                        <button className="footer-btn track" onClick={() => handleTrackOrder(order.id)}>
                                            🚚 Track Order
                                        </button>
                                        <button className="footer-btn cancel" onClick={() => handleCancelOrder(order)}>
                                            ❌ Cancel Order
                                        </button>
                                    </>
                                )}

                                {order.status === 'delivered' && (
                                    <>
                                        <button className="footer-btn reorder" onClick={() => handleReorder(order)}>
                                            🔄 Reorder
                                        </button>
                                        {order.rating === 0 && (
                                            <button className="footer-btn rate" onClick={() => handleRateOrder(order)}>
                                                ⭐ Rate Order
                                            </button>
                                        )}
                                    </>
                                )}

                                {order.status === 'cancelled' && (
                                    <button className="footer-btn reorder" onClick={() => handleReorder(order)}>
                                        🔄 Reorder
                                    </button>
                                )}

                                {order.status === 'delivered' && order.rating > 0 && (
                                    <div className="rated-section">
                                        <RatingStars rating={order.rating} size="small" readonly />
                                        {order.review && <span className="review-text">"{order.review}"</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
                    <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Rate Your Order</h3>
                            <button className="close-modal" onClick={() => setShowRatingModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="restaurant-info-modal">
                                <img src={selectedOrder?.restaurant.image} alt={selectedOrder?.restaurant.name} />
                                <div>
                                    <h4>{selectedOrder?.restaurant.name}</h4>
                                    <p>Order #{selectedOrder?.id}</p>
                                </div>
                            </div>
                            <div className="rating-section">
                                <label>Your Rating</label>
                                <RatingStars rating={rating} size="large" interactive onChange={setRating} />
                            </div>
                            <div className="review-section">
                                <label>Write a Review (Optional)</label>
                                <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={4} placeholder="Share your experience with this restaurant..." />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="outline" onClick={() => setShowRatingModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={submitRating}>Submit Rating</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reorder Confirmation Modal */}
            {showReorderConfirm && (
                <div className="modal-overlay" onClick={() => setShowReorderConfirm(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">🔄</div>
                        <h3>Reorder Items?</h3>
                        <p>Would you like to add all items from order #{selectedOrder?.id} to your cart?</p>
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={() => setShowReorderConfirm(false)}>Cancel</button>
                            <button className="confirm-btn" onClick={confirmReorder}>Yes, Reorder</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Confirmation Modal */}
            {showCancelConfirm && (
                <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">⚠️</div>
                        <h3>Cancel Order?</h3>
                        <p>Are you sure you want to cancel order #{selectedOrderToCancel?.id}? This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={() => setShowCancelConfirm(false)}>No, Keep Order</button>
                            <button className="confirm-btn danger" onClick={confirmCancelOrder}>Yes, Cancel Order</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOrderHistory;
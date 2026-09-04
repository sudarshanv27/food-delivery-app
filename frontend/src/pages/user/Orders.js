import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockOrders = [
                {
                    id: 'ORD-001',
                    date: '2024-01-15T18:30:00',
                    status: 'delivered',
                    total: 450,
                    items: [
                        { id: 1, name: 'Margherita Pizza', quantity: 1, price: 250, image: '/pizza.jpg' },
                        { id: 2, name: 'Garlic Bread', quantity: 2, price: 100, image: '/garlic-bread.jpg' }
                    ],
                    restaurant: {
                        id: 1,
                        name: 'Pizza Hut',
                        image: '/pizza-hut.jpg',
                        address: '123 Main St'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Online',
                    rating: 4,
                    review: 'Great pizza!'
                },
                {
                    id: 'ORD-002',
                    date: '2024-01-10T19:15:00',
                    status: 'delivered',
                    total: 320,
                    items: [
                        { id: 3, name: 'McChicken Burger', quantity: 2, price: 160, image: '/burger.jpg' }
                    ],
                    restaurant: {
                        id: 2,
                        name: "McDonald's",
                        image: '/mcdonalds.jpg',
                        address: '456 Park Ave'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Cash on Delivery',
                    rating: 0
                },
                {
                    id: 'ORD-003',
                    date: '2024-01-18T12:30:00',
                    status: 'processing',
                    total: 520,
                    items: [
                        { id: 4, name: 'Sushi Roll', quantity: 2, price: 260, image: '/sushi.jpg' }
                    ],
                    restaurant: {
                        id: 3,
                        name: 'Sushi Master',
                        image: '/sushi-master.jpg',
                        address: '789 Broadway'
                    },
                    deliveryAddress: '123 Main St, New York, NY 10001',
                    paymentMethod: 'Online',
                    rating: 0
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
        const config = {
            delivered: { class: 'delivered', text: 'Delivered', icon: '✅' },
            processing: { class: 'processing', text: 'Processing', icon: '🔄' },
            cancelled: { class: 'cancelled', text: 'Cancelled', icon: '❌' },
            pending: { class: 'pending', text: 'Pending', icon: '⏳' }
        };
        const statusConfig = config[status] || config.pending;
        return (
            <span className={`status-badge ${statusConfig.class}`}>
                <span className="status-icon">{statusConfig.icon}</span>
                <span className="status-text">{statusConfig.text}</span>
            </span>
        );
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const handleReorder = async (order) => {
        console.log('Reorder:', order);
    };

    const handleCancelOrder = async (order) => {
        console.log('Cancel order:', order);
    };

    const handleTrackOrder = (orderId) => {
        console.log('Track order:', orderId);
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

        // Update order with rating
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

    if (isLoading) {
        return (
            <div className="orders-loading">
                <div className="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="orders-empty">
                <div className="empty-icon">📦</div>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet.</p>
                <Link to="/restaurants">
                    <Button variant="primary">Browse Restaurants</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h2>My Orders</h2>
                <div className="orders-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                        onClick={() => setFilter('processing')}
                    >
                        Processing
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered
                    </button>
                    <button
                        className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            <div className="orders-list">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <span className="order-id">Order #{order.id}</span>
                                <span className="order-date">
                                    {new Date(order.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            {getStatusBadge(order.status)}
                        </div>

                        <div className="order-body">
                            <div className="restaurant-info">
                                <img
                                    src={order.restaurant.image}
                                    alt={order.restaurant.name}
                                    className="restaurant-image"
                                />
                                <div className="restaurant-details">
                                    <h4>{order.restaurant.name}</h4>
                                    <p>{order.restaurant.address}</p>
                                </div>
                            </div>

                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img src={item.image} alt={item.name} className="item-image" />
                                        <div className="item-details">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-quantity">x{item.quantity}</span>
                                            <span className="item-price">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-total">
                                <span>Total Amount:</span>
                                <strong>₹{order.total}</strong>
                            </div>
                        </div>

                        <div className="order-footer">
                            {order.status === 'processing' && (
                                <>
                                    <button
                                        className="footer-btn track-btn"
                                        onClick={() => handleTrackOrder(order.id)}
                                    >
                                        🚚 Track Order
                                    </button>
                                    <button
                                        className="footer-btn cancel-btn"
                                        onClick={() => handleCancelOrder(order)}
                                    >
                                        ❌ Cancel Order
                                    </button>
                                </>
                            )}

                            {order.status === 'delivered' && (
                                <>
                                    <button
                                        className="footer-btn reorder-btn"
                                        onClick={() => handleReorder(order)}
                                    >
                                        🔄 Reorder
                                    </button>
                                    {order.rating === 0 && (
                                        <button
                                            className="footer-btn rate-btn"
                                            onClick={() => handleRateOrder(order)}
                                        >
                                            ⭐ Rate Order
                                        </button>
                                    )}
                                </>
                            )}

                            {order.status === 'delivered' && order.rating > 0 && (
                                <div className="rated-section">
                                    <RatingStars rating={order.rating} size="small" readonly />
                                    {order.review && <span className="review-text">"{order.review}"</span>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="rating-modal-overlay" onClick={() => setShowRatingModal(false)}>
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
                                <RatingStars
                                    rating={rating}
                                    size="large"
                                    interactive
                                    onChange={setRating}
                                />
                            </div>

                            <div className="review-section">
                                <label>Write a Review (Optional)</label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    rows={4}
                                    placeholder="Share your experience with this restaurant..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={submitRating}>
                                Submit Rating
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
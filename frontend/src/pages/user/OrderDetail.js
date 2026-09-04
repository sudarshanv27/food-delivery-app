import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import DeliveryTracker from '../../components/delivery/DeliveryTracker';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockOrder = {
                id: id,
                date: '2024-01-15T18:30:00',
                status: 'delivered',
                total: 450,
                subtotal: 420,
                tax: 21,
                deliveryFee: 9,
                items: [
                    {
                        id: 1,
                        name: 'Margherita Pizza',
                        quantity: 1,
                        price: 250,
                        originalPrice: 300,
                        image: '/pizza.jpg',
                        customization: 'Extra cheese, Thin crust'
                    },
                    {
                        id: 2,
                        name: 'Garlic Bread',
                        quantity: 2,
                        price: 100,
                        originalPrice: 120,
                        image: '/garlic-bread.jpg'
                    }
                ],
                restaurant: {
                    id: 1,
                    name: 'Pizza Hut',
                    image: '/pizza-hut.jpg',
                    address: '123 Main Street, Downtown',
                    phone: '+1 234 567 890',
                    contactPerson: 'John Manager'
                },
                deliveryAddress: {
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    landmark: 'Near Central Park',
                    phone: '+1 234 567 890'
                },
                paymentMethod: 'Online',
                paymentStatus: 'Paid',
                deliveryPartner: {
                    name: 'Raj Kumar',
                    phone: '+1 234 567 890',
                    rating: 4.8,
                    vehicleNumber: 'DL 01 AB 1234'
                },
                timeline: [
                    { status: 'Order Placed', time: '2024-01-15T18:30:00', completed: true },
                    { status: 'Order Confirmed', time: '2024-01-15T18:35:00', completed: true },
                    { status: 'Preparing', time: '2024-01-15T18:40:00', completed: true },
                    { status: 'Ready for Pickup', time: '2024-01-15T18:55:00', completed: true },
                    { status: 'Out for Delivery', time: '2024-01-15T19:00:00', completed: true },
                    { status: 'Delivered', time: '2024-01-15T19:25:00', completed: true }
                ],
                rating: 4,
                review: 'Great pizza! Delivery was fast.',
                invoiceUrl: '#'
            };
            setOrder(mockOrder);
            setRating(mockOrder.rating || 0);
            setReview(mockOrder.review || '');
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReorder = async () => {
        // Implement reorder logic
        navigate('/checkout');
    };

    const handleCancelOrder = async () => {
        // Implement cancel logic
        if (window.confirm('Are you sure you want to cancel this order?')) {
            console.log('Cancel order');
        }
    };

    const handleTrackOrder = () => {
        // Navigate to tracking page
        navigate(`/tracking/${id}`);
    };

    const handleDownloadInvoice = () => {
        // Download invoice
        window.open(order?.invoiceUrl, '_blank');
    };

    const handleContactSupport = () => {
        navigate('/contact');
    };

    const submitRating = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        // Update rating
        setOrder(prev => ({ ...prev, rating, review }));
        setShowRatingModal(false);
    };

    if (isLoading) {
        return (
            <div className="order-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-error">
                <div className="error-icon">⚠️</div>
                <h3>Order Not Found</h3>
                <p>We couldn't find the order you're looking for.</p>
                <Link to="/orders">
                    <Button variant="primary">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="order-detail-page">
            <div className="order-detail-container">
                {/* Header */}
                <div className="detail-header">
                    <Link to="/orders" className="back-link">← Back to Orders</Link>
                    <div className="order-status-header">
                        <h2>Order #{order.id}</h2>
                        <span className={`status-badge ${order.status}`}>
                            {order.status === 'delivered' && '✅ Delivered'}
                            {order.status === 'processing' && '🔄 Processing'}
                            {order.status === 'cancelled' && '❌ Cancelled'}
                        </span>
                    </div>
                </div>

                {/* Delivery Tracking (for active orders) */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="delivery-tracking-section">
                        <DeliveryTracker orderId={order.id} />
                    </div>
                )}

                <div className="detail-grid">
                    {/* Left Column - Order Items */}
                    <div className="detail-left">
                        <div className="detail-card">
                            <h3>Order Items</h3>
                            <div className="items-list">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item-detail">
                                        <img src={item.image} alt={item.name} className="item-image" />
                                        <div className="item-info">
                                            <div className="item-name">{item.name}</div>
                                            {item.customization && (
                                                <div className="item-customization">✨ {item.customization}</div>
                                            )}
                                            <div className="item-meta">
                                                <span className="item-quantity">Quantity: {item.quantity}</span>
                                                {item.originalPrice > item.price && (
                                                    <span className="item-saved">Saved ₹{(item.originalPrice - item.price) * item.quantity}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="item-price">
                                            ₹{item.price * item.quantity}
                                        </div>
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
                                <div className="price-row total">
                                    <span>Total</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="detail-card">
                            <h3>Order Timeline</h3>
                            <div className="timeline">
                                {order.timeline.map((event, index) => (
                                    <div key={index} className={`timeline-item ${event.completed ? 'completed' : ''}`}>
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <div className="timeline-status">{event.status}</div>
                                            <div className="timeline-time">
                                                {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Info */}
                    <div className="detail-right">
                        {/* Restaurant Info */}
                        <div className="detail-card">
                            <h3>Restaurant Details</h3>
                            <div className="restaurant-detail-info">
                                <img src={order.restaurant.image} alt={order.restaurant.name} />
                                <div>
                                    <h4>{order.restaurant.name}</h4>
                                    <p>{order.restaurant.address}</p>
                                    <p>📞 {order.restaurant.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="detail-card">
                            <h3>Delivery Address</h3>
                            <div className="address-info">
                                <p>{order.deliveryAddress.street}</p>
                                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}</p>
                                {order.deliveryAddress.landmark && <p>📍 Landmark: {order.deliveryAddress.landmark}</p>}
                                <p>📞 {order.deliveryAddress.phone}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="detail-card">
                            <h3>Payment Information</h3>
                            <div className="payment-info">
                                <div className="payment-row">
                                    <span>Method:</span>
                                    <span>{order.paymentMethod}</span>
                                </div>
                                <div className="payment-row">
                                    <span>Status:</span>
                                    <span className="payment-status">{order.paymentStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Partner (if assigned) */}
                        {order.deliveryPartner && (
                            <div className="detail-card">
                                <h3>Delivery Partner</h3>
                                <div className="delivery-partner-info">
                                    <div className="partner-detail">
                                        <span className="partner-icon">🛵</span>
                                        <div>
                                            <div className="partner-name">{order.deliveryPartner.name}</div>
                                            <div className="partner-rating">⭐ {order.deliveryPartner.rating}</div>
                                            <div className="partner-vehicle">{order.deliveryPartner.vehicleNumber}</div>
                                        </div>
                                    </div>
                                    <button className="contact-partner-btn">📞 Contact</button>
                                </div>
                            </div>
                        )}

                        {/* Rating Section (for delivered orders) */}
                        {order.status === 'delivered' && (
                            <div className="detail-card">
                                <h3>Rate Your Experience</h3>
                                {order.rating > 0 ? (
                                    <div className="existing-rating">
                                        <RatingStars rating={order.rating} size="medium" readonly />
                                        {order.review && <p className="existing-review">"{order.review}"</p>}
                                    </div>
                                ) : (
                                    <div className="rate-prompt">
                                        <p>How was your experience with {order.restaurant.name}?</p>
                                        <Button variant="primary" onClick={() => setShowRatingModal(true)}>
                                            Rate this Order
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons-group">
                            {order.status === 'processing' && (
                                <Button variant="danger" fullWidth onClick={handleCancelOrder}>
                                    Cancel Order
                                </Button>
                            )}
                            {order.status === 'processing' && (
                                <Button variant="primary" fullWidth onClick={handleTrackOrder}>
                                    Track Order
                                </Button>
                            )}
                            {order.status === 'delivered' && (
                                <Button variant="primary" fullWidth onClick={handleReorder}>
                                    Reorder
                                </Button>
                            )}
                            <Button variant="outline" fullWidth onClick={handleDownloadInvoice}>
                                Download Invoice
                            </Button>
                            <Button variant="outline" fullWidth onClick={handleContactSupport}>
                                Need Help?
                            </Button>
                        </div>
                    </div>
                </div>
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
                                <img src={order.restaurant.image} alt={order.restaurant.name} />
                                <div>
                                    <h4>{order.restaurant.name}</h4>
                                    <p>Order #{order.id}</p>
                                </div>
                            </div>

                            <div className="rating-section">
                                <label>Your Rating</label>
                                <RatingStars rating={rating} size="large" interactive onChange={setRating} />
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

export default OrderDetail;
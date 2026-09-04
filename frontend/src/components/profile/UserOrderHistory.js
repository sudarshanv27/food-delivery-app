// src/components/profile/UserOrderHistory.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './UserOrderHistory.css';

const UserOrderHistory = ({
    limit = null,
    showFilters = true,
    showStats = true,
    variant = 'default', // 'default', 'compact', 'detailed'
    enableReorder = true,
    enableCancellation = true,
    enableRating = true
}) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedYear, setSelectedYear] = useState('all');
    const [ratings, setRatings] = useState({});
    const [reviews, setReviews] = useState({});
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingOrder, setRatingOrder] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const [stats, setStats] = useState({
        total: 0,
        delivered: 0,
        cancelled: 0,
        pending: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteRestaurant: '',
        mostOrderedItem: ''
    });

    const calculateStats = useCallback((ordersData) => {
        const deliveredOrders = ordersData.filter(o => o.order_status === 'delivered');
        const cancelledOrders = ordersData.filter(o => o.order_status === 'cancelled');
        const pendingOrders = ordersData.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.order_status));

        // Calculate average order value
        const totalSpent = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const averageOrderValue = deliveredOrders.length > 0 ? totalSpent / deliveredOrders.length : 0;

        // Find favorite restaurant
        const restaurantCount = {};
        ordersData.forEach(order => {
            if (order.order_status === 'delivered') {
                restaurantCount[order.restaurant_name] = (restaurantCount[order.restaurant_name] || 0) + 1;
            }
        });
        const favoriteRestaurant = Object.keys(restaurantCount).length > 0
            ? Object.keys(restaurantCount).reduce((a, b) => restaurantCount[a] > restaurantCount[b] ? a : b)
            : 'None';

        // Find most ordered item
        const itemCount = {};
        ordersData.forEach(order => {
            const items = parseItems(order.items);
            items.forEach(item => {
                if (order.order_status === 'delivered') {
                    itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity;
                }
            });
        });
        const mostOrderedItem = Object.keys(itemCount).length > 0
            ? Object.keys(itemCount).reduce((a, b) => itemCount[a] > itemCount[b] ? a : b)
            : 'None';

        setStats({
            total: ordersData.length,
            delivered: deliveredOrders.length,
            cancelled: cancelledOrders.length,
            pending: pendingOrders.length,
            totalSpent,
            averageOrderValue,
            favoriteRestaurant,
            mostOrderedItem
        });
    }, []);

    const parseItems = (items) => {
        if (!items) return [];
        if (typeof items === 'string') {
            try {
                return JSON.parse(items);
            } catch (e) {
                console.error('Error parsing items:', e);
                return [];
            }
        }
        return items;
    };

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` },
                params: limit ? { limit } : {}
            });

            const ordersData = response.data.orders || response.data.data || [];
            setOrders(ordersData);
            calculateStats(ordersData);

            // Load ratings from localStorage (demo)
            const savedRatings = localStorage.getItem('orderRatings');
            if (savedRatings) {
                setRatings(JSON.parse(savedRatings));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Mock data for demo
            const mockOrders = generateMockOrders();
            setOrders(mockOrders);
            calculateStats(mockOrders);
            toast.error('Using demo data. API not available.', { duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, [calculateStats, limit]);

    const generateMockOrders = () => {
        const orders = [];
        const restaurants = [
            { id: 1, name: 'Pizza Hut', cuisine: 'Italian' },
            { id: 2, name: "McDonald's", cuisine: 'Fast Food' },
            { id: 3, name: 'KFC', cuisine: 'Fried Chicken' },
            { id: 4, name: 'Dominos', cuisine: 'Pizza' },
            { id: 5, name: 'Starbucks', cuisine: 'Coffee' },
            { id: 6, name: 'Burger King', cuisine: 'Burgers' }
        ];

        const statuses = ['delivered', 'delivered', 'delivered', 'out_for_delivery', 'preparing', 'confirmed', 'cancelled'];
        const now = new Date();

        for (let i = 0; i < 25; i++) {
            const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;

            for (let j = 0; j < itemCount; j++) {
                const price = [99, 149, 199, 299, 399, 499][Math.floor(Math.random() * 6)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                items.push({
                    id: j + 1,
                    name: `${restaurant.name} Item ${j + 1}`,
                    quantity,
                    price
                });
                subtotal += price * quantity;
            }

            const deliveryFee = 40;
            const tax = Math.round(subtotal * 0.1);
            const total = subtotal + deliveryFee + tax;

            const date = new Date(now - i * 2 * 24 * 60 * 60 * 1000);

            orders.push({
                order_id: `ORD${100000 + i}`,
                order_number: `ORD${100000 + i}`,
                restaurant_name: restaurant.name,
                restaurant_id: restaurant.id,
                restaurant_cuisine: restaurant.cuisine,
                items: items,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                tax: tax,
                total_amount: total,
                order_status: status,
                payment_method: Math.random() > 0.5 ? 'online' : 'cash',
                created_at: date.toISOString(),
                delivered_at: status === 'delivered' ? new Date(date.getTime() + 45 * 60000).toISOString() : null,
                estimated_delivery: status !== 'delivered' && status !== 'cancelled'
                    ? new Date(date.getTime() + 45 * 60000).toISOString()
                    : null,
                delivery_address: `${Math.floor(Math.random() * 1000)} Main Street, City - ${100000 + Math.floor(Math.random() * 100000)}`,
                delivery_partner: status === 'out_for_delivery' ? {
                    name: ['Rahul', 'Amit', 'Priya', 'Suresh'][Math.floor(Math.random() * 4)],
                    phone: '+91 98765 43210',
                    rating: 4.5
                } : null
            });
        }

        return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusColor = (status) => {
        const colors = {
            pending: '#FF9800',
            confirmed: '#2196F3',
            preparing: '#9C27B0',
            out_for_delivery: '#00BCD4',
            delivered: '#4CAF50',
            cancelled: '#F44336'
        };
        return colors[status] || '#666';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            preparing: '🍳',
            out_for_delivery: '🚚',
            delivered: '🎉',
            cancelled: '❌'
        };
        return icons[status] || '📦';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            out_for_delivery: 'Out for Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return texts[status] || status?.replace('_', ' ').toUpperCase() || 'UNKNOWN';
    };

    const getProgressPercentage = (status) => {
        const steps = {
            pending: 0,
            confirmed: 20,
            preparing: 40,
            out_for_delivery: 70,
            delivered: 100
        };
        return steps[status] || 0;
    };

    const handleReorder = async (order) => {
        if (!enableReorder) return;

        try {
            const token = localStorage.getItem('token');
            const items = parseItems(order.items);

            const cartItems = items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                restaurant_id: order.restaurant_id,
                restaurant_name: order.restaurant_name
            }));

            await axios.post('/api/cart/add-bulk', { items: cartItems }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Items added to cart! Redirecting to checkout...', {
                icon: '🛒',
                duration: 2000
            });

            setTimeout(() => {
                window.location.href = '/checkout';
            }, 1500);
        } catch (error) {
            console.error('Error reordering:', error);
            toast.error(error.response?.data?.message || 'Failed to add items to cart');
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!enableCancellation) return;

        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Order cancelled successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleSubmitRating = () => {
        if (ratingValue === 0) {
            toast.error('Please select a rating');
            return;
        }

        const newRatings = { ...ratings, [ratingOrder.order_id]: { rating: ratingValue, comment: ratingComment, date: new Date().toISOString() } };
        setRatings(newRatings);
        localStorage.setItem('orderRatings', JSON.stringify(newRatings));

        toast.success('Thank you for your feedback!', { icon: '⭐' });
        setShowRatingModal(false);
        setRatingValue(0);
        setRatingComment('');
        setRatingOrder(null);
    };

    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        // Filter by status
        if (filter === 'all') {
            // keep all
        } else if (filter === 'active') {
            filtered = filtered.filter(o => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.order_status));
        } else {
            filtered = filtered.filter(o => o.order_status === filter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.order_number?.toLowerCase().includes(term) ||
                o.restaurant_name?.toLowerCase().includes(term) ||
                o.restaurant_cuisine?.toLowerCase().includes(term)
            );
        }

        // Filter by year
        if (selectedYear !== 'all') {
            filtered = filtered.filter(o => new Date(o.created_at).getFullYear().toString() === selectedYear);
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (sortBy === 'highest') {
                return (b.total_amount || 0) - (a.total_amount || 0);
            } else if (sortBy === 'lowest') {
                return (a.total_amount || 0) - (b.total_amount || 0);
            }
            return 0;
        });

        return filtered;
    }, [orders, filter, searchTerm, selectedYear, sortBy]);

    const displayOrders = limit ? filteredOrders.slice(0, limit) : filteredOrders;

    // Get unique years from orders
    const years = useMemo(() => {
        const yearsSet = new Set();
        orders.forEach(order => {
            yearsSet.add(new Date(order.created_at).getFullYear());
        });
        return ['all', ...Array.from(yearsSet).sort().reverse()];
    }, [orders]);

    if (loading) {
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

    const isCompact = variant === 'compact';
    const isDetailed = variant === 'detailed';

    return (
        <div className={`user-order-history ${variant}`}>
            {/* Header Section */}
            <div className="order-history-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">📋</span>
                        Order History
                        <span className="order-count">{stats.total} orders</span>
                    </h2>
                    <button className="refresh-btn" onClick={fetchOrders} title="Refresh orders">
                        🔄 Refresh
                    </button>
                </div>

                {/* Statistics Cards */}
                {showStats && !limit && stats.total > 0 && (
                    <div className="order-stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📦</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Total Orders</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.delivered}</span>
                                <span className="stat-label">Delivered</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <span className="stat-value">{stats.pending}</span>
                                <span className="stat-label">Active</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <span className="stat-value">₹{stats.totalSpent.toLocaleString()}</span>
                                <span className="stat-label">Total Spent</span>
                            </div>
                        </div>
                        <div className="stat-card highlight">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <span className="stat-value">₹{Math.round(stats.averageOrderValue).toLocaleString()}</span>
                                <span className="stat-label">Avg Order Value</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Favorite Stats */}
                {showStats && !limit && stats.total > 0 && (stats.favoriteRestaurant !== 'None' || stats.mostOrderedItem !== 'None') && (
                    <div className="favorite-stats">
                        {stats.favoriteRestaurant !== 'None' && (
                            <div className="favorite-item">
                                <span className="fav-icon">🏆</span>
                                <span>Favorite Restaurant: <strong>{stats.favoriteRestaurant}</strong></span>
                            </div>
                        )}
                        {stats.mostOrderedItem !== 'None' && (
                            <div className="favorite-item">
                                <span className="fav-icon">🍽️</span>
                                <span>Most Ordered: <strong>{stats.mostOrderedItem}</strong></span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Search and Filters Bar */}
            {showFilters && orders.length > 0 && !limit && (
                <div className="order-filters-bar">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by order ID, restaurant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="filter-controls">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Amount</option>
                            <option value="lowest">Lowest Amount</option>
                        </select>

                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="year-select">
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year === 'all' ? 'All Years' : year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            {showFilters && orders.length > 0 && !limit && (
                <div className="order-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active ({stats.pending})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered ({stats.delivered})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setFilter('cancelled')}
                    >
                        Cancelled ({stats.cancelled})
                    </button>
                </div>
            )}

            {/* Results Count */}
            {filteredOrders.length !== orders.length && (
                <div className="results-info">
                    Showing {filteredOrders.length} of {orders.length} orders
                    <button className="clear-filters" onClick={() => {
                        setSearchTerm('');
                        setSelectedYear('all');
                        setSortBy('newest');
                    }}>Clear filters</button>
                </div>
            )}

            {/* Orders List */}
            {displayOrders.length === 0 ? (
                <div className="no-orders">
                    <div className="empty-state-animation">
                        <div className="empty-icon">🛒</div>
                    </div>
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet. Start exploring restaurants!</p>
                    <Link to="/" className="browse-btn">
                        Browse Restaurants →
                    </Link>
                </div>
            ) : (
                <div className={`orders-list ${isCompact ? 'compact' : ''} ${isDetailed ? 'detailed' : ''}`}>
                    {displayOrders.map((order, index) => {
                        const items = parseItems(order.items);
                        const isActive = ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.order_status);
                        const hasRated = ratings[order.order_id];
                        const progress = getProgressPercentage(order.order_status);
                        const isExpanded = expandedOrder === order.order_id;

                        return (
                            <div key={order.order_id || index} className={`order-card status-${order.order_status} ${isExpanded ? 'expanded' : ''}`}>
                                {/* Card Header */}
                                <div className="order-card-header" onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}>
                                    <div className="order-info">
                                        <span className="order-number">#{order.order_number || order.order_id}</span>
                                        <span className="order-date">
                                            📅 {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="order-time">
                                            🕐 {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.order_status) }}>
                                        {getStatusIcon(order.order_status)} {getStatusText(order.order_status)}
                                    </div>
                                </div>

                                {/* Progress Bar for Active Orders */}
                                {isActive && order.order_status !== 'cancelled' && (
                                    <div className="order-progress">
                                        <div className="progress-steps">
                                            <div className={`progress-step ${progress >= 0 ? 'completed' : ''}`}>
                                                <span className="step-dot"></span>
                                                <span className="step-label">Ordered</span>
                                            </div>
                                            <div className={`progress-step ${progress >= 20 ? 'completed' : ''}`}>
                                                <span className="step-dot"></span>
                                                <span className="step-label">Confirmed</span>
                                            </div>
                                            <div className={`progress-step ${progress >= 40 ? 'completed' : ''}`}>
                                                <span className="step-dot"></span>
                                                <span className="step-label">Preparing</span>
                                            </div>
                                            <div className={`progress-step ${progress >= 70 ? 'completed' : ''}`}>
                                                <span className="step-dot"></span>
                                                <span className="step-label">Out for Delivery</span>
                                            </div>
                                            <div className={`progress-step ${progress >= 100 ? 'completed' : ''}`}>
                                                <span className="step-dot"></span>
                                                <span className="step-label">Delivered</span>
                                            </div>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {/* Card Body */}
                                <div className="order-card-body">
                                    <div className="restaurant-info">
                                        <h3 className="restaurant-name">
                                            <Link to={`/restaurant/${order.restaurant_id}`}>
                                                🍕 {order.restaurant_name}
                                            </Link>
                                        </h3>
                                        {order.restaurant_cuisine && (
                                            <span className="restaurant-cuisine">{order.restaurant_cuisine}</span>
                                        )}
                                    </div>

                                    {/* Order Items */}
                                    <div className="order-items">
                                        {items.slice(0, isDetailed ? 5 : 3).map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <span className="item-quantity">{item.quantity}×</span>
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-price">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                        {items.length > (isDetailed ? 5 : 3) && (
                                            <div className="more-items">
                                                +{items.length - (isDetailed ? 5 : 3)} more item(s)
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="order-summary">
                                        <div className="summary-row">
                                            <span>Total Amount:</span>
                                            <strong className="total-amount">₹{order.total_amount}</strong>
                                        </div>
                                        <div className="summary-row">
                                            <span>Payment:</span>
                                            <span className={`payment-method ${order.payment_method === 'online' ? 'online' : 'cash'}`}>
                                                {order.payment_method?.toUpperCase() || 'CASH ON DELIVERY'}
                                            </span>
                                        </div>
                                        {hasRated && (
                                            <div className="rating-display">
                                                {'⭐'.repeat(hasRated.rating)}
                                                <span className="rating-text">Rated {hasRated.rating}/5</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delivery Address (Expanded) */}
                                    {isExpanded && order.delivery_address && (
                                        <div className="delivery-address">
                                            <span className="address-icon">📍</span>
                                            <span className="address-text">{order.delivery_address}</span>
                                        </div>
                                    )}

                                    {/* Delivery Partner Info (Expanded) */}
                                    {isExpanded && order.delivery_partner && (
                                        <div className="delivery-partner">
                                            <span className="partner-icon">🛵</span>
                                            <div className="partner-info">
                                                <span className="partner-name">{order.delivery_partner.name}</span>
                                                <span className="partner-rating">⭐ {order.delivery_partner.rating}</span>
                                            </div>
                                            <button className="contact-partner">Contact</button>
                                        </div>
                                    )}

                                    {/* Expand/Collapse Indicator */}
                                    <button className="expand-indicator" onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}>
                                        {isExpanded ? 'Show less ↑' : 'Show more ↓'}
                                    </button>
                                </div>

                                {/* Card Footer */}
                                <div className="order-card-footer">
                                    {isActive && (
                                        <Link to={`/tracking/${order.order_id}`} className="track-btn">
                                            📍 Track Order
                                        </Link>
                                    )}
                                    {order.order_status === 'delivered' && enableReorder && (
                                        <button onClick={() => handleReorder(order)} className="reorder-btn">
                                            🔄 Reorder
                                        </button>
                                    )}
                                    {order.order_status === 'delivered' && enableRating && !hasRated && (
                                        <button onClick={() => {
                                            setRatingOrder(order);
                                            setShowRatingModal(true);
                                        }} className="rate-btn">
                                            ⭐ Rate Order
                                        </button>
                                    )}
                                    {isActive && order.order_status !== 'out_for_delivery' && enableCancellation && (
                                        <button onClick={() => handleCancelOrder(order.order_id)} className="cancel-btn">
                                            ❌ Cancel
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedOrder(order)} className="details-btn">
                                        📋 Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <span className="modal-icon">📋</span>
                                Order Details - {selectedOrder.order_number || selectedOrder.order_id}
                            </h3>
                            <button className="close-modal" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>

                        <div className="order-details-content">
                            {/* Order Information */}
                            <div className="detail-section">
                                <h4>Order Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Restaurant:</span>
                                        <span className="detail-value">{selectedOrder.restaurant_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Order Date:</span>
                                        <span className="detail-value">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <span className="detail-value" style={{ color: getStatusColor(selectedOrder.order_status) }}>
                                            {getStatusIcon(selectedOrder.order_status)} {getStatusText(selectedOrder.order_status)}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Payment Method:</span>
                                        <span className="detail-value">{selectedOrder.payment_method?.toUpperCase() || 'CASH'}</span>
                                    </div>
                                    {selectedOrder.delivered_at && (
                                        <div className="detail-item">
                                            <span className="detail-label">Delivered At:</span>
                                            <span className="detail-value">{new Date(selectedOrder.delivered_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedOrder.estimated_delivery && (
                                        <div className="detail-item">
                                            <span className="detail-label">Est. Delivery:</span>
                                            <span className="detail-value">{new Date(selectedOrder.estimated_delivery).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedOrder.delivery_address && (
                                        <div className="detail-item full-width">
                                            <span className="detail-label">Delivery Address:</span>
                                            <span className="detail-value">{selectedOrder.delivery_address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div className="detail-section">
                                <h4>Order Items</h4>
                                <div className="items-table-container">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parseItems(selectedOrder.items).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price}</td>
                                                    <td>₹{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3"><strong>Subtotal</strong></td>
                                                <td><strong>₹{selectedOrder.subtotal}</strong></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3">Delivery Fee</td>
                                                <td>₹{selectedOrder.delivery_fee}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3">Tax & Charges</td>
                                                <td>₹{selectedOrder.tax}</td>
                                            </tr>
                                            <tr className="total-row">
                                                <td colSpan="3"><strong>Total</strong></td>
                                                <td><strong>₹{selectedOrder.total_amount}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            {['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(selectedOrder.order_status) && (
                                <Link to={`/tracking/${selectedOrder.order_id}`} className="track-order-btn">
                                    📍 Track Order
                                </Link>
                            )}
                            {selectedOrder.order_status === 'delivered' && enableReorder && (
                                <button onClick={() => handleReorder(selectedOrder)} className="reorder-modal-btn">
                                    🔄 Reorder
                                </button>
                            )}
                            <button onClick={() => setSelectedOrder(null)} className="close-details-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && ratingOrder && (
                <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
                    <div className="modal-content rating-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Rate Your Order</h3>
                            <button className="close-modal" onClick={() => setShowRatingModal(false)}>✕</button>
                        </div>
                        <div className="rating-modal-content">
                            <div className="restaurant-info-modal">
                                <span className="restaurant-icon">🍕</span>
                                <div>
                                    <div className="restaurant-name">{ratingOrder.restaurant_name}</div>
                                    <div className="order-id">Order #{ratingOrder.order_number}</div>
                                </div>
                            </div>

                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        className={`star-btn ${ratingValue >= star ? 'active' : ''}`}
                                        onClick={() => setRatingValue(star)}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="rating-comment"
                                placeholder="Share your experience (optional)"
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                rows="4"
                            />
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowRatingModal(false)} className="cancel-btn">Cancel</button>
                            <button onClick={handleSubmitRating} className="submit-rating-btn">Submit Rating</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOrderHistory;
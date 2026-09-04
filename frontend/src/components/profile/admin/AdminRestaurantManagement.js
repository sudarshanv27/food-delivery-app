// src/components/profile/admin/AdminRestaurantManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminRestaurantManagement.css';

const AdminRestaurantManagement = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        cuisine_type: '',
        opening_time: '10:00',
        closing_time: '22:00',
        min_order_amount: '',
        delivery_fee: '',
        is_active: true,
        is_approved: false,
        commission_rate: 15,
        logo: '',
        banner: '',
        description: '',
        facebook_url: '',
        instagram_url: '',
        website_url: ''
    });

    useEffect(() => {
        fetchRestaurants();

        // Set up polling for real-time updates (every 60 seconds)
        const interval = setInterval(() => {
            fetchRestaurants(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [dateRange]);

    const fetchRestaurants = async (silent = false) => {
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/restaurants?range=${dateRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRestaurants(response.data.data || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            // Mock data for demo
            setRestaurants(getMockRestaurants());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getMockRestaurants = () => [
        {
            id: 1,
            name: 'Pizza Hut',
            email: 'contact@pizzahut.com',
            phone: '+91 1122334455',
            address: '123 Main Street, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400069',
            cuisine_type: 'Italian, Fast Food',
            opening_time: '10:00',
            closing_time: '23:00',
            min_order_amount: 199,
            delivery_fee: 40,
            is_active: true,
            is_approved: true,
            commission_rate: 15,
            rating: 4.5,
            total_orders: 1250,
            total_revenue: 375000,
            logo: 'https://via.placeholder.com/100',
            created_at: '2023-01-15T00:00:00Z',
            owner_name: 'Rajesh Kumar',
            owner_email: 'rajesh@pizzahut.com',
            description: 'Best pizza in town with authentic Italian flavors',
            facebook_url: 'https://facebook.com/pizzahut',
            instagram_url: 'https://instagram.com/pizzahut',
            website_url: 'https://pizzahut.com'
        },
        {
            id: 2,
            name: 'McDonald\'s',
            email: 'contact@mcdonalds.com',
            phone: '+91 1122334466',
            address: '456 Park Avenue, Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            cuisine_type: 'Burger, Fast Food',
            opening_time: '09:00',
            closing_time: '22:00',
            min_order_amount: 149,
            delivery_fee: 35,
            is_active: true,
            is_approved: true,
            commission_rate: 15,
            rating: 4.6,
            total_orders: 980,
            total_revenue: 294000,
            logo: 'https://via.placeholder.com/100',
            created_at: '2023-02-20T00:00:00Z',
            owner_name: 'Priya Sharma',
            owner_email: 'priya@mcdonalds.com',
            description: 'World famous burgers and fast food',
            facebook_url: 'https://facebook.com/mcdonalds',
            instagram_url: 'https://instagram.com/mcdonalds',
            website_url: 'https://mcdonalds.com'
        },
        {
            id: 3,
            name: 'KFC',
            email: 'contact@kfc.com',
            phone: '+91 1122334477',
            address: '789 Lake View, Powai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400076',
            cuisine_type: 'Fried Chicken, Fast Food',
            opening_time: '11:00',
            closing_time: '23:00',
            min_order_amount: 249,
            delivery_fee: 45,
            is_active: false,
            is_approved: true,
            commission_rate: 15,
            rating: 4.4,
            total_orders: 750,
            total_revenue: 225000,
            logo: 'https://via.placeholder.com/100',
            created_at: '2023-03-10T00:00:00Z',
            owner_name: 'Amit Patel',
            owner_email: 'amit@kfc.com',
            description: 'Finger lickin\' good chicken',
            facebook_url: 'https://facebook.com/kfc',
            instagram_url: 'https://instagram.com/kfc',
            website_url: 'https://kfc.com'
        },
        {
            id: 4,
            name: 'Dominos',
            email: 'contact@dominos.com',
            phone: '+91 1122334488',
            address: '321 Green Park, Goregaon',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400063',
            cuisine_type: 'Pizza, Italian',
            opening_time: '10:00',
            closing_time: '22:00',
            min_order_amount: 199,
            delivery_fee: 40,
            is_active: true,
            is_approved: true,
            commission_rate: 15,
            rating: 4.7,
            total_orders: 1100,
            total_revenue: 330000,
            logo: 'https://via.placeholder.com/100',
            created_at: '2023-01-05T00:00:00Z',
            owner_name: 'Neha Gupta',
            owner_email: 'neha@dominos.com',
            description: 'Hot and fresh pizzas delivered fast',
            facebook_url: 'https://facebook.com/dominos',
            instagram_url: 'https://instagram.com/dominos',
            website_url: 'https://dominos.com'
        },
        {
            id: 5,
            name: 'Starbucks',
            email: 'contact@starbucks.com',
            phone: '+91 1122334499',
            address: '555 Coffee Lane, Malad',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400097',
            cuisine_type: 'Coffee, Bakery',
            opening_time: '08:00',
            closing_time: '22:00',
            min_order_amount: 99,
            delivery_fee: 30,
            is_active: true,
            is_approved: false,
            commission_rate: 12,
            rating: 0,
            total_orders: 0,
            total_revenue: 0,
            logo: 'https://via.placeholder.com/100',
            created_at: '2024-01-10T00:00:00Z',
            owner_name: 'Vikram Singh',
            owner_email: 'vikram@starbucks.com',
            description: 'Premium coffee and beverages',
            facebook_url: 'https://facebook.com/starbucks',
            instagram_url: 'https://instagram.com/starbucks',
            website_url: 'https://starbucks.com'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.phone || !formData.address) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (editingRestaurant) {
                await axios.put(`/api/admin/restaurants/${editingRestaurant.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Restaurant updated successfully');
            } else {
                await axios.post('/api/admin/restaurants', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Restaurant added successfully');
            }
            resetForm();
            fetchRestaurants();
        } catch (error) {
            console.error('Error saving restaurant:', error);
            toast.error(error.response?.data?.message || 'Failed to save restaurant');
        }
    };

    const handleDelete = async (restaurantId) => {
        if (window.confirm('Are you sure you want to delete this restaurant? This will also delete all orders and menu items. This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/restaurants/${restaurantId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Restaurant deleted successfully');
                fetchRestaurants();
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                toast.error('Failed to delete restaurant');
            }
        }
    };

    const handleToggleStatus = async (restaurantId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/admin/restaurants/${restaurantId}/toggle-status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Restaurant ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchRestaurants();
        } catch (error) {
            console.error('Error toggling restaurant status:', error);
            toast.error('Failed to update restaurant status');
        }
    };

    const handleApproval = async (restaurantId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/admin/restaurants/${restaurantId}/approve`,
                { is_approved: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Restaurant ${!currentStatus ? 'approved' : 'unapproved'} successfully`);
            fetchRestaurants();
        } catch (error) {
            console.error('Error approving restaurant:', error);
            toast.error('Failed to update restaurant approval');
        }
    };

    const exportData = async (format = 'csv') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/restaurants/export?format=${format}&filter=${filter}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `restaurants_report_${new Date().toISOString()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            cuisine_type: '',
            opening_time: '10:00',
            closing_time: '22:00',
            min_order_amount: '',
            delivery_fee: '',
            is_active: true,
            is_approved: false,
            commission_rate: 15,
            logo: '',
            banner: '',
            description: '',
            facebook_url: '',
            instagram_url: '',
            website_url: ''
        });
        setEditingRestaurant(null);
        setShowModal(false);
    };

    const editRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant);
        setFormData({
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address,
            city: restaurant.city || '',
            state: restaurant.state || '',
            pincode: restaurant.pincode || '',
            cuisine_type: restaurant.cuisine_type,
            opening_time: restaurant.opening_time,
            closing_time: restaurant.closing_time,
            min_order_amount: restaurant.min_order_amount,
            delivery_fee: restaurant.delivery_fee,
            is_active: restaurant.is_active,
            is_approved: restaurant.is_approved,
            commission_rate: restaurant.commission_rate || 15,
            logo: restaurant.logo || '',
            banner: restaurant.banner || '',
            description: restaurant.description || '',
            facebook_url: restaurant.facebook_url || '',
            instagram_url: restaurant.instagram_url || '',
            website_url: restaurant.website_url || ''
        });
        setShowModal(true);
    };

    const getStatusBadge = (isActive, isApproved) => {
        if (!isApproved) {
            return <span className="status-badge pending">⏳ Pending Approval</span>;
        }
        if (isActive) {
            return <span className="status-badge active">✅ Active</span>;
        }
        return <span className="status-badge inactive">❌ Inactive</span>;
    };

    const getPerformanceLevel = (rating) => {
        if (rating >= 4.5) return 'excellent';
        if (rating >= 4.0) return 'good';
        if (rating >= 3.0) return 'average';
        return 'poor';
    };

    const getFilteredAndSortedRestaurants = () => {
        let filtered = [...restaurants];

        // Apply filter
        if (filter === 'active') {
            filtered = filtered.filter(r => r.is_active && r.is_approved);
        } else if (filter === 'inactive') {
            filtered = filtered.filter(r => !r.is_active);
        } else if (filter === 'pending') {
            filtered = filtered.filter(r => !r.is_approved);
        }

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.city && r.city.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'total_revenue' || sortBy === 'total_orders' || sortBy === 'rating') {
                aVal = aVal || 0;
                bVal = bVal || 0;
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    };

    const getStats = () => {
        const total = restaurants.length;
        const active = restaurants.filter(r => r.is_active && r.is_approved).length;
        const pending = restaurants.filter(r => !r.is_approved).length;
        const inactive = restaurants.filter(r => !r.is_active && r.is_approved).length;
        const totalRevenue = restaurants.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
        const totalOrders = restaurants.reduce((sum, r) => sum + (r.total_orders || 0), 0);
        const avgRating = restaurants.filter(r => r.rating > 0).reduce((sum, r, _, arr) => sum + r.rating / arr.length, 0);
        const growthRate = ((active - (restaurants.length - pending)) / (restaurants.length - pending) * 100).toFixed(1);

        return { total, active, pending, inactive, totalRevenue, totalOrders, avgRating: avgRating.toFixed(1), growthRate };
    };

    const stats = getStats();
    const filteredRestaurants = getFilteredAndSortedRestaurants();

    const statsCards = [
        { title: 'Total Restaurants', value: stats.total, icon: '🏪', color: '#2196F3', trend: 12.5 },
        { title: 'Active Restaurants', value: stats.active, icon: '✅', color: '#4CAF50', trend: 8.3 },
        { title: 'Pending Approval', value: stats.pending, icon: '⏳', color: '#FF9800', trend: -5.2 },
        { title: 'Inactive', value: stats.inactive, icon: '❌', color: '#F44336', trend: 2.1 },
        { title: 'Total Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: '💰', color: '#9C27B0', trend: 18.7 },
        { title: 'Avg Rating', value: stats.avgRating, icon: '⭐', color: '#FFC107', trend: 0.3 }
    ];

    const TrendIndicator = ({ value }) => {
        if (!value) return null;
        const isPositive = value > 0;
        return (
            <span className={`trend ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(value)}%
            </span>
        );
    };

    if (loading) {
        return (
            <div className="restaurants-loading-container">
                <div className="loading-spinner"></div>
                <p>Loading restaurants...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="restaurants-error-container">
                <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={() => fetchRestaurants()} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-restaurant-management">
            <div className="section-header">
                <div className="header-title">
                    <h2>Restaurant Management</h2>
                    {refreshing && <span className="refreshing-badge">Refreshing...</span>}
                </div>
                <div className="header-controls">
                    <div className="date-range-filter">
                        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="all">All Time</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <button className="refresh-btn" onClick={() => fetchRestaurants()} title="Refresh data">
                        🔄
                    </button>
                    <div className="export-buttons">
                        <button onClick={() => exportData('csv')} className="export-btn csv">
                            📄 CSV
                        </button>
                        <button onClick={() => exportData('pdf')} className="export-btn pdf">
                            📑 PDF
                        </button>
                    </div>
                    <button className="add-btn" onClick={() => setShowModal(true)}>
                        + Add New Restaurant
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>
                                {stat.title}
                                <TrendIndicator value={stat.trend} />
                            </h3>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Search by name, email, cuisine, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                    )}
                </div>
                <div className="filter-buttons">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All ({stats.total})
                    </button>
                    <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                        Active ({stats.active})
                    </button>
                    <button className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`} onClick={() => setFilter('inactive')}>
                        Inactive ({stats.inactive})
                    </button>
                    <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        Pending ({stats.pending})
                    </button>
                </div>
                <div className="sort-controls">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">Sort by Name</option>
                        <option value="total_orders">Sort by Orders</option>
                        <option value="total_revenue">Sort by Revenue</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="created_at">Sort by Joined Date</option>
                    </select>
                    <button
                        className="sort-order-btn"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Restaurants Grid */}
            <div className="restaurants-grid">
                {filteredRestaurants.length === 0 ? (
                    <div className="no-restaurants">
                        <span className="no-restaurants-icon">🏪</span>
                        <h3>No restaurants found</h3>
                        <p>Try adjusting your filters or add a new restaurant</p>
                    </div>
                ) : (
                    filteredRestaurants.map(restaurant => (
                        <div key={restaurant.id} className={`restaurant-card ${getPerformanceLevel(restaurant.rating)}`}>
                            <div className="restaurant-header">
                                <div className="restaurant-logo">
                                    {restaurant.logo ? (
                                        <img src={restaurant.logo} alt={restaurant.name} />
                                    ) : (
                                        <div className="logo-placeholder">{restaurant.name.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="restaurant-info">
                                    <h3>{restaurant.name}</h3>
                                    <p className="cuisine">{restaurant.cuisine_type}</p>
                                    <div className="rating">
                                        {restaurant.rating > 0 ? (
                                            <>
                                                <span className="stars">⭐ {restaurant.rating}</span>
                                                <span className="orders">({restaurant.total_orders} orders)</span>
                                            </>
                                        ) : (
                                            <span className="no-rating">No ratings yet</span>
                                        )}
                                    </div>
                                </div>
                                <div className="restaurant-status">
                                    {getStatusBadge(restaurant.is_active, restaurant.is_approved)}
                                </div>
                            </div>

                            <div className="restaurant-details">
                                <div className="detail-item">
                                    <span className="detail-icon">📍</span>
                                    <span>{restaurant.address}, {restaurant.city}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">📞</span>
                                    <span>{restaurant.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">⏰</span>
                                    <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">💰</span>
                                    <span>Min: ₹{restaurant.min_order_amount} | Delivery: ₹{restaurant.delivery_fee}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">📊</span>
                                    <span>Commission: {restaurant.commission_rate}%</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-icon">📈</span>
                                    <span>Revenue: ₹{restaurant.total_revenue?.toLocaleString() || 0}</span>
                                </div>
                            </div>

                            <div className="restaurant-footer">
                                <button className="view-btn" onClick={() => setSelectedRestaurant(restaurant)} title="View Details">
                                    👁️ View
                                </button>
                                <button className="edit-btn" onClick={() => editRestaurant(restaurant)} title="Edit Restaurant">
                                    ✏️ Edit
                                </button>
                                <button className="menu-btn" onClick={() => toast.info('Menu management coming soon')} title="Manage Menu">
                                    🍽️ Menu
                                </button>
                                {!restaurant.is_approved && (
                                    <button className="approve-btn" onClick={() => handleApproval(restaurant.id, restaurant.is_approved)} title="Approve Restaurant">
                                        ✅ Approve
                                    </button>
                                )}
                                <button
                                    className={`toggle-btn ${restaurant.is_active ? 'deactivate' : 'activate'}`}
                                    onClick={() => handleToggleStatus(restaurant.id, restaurant.is_active)}
                                    disabled={!restaurant.is_approved}
                                    title={restaurant.is_active ? 'Deactivate' : 'Activate'}
                                >
                                    {restaurant.is_active ? '🔴 Off' : '🟢 On'}
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(restaurant.id)} title="Delete Restaurant">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Restaurant Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => resetForm()}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingRestaurant ? '✏️ Edit Restaurant' : '➕ Add New Restaurant'}</h3>
                            <button className="close-modal" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Restaurant Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Pizza Hut"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="contact@restaurant.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="+91 XXXXXXXXXX"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Cuisine Type</label>
                                    <input
                                        type="text"
                                        name="cuisine_type"
                                        value={formData.cuisine_type}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Italian, Chinese, Fast Food"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    required
                                    placeholder="Full address of the restaurant"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="State name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="Postal code"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Opening Time</label>
                                    <input
                                        type="time"
                                        name="opening_time"
                                        value={formData.opening_time}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Closing Time</label>
                                    <input
                                        type="time"
                                        name="closing_time"
                                        value={formData.closing_time}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Minimum Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="min_order_amount"
                                        value={formData.min_order_amount}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 199"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Fee (₹)</label>
                                    <input
                                        type="number"
                                        name="delivery_fee"
                                        value={formData.delivery_fee}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 40"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        name="commission_rate"
                                        value={formData.commission_rate}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        step="0.5"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe the restaurant, cuisine, ambiance, etc."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Facebook URL</label>
                                    <input
                                        type="url"
                                        name="facebook_url"
                                        value={formData.facebook_url}
                                        onChange={handleInputChange}
                                        placeholder="https://facebook.com/restaurant"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Instagram URL</label>
                                    <input
                                        type="url"
                                        name="instagram_url"
                                        value={formData.instagram_url}
                                        onChange={handleInputChange}
                                        placeholder="https://instagram.com/restaurant"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Website URL</label>
                                    <input
                                        type="url"
                                        name="website_url"
                                        value={formData.website_url}
                                        onChange={handleInputChange}
                                        placeholder="https://restaurant.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_approved"
                                            checked={formData.is_approved}
                                            onChange={handleInputChange}
                                        />
                                        ✅ Approved
                                    </label>
                                </div>

                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            disabled={!formData.is_approved}
                                        />
                                        🟢 Active
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Restaurant Details Modal */}
            {selectedRestaurant && (
                <div className="modal-overlay" onClick={() => setSelectedRestaurant(null)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📋 Restaurant Details - {selectedRestaurant.name}</h3>
                            <button className="close-modal" onClick={() => setSelectedRestaurant(null)}>×</button>
                        </div>

                        <div className="restaurant-details-modal">
                            <div className="details-section">
                                <h4>🏪 Basic Information</h4>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>Name:</strong> {selectedRestaurant.name}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Email:</strong> {selectedRestaurant.email}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Phone:</strong> {selectedRestaurant.phone}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Cuisine:</strong> {selectedRestaurant.cuisine_type}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong>Description:</strong> {selectedRestaurant.description || 'No description provided'}
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h4>📍 Address</h4>
                                <p>{selectedRestaurant.address}</p>
                                <p>{selectedRestaurant.city}, {selectedRestaurant.state} - {selectedRestaurant.pincode}</p>
                            </div>

                            <div className="details-section">
                                <h4>⏰ Business Hours</h4>
                                <p>{selectedRestaurant.opening_time} - {selectedRestaurant.closing_time}</p>
                            </div>

                            <div className="details-section">
                                <h4>💰 Financial Information</h4>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>Min Order:</strong> ₹{selectedRestaurant.min_order_amount}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Delivery Fee:</strong> ₹{selectedRestaurant.delivery_fee}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Commission Rate:</strong> {selectedRestaurant.commission_rate}%
                                    </div>
                                    <div className="detail-item">
                                        <strong>Total Revenue:</strong> ₹{selectedRestaurant.total_revenue?.toLocaleString() || 0}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Total Orders:</strong> {selectedRestaurant.total_orders || 0}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Avg Rating:</strong> {selectedRestaurant.rating || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="details-section">
                                <h4>👨‍💼 Owner Information</h4>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <strong>Name:</strong> {selectedRestaurant.owner_name || 'N/A'}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Email:</strong> {selectedRestaurant.owner_email || 'N/A'}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Joined:</strong> {new Date(selectedRestaurant.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {(selectedRestaurant.facebook_url || selectedRestaurant.instagram_url || selectedRestaurant.website_url) && (
                                <div className="details-section">
                                    <h4>🌐 Social Links</h4>
                                    <div className="social-links">
                                        {selectedRestaurant.facebook_url && (
                                            <a href={selectedRestaurant.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                                                📘 Facebook
                                            </a>
                                        )}
                                        {selectedRestaurant.instagram_url && (
                                            <a href={selectedRestaurant.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                                                📷 Instagram
                                            </a>
                                        )}
                                        {selectedRestaurant.website_url && (
                                            <a href={selectedRestaurant.website_url} target="_blank" rel="noopener noreferrer" className="social-link website">
                                                🌐 Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setSelectedRestaurant(null)} className="close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRestaurantManagement;
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import './AdminRestaurants.css';

const AdminRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        cuisine: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        status: 'pending',
        commission: 15
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockRestaurants = [
                { id: 1, name: 'Pizza Hut', email: 'contact@pizzahut.com', phone: '1234567890', address: '123 Main St, NYC', cuisine: 'Italian, Pizza', ownerName: 'John Smith', ownerEmail: 'john@pizzahut.com', ownerPhone: '9876543210', status: 'active', commission: 15, totalOrders: 1250, totalRevenue: 456000, rating: 4.8, joinedDate: '2023-01-15' },
                { id: 2, name: "McDonald's", email: 'contact@mcdonalds.com', phone: '1234567891', address: '456 Park Ave, NYC', cuisine: 'American, Burger', ownerName: 'Jane Doe', ownerEmail: 'jane@mcdonalds.com', ownerPhone: '9876543211', status: 'active', commission: 15, totalOrders: 1100, totalRevenue: 389000, rating: 4.7, joinedDate: '2023-02-20' },
                { id: 3, name: 'KFC', email: 'contact@kfc.com', phone: '1234567892', address: '789 Broadway, NYC', cuisine: 'American, Fried Chicken', ownerName: 'Mike Johnson', ownerEmail: 'mike@kfc.com', ownerPhone: '9876543212', status: 'pending', commission: 15, totalOrders: 0, totalRevenue: 0, rating: 0, joinedDate: '2024-01-10' },
                { id: 4, name: 'Biryani House', email: 'contact@biryani.com', phone: '1234567893', address: '321 5th Ave, NYC', cuisine: 'Indian, Biryani', ownerName: 'Sarah Williams', ownerEmail: 'sarah@biryani.com', ownerPhone: '9876543213', status: 'active', commission: 15, totalOrders: 850, totalRevenue: 245000, rating: 4.9, joinedDate: '2023-03-05' },
                { id: 5, name: "Domino's", email: 'contact@dominos.com', phone: '1234567894', address: '654 Madison Ave, NYC', cuisine: 'Italian, Pizza', ownerName: 'David Brown', ownerEmail: 'david@dominos.com', ownerPhone: '9876543214', status: 'suspended', commission: 15, totalOrders: 780, totalRevenue: 234000, rating: 4.8, joinedDate: '2023-04-12' }
            ];
            setRestaurants(mockRestaurants);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRestaurant = () => {
        setIsEditing(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            cuisine: '',
            ownerName: '',
            ownerEmail: '',
            ownerPhone: '',
            status: 'pending',
            commission: 15
        });
        setFormErrors({});
        setShowRestaurantModal(true);
    };

    const handleEditRestaurant = (restaurant) => {
        setIsEditing(true);
        setSelectedRestaurant(restaurant);
        setFormData({
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address,
            cuisine: restaurant.cuisine,
            ownerName: restaurant.ownerName,
            ownerEmail: restaurant.ownerEmail,
            ownerPhone: restaurant.ownerPhone,
            status: restaurant.status,
            commission: restaurant.commission
        });
        setFormErrors({});
        setShowRestaurantModal(true);
    };

    const handleViewRestaurant = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setShowRestaurantModal(true);
        setIsEditing(false);
        setFormData({
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            address: restaurant.address,
            cuisine: restaurant.cuisine,
            ownerName: restaurant.ownerName,
            ownerEmail: restaurant.ownerEmail,
            ownerPhone: restaurant.ownerPhone,
            status: restaurant.status,
            commission: restaurant.commission
        });
    };

    const handleDeleteRestaurant = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setRestaurants(prev => prev.filter(r => r.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting restaurant:', error);
        }
    };

    const handleStatusChange = async (restaurantId, newStatus) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setRestaurants(prev => prev.map(restaurant =>
                restaurant.id === restaurantId ? { ...restaurant, status: newStatus } : restaurant
            ));
        } catch (error) {
            console.error('Error updating restaurant status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!formData.name) errors.name = 'Restaurant name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.phone) errors.phone = 'Phone is required';
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.ownerName) errors.ownerName = 'Owner name is required';
        if (!formData.ownerEmail) errors.ownerEmail = 'Owner email is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (isEditing) {
                setRestaurants(prev => prev.map(r =>
                    r.id === selectedRestaurant.id ? { ...r, ...formData } : r
                ));
            } else {
                const newRestaurant = {
                    id: Date.now(),
                    ...formData,
                    totalOrders: 0,
                    totalRevenue: 0,
                    rating: 0,
                    joinedDate: new Date().toISOString().split('T')[0]
                };
                setRestaurants(prev => [...prev, newRestaurant]);
            }

            setShowRestaurantModal(false);
        } catch (error) {
            console.error('Error saving restaurant:', error);
        }
    };

    const getStatusBadge = (status) => {
        const configs = {
            active: { class: 'active', text: 'Active', icon: '✅' },
            pending: { class: 'pending', text: 'Pending', icon: '⏳' },
            suspended: { class: 'suspended', text: 'Suspended', icon: '⛔' }
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`restaurant-status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </span>
        );
    };

    const filteredRestaurants = restaurants.filter(restaurant => {
        if (filterStatus !== 'all' && restaurant.status !== filterStatus) return false;
        if (searchTerm && !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !restaurant.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const columns = [
        { key: 'id', label: 'ID', width: '70px', sortable: true },
        { key: 'name', label: 'Restaurant Name', width: '180px', sortable: true },
        { key: 'email', label: 'Email', width: '200px' },
        { key: 'phone', label: 'Phone', width: '120px' },
        { key: 'cuisine', label: 'Cuisine', width: '150px' },
        { key: 'totalOrders', label: 'Orders', width: '80px', sortable: true, render: (value) => value.toLocaleString() },
        { key: 'totalRevenue', label: 'Revenue', width: '120px', sortable: true, render: (value) => `₹${value.toLocaleString()}` },
        { key: 'rating', label: 'Rating', width: '80px', sortable: true, render: (value) => value > 0 ? `⭐ ${value}` : '-' },
        {
            key: 'status',
            label: 'Status',
            width: '100px',
            render: (value) => getStatusBadge(value)
        }
    ];

    const actions = [
        {
            icon: '👁️',
            tooltip: 'View Details',
            className: 'view-btn',
            onClick: (row) => handleViewRestaurant(row)
        },
        {
            icon: '✏️',
            tooltip: 'Edit',
            className: 'edit-btn',
            onClick: (row) => handleEditRestaurant(row)
        },
        {
            icon: '🗑️',
            tooltip: 'Delete',
            className: 'delete-btn',
            onClick: (row) => setDeleteConfirm({ id: row.id, name: row.name })
        }
    ];

    const statusCounts = {
        all: restaurants.length,
        active: restaurants.filter(r => r.status === 'active').length,
        pending: restaurants.filter(r => r.status === 'pending').length,
        suspended: restaurants.filter(r => r.status === 'suspended').length
    };

    return (
        <div className="admin-restaurants">
            <div className="page-header">
                <h1>Restaurant Management</h1>
                <p>Manage all registered restaurants</p>
            </div>

            {/* Stats Cards */}
            <div className="restaurant-stats">
                <div className="stat-card" onClick={() => setFilterStatus('all')}>
                    <div className="stat-value">{statusCounts.all}</div>
                    <div className="stat-label">Total Restaurants</div>
                </div>
                <div className="stat-card active" onClick={() => setFilterStatus('active')}>
                    <div className="stat-value">{statusCounts.active}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card pending" onClick={() => setFilterStatus('pending')}>
                    <div className="stat-value">{statusCounts.pending}</div>
                    <div className="stat-label">Pending Approval</div>
                </div>
                <div className="stat-card suspended" onClick={() => setFilterStatus('suspended')}>
                    <div className="stat-value">{statusCounts.suspended}</div>
                    <div className="stat-label">Suspended</div>
                </div>
            </div>

            {/* Filters */}
            <div className="restaurant-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <div className="filter-group">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <Button variant="primary" onClick={handleAddRestaurant}>
                        + Add Restaurant
                    </Button>
                    <Button variant="outline" onClick={() => {
                        setFilterStatus('all');
                        setSearchTerm('');
                    }}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Restaurants Table */}
            <DataTable
                columns={columns}
                data={filteredRestaurants}
                loading={loading}
                actions={actions}
                onRowClick={handleViewRestaurant}
                emptyMessage="No restaurants found"
            />

            {/* Restaurant Modal */}
            <Modal
                isOpen={showRestaurantModal}
                onClose={() => setShowRestaurantModal(false)}
                title={isEditing ? 'Edit Restaurant' : 'Restaurant Details'}
                size="large"
            >
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="restaurant-form">
                        <div className="form-section">
                            <h4>Restaurant Information</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Restaurant Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={formErrors.name ? 'error' : ''}
                                    />
                                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={formErrors.email ? 'error' : ''}
                                    />
                                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={formErrors.phone ? 'error' : ''}
                                    />
                                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Cuisine</label>
                                    <input
                                        type="text"
                                        value={formData.cuisine}
                                        onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                        placeholder="e.g., Italian, Pizza"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address *</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className={formErrors.address ? 'error' : ''}
                                />
                                {formErrors.address && <span className="error-message">{formErrors.address}</span>}
                            </div>
                        </div>

                        <div className="form-section">
                            <h4>Owner Information</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Owner Name *</label>
                                    <input
                                        type="text"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className={formErrors.ownerName ? 'error' : ''}
                                    />
                                    {formErrors.ownerName && <span className="error-message">{formErrors.ownerName}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Owner Email *</label>
                                    <input
                                        type="email"
                                        value={formData.ownerEmail}
                                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                                        className={formErrors.ownerEmail ? 'error' : ''}
                                    />
                                    {formErrors.ownerEmail && <span className="error-message">{formErrors.ownerEmail}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Owner Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.ownerPhone}
                                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Commission (%)</label>
                                    <input
                                        type="number"
                                        value={formData.commission}
                                        onChange={(e) => setFormData({ ...formData, commission: parseInt(e.target.value) })}
                                        min="0"
                                        max="50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h4>Status</h4>
                            <div className="status-options">
                                <label className="status-option">
                                    <input
                                        type="radio"
                                        value="active"
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Active</span>
                                </label>
                                <label className="status-option">
                                    <input
                                        type="radio"
                                        value="pending"
                                        checked={formData.status === 'pending'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Pending</span>
                                </label>
                                <label className="status-option">
                                    <input
                                        type="radio"
                                        value="suspended"
                                        checked={formData.status === 'suspended'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <span>Suspended</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" variant="primary">Save Changes</Button>
                            <Button type="button" variant="outline" onClick={() => setShowRestaurantModal(false)}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    selectedRestaurant && (
                        <div className="restaurant-details-modal">
                            <div className="detail-section">
                                <h4>Restaurant Information</h4>
                                <p><strong>Name:</strong> {selectedRestaurant.name}</p>
                                <p><strong>Email:</strong> {selectedRestaurant.email}</p>
                                <p><strong>Phone:</strong> {selectedRestaurant.phone}</p>
                                <p><strong>Address:</strong> {selectedRestaurant.address}</p>
                                <p><strong>Cuisine:</strong> {selectedRestaurant.cuisine}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedRestaurant.status)}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Owner Information</h4>
                                <p><strong>Name:</strong> {selectedRestaurant.ownerName}</p>
                                <p><strong>Email:</strong> {selectedRestaurant.ownerEmail}</p>
                                <p><strong>Phone:</strong> {selectedRestaurant.ownerPhone}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Statistics</h4>
                                <p><strong>Total Orders:</strong> {selectedRestaurant.totalOrders.toLocaleString()}</p>
                                <p><strong>Total Revenue:</strong> ₹{selectedRestaurant.totalRevenue.toLocaleString()}</p>
                                <p><strong>Rating:</strong> {selectedRestaurant.rating > 0 ? `⭐ ${selectedRestaurant.rating}` : 'Not rated yet'}</p>
                                <p><strong>Commission Rate:</strong> {selectedRestaurant.commission}%</p>
                                <p><strong>Joined Date:</strong> {new Date(selectedRestaurant.joinedDate).toLocaleDateString()}</p>
                            </div>

                            <div className="detail-actions">
                                <Button variant="primary" onClick={() => handleEditRestaurant(selectedRestaurant)}>
                                    Edit Restaurant
                                </Button>
                                <Button variant="outline" onClick={() => setShowRestaurantModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDeleteRestaurant}
                title="Delete Restaurant"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminRestaurants;
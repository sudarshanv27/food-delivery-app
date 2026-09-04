import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import './AdminDeliveryManagement.css';

const AdminDeliveryManagement = () => {
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('partners');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleNumber: '',
        vehicleType: 'bike',
        status: 'pending',
        commission: 50,
        totalDeliveries: 0,
        totalEarnings: 0,
        rating: 0
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchDeliveryData();
    }, []);

    const fetchDeliveryData = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockPartners = [
                { id: 1, name: 'Raj Kumar', email: 'raj@example.com', phone: '9876543210', vehicleNumber: 'DL 01 AB 1234', vehicleType: 'bike', status: 'active', totalDeliveries: 156, totalEarnings: 12480, rating: 4.8, joinedDate: '2023-01-15' },
                { id: 2, name: 'Amit Singh', email: 'amit@example.com', phone: '9876543211', vehicleNumber: 'DL 02 CD 5678', vehicleType: 'scooter', status: 'active', totalDeliveries: 142, totalEarnings: 11360, rating: 4.7, joinedDate: '2023-02-20' },
                { id: 3, name: 'Vikram Sharma', email: 'vikram@example.com', phone: '9876543212', vehicleNumber: 'DL 03 EF 9012', vehicleType: 'bike', status: 'inactive', totalDeliveries: 89, totalEarnings: 7120, rating: 4.5, joinedDate: '2023-03-10' },
                { id: 4, name: 'Rohit Verma', email: 'rohit@example.com', phone: '9876543213', vehicleNumber: 'DL 04 GH 3456', vehicleType: 'bike', status: 'pending', totalDeliveries: 0, totalEarnings: 0, rating: 0, joinedDate: '2024-01-05' }
            ];

            const mockActiveDeliveries = [
                { id: 'DEL-001', orderId: 'ORD-001', partner: 'Raj Kumar', customer: 'John Doe', restaurant: 'Pizza Hut', pickupAddress: '123 Main St', deliveryAddress: '456 Park Ave', status: 'picked_up', assignedTime: '10:30 AM', estimatedDelivery: '11:00 AM' },
                { id: 'DEL-002', orderId: 'ORD-002', partner: 'Amit Singh', customer: 'Jane Smith', restaurant: "McDonald's", pickupAddress: '789 Broadway', deliveryAddress: '321 5th Ave', status: 'assigned', assignedTime: '10:45 AM', estimatedDelivery: '11:15 AM' }
            ];

            setDeliveryPartners(mockPartners);
            setActiveDeliveries(mockActiveDeliveries);
        } catch (error) {
            console.error('Error fetching delivery data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPartner = () => {
        setIsEditing(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            vehicleNumber: '',
            vehicleType: 'bike',
            status: 'pending',
            commission: 50,
            totalDeliveries: 0,
            totalEarnings: 0,
            rating: 0
        });
        setFormErrors({});
        setShowPartnerModal(true);
    };

    const handleEditPartner = (partner) => {
        setIsEditing(true);
        setSelectedPartner(partner);
        setFormData({
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            vehicleNumber: partner.vehicleNumber,
            vehicleType: partner.vehicleType,
            status: partner.status,
            commission: partner.commission || 50,
            totalDeliveries: partner.totalDeliveries,
            totalEarnings: partner.totalEarnings,
            rating: partner.rating
        });
        setFormErrors({});
        setShowPartnerModal(true);
    };

    const handleViewPartner = (partner) => {
        setSelectedPartner(partner);
        setShowPartnerModal(true);
        setIsEditing(false);
    };

    const handleDeletePartner = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDeliveryPartners(prev => prev.filter(p => p.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting partner:', error);
        }
    };

    const handleStatusChange = async (partnerId, newStatus) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setDeliveryPartners(prev => prev.map(partner =>
                partner.id === partnerId ? { ...partner, status: newStatus } : partner
            ));
        } catch (error) {
            console.error('Error updating partner status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (!formData.phone) errors.phone = 'Phone is required';
        if (!formData.vehicleNumber) errors.vehicleNumber = 'Vehicle number is required';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (isEditing) {
                setDeliveryPartners(prev => prev.map(p =>
                    p.id === selectedPartner.id ? { ...p, ...formData } : p
                ));
            } else {
                const newPartner = {
                    id: Date.now(),
                    ...formData,
                    joinedDate: new Date().toISOString().split('T')[0]
                };
                setDeliveryPartners(prev => [...prev, newPartner]);
            }

            setShowPartnerModal(false);
        } catch (error) {
            console.error('Error saving partner:', error);
        }
    };

    const getStatusBadge = (status) => {
        const configs = {
            active: { class: 'active', text: 'Active', icon: '✅' },
            inactive: { class: 'inactive', text: 'Inactive', icon: '⭕' },
            pending: { class: 'pending', text: 'Pending', icon: '⏳' }
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`delivery-status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </span>
        );
    };

    const getDeliveryStatusBadge = (status) => {
        const configs = {
            assigned: { class: 'assigned', text: 'Assigned', icon: '📋' },
            picked_up: { class: 'picked', text: 'Picked Up', icon: '🛵' },
            delivered: { class: 'delivered', text: 'Delivered', icon: '✅' }
        };
        const config = configs[status] || configs.assigned;
        return (
            <span className={`delivery-status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </span>
        );
    };

    const filteredPartners = deliveryPartners.filter(partner => {
        if (filterStatus !== 'all' && partner.status !== filterStatus) return false;
        if (searchTerm && !partner.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !partner.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const partnerColumns = [
        { key: 'id', label: 'ID', width: '70px', sortable: true },
        { key: 'name', label: 'Partner Name', width: '150px', sortable: true },
        { key: 'email', label: 'Email', width: '180px' },
        { key: 'phone', label: 'Phone', width: '120px' },
        { key: 'vehicleNumber', label: 'Vehicle No', width: '120px' },
        { key: 'vehicleType', label: 'Vehicle', width: '100px', render: (value) => value.toUpperCase() },
        { key: 'totalDeliveries', label: 'Deliveries', width: '100px', sortable: true },
        { key: 'totalEarnings', label: 'Earnings', width: '120px', sortable: true, render: (value) => `₹${value.toLocaleString()}` },
        { key: 'rating', label: 'Rating', width: '80px', sortable: true, render: (value) => value > 0 ? `⭐ ${value}` : '-' },
        { key: 'status', label: 'Status', width: '100px', render: (value) => getStatusBadge(value) }
    ];

    const deliveryColumns = [
        { key: 'id', label: 'Delivery ID', width: '100px' },
        { key: 'orderId', label: 'Order ID', width: '100px' },
        { key: 'partner', label: 'Partner', width: '120px' },
        { key: 'customer', label: 'Customer', width: '120px' },
        { key: 'restaurant', label: 'Restaurant', width: '120px' },
        { key: 'status', label: 'Status', width: '100px', render: (value) => getDeliveryStatusBadge(value) },
        { key: 'estimatedDelivery', label: 'Est Delivery', width: '100px' }
    ];

    const partnerActions = [
        { icon: '👁️', tooltip: 'View Details', className: 'view-btn', onClick: (row) => handleViewPartner(row) },
        { icon: '✏️', tooltip: 'Edit', className: 'edit-btn', onClick: (row) => handleEditPartner(row) },
        { icon: '🗑️', tooltip: 'Delete', className: 'delete-btn', onClick: (row) => setDeleteConfirm({ id: row.id, name: row.name }) }
    ];

    const statusCounts = {
        all: deliveryPartners.length,
        active: deliveryPartners.filter(p => p.status === 'active').length,
        inactive: deliveryPartners.filter(p => p.status === 'inactive').length,
        pending: deliveryPartners.filter(p => p.status === 'pending').length
    };

    return (
        <div className="admin-delivery">
            <div className="page-header">
                <h1>Delivery Management</h1>
                <p>Manage delivery partners and track active deliveries</p>
            </div>

            {/* Tabs */}
            <div className="delivery-tabs">
                <button
                    className={`tab-btn ${activeTab === 'partners' ? 'active' : ''}`}
                    onClick={() => setActiveTab('partners')}
                >
                    🚚 Delivery Partners
                </button>
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    📦 Active Deliveries ({activeDeliveries.length})
                </button>
            </div>

            {/* Partners Tab */}
            {activeTab === 'partners' && (
                <>
                    {/* Stats Cards */}
                    <div className="delivery-stats">
                        <div className="stat-card" onClick={() => setFilterStatus('all')}>
                            <div className="stat-value">{statusCounts.all}</div>
                            <div className="stat-label">Total Partners</div>
                        </div>
                        <div className="stat-card active" onClick={() => setFilterStatus('active')}>
                            <div className="stat-value">{statusCounts.active}</div>
                            <div className="stat-label">Active</div>
                        </div>
                        <div className="stat-card inactive" onClick={() => setFilterStatus('inactive')}>
                            <div className="stat-value">{statusCounts.inactive}</div>
                            <div className="stat-label">Inactive</div>
                        </div>
                        <div className="stat-card pending" onClick={() => setFilterStatus('pending')}>
                            <div className="stat-value">{statusCounts.pending}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="delivery-filters">
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
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
                            <Button variant="primary" onClick={handleAddPartner}>
                                + Add Partner
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setFilterStatus('all');
                                setSearchTerm('');
                            }}>
                                Clear Filters
                            </Button>
                        </div>
                    </div>

                    {/* Partners Table */}
                    <DataTable
                        columns={partnerColumns}
                        data={filteredPartners}
                        loading={loading}
                        actions={partnerActions}
                        onRowClick={handleViewPartner}
                        emptyMessage="No delivery partners found"
                    />
                </>
            )}

            {/* Active Deliveries Tab */}
            {activeTab === 'active' && (
                <div className="active-deliveries">
                    <h3>Active Deliveries</h3>
                    <DataTable
                        columns={deliveryColumns}
                        data={activeDeliveries}
                        loading={loading}
                        emptyMessage="No active deliveries"
                    />
                </div>
            )}

            {/* Partner Modal */}
            <Modal
                isOpen={showPartnerModal}
                onClose={() => setShowPartnerModal(false)}
                title={isEditing ? 'Edit Delivery Partner' : 'Partner Details'}
                size="large"
            >
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="partner-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
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
                                <label>Vehicle Number *</label>
                                <input
                                    type="text"
                                    value={formData.vehicleNumber}
                                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    className={formErrors.vehicleNumber ? 'error' : ''}
                                />
                                {formErrors.vehicleNumber && <span className="error-message">{formErrors.vehicleNumber}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Vehicle Type</label>
                                <select value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}>
                                    <option value="bike">Bike</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Commission per Delivery (₹)</label>
                                <input
                                    type="number"
                                    value={formData.commission}
                                    onChange={(e) => setFormData({ ...formData, commission: parseInt(e.target.value) })}
                                    min="0"
                                    step="5"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" variant="primary">Save Changes</Button>
                            <Button type="button" variant="outline" onClick={() => setShowPartnerModal(false)}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    selectedPartner && (
                        <div className="partner-details-modal">
                            <div className="detail-section">
                                <h4>Personal Information</h4>
                                <p><strong>Name:</strong> {selectedPartner.name}</p>
                                <p><strong>Email:</strong> {selectedPartner.email}</p>
                                <p><strong>Phone:</strong> {selectedPartner.phone}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedPartner.status)}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Vehicle Information</h4>
                                <p><strong>Vehicle Number:</strong> {selectedPartner.vehicleNumber}</p>
                                <p><strong>Vehicle Type:</strong> {selectedPartner.vehicleType.toUpperCase()}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Performance Statistics</h4>
                                <p><strong>Total Deliveries:</strong> {selectedPartner.totalDeliveries}</p>
                                <p><strong>Total Earnings:</strong> ₹{selectedPartner.totalEarnings.toLocaleString()}</p>
                                <p><strong>Average per Delivery:</strong> ₹{(selectedPartner.totalEarnings / (selectedPartner.totalDeliveries || 1)).toFixed(0)}</p>
                                <p><strong>Rating:</strong> {selectedPartner.rating > 0 ? `⭐ ${selectedPartner.rating}` : 'Not rated yet'}</p>
                                <p><strong>Joined Date:</strong> {new Date(selectedPartner.joinedDate).toLocaleDateString()}</p>
                            </div>

                            <div className="detail-actions">
                                <Button variant="primary" onClick={() => handleEditPartner(selectedPartner)}>
                                    Edit Partner
                                </Button>
                                <Button variant="outline" onClick={() => setShowPartnerModal(false)}>
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
                onConfirm={handleDeletePartner}
                title="Delete Delivery Partner"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminDeliveryManagement;
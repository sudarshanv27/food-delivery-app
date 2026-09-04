import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import './AdminOrders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockOrders = [
                { id: 'ORD-001', customer: 'John Doe', customerEmail: 'john@example.com', customerPhone: '1234567890', restaurant: 'Pizza Hut', items: 3, amount: 450, status: 'delivered', paymentMethod: 'Online', date: '2024-01-15T10:30:00', deliveryAddress: '123 Main St, NYC' },
                { id: 'ORD-002', customer: 'Jane Smith', customerEmail: 'jane@example.com', customerPhone: '0987654321', restaurant: "McDonald's", items: 2, amount: 320, status: 'processing', paymentMethod: 'COD', date: '2024-01-15T11:45:00', deliveryAddress: '456 Park Ave, NYC' },
                { id: 'ORD-003', customer: 'Mike Johnson', customerEmail: 'mike@example.com', customerPhone: '1122334455', restaurant: 'KFC', items: 4, amount: 280, status: 'pending', paymentMethod: 'Online', date: '2024-01-14T09:15:00', deliveryAddress: '789 Broadway, NYC' },
                { id: 'ORD-004', customer: 'Sarah Williams', customerEmail: 'sarah@example.com', customerPhone: '5544332211', restaurant: 'Biryani House', items: 2, amount: 520, status: 'delivered', paymentMethod: 'Online', date: '2024-01-14T14:20:00', deliveryAddress: '321 5th Ave, NYC' },
                { id: 'ORD-005', customer: 'David Brown', customerEmail: 'david@example.com', customerPhone: '6677889900', restaurant: 'Domino\'s', items: 3, amount: 380, status: 'cancelled', paymentMethod: 'COD', date: '2024-01-13T18:30:00', deliveryAddress: '654 Madison Ave, NYC' },
                { id: 'ORD-006', customer: 'Emily Davis', customerEmail: 'emily@example.com', customerPhone: '9988776655', restaurant: 'Starbucks', items: 2, amount: 150, status: 'processing', paymentMethod: 'Online', date: '2024-01-13T10:00:00', deliveryAddress: '987 Lex Ave, NYC' }
            ];
            setOrders(mockOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus !== 'all' && order.status !== filterStatus) return false;
        if (searchTerm && !order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !order.customer.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !order.restaurant.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const getStatusBadge = (status) => {
        const configs = {
            delivered: { class: 'delivered', text: 'Delivered', icon: '✅' },
            processing: { class: 'processing', text: 'Processing', icon: '🔄' },
            pending: { class: 'pending', text: 'Pending', icon: '⏳' },
            cancelled: { class: 'cancelled', text: 'Cancelled', icon: '❌' }
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`order-status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </span>
        );
    };

    const columns = [
        { key: 'id', label: 'Order ID', width: '120px', sortable: true },
        { key: 'customer', label: 'Customer', width: '150px', sortable: true },
        { key: 'restaurant', label: 'Restaurant', width: '150px', sortable: true },
        { key: 'items', label: 'Items', width: '80px', sortable: true },
        {
            key: 'amount',
            label: 'Amount',
            width: '100px',
            sortable: true,
            render: (value) => `₹${value}`
        },
        {
            key: 'status',
            label: 'Status',
            width: '120px',
            sortable: true,
            render: (value) => getStatusBadge(value)
        },
        {
            key: 'date',
            label: 'Date',
            width: '150px',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    const actions = [
        {
            icon: '👁️',
            tooltip: 'View Details',
            className: 'view-btn',
            onClick: (row) => handleViewOrder(row)
        },
        {
            icon: '✏️',
            tooltip: 'Update Status',
            className: 'edit-btn',
            onClick: (row) => {
                const newStatus = prompt('Enter new status (delivered/processing/pending/cancelled):', row.status);
                if (newStatus && ['delivered', 'processing', 'pending', 'cancelled'].includes(newStatus)) {
                    handleStatusChange(row.id, newStatus);
                }
            }
        }
    ];

    const statusCounts = {
        all: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        processing: orders.filter(o => o.status === 'processing').length,
        pending: orders.filter(o => o.status === 'pending').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    return (
        <div className="admin-orders">
            <div className="page-header">
                <h1>Order Management</h1>
                <p>Manage and track all customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="order-stats">
                <div className="stat-card" onClick={() => setFilterStatus('all')}>
                    <div className="stat-value">{statusCounts.all}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card delivered" onClick={() => setFilterStatus('delivered')}>
                    <div className="stat-value">{statusCounts.delivered}</div>
                    <div className="stat-label">Delivered</div>
                </div>
                <div className="stat-card processing" onClick={() => setFilterStatus('processing')}>
                    <div className="stat-value">{statusCounts.processing}</div>
                    <div className="stat-label">Processing</div>
                </div>
                <div className="stat-card pending" onClick={() => setFilterStatus('pending')}>
                    <div className="stat-value">{statusCounts.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card cancelled" onClick={() => setFilterStatus('cancelled')}>
                    <div className="stat-value">{statusCounts.cancelled}</div>
                    <div className="stat-label">Cancelled</div>
                </div>
            </div>

            {/* Filters */}
            <div className="order-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by order ID, customer, restaurant..."
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
                        <option value="delivered">Delivered</option>
                        <option value="processing">Processing</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="outline" onClick={() => {
                        setFilterStatus('all');
                        setSearchTerm('');
                    }}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Orders Table */}
            <DataTable
                columns={columns}
                data={filteredOrders}
                loading={loading}
                actions={actions}
                onRowClick={handleViewOrder}
                emptyMessage="No orders found"
            />

            {/* Order Details Modal */}
            <Modal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                title={`Order Details - ${selectedOrder?.id}`}
                size="large"
            >
                {selectedOrder && (
                    <div className="order-details-modal">
                        <div className="order-info-grid">
                            <div className="info-section">
                                <h4>Customer Information</h4>
                                <p><strong>Name:</strong> {selectedOrder.customer}</p>
                                <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                                <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                            </div>

                            <div className="info-section">
                                <h4>Order Information</h4>
                                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                                <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                            </div>

                            <div className="info-section">
                                <h4>Restaurant Information</h4>
                                <p><strong>Name:</strong> {selectedOrder.restaurant}</p>
                                <p><strong>Items:</strong> {selectedOrder.items}</p>
                                <p><strong>Total Amount:</strong> ₹{selectedOrder.amount}</p>
                            </div>

                            <div className="info-section">
                                <h4>Delivery Address</h4>
                                <p>{selectedOrder.deliveryAddress}</p>
                            </div>
                        </div>

                        <div className="order-actions-modal">
                            <select
                                value={selectedOrder.status}
                                onChange={(e) => {
                                    handleStatusChange(selectedOrder.id, e.target.value);
                                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                                }}
                                className="status-select"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Button variant="primary" onClick={() => setShowOrderModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrders;
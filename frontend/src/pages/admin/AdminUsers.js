import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockUsers = [
                { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'user', status: 'active', orders: 12, totalSpent: 4560, joinedDate: '2023-01-15', lastActive: '2024-01-15T10:30:00' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'user', status: 'active', orders: 8, totalSpent: 3240, joinedDate: '2023-02-20', lastActive: '2024-01-14T15:45:00' },
                { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '1122334455', role: 'restaurant_owner', status: 'active', orders: 0, totalSpent: 0, joinedDate: '2023-03-10', lastActive: '2024-01-13T09:20:00' },
                { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '5544332211', role: 'delivery_partner', status: 'active', orders: 0, totalSpent: 0, joinedDate: '2023-04-05', lastActive: '2024-01-15T08:00:00' },
                { id: 5, name: 'David Brown', email: 'david@example.com', phone: '6677889900', role: 'user', status: 'suspended', orders: 5, totalSpent: 1890, joinedDate: '2023-05-12', lastActive: '2023-12-20T14:30:00' },
                { id: 6, name: 'Emily Davis', email: 'emily@example.com', phone: '9988776655', role: 'user', status: 'pending', orders: 0, totalSpent: 0, joinedDate: '2024-01-10', lastActive: '2024-01-10T11:00:00' }
            ];
            setUsers(mockUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = () => {
        setIsEditing(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'user',
            status: 'active',
            address: '',
            city: '',
            state: '',
            zipCode: ''
        });
        setFormErrors({});
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        setIsEditing(true);
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zipCode: user.zipCode || ''
        });
        setFormErrors({});
        setShowUserModal(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
        setIsEditing(false);
    };

    const handleDeleteUser = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            ));
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (!formData.phone) errors.phone = 'Phone is required';
        if (!/^\d{10}$/.test(formData.phone)) errors.phone = 'Phone must be 10 digits';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (isEditing) {
                setUsers(prev => prev.map(u =>
                    u.id === selectedUser.id ? { ...u, ...formData } : u
                ));
            } else {
                const newUser = {
                    id: Date.now(),
                    ...formData,
                    orders: 0,
                    totalSpent: 0,
                    joinedDate: new Date().toISOString().split('T')[0],
                    lastActive: new Date().toISOString()
                };
                setUsers(prev => [...prev, newUser]);
            }

            setShowUserModal(false);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const getRoleBadge = (role) => {
        const configs = {
            user: { class: 'user', text: 'Customer', icon: '👤' },
            restaurant_owner: { class: 'owner', text: 'Restaurant Owner', icon: '🏪' },
            delivery_partner: { class: 'delivery', text: 'Delivery Partner', icon: '🚚' },
            admin: { class: 'admin', text: 'Admin', icon: '⚙️' }
        };
        const config = configs[role] || configs.user;
        return (
            <span className={`user-role-badge ${config.class}`}>
                <span className="role-icon">{config.icon}</span>
                <span className="role-text">{config.text}</span>
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const configs = {
            active: { class: 'active', text: 'Active', icon: '✅' },
            suspended: { class: 'suspended', text: 'Suspended', icon: '⛔' },
            pending: { class: 'pending', text: 'Pending', icon: '⏳' }
        };
        const config = configs[status] || configs.pending;
        return (
            <span className={`user-status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </span>
        );
    };

    const filteredUsers = users.filter(user => {
        if (filterRole !== 'all' && user.role !== filterRole) return false;
        if (filterStatus !== 'all' && user.status !== filterStatus) return false;
        if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const columns = [
        { key: 'id', label: 'ID', width: '70px', sortable: true },
        { key: 'name', label: 'Name', width: '150px', sortable: true },
        { key: 'email', label: 'Email', width: '200px' },
        { key: 'phone', label: 'Phone', width: '120px' },
        { key: 'role', label: 'Role', width: '140px', render: (value) => getRoleBadge(value) },
        { key: 'orders', label: 'Orders', width: '80px', sortable: true },
        { key: 'totalSpent', label: 'Total Spent', width: '120px', sortable: true, render: (value) => `₹${value.toLocaleString()}` },
        { key: 'status', label: 'Status', width: '100px', render: (value) => getStatusBadge(value) },
        { key: 'joinedDate', label: 'Joined', width: '100px', render: (value) => new Date(value).toLocaleDateString() }
    ];

    const actions = [
        {
            icon: '👁️',
            tooltip: 'View Details',
            className: 'view-btn',
            onClick: (row) => handleViewUser(row)
        },
        {
            icon: '✏️',
            tooltip: 'Edit',
            className: 'edit-btn',
            onClick: (row) => handleEditUser(row)
        },
        {
            icon: '🗑️',
            tooltip: 'Delete',
            className: 'delete-btn',
            onClick: (row) => setDeleteConfirm({ id: row.id, name: row.name })
        }
    ];

    const roleCounts = {
        all: users.length,
        user: users.filter(u => u.role === 'user').length,
        restaurant_owner: users.filter(u => u.role === 'restaurant_owner').length,
        delivery_partner: users.filter(u => u.role === 'delivery_partner').length
    };

    const statusCounts = {
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        pending: users.filter(u => u.status === 'pending').length
    };

    return (
        <div className="admin-users">
            <div className="page-header">
                <h1>User Management</h1>
                <p>Manage all registered users</p>
            </div>

            {/* Stats Cards */}
            <div className="user-stats">
                <div className="stat-card" onClick={() => setFilterRole('all')}>
                    <div className="stat-value">{roleCounts.all}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card" onClick={() => setFilterRole('user')}>
                    <div className="stat-value">{roleCounts.user}</div>
                    <div className="stat-label">Customers</div>
                </div>
                <div className="stat-card" onClick={() => setFilterRole('restaurant_owner')}>
                    <div className="stat-value">{roleCounts.restaurant_owner}</div>
                    <div className="stat-label">Restaurant Owners</div>
                </div>
                <div className="stat-card" onClick={() => setFilterRole('delivery_partner')}>
                    <div className="stat-value">{roleCounts.delivery_partner}</div>
                    <div className="stat-label">Delivery Partners</div>
                </div>
            </div>

            {/* Second Row Stats - Status */}
            <div className="user-stats secondary">
                <div className="stat-card active" onClick={() => setFilterStatus('active')}>
                    <div className="stat-value">{statusCounts.active}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card suspended" onClick={() => setFilterStatus('suspended')}>
                    <div className="stat-value">{statusCounts.suspended}</div>
                    <div className="stat-label">Suspended</div>
                </div>
                <div className="stat-card pending" onClick={() => setFilterStatus('pending')}>
                    <div className="stat-value">{statusCounts.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            {/* Filters */}
            <div className="user-filters">
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
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="role-filter"
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Customers</option>
                        <option value="restaurant_owner">Restaurant Owners</option>
                        <option value="delivery_partner">Delivery Partners</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                    </select>
                    <Button variant="primary" onClick={handleAddUser}>
                        + Add User
                    </Button>
                    <Button variant="outline" onClick={() => {
                        setFilterRole('all');
                        setFilterStatus('all');
                        setSearchTerm('');
                    }}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <DataTable
                columns={columns}
                data={filteredUsers}
                loading={loading}
                actions={actions}
                onRowClick={handleViewUser}
                emptyMessage="No users found"
            />

            {/* User Modal */}
            <Modal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title={isEditing ? 'Edit User' : 'User Details'}
                size="large"
            >
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="user-form">
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
                                <label>Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="user">Customer</option>
                                    <option value="restaurant_owner">Restaurant Owner</option>
                                    <option value="delivery_partner">Delivery Partner</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>ZIP Code</label>
                                <input
                                    type="text"
                                    value={formData.zipCode}
                                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" variant="primary">Save Changes</Button>
                            <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                        </div>
                    </form>
                ) : (
                    selectedUser && (
                        <div className="user-details-modal">
                            <div className="detail-section">
                                <h4>Personal Information</h4>
                                <p><strong>Name:</strong> {selectedUser.name}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                                <p><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedUser.status)}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Account Statistics</h4>
                                <p><strong>Total Orders:</strong> {selectedUser.orders}</p>
                                <p><strong>Total Spent:</strong> ₹{selectedUser.totalSpent.toLocaleString()}</p>
                                <p><strong>Joined Date:</strong> {new Date(selectedUser.joinedDate).toLocaleDateString()}</p>
                                <p><strong>Last Active:</strong> {new Date(selectedUser.lastActive).toLocaleString()}</p>
                            </div>

                            {selectedUser.address && (
                                <div className="detail-section">
                                    <h4>Address</h4>
                                    <p>{selectedUser.address}</p>
                                    <p>{selectedUser.city}, {selectedUser.state} - {selectedUser.zipCode}</p>
                                </div>
                            )}

                            <div className="detail-actions">
                                <Button variant="primary" onClick={() => handleEditUser(selectedUser)}>
                                    Edit User
                                </Button>
                                <Button variant="outline" onClick={() => setShowUserModal(false)}>
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
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminUsers;
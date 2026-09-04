// frontend/src/components/profile/admin/AdminUserManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [dateRange, setDateRange] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        is_active: true
    });

    useEffect(() => {
        fetchUsers();

        // Set up polling for real-time updates (every 60 seconds)
        const interval = setInterval(() => {
            fetchUsers(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [dateRange]);

    const fetchUsers = async (silent = false) => {
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/users?range=${dateRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            // Mock data for demo
            setUsers(getMockUsers());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getMockUsers = () => [
        {
            user_id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+91 98765 43210',
            role: 'user',
            is_active: true,
            total_orders: 25,
            total_spent: 12500,
            created_at: '2024-01-15T10:30:00Z',
            last_login: '2024-01-20T15:45:00Z',
            avatar: null,
            address: '123 Main St, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
        },
        {
            user_id: 2,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+91 98765 43211',
            role: 'restaurant_owner',
            is_active: true,
            total_orders: 0,
            total_spent: 0,
            created_at: '2024-01-10T09:00:00Z',
            last_login: '2024-01-19T11:30:00Z',
            avatar: null,
            address: '456 Park Ave, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400002'
        },
        {
            user_id: 3,
            full_name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 98765 43212',
            role: 'delivery_partner',
            is_active: true,
            total_orders: 156,
            total_spent: 0,
            created_at: '2023-12-01T14:20:00Z',
            last_login: '2024-01-20T08:15:00Z',
            avatar: null,
            address: '789 Lake View, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400003'
        },
        {
            user_id: 4,
            full_name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43213',
            role: 'user',
            is_active: false,
            total_orders: 5,
            total_spent: 2500,
            created_at: '2024-01-05T16:45:00Z',
            last_login: '2024-01-18T19:00:00Z',
            avatar: null,
            address: '321 Green Park, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400004'
        },
        {
            user_id: 5,
            full_name: 'Admin User',
            email: 'admin@foodiedash.com',
            phone: '+91 98765 43214',
            role: 'admin',
            is_active: true,
            total_orders: 0,
            total_spent: 0,
            created_at: '2023-11-01T00:00:00Z',
            last_login: '2024-01-20T10:00:00Z',
            avatar: null,
            address: '555 Admin Office, Mumbai',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400005'
        }
    ];

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('User role updated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleUserStatus = async (userId, isActive) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}/status`,
                { is_active: !isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!newUser.full_name || !newUser.email || !newUser.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users', newUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User added successfully');
            setShowAddUserModal(false);
            setNewUser({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'user',
                is_active: true
            });
            fetchUsers();
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error('Failed to add user');
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to update');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users/bulk-status',
                { user_ids: selectedUsers, is_active: status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`${selectedUsers.length} users ${status ? 'activated' : 'deactivated'} successfully`);
            setSelectedUsers([]);
            setShowBulkActions(false);
            fetchUsers();
        } catch (error) {
            console.error('Error bulk updating users:', error);
            toast.error('Failed to update users');
        }
    };

    const handleBulkRoleUpdate = async (role) => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to update');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users/bulk-role',
                { user_ids: selectedUsers, role: role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`${selectedUsers.length} users role updated to ${role}`);
            setSelectedUsers([]);
            setShowBulkActions(false);
            fetchUsers();
        } catch (error) {
            console.error('Error bulk updating roles:', error);
            toast.error('Failed to update user roles');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.user_id));
        }
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleExport = async (format = 'csv') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/users/export?format=${format}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Users exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            // Fallback CSV export
            const exportData = filteredUsers.map(user => ({
                Name: user.full_name,
                Email: user.email,
                Phone: user.phone,
                Role: user.role,
                Status: user.is_active ? 'Active' : 'Inactive',
                'Total Orders': user.total_orders || 0,
                'Total Spent': user.total_spent || 0,
                'Joined Date': new Date(user.created_at).toLocaleDateString(),
                'Last Login': new Date(user.last_login).toLocaleDateString()
            }));
            const csv = convertToCSV(exportData);
            downloadFile(csv, `users_export_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success('Users exported successfully');
        }
    };

    const convertToCSV = (data) => {
        if (!data.length) return '';
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','));
        return [headers.join(','), ...rows].join('\n');
    };

    const downloadFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const getSortedUsers = () => {
        return [...filteredUsers].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'created_at' || sortBy === 'last_login') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.is_active) ||
            (filterStatus === 'inactive' && !user.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const sortedUsers = getSortedUsers();

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return '#F44336';
            case 'restaurant_owner': return '#FF9800';
            case 'delivery_partner': return '#4CAF50';
            default: return '#2196F3';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return '👑';
            case 'restaurant_owner': return '🏪';
            case 'delivery_partner': return '🚚';
            default: return '👤';
        }
    };

    const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        admins: users.filter(u => u.role === 'admin').length,
        owners: users.filter(u => u.role === 'restaurant_owner').length,
        partners: users.filter(u => u.role === 'delivery_partner').length,
        customers: users.filter(u => u.role === 'user').length
    };

    const statsCards = [
        { title: 'Total Users', value: stats.total, icon: '👥', color: '#2196F3', trend: 12.5 },
        { title: 'Active', value: stats.active, icon: '🟢', color: '#4CAF50', trend: 8.3 },
        { title: 'Inactive', value: stats.inactive, icon: '🔴', color: '#F44336', trend: -5.2 },
        { title: 'Customers', value: stats.customers, icon: '👤', color: '#9C27B0', trend: 15.7 },
        { title: 'Restaurant Owners', value: stats.owners, icon: '🏪', color: '#FF9800', trend: 6.8 },
        { title: 'Delivery Partners', value: stats.partners, icon: '🚚', color: '#00BCD4', trend: 10.2 }
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
            <div className="users-loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="users-error-container">
                <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={() => fetchUsers()} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-user-management">
            <div className="section-header">
                <div className="header-title">
                    <h2>User Management</h2>
                    {refreshing && <span className="refreshing-badge">Refreshing...</span>}
                </div>
                <div className="header-actions">
                    <div className="date-range-filter">
                        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="all">All Time</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <button className="refresh-btn" onClick={() => fetchUsers()} title="Refresh data">
                        🔄
                    </button>
                    <div className="export-buttons">
                        <button onClick={() => handleExport('csv')} className="export-btn csv">
                            📄 CSV
                        </button>
                        <button onClick={() => handleExport('pdf')} className="export-btn pdf">
                            📑 PDF
                        </button>
                    </div>
                    <button className="add-user-btn" onClick={() => setShowAddUserModal(true)}>
                        + Add User
                    </button>
                    {selectedUsers.length > 0 && (
                        <button className="bulk-actions-btn" onClick={() => setShowBulkActions(!showBulkActions)}>
                            📋 Bulk ({selectedUsers.length})
                        </button>
                    )}
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

            {/* Bulk Actions Panel */}
            {showBulkActions && (
                <div className="bulk-actions-panel">
                    <div className="bulk-header">
                        <h4>Bulk Actions ({selectedUsers.length} users selected)</h4>
                        <button className="close-bulk" onClick={() => setShowBulkActions(false)}>×</button>
                    </div>
                    <div className="bulk-buttons">
                        <button onClick={() => handleBulkStatusUpdate(true)} className="bulk-activate">
                            ✅ Activate Selected
                        </button>
                        <button onClick={() => handleBulkStatusUpdate(false)} className="bulk-deactivate">
                            ❌ Deactivate Selected
                        </button>
                        <button onClick={() => handleBulkRoleUpdate('user')} className="bulk-role">
                            👤 Make Customer
                        </button>
                        <button onClick={() => handleBulkRoleUpdate('restaurant_owner')} className="bulk-role">
                            🏪 Make Restaurant Owner
                        </button>
                        <button onClick={() => handleBulkRoleUpdate('delivery_partner')} className="bulk-role">
                            🚚 Make Delivery Partner
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                    )}
                </div>
                <div className="filter-controls">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="user">👤 Customers</option>
                        <option value="restaurant_owner">🏪 Restaurant Owners</option>
                        <option value="delivery_partner">🚚 Delivery Partners</option>
                        <option value="admin">👑 Admins</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="active">🟢 Active</option>
                        <option value="inactive">🔴 Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th onClick={() => handleSort('full_name')} className="sortable">
                                User {sortBy === 'full_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('email')} className="sortable">
                                Contact {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Role</th>
                            <th>Status</th>
                            <th onClick={() => handleSort('total_orders')} className="sortable">
                                Activity {sortBy === 'total_orders' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('created_at')} className="sortable">
                                Joined {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">
                                    <div className="no-data-content">
                                        <span>👥</span>
                                        <p>No users found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map(user => (
                                <tr key={user.user_id} className={!user.is_active ? 'inactive-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.user_id)}
                                            onChange={() => handleSelectUser(user.user_id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.full_name} />
                                                ) : (
                                                    <div className="avatar-placeholder" style={{ background: getRoleBadgeColor(user.role) }}>
                                                        {user.full_name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="user-name">{user.full_name}</div>
                                                <div className="user-phone">{user.phone || 'No phone'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-email">{user.email}</div>
                                        <div className="user-last-login">Last: {new Date(user.last_login).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                            className="role-select"
                                            style={{
                                                backgroundColor: getRoleBadgeColor(user.role) + '20',
                                                color: getRoleBadgeColor(user.role),
                                                borderColor: getRoleBadgeColor(user.role) + '40'
                                            }}
                                        >
                                            <option value="user">👤 Customer</option>
                                            <option value="restaurant_owner">🏪 Restaurant Owner</option>
                                            <option value="delivery_partner">🚚 Delivery Partner</option>
                                            <option value="admin">👑 Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="order-stats">
                                            <div>{user.total_orders || 0} orders</div>
                                            <div className="total-spent">₹{(user.total_spent || 0).toLocaleString()}</div>
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="view-btn"
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => handleUserStatus(user.user_id, user.is_active)}
                                                className="status-btn"
                                                title={user.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {user.is_active ? '🔒' : '🔓'}
                                            </button>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                    className="delete-btn"
                                                    title="Delete User"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="page-btn"
                    >
                        « First
                    </button>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="page-btn"
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="page-btn"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="page-btn"
                    >
                        Last »
                    </button>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>➕ Add New User</h3>
                            <button className="close-modal" onClick={() => setShowAddUserModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="user">Customer</option>
                                        <option value="restaurant_owner">Restaurant Owner</option>
                                        <option value="delivery_partner">Delivery Partner</option>
                                    </select>
                                </div>
                                <div className="form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={newUser.is_active}
                                            onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                                        />
                                        Active immediately
                                    </label>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddUserModal(false)} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>User Details</h3>
                            <button className="close-modal" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="user-details">
                            <div className="user-profile-header">
                                <div className="user-avatar-large">
                                    {selectedUser.avatar ? (
                                        <img src={selectedUser.avatar} alt={selectedUser.full_name} />
                                    ) : (
                                        <div className="avatar-placeholder large" style={{ background: getRoleBadgeColor(selectedUser.role) }}>
                                            {selectedUser.full_name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="user-basic-info">
                                    <h4>{selectedUser.full_name}</h4>
                                    <p className="user-role-badge" style={{ background: getRoleBadgeColor(selectedUser.role) }}>
                                        {getRoleIcon(selectedUser.role)} {selectedUser.role?.replace('_', ' ').toUpperCase()}
                                    </p>
                                    <p className="user-status">{selectedUser.is_active ? '🟢 Active' : '🔴 Inactive'}</p>
                                </div>
                            </div>

                            <div className="details-grid">
                                <div className="detail-section">
                                    <h5>📞 Contact Information</h5>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                    <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                                </div>
                                <div className="detail-section">
                                    <h5>📍 Address</h5>
                                    <p>{selectedUser.address || 'Not provided'}</p>
                                    {selectedUser.city && (
                                        <p>{selectedUser.city}, {selectedUser.state} - {selectedUser.pincode}</p>
                                    )}
                                </div>
                                <div className="detail-section">
                                    <h5>📊 Account Information</h5>
                                    <p><strong>Member since:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                    <p><strong>Last login:</strong> {new Date(selectedUser.last_login).toLocaleString()}</p>
                                </div>
                                <div className="detail-section">
                                    <h5>📈 Activity Summary</h5>
                                    <p><strong>Total Orders:</strong> {selectedUser.total_orders || 0}</p>
                                    <p><strong>Total Spent:</strong> ₹{(selectedUser.total_spent || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => handleUserStatus(selectedUser.user_id, selectedUser.is_active)} className="status-action-btn">
                                {selectedUser.is_active ? '🔒 Deactivate User' : '🔓 Activate User'}
                            </button>
                            <button onClick={() => setSelectedUser(null)} className="close-btn">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
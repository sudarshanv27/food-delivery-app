import React, { useState } from 'react';
import { Search, MoreVertical, Star, ShoppingBag } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', orders: 12, totalSpent: 3450, joinDate: '2024-01-01', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 98765 43211', orders: 8, totalSpent: 2340, joinDate: '2024-01-03', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 98765 43212', orders: 15, totalSpent: 5670, joinDate: '2023-12-28', status: 'active' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+91 98765 43213', orders: 5, totalSpent: 1280, joinDate: '2024-01-10', status: 'inactive' },
    { id: 5, name: 'David Brown', email: 'david@example.com', phone: '+91 98765 43214', orders: 20, totalSpent: 8900, joinDate: '2023-12-15', status: 'active' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '8px' }}>Users Management</h1>
        <p style={{ color: '#7f8c8d' }}>View and manage all registered users</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '18px', color: '#2c3e50' }}>All Users</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '14px', width: '200px' }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>User</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Orders</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Total Spent</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Join Date</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#ff4757', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {user.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#7f8c8d' }}>{user.email}</td>
                  <td style={{ padding: '16px 24px', color: '#7f8c8d' }}>{user.phone}</td>
                  <td style={{ padding: '16px 24px' }}>{user.orders}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2ed573' }}>₹{user.totalSpent.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px', color: '#7f8c8d' }}>{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: user.status === 'active' ? '#e8f5e8' : '#ffe8e8', color: user.status === 'active' ? '#2ed573' : '#ff4757' }}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
// admin-panel/src/pages/Users.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/admin/users/${userId}/status`, 
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div style={styles.loading}>Loading users...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>👥 User Management</h1>
            </div>

            <div style={styles.searchBar}>
                <input
                    type="text"
                    placeholder="🔍 Search users by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>User Type</th>
                            <th>Verified</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.user_id}>
                                <td>{user.full_name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <span style={{...styles.badge, backgroundColor: getUserTypeColor(user.user_type)}}>
                                        {user.user_type}
                                    </span>
                                </td>
                                <td>
                                    <span style={{...styles.badge, backgroundColor: user.is_verified ? '#28a745' : '#dc3545'}}>
                                        {user.is_verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td>
                                    <span style={{...styles.badge, backgroundColor: user.is_active ? '#28a745' : '#dc3545'}}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                                        style={{...styles.actionBtn, backgroundColor: user.is_active ? '#dc3545' : '#28a745'}}
                                    >
                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const getUserTypeColor = (type) => {
    switch(type) {
        case 'admin': return '#1a1a2e';
        case 'restaurant': return '#fd7e14';
        case 'delivery': return '#17a2b8';
        default: return '#28a745';
    }
};

const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { marginBottom: '30px' },
    backBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px' },
    title: { fontSize: '28px', color: '#333' },
    searchBar: { marginBottom: '20px' },
    searchInput: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    th: { padding: '15px', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' },
    td: { padding: '12px 15px', borderBottom: '1px solid #dee2e6' },
    badge: { padding: '4px 8px', borderRadius: '20px', fontSize: '12px', color: 'white' },
    actionBtn: { padding: '6px 12px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '12px' }
};
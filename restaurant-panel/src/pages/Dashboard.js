// restaurant-panel/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, items: 0, rating: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        fetchRecentOrders();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('restaurantToken');
            const response = await axios.get(`${API_URL}/restaurant/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch stats');
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const token = localStorage.getItem('restaurantToken');
            const response = await axios.get(`${API_URL}/restaurant/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRecentOrders(response.data.data.slice(0, 5));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('restaurantToken');
        localStorage.removeItem('restaurant');
        navigate('/login');
        toast.success('Logged out');
    };

    if (loading) {
        return <div style={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🍽️ Restaurant Dashboard</h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <h3>Today's Orders</h3>
                    <p style={styles.statNumber}>{stats.orders}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Revenue</h3>
                    <p style={styles.statNumber}>₹{stats.revenue}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Menu Items</h3>
                    <p style={styles.statNumber}>{stats.items}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Rating</h3>
                    <p style={styles.statNumber}>⭐ {stats.rating}</p>
                </div>
            </div>

            <div style={styles.actions}>
                <button onClick={() => navigate('/menu')} style={styles.actionBtn}>🍔 Manage Menu</button>
                <button onClick={() => navigate('/orders')} style={styles.actionBtn}>📦 View Orders</button>
                <button onClick={() => navigate('/analytics')} style={styles.actionBtn}>📈 Analytics</button>
            </div>

            <div style={styles.recentOrders}>
                <h2>Recent Orders</h2>
                {recentOrders.length === 0 ? (
                    <p>No orders yet</p>
                ) : (
                    recentOrders.map(order => (
                        <div key={order.order_id} style={styles.orderCard}>
                            <div style={styles.orderHeader}>
                                <span><strong>#{order.order_number}</strong></span>
                                <span style={{ ...styles.status, backgroundColor: getStatusColor(order.order_status) }}>
                                    {order.order_status}
                                </span>
                            </div>
                            <p>Customer: {order.customer_name || 'Guest'}</p>
                            <p>Total: ₹{order.total_amount}</p>
                            <p>{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return '#ffc107';
        case 'confirmed': return '#17a2b8';
        case 'preparing': return '#fd7e14';
        case 'out_for_delivery': return '#6f42c1';
        case 'delivered': return '#28a745';
        default: return '#6c757d';
    }
};

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', color: '#333' },
    logoutBtn: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' },
    statNumber: { fontSize: '32px', fontWeight: 'bold', color: '#ff6b35', marginTop: '10px' },
    actions: { display: 'flex', gap: '15px', marginBottom: '30px' },
    actionBtn: { flex: 1, padding: '15px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    recentOrders: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    orderCard: { borderBottom: '1px solid #eee', padding: '15px', marginBottom: '10px' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    status: { padding: '5px 10px', borderRadius: '20px', fontSize: '12px', color: 'white' }
};
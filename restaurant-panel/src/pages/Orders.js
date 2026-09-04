// restaurant-panel/src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('restaurantToken');
            const response = await axios.get(`${API_URL}/restaurant/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('restaurantToken');
            await axios.put(`${API_URL}/restaurant/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Order ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

    if (loading) return <div style={styles.loading}>Loading orders...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>📦 Order Management</h1>
            </div>

            <div style={styles.filters}>
                <button onClick={() => setFilter('all')} style={{ ...styles.filterBtn, ...(filter === 'all' ? styles.activeFilter : {}) }}>All</button>
                <button onClick={() => setFilter('pending')} style={{ ...styles.filterBtn, ...(filter === 'pending' ? styles.activeFilter : {}) }}>Pending</button>
                <button onClick={() => setFilter('confirmed')} style={{ ...styles.filterBtn, ...(filter === 'confirmed' ? styles.activeFilter : {}) }}>Confirmed</button>
                <button onClick={() => setFilter('preparing')} style={{ ...styles.filterBtn, ...(filter === 'preparing' ? styles.activeFilter : {}) }}>Preparing</button>
                <button onClick={() => setFilter('out_for_delivery')} style={{ ...styles.filterBtn, ...(filter === 'out_for_delivery' ? styles.activeFilter : {}) }}>Out for Delivery</button>
                <button onClick={() => setFilter('delivered')} style={{ ...styles.filterBtn, ...(filter === 'delivered' ? styles.activeFilter : {}) }}>Delivered</button>
            </div>

            {filteredOrders.length === 0 ? (
                <p style={styles.noOrders}>No orders found</p>
            ) : (
                filteredOrders.map(order => (
                    <div key={order.order_id} style={styles.orderCard}>
                        <div style={styles.orderHeader}>
                            <div>
                                <h3>Order #{order.order_number}</h3>
                                <p style={styles.customerName}>Customer: {order.customer_name || 'Guest'}</p>
                            </div>
                            <span style={{ ...styles.status, backgroundColor: getStatusColor(order.order_status) }}>
                                {order.order_status}
                            </span>
                        </div>

                        <div style={styles.orderItems}>
                            <strong>Items:</strong>
                            {order.items && JSON.parse(order.items).map((item, idx) => (
                                <div key={idx} style={styles.orderItem}>
                                    {item.quantity} × {item.name} - ₹{item.price * item.quantity}
                                </div>
                            ))}
                        </div>

                        <div style={styles.orderFooter}>
                            <div>
                                <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
                                <p><strong>Ordered:</strong> {new Date(order.created_at).toLocaleString()}</p>
                                <p><strong>Total Amount:</strong> ₹{order.total_amount}</p>
                            </div>
                            <div style={styles.actions}>
                                {order.order_status === 'pending' && (
                                    <button onClick={() => updateOrderStatus(order.order_id, 'confirmed')} style={styles.confirmBtn}>Confirm Order</button>
                                )}
                                {order.order_status === 'confirmed' && (
                                    <button onClick={() => updateOrderStatus(order.order_id, 'preparing')} style={styles.prepareBtn}>Start Preparing</button>
                                )}
                                {order.order_status === 'preparing' && (
                                    <button onClick={() => updateOrderStatus(order.order_id, 'ready')} style={styles.readyBtn}>Mark Ready</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return '#ffc107';
        case 'confirmed': return '#17a2b8';
        case 'preparing': return '#fd7e14';
        case 'ready': return '#28a745';
        case 'out_for_delivery': return '#6f42c1';
        case 'delivered': return '#28a745';
        default: return '#6c757d';
    }
};

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { marginBottom: '30px' },
    backBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px' },
    title: { fontSize: '28px', color: '#333' },
    filters: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn: { padding: '8px 16px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '20px', cursor: 'pointer' },
    activeFilter: { backgroundColor: '#ff6b35', color: 'white' },
    noOrders: { textAlign: 'center', padding: '50px', color: '#666' },
    orderCard: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    customerName: { color: '#666', marginTop: '5px' },
    status: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', color: 'white' },
    orderItems: { marginBottom: '15px' },
    orderItem: { marginLeft: '15px', padding: '5px 0', color: '#555' },
    orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid #eee', paddingTop: '15px' },
    actions: { display: 'flex', gap: '10px' },
    confirmBtn: { padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    prepareBtn: { padding: '8px 16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    readyBtn: { padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};
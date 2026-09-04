// admin-panel/src/pages/DeliveryPartners.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function DeliveryPartners() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDeliveryPartners();
    }, []);

    const fetchDeliveryPartners = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const deliveryPartners = response.data.data.filter(u => u.user_type === 'delivery');
                setPartners(deliveryPartners);
            }
        } catch (error) {
            toast.error('Failed to fetch delivery partners');
        } finally {
            setLoading(false);
        }
    };

    const togglePartnerStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/admin/users/${userId}/status`, 
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Partner ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchDeliveryPartners();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div style={styles.loading}>Loading delivery partners...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>🛵 Delivery Partner Management</h1>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partners.map(partner => (
                            <tr key={partner.user_id}>
                                <td>{partner.full_name}</td>
                                <td>{partner.email}</td>
                                <td>{partner.phone}</td>
                                <td>
                                    <span style={{...styles.badge, backgroundColor: partner.is_active ? '#28a745' : '#dc3545'}}>
                                        {partner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{new Date(partner.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => togglePartnerStatus(partner.user_id, partner.is_active)}
                                        style={{...styles.actionBtn, backgroundColor: partner.is_active ? '#dc3545' : '#28a745'}}
                                    >
                                        {partner.is_active ? 'Deactivate' : 'Activate'}
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

const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { marginBottom: '30px' },
    backBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px' },
    title: { fontSize: '28px', color: '#333' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    badge: { padding: '4px 8px', borderRadius: '20px', fontSize: '12px', color: 'white' },
    actionBtn: { padding: '6px 12px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '12px' }
};
import React, { useState } from 'react';
import { Star, ShoppingBag, MoreVertical, Search, Plus } from 'lucide-react';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: 'Pizza Paradise', rating: 4.5, orders: 342, revenue: 128950, status: 'active', cuisine: 'Italian, Pizza', address: 'MG Road, Bangalore' },
    { id: 2, name: 'Burger Hub', rating: 4.3, orders: 289, revenue: 89230, status: 'active', cuisine: 'American, Burgers', address: 'Indiranagar, Bangalore' },
    { id: 3, name: 'Sushi Master', rating: 4.7, orders: 198, revenue: 145670, status: 'active', cuisine: 'Japanese, Sushi', address: 'Koramangala, Bangalore' },
    { id: 4, name: 'Taco Fiesta', rating: 4.2, orders: 167, revenue: 78450, status: 'active', cuisine: 'Mexican', address: 'Whitefield, Bangalore' },
    { id: 5, name: 'Chinese Wok', rating: 4.4, orders: 234, revenue: 98760, status: 'active', cuisine: 'Chinese, Asian', address: 'HSR Layout, Bangalore' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', background: '#f5f6fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '8px' }}>Restaurants</h1>
          <p style={{ color: '#7f8c8d' }}>Manage all partner restaurants</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <Plus size={18} />
          Add Restaurant
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '18px', color: '#2c3e50' }}>All Restaurants</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Search size={18} />
            <input type="text" placeholder="Search restaurants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '14px', width: '200px' }} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Cuisine</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Orders</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Revenue</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#7f8c8d', fontWeight: '500' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600' }}>{restaurant.name}</td>
                  <td style={{ padding: '16px 24px', color: '#7f8c8d' }}>{restaurant.cuisine}</td>
                  <td style={{ padding: '16px 24px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Star size={14} color="#ffa502" /> {restaurant.rating}</span></td>
                  <td style={{ padding: '16px 24px' }}>{restaurant.orders}</td>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2ed573' }}>₹{restaurant.revenue.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: '#e8f5e8', color: '#2ed573' }}>Active</span>
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

export default Restaurants;
// admin-panel/src/pages/Restaurants.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/restaurants`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRestaurants(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch restaurants');
        } finally {
            setLoading(false);
        }
    };

    const toggleRestaurantStatus = async (restaurantId, currentStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/admin/restaurants/${restaurantId}/status`, 
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Restaurant ${!currentStatus ? 'approved' : 'suspended'}`);
            fetchRestaurants();
        } catch (error) {
            toast.error('Failed to update restaurant status');
        }
    };

    const filteredRestaurants = restaurants.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.owner_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div style={styles.loading}>Loading restaurants...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>🏪 Restaurant Management</h1>
            </div>

            <div style={styles.searchBar}>
                <input
                    type="text"
                    placeholder="🔍 Search restaurants by name or owner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Restaurant Name</th>
                            <th>Owner</th>
                            <th>Cuisine</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRestaurants.map(restaurant => (
                            <tr key={restaurant.restaurant_id}>
                                <td><strong>{restaurant.name}</strong></td>
                                <td>{restaurant.owner_name || 'N/A'}</td>
                                <td>{restaurant.cuisine_types?.join(', ')}</td>
                                <td>⭐ {restaurant.avg_rating || 'N/A'}</td>
                                <td>
                                    <span style={{...styles.badge, backgroundColor: restaurant.is_active ? '#28a745' : '#dc3545'}}>
                                        {restaurant.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleRestaurantStatus(restaurant.restaurant_id, restaurant.is_active)}
                                        style={{...styles.actionBtn, backgroundColor: restaurant.is_active ? '#dc3545' : '#28a745'}}
                                    >
                                        {restaurant.is_active ? 'Suspend' : 'Approve'}
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
    searchBar: { marginBottom: '20px' },
    searchInput: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    badge: { padding: '4px 8px', borderRadius: '20px', fontSize: '12px', color: 'white' },
    actionBtn: { padding: '6px 12px', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '12px' }
};
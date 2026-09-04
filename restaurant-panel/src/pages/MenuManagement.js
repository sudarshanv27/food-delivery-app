// restaurant-panel/src/pages/MenuManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function MenuManagement() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: '', is_vegetarian: false });
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const token = localStorage.getItem('restaurantToken');
            const response = await axios.get(`${API_URL}/restaurant/menu`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMenu(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch menu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const token = localStorage.getItem('restaurantToken');
            await axios.post(`${API_URL}/restaurant/menu`, newItem, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Menu item added');
            setShowAddForm(false);
            setNewItem({ name: '', description: '', price: '', is_vegetarian: false });
            fetchMenu();
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('restaurantToken');
                await axios.delete(`${API_URL}/restaurant/menu/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Item deleted');
                fetchMenu();
            } catch (error) {
                toast.error('Failed to delete item');
            }
        }
    };

    if (loading) return <div style={styles.loading}>Loading menu...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>🍔 Menu Management</h1>
                <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
                    {showAddForm ? 'Cancel' : '+ Add New Item'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddItem} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Item Name *"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        style={styles.input}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        style={styles.textarea}
                    />
                    <input
                        type="number"
                        placeholder="Price *"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        style={styles.input}
                        required
                    />
                    <label style={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={newItem.is_vegetarian}
                            onChange={(e) => setNewItem({ ...newItem, is_vegetarian: e.target.checked })}
                        />
                        Vegetarian
                    </label>
                    <button type="submit" style={styles.submitBtn}>Add Item</button>
                </form>
            )}

            <div style={styles.menuGrid}>
                {menu.length === 0 ? (
                    <p>No menu items yet. Click "Add New Item" to get started.</p>
                ) : (
                    menu.map(item => (
                        <div key={item.item_id} style={styles.menuCard}>
                            <div style={styles.menuHeader}>
                                <h3>{item.name}</h3>
                                <button onClick={() => handleDeleteItem(item.item_id)} style={styles.deleteBtn}>🗑️</button>
                            </div>
                            <p style={styles.description}>{item.description || 'No description'}</p>
                            <p style={styles.price}>₹{item.price}</p>
                            <span style={{ ...styles.badge, backgroundColor: item.is_vegetarian ? '#28a745' : '#dc3545' }}>
                                {item.is_vegetarian ? '🌱 Veg' : '🍖 Non-Veg'}
                            </span>
                            <span style={{ ...styles.badge, backgroundColor: item.is_available ? '#28a745' : '#dc3545' }}>
                                {item.is_available ? 'Available' : 'Out of Stock'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    backBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    title: { fontSize: '28px', color: '#333' },
    addBtn: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    form: { background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '30px' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', minHeight: '80px', boxSizing: 'border-box' },
    checkbox: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' },
    submitBtn: { padding: '12px 24px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
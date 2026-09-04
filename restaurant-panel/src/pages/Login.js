// restaurant-panel/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });

            if (response.data.success) {
                // Check if user is a restaurant owner
                if (response.data.user.type === 'restaurant') {
                    localStorage.setItem('restaurantToken', response.data.token);
                    localStorage.setItem('restaurant', JSON.stringify(response.data.user));
                    toast.success('Login successful!');
                    navigate('/dashboard');
                } else {
                    toast.error('You are not registered as a restaurant owner');
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🍽️ Restaurant Owner Panel</h1>
                <p style={styles.subtitle}>Login to manage your restaurant</p>

                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        style={styles.input}
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '10px',
        color: '#333'
    },
    subtitle: {
        textAlign: 'center',
        color: '#666',
        marginBottom: '30px'
    },
    input: {
        width: '100%',
        padding: '14px',
        marginBottom: '20px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        fontSize: '16px',
        boxSizing: 'border-box'
    },
    button: {
        width: '100%',
        padding: '14px',
        background: '#ff6b35',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};
// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const Login = () => {

  // ================= STATES =================
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const navigate = useNavigate();

  // ================= LOGIN HANDLER =================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    try {

      // ================= DEMO LOGIN =================
      if (
        email === 'admin@foodapp.com' &&
        password === 'admin123'
      ) {

        localStorage.setItem(
          'adminToken',
          'demo-token'
        );

        localStorage.setItem(
          'adminUser',
          JSON.stringify({
            name: 'Admin User',
            email: 'admin@foodapp.com'
          })
        );

        navigate('/');

      } else {

        setError(
          'Invalid credentials. Use admin@foodapp.com / admin123'
        );

      }

    } catch (err) {

      setError('Something went wrong');

    } finally {

      setLoading(false);

    }

  };

  // ================= UI =================
  return (

    <div style={styles.container}>

      <div style={styles.card}>

        {/* ================= HEADER ================= */}
        <div style={styles.header}>

          <TrendingUp
            size={50}
            color="#ff4757"
          />

          <h1 style={styles.title}>
            FoodieDash Admin
          </h1>

          <p style={styles.subtitle}>
            Sign in to manage your food delivery platform
          </p>

        </div>

        {/* ================= ERROR ================= */}
        {error && (

          <div style={styles.errorBox}>
            {error}
          </div>

        )}

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div style={styles.inputGroup}>

            <Mail
              size={18}
              color="#777"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={styles.input}
              required
            />

          </div>

          {/* PASSWORD */}
          <div style={styles.inputGroup}>

            <Lock
              size={18}
              color="#777"
            />

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={styles.input}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              style={styles.eyeButton}
            >

              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}

            </button>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={styles.loginButton}
          >

            {loading
              ? 'Signing In...'
              : 'Sign In'}

          </button>

        </form>

        {/* ================= DEMO CREDENTIALS ================= */}
        <div style={styles.demoBox}>

          <p style={styles.demoTitle}>
            Demo Credentials
          </p>

          <p style={styles.demoText}>
            Email:
            {' '}
            admin@foodapp.com
          </p>

          <p style={styles.demoText}>
            Password:
            {' '}
            admin123
          </p>

        </div>

      </div>

    </div>

  );

};

// ================= STYLES =================
const styles = {

  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
    padding: '20px'
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 30px',
    boxShadow:
      '0 20px 40px rgba(0,0,0,0.15)'
  },

  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },

  title: {
    marginTop: '15px',
    marginBottom: '10px',
    color: '#222'
  },

  subtitle: {
    color: '#666',
    fontSize: '14px'
  },

  errorBox: {
    background: '#ffe8e8',
    color: '#ff4757',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '14px'
  },

  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '18px'
  },

  input: {
    border: 'none',
    outline: 'none',
    flex: 1,
    fontSize: '14px'
  },

  eyeButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  },

  loginButton: {
    width: '100%',
    padding: '14px',
    background: '#ff4757',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },

  demoBox: {
    marginTop: '25px',
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center'
  },

  demoTitle: {
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333'
  },

  demoText: {
    color: '#666',
    fontSize: '13px',
    margin: '4px 0'
  }

};

export default Login;
// admin-panel/src/pages/Login.js
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
                // Check if user is admin
                if (response.data.user.type === 'admin') {
                    localStorage.setItem('adminToken', response.data.token);
                    localStorage.setItem('admin', JSON.stringify(response.data.user));
                    toast.success('Welcome Admin!');
                    navigate('/dashboard');
                } else {
                    toast.error('You do not have admin access');
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
                <div style={styles.logo}>🛡️</div>
                <h1 style={styles.title}>Admin Panel</h1>
                <p style={styles.subtitle}>Login to manage your platform</p>
                
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        style={styles.input}
                        placeholder="Admin Email"
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
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '20px'
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
    },
    logo: { fontSize: '48px', marginBottom: '10px' },
    title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#333' },
    subtitle: { color: '#666', marginBottom: '30px' },
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
        background: '#1a1a2e',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};
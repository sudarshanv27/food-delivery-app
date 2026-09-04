import React, {
    useState,
} from 'react';

import {
    Link,
    useNavigate,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import API from '../services/api';

// ================= COMPONENT =================
const Login = () => {
    const navigate =
        useNavigate();

    // ================= STATES =================
    const [loading, setLoading] =
        useState(false);

    const [formData, setFormData] =
        useState({
            email: '',
            password: '',
        });

    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value,
        });
    };

    // ================= HANDLE LOGIN =================
    const handleLogin =
        async (e) => {
            e.preventDefault();

            if (
                !formData.email ||
                !formData.password
            ) {
                toast.error(
                    'Please fill all fields'
                );

                return;
            }

            try {
                setLoading(true);

                // ================= API =================
                const response =
                    await API.post(
                        '/auth/login',
                        formData
                    );

                // ================= SAVE TOKEN =================
                localStorage.setItem(
                    'token',
                    response.data.token
                );

                localStorage.setItem(
                    'user',
                    JSON.stringify(
                        response.data.user
                    )
                );

                toast.success(
                    'Login successful'
                );

                navigate('/');

            } catch (error) {
                console.error(error);

                toast.error(
                    error.response?.data
                        ?.message ||
                    'Login failed'
                );
            } finally {
                setLoading(false);
            }
        };

    // ================= RETURN =================
    return (
        <div className="auth-container">
            <form
                className="auth-card"
                onSubmit={
                    handleLogin
                }
            >
                <h1>
                    🔐 Login
                </h1>

                <p>
                    Welcome back to
                    FoodieDash
                </p>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={
                        formData.email
                    }
                    onChange={
                        handleChange
                    }
                    className="auth-input"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={
                        formData.password
                    }
                    onChange={
                        handleChange
                    }
                    className="auth-input"
                />

                <button
                    type="submit"
                    className="auth-btn"
                    disabled={loading}
                >
                    {loading
                        ? 'Logging in...'
                        : 'Login'}
                </button>

                <p
                    style={{
                        marginTop:
                            '1rem',
                    }}
                >
                    Don’t have an
                    account?{' '}
                    <Link to="/signup">
                        Signup
                    </Link>
                </p>
            </form>

            {/* ================= STYLES ================= */}
            <style>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #ff4757, #ff6b81);
                    padding: 20px;
                }

                .auth-card {
                    background: white;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    text-align: center;
                }

                .auth-card h1 {
                    margin-bottom: 10px;
                    color: #ff4757;
                }

                .auth-card p {
                    color: #666;
                }

                .auth-input {
                    width: 100%;
                    padding: 14px;
                    margin-top: 1rem;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    font-size: 15px;
                    outline: none;
                }

                .auth-btn {
                    width: 100%;
                    margin-top: 1.5rem;
                    padding: 14px;
                    border: none;
                    border-radius: 10px;
                    background: #ff4757;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                }

                .auth-btn:hover {
                    background: #ff6b81;
                }

                a {
                    color: #ff4757;
                    font-weight: bold;
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
};

export default Login;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import API from '../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ======================================================
  // IF ALREADY AUTHENTICATED, GO TO DASHBOARD
  // ======================================================

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // ======================================================
  // LOGIN
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      const message = 'Please enter your email and password.';

      setError(message);
      toast.error(message);

      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', {
        email: trimmedEmail,
        password
      });

      const data = response?.data;

      // ==================================================
      // VERIFY API RESPONSE
      // ==================================================

      if (!data?.success) {
        throw new Error(
          data?.message || 'Login failed. Please try again.'
        );
      }

      const user = data?.user;
      const token = data?.token;

      if (!token) {
        throw new Error(
          'Authentication token was not returned by the server.'
        );
      }

      if (!user) {
        throw new Error(
          'User information was not returned by the server.'
        );
      }

      // ==================================================
      // VERIFY ADMIN ACCESS
      // ==================================================

      const userType = String(
        user?.user_type || user?.type || user?.role || ''
      ).toLowerCase();

      if (userType !== 'admin') {
        const message = 'You do not have admin access.';

        // Make sure unauthorized users do not retain
        // previously stored admin authentication data.
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('admin');

        setError(message);
        toast.error(message);

        return;
      }

      // ==================================================
      // SAVE AUTHENTICATION DATA
      // ==================================================

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      // Backward compatibility with existing components.
      localStorage.setItem('admin', JSON.stringify(user));

      // ==================================================
      // SUCCESS
      // ==================================================

      toast.success('Welcome to FoodieDash Admin!');

      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('FoodieDash Admin Login Error:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed. Please check your credentials and try again.';

      setError(message);
      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="login-container">

      <div className="login-card">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="login-header">

          <div
            className="login-logo"
            aria-hidden="true"
          >
            <Shield size={42} />
          </div>

          <h1>FoodieDash Admin</h1>

          <p>
            Sign in to manage your food delivery platform
          </p>

        </div>

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div
            className="login-error"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={18} />

            <span>{error}</span>
          </div>
        )}

        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <form onSubmit={handleSubmit} noValidate>

          {/* EMAIL */}

          <div className="login-input-group">

            <Mail
              size={19}
              aria-hidden="true"
            />

            <input
              id="admin-email"
              name="email"
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              autoComplete="email"
              autoFocus
              required
              disabled={loading}
              aria-label="Admin email"
            />

          </div>

          {/* PASSWORD */}

          <div className="login-input-group">

            <Lock
              size={19}
              aria-hidden="true"
            />

            <input
              id="admin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="current-password"
              required
              disabled={loading}
              aria-label="Admin password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              disabled={loading}
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span
                  className="login-spinner"
                  aria-hidden="true"
                />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

        </form>

        {/* ==================================================
            DEVELOPMENT INFORMATION
        ================================================== */}

        <div className="login-demo">

          <strong>Administrator Access</strong>

          <p>
            Sign in using an administrator account
            configured in the FoodieDash backend.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;
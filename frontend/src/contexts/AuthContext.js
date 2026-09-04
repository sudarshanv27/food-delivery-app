import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const updateAuthHeader = useCallback((tokenValue) => {
    if (tokenValue) {
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  const handleLogoutCleanup = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    updateAuthHeader(null);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, [updateAuthHeader]);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      updateAuthHeader(storedToken);
      setToken(storedToken);

      const response = await api.get('/auth/profile');

      if (response.data && (response.data.success || response.data.data)) {
        const userData = response.data.data || response.data.user;
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          throw new Error('Invalid user data from API');
        }
      } else if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        handleLogoutCleanup();
      }
    } catch (error) {
      console.error('Auth Load Error:', error);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (e) {
          handleLogoutCleanup();
        }
      } else {
        handleLogoutCleanup();
      }
    } finally {
      setLoading(false);
    }
  }, [updateAuthHeader, handleLogoutCleanup]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setError(null);

    if (!email || !password) {
      const errorMsg = 'Please provide both email and password';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }

    try {
      const response = await api.post('/auth/login', { email, password });

      const newToken = response.data.token || response.data.data?.token;
      const userData = response.data.user || response.data.data?.user;
      const refreshToken = response.data.refresh_token || response.data.data?.refresh_token;

      if (newToken && userData) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        updateAuthHeader(newToken);
        setUser(userData);
        setToken(newToken);
        setIsAuthenticated(true);

        toast.success(`Welcome back, ${userData.full_name || userData.name || 'User'}!`);

        return { success: true, user: userData, token: newToken };
      }

      const errorMsg = response.data.message || 'Login failed';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } catch (error) {
      console.error('Login Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Invalid email or password';
      toast.error(errorMsg);
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const signup = async (userData) => {
    setError(null);

    const requiredFields = ['email', 'password', 'full_name'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }

    try {
      const response = await api.post('/auth/register', userData);

      const newToken = response.data.token || response.data.data?.token;
      const newUser = response.data.user || response.data.data?.user;
      const refreshToken = response.data.refresh_token || response.data.data?.refresh_token;

      if (newToken && newUser) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        updateAuthHeader(newToken);
        setUser(newUser);
        setToken(newToken);
        setIsAuthenticated(true);

        toast.success('Account created successfully!');

        return { success: true, user: newUser, token: newToken };
      }

      const errorMsg = response.data.message || 'Signup failed';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } catch (error) {
      console.error('Signup Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create account';
      toast.error(errorMsg);
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      handleLogoutCleanup();
    }
  };

  const updateUser = useCallback((userData) => {
    if (!userData) return;

    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token');

    if (!refreshTokenValue) {
      return false;
    }

    try {
      const response = await api.post('/auth/refresh-token', {
        refresh_token: refreshTokenValue
      });

      if (response.data.token) {
        const newToken = response.data.token;
        const newRefreshToken = response.data.refresh_token;

        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        updateAuthHeader(newToken);
        setToken(newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      handleLogoutCleanup();
      return false;
    }
  };

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === role;
  }, [user]);

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isRestaurantOwner = useCallback(() => hasRole('restaurant_owner'), [hasRole]);
  const isDeliveryPartner = useCallback(() => hasRole('delivery_partner'), [hasRole]);
  const isRegularUser = useCallback(() => user?.role === 'user' || user?.role === 'customer', [user]);

  const getUserDisplayName = useCallback(() => {
    if (!user) return '';
    return user.full_name || user.name || user.email?.split('@')[0] || 'User';
  }, [user]);

  const getUserAvatar = useCallback(() => {
    if (!user) return '/default-avatar.png';
    return user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=ff4757&color=fff`;
  }, [user, getUserDisplayName]);

  const value = {
    user,
    loading,
    isAuthenticated,
    token,
    error,
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    isAdmin,
    isRestaurantOwner,
    isDeliveryPartner,
    isRegularUser,
    getUserDisplayName,
    getUserAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('@FoodApp:token');
      const userData = await AsyncStorage.getItem('@FoodApp:user');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        await AsyncStorage.setItem('@FoodApp:token', response.data.token);
        await AsyncStorage.setItem('@FoodApp:user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      
      if (response.data.success) {
        await AsyncStorage.setItem('@FoodApp:token', response.data.token);
        await AsyncStorage.setItem('@FoodApp:user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Signup failed' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@FoodApp:token');
    await AsyncStorage.removeItem('@FoodApp:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// mobile-app/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                await AsyncStorage.setItem('token', response.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/auth/send-otp', userData);
            if (response.data.success) {
                return { success: true, email: userData.email };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            if (response.data.success) {
                await AsyncStorage.setItem('token', response.data.data.token);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
                setUser(response.data.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Verification failed' };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            login,
            signup,
            verifyOTP,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
// src/services/api.js

import axios from 'axios';

// ======================================================
// API CONFIGURATION
// ======================================================

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000/api',

  timeout: 15000,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

// ======================================================
// REQUEST INTERCEPTOR
// ======================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// RESPONSE INTERCEPTOR
// ======================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error?.response?.status;

    // ==================================================
    // UNAUTHORIZED
    // ==================================================

    if (status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('admin');

      // Prevent redirect loops.
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    // ==================================================
    // FORBIDDEN
    // ==================================================

    if (status === 403) {
      console.error(
        'FoodieDash Admin access denied:',
        error?.response?.data || error.message
      );
    }

    // ==================================================
    // SERVER ERROR
    // ==================================================

    if (status >= 500) {
      console.error(
        'FoodieDash API server error:',
        error?.response?.data || error.message
      );
    }

    // Always allow individual pages/services
    // to handle the original error.
    return Promise.reject(error);
  }
);

export default API;
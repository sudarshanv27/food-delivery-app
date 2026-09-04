// src/services/api.js

import axios from 'axios';

// ================= API INSTANCE =================
const API = axios.create({

  baseURL:
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json'
  },

  timeout: 10000

});

// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(

  (config) => {

    // Get admin token
    const token =
      localStorage.getItem('adminToken');

    // Add token if exists
    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);

// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(

  // Success response
  (response) => {

    return response;

  },

  // Error response
  (error) => {

    // Unauthorized
    if (error.response?.status === 401) {

      // Clear storage
      localStorage.removeItem('adminToken');

      localStorage.removeItem('adminUser');

      // Redirect login
      window.location.href = '/login';

    }

    // Forbidden
    if (error.response?.status === 403) {

      console.error(
        '❌ Access Denied'
      );

    }

    // Server error
    if (error.response?.status >= 500) {

      console.error(
        '❌ Server Error'
      );

    }

    return Promise.reject(error);

  }

);

// ================= HELPER METHODS =================

// GET
export const getData = async (url, params = {}) => {

  const response = await API.get(url, {
    params
  });

  return response.data;

};

// POST
export const postData = async (url, data = {}) => {

  const response = await API.post(
    url,
    data
  );

  return response.data;

};

// PUT
export const updateData = async (url, data = {}) => {

  const response = await API.put(
    url,
    data
  );

  return response.data;

};

// DELETE
export const deleteData = async (url) => {

  const response = await API.delete(url);

  return response.data;

};

// ================= EXPORT =================
export default API;
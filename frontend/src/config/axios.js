// frontend/src/config/axios.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Try to refresh token
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
                        { refreshToken }
                    );
                    
                    const { token, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('refreshToken', newRefreshToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('userRole');
                
                // Show toast message
                toast.error('Session expired. Please login again.');
                
                // Redirect to login page
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        // Handle 403 Forbidden errors
        if (error.response?.status === 403) {
            toast.error('You do not have permission to perform this action');
        }
        
        // Handle 404 Not Found errors
        if (error.response?.status === 404) {
            toast.error('Resource not found');
        }
        
        // Handle 500 Server errors
        if (error.response?.status >= 500) {
            toast.error('Server error. Please try again later.');
        }
        
        // Handle network errors
        if (error.code === 'ECONNABORTED') {
            toast.error('Request timeout. Please check your connection.');
        }
        
        if (!error.response) {
            toast.error('Network error. Please check your internet connection.');
        }
        
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
        }
        
        return Promise.reject(error);
    }
);

// Helper methods for common operations
const api = {
    // GET request
    get: (url, params = {}, config = {}) => {
        return axiosInstance.get(url, { params, ...config });
    },
    
    // POST request
    post: (url, data = {}, config = {}) => {
        return axiosInstance.post(url, data, config);
    },
    
    // PUT request
    put: (url, data = {}, config = {}) => {
        return axiosInstance.put(url, data, config);
    },
    
    // PATCH request
    patch: (url, data = {}, config = {}) => {
        return axiosInstance.patch(url, data, config);
    },
    
    // DELETE request
    delete: (url, config = {}) => {
        return axiosInstance.delete(url, config);
    },
    
    // Upload file
    upload: (url, file, onProgress = null) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axiosInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
    },
    
    // Upload multiple files
    uploadMultiple: (url, files, onProgress = null) => {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        
        return axiosInstance.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
    },
    
    // Download file
    download: async (url, filename, config = {}) => {
        const response = await axiosInstance.get(url, {
            ...config,
            responseType: 'blob',
        });
        
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    },
};

// Auth specific methods
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => api.post('/auth/verify-email', { token }),
    changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// User specific methods
export const userAPI = {
    getAll: (params) => api.get('/users', params),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
    updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
    getOrders: (id) => api.get(`/users/${id}/orders`),
    getReviews: (id) => api.get(`/users/${id}/reviews`),
};

// Restaurant specific methods
export const restaurantAPI = {
    getAll: (params) => api.get('/restaurants', params),
    getById: (id) => api.get(`/restaurants/${id}`),
    create: (data) => api.post('/restaurants', data),
    update: (id, data) => api.put(`/restaurants/${id}`, data),
    delete: (id) => api.delete(`/restaurants/${id}`),
    updateStatus: (id, status) => api.patch(`/restaurants/${id}/status`, { status }),
    getMenu: (id) => api.get(`/restaurants/${id}/menu`),
    updateMenu: (id, data) => api.put(`/restaurants/${id}/menu`, data),
    getReviews: (id) => api.get(`/restaurants/${id}/reviews`),
    getOrders: (id) => api.get(`/restaurants/${id}/orders`),
};

// Order specific methods
export const orderAPI = {
    getAll: (params) => api.get('/orders', params),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    cancel: (id) => api.post(`/orders/${id}/cancel`),
    getTracking: (id) => api.get(`/orders/${id}/tracking`),
};

// Delivery specific methods
export const deliveryAPI = {
    getAll: (params) => api.get('/deliveries', params),
    getById: (id) => api.get(`/deliveries/${id}`),
    assignPartner: (id, partnerId) => api.post(`/deliveries/${id}/assign`, { partnerId }),
    updateStatus: (id, status) => api.patch(`/deliveries/${id}/status`, { status }),
    getPartnerDeliveries: (partnerId) => api.get(`/deliveries/partner/${partnerId}`),
    getTracking: (id) => api.get(`/deliveries/${id}/tracking`),
};

// Offer specific methods
export const offerAPI = {
    getAll: (params) => api.get('/offers', params),
    getById: (id) => api.get(`/offers/${id}`),
    create: (data) => api.post('/offers', data),
    update: (id, data) => api.put(`/offers/${id}`, data),
    delete: (id) => api.delete(`/offers/${id}`),
    apply: (code) => api.post('/offers/apply', { code }),
    validate: (code) => api.get(`/offers/validate/${code}`),
};

// Payment specific methods
export const paymentAPI = {
    createOrder: (amount, currency = 'INR') => api.post('/payments/create-order', { amount, currency }),
    verifyPayment: (paymentId, orderId, signature) => api.post('/payments/verify', { paymentId, orderId, signature }),
    getPaymentMethods: () => api.get('/payments/methods'),
    addPaymentMethod: (data) => api.post('/payments/methods', data),
    deletePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
    setDefaultMethod: (id) => api.patch(`/payments/methods/${id}/default`),
    getTransactions: () => api.get('/payments/transactions'),
    refund: (transactionId, amount) => api.post('/payments/refund', { transactionId, amount }),
};

// Admin specific methods
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/stats'),
    getAnalytics: (params) => api.get('/admin/analytics', params),
    exportData: (type, format, params) => api.download(`/admin/export/${type}`, `${type}_report.${format}`, { params }),
    getSystemLogs: (params) => api.get('/admin/logs', params),
    getBackupList: () => api.get('/admin/backups'),
    createBackup: () => api.post('/admin/backups'),
    restoreBackup: (filename) => api.post(`/admin/backups/restore/${filename}`),
    deleteBackup: (filename) => api.delete(`/admin/backups/${filename}`),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data) => api.put('/admin/settings', data),
};

// Utility function to cancel requests
export const cancelRequest = (source) => {
    if (source) {
        source.cancel('Request cancelled by user');
    }
};

// Create cancel token source
export const getCancelTokenSource = () => {
    return axios.CancelToken.source();
};

export default api;
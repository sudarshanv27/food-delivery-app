// web-app/src/services/api.js

import axios from 'axios';

// ================= AXIOS INSTANCE =================
const API = axios.create({
    baseURL:
        process.env.REACT_APP_API_URL ||
        'http://localhost:5000/api',

    timeout: 15000,

    headers: {
        'Content-Type':
            'application/json',
    },
});

// ================= REQUEST INTERCEPTOR =================
API.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem(
                'token'
            );

        // ================= ADD TOKEN =================
        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) =>
        Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
    (response) => response,

    (error) => {
        // ================= HANDLE 401 =================
        if (
            error.response?.status ===
            401
        ) {
            localStorage.removeItem(
                'token'
            );

            localStorage.removeItem(
                'user'
            );

            // ================= PREVENT RELOAD LOOP =================
            if (
                window.location.pathname !==
                '/login'
            ) {
                window.location.href =
                    '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ================= RESTAURANT API =================
export const restaurantAPI = {
    getAll: () =>
        API.get('/restaurants'),

    getById: (id) =>
        API.get(
            `/restaurants/${id}`
        ),

    searchRestaurants: (
        query
    ) =>
        API.get(
            `/restaurants/search/${query}`
        ),
};

// ================= CART API =================
export const cartAPI = {
    getCart: () =>
        API.get('/cart'),

    addToCart: (data) =>
        API.post(
            '/cart/add',
            data
        ),

    updateCartItem: (
        cartId,
        data
    ) =>
        API.put(
            `/cart/${cartId}`,
            data
        ),

    removeItem: (cartId) =>
        API.delete(
            `/cart/${cartId}`
        ),

    clearCart: () =>
        API.delete('/cart'),
};

// ================= ORDER API =================
export const orderAPI = {
    createOrder: (data) =>
        API.post(
            '/orders/create',
            data
        ),

    getOrders: () =>
        API.get('/orders'),

    getOrderById: (id) =>
        API.get(`/orders/${id}`),

    updateOrderStatus: (
        id,
        data
    ) =>
        API.put(
            `/orders/${id}/status`,
            data
        ),
};

// ================= AUTH API =================
export const authAPI = {
    signup: (data) =>
        API.post(
            '/auth/signup',
            data
        ),

    login: (data) =>
        API.post(
            '/auth/login',
            data
        ),

    getProfile: () =>
        API.get('/auth/profile'),
};

// ================= PAYMENT API =================
export const paymentAPI = {
    createPaymentOrder: (
        data
    ) =>
        API.post(
            '/payment/create-order',
            data
        ),

    verifyPayment: (data) =>
        API.post(
            '/payment/verify',
            data
        ),
};

// ================= REVIEW API =================
export const reviewAPI = {
    addReview: (data) =>
        API.post(
            '/reviews',
            data
        ),

    getRestaurantReviews: (
        restaurantId
    ) =>
        API.get(
            `/reviews/${restaurantId}`
        ),
};

// ================= WALLET API =================
export const walletAPI = {
    getWallet: () =>
        API.get('/wallet'),

    addMoney: (data) =>
        API.post(
            '/wallet/add-money',
            data
        ),

    getTransactions: () =>
        API.get(
            '/wallet/transactions'
        ),
};

// ================= EXPORT =================
export default API;
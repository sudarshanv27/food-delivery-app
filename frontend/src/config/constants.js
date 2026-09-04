// frontend/src/config/constants.js

// ============================================
// API Endpoints
// ============================================
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
        CHANGE_PASSWORD: '/auth/change-password',
        PROFILE: '/auth/profile',
    },

    // User endpoints
    USERS: {
        BASE: '/users',
        GET_ALL: '/users',
        GET_BY_ID: (id) => `/users/${id}`,
        CREATE: '/users',
        UPDATE: (id) => `/users/${id}`,
        DELETE: (id) => `/users/${id}`,
        UPDATE_STATUS: (id) => `/users/${id}/status`,
        GET_ORDERS: (id) => `/users/${id}/orders`,
        GET_REVIEWS: (id) => `/users/${id}/reviews`,
        GET_WISHLIST: (id) => `/users/${id}/wishlist`,
        ADD_TO_WISHLIST: (id) => `/users/${id}/wishlist`,
        REMOVE_FROM_WISHLIST: (id, itemId) => `/users/${id}/wishlist/${itemId}`,
    },

    // Restaurant endpoints
    RESTAURANTS: {
        BASE: '/restaurants',
        GET_ALL: '/restaurants',
        GET_BY_ID: (id) => `/restaurants/${id}`,
        CREATE: '/restaurants',
        UPDATE: (id) => `/restaurants/${id}`,
        DELETE: (id) => `/restaurants/${id}`,
        UPDATE_STATUS: (id) => `/restaurants/${id}/status`,
        GET_MENU: (id) => `/restaurants/${id}/menu`,
        UPDATE_MENU: (id) => `/restaurants/${id}/menu`,
        ADD_MENU_ITEM: (id) => `/restaurants/${id}/menu`,
        UPDATE_MENU_ITEM: (id, itemId) => `/restaurants/${id}/menu/${itemId}`,
        DELETE_MENU_ITEM: (id, itemId) => `/restaurants/${id}/menu/${itemId}`,
        GET_REVIEWS: (id) => `/restaurants/${id}/reviews`,
        GET_ORDERS: (id) => `/restaurants/${id}/orders`,
        GET_ANALYTICS: (id) => `/restaurants/${id}/analytics`,
    },

    // Order endpoints
    ORDERS: {
        BASE: '/orders',
        GET_ALL: '/orders',
        GET_BY_ID: (id) => `/orders/${id}`,
        CREATE: '/orders',
        UPDATE_STATUS: (id) => `/orders/${id}/status`,
        CANCEL: (id) => `/orders/${id}/cancel`,
        GET_TRACKING: (id) => `/orders/${id}/tracking`,
        GET_INVOICE: (id) => `/orders/${id}/invoice`,
    },

    // Delivery endpoints
    DELIVERY: {
        BASE: '/deliveries',
        GET_ALL: '/deliveries',
        GET_BY_ID: (id) => `/deliveries/${id}`,
        ASSIGN_PARTNER: (id) => `/deliveries/${id}/assign`,
        UPDATE_STATUS: (id) => `/deliveries/${id}/status`,
        GET_PARTNER_DELIVERIES: (partnerId) => `/deliveries/partner/${partnerId}`,
        GET_TRACKING: (id) => `/deliveries/${id}/tracking`,
        GET_STATS: '/deliveries/stats',
    },

    // Offer endpoints
    OFFERS: {
        BASE: '/offers',
        GET_ALL: '/offers',
        GET_BY_ID: (id) => `/offers/${id}`,
        CREATE: '/offers',
        UPDATE: (id) => `/offers/${id}`,
        DELETE: (id) => `/offers/${id}`,
        APPLY: '/offers/apply',
        VALIDATE: (code) => `/offers/validate/${code}`,
        GET_ACTIVE: '/offers/active',
    },

    // Payment endpoints
    PAYMENTS: {
        CREATE_ORDER: '/payments/create-order',
        VERIFY: '/payments/verify',
        GET_METHODS: '/payments/methods',
        ADD_METHOD: '/payments/methods',
        DELETE_METHOD: (id) => `/payments/methods/${id}`,
        SET_DEFAULT_METHOD: (id) => `/payments/methods/${id}/default`,
        GET_TRANSACTIONS: '/payments/transactions',
        REFUND: '/payments/refund',
    },

    // Admin endpoints
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        STATS: '/admin/stats',
        ANALYTICS: '/admin/analytics',
        EXPORT: (type) => `/admin/export/${type}`,
        LOGS: '/admin/logs',
        BACKUPS: '/admin/backups',
        CREATE_BACKUP: '/admin/backups',
        RESTORE_BACKUP: (filename) => `/admin/backups/restore/${filename}`,
        DELETE_BACKUP: (filename) => `/admin/backups/${filename}`,
        SETTINGS: '/admin/settings',
    },
};

// ============================================
// User Roles
// ============================================
export const USER_ROLES = {
    ADMIN: 'admin',
    RESTAURANT_OWNER: 'restaurant_owner',
    DELIVERY_PARTNER: 'delivery_partner',
    USER: 'user',
};

export const USER_ROLES_CONFIG = {
    [USER_ROLES.ADMIN]: {
        label: 'Admin',
        icon: '👑',
        color: '#f44336',
        permissions: ['*'],
    },
    [USER_ROLES.RESTAURANT_OWNER]: {
        label: 'Restaurant Owner',
        icon: '🏪',
        color: '#ff9800',
        permissions: ['manage_restaurant', 'view_orders', 'manage_menu'],
    },
    [USER_ROLES.DELIVERY_PARTNER]: {
        label: 'Delivery Partner',
        icon: '🚚',
        color: '#2196f3',
        permissions: ['view_deliveries', 'update_delivery_status'],
    },
    [USER_ROLES.USER]: {
        label: 'Customer',
        icon: '👤',
        color: '#4caf50',
        permissions: ['place_orders', 'view_orders', 'write_reviews'],
    },
};

// ============================================
// Order Status
// ============================================
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};

export const ORDER_STATUS_CONFIG = {
    [ORDER_STATUS.PENDING]: {
        label: 'Pending',
        icon: '⏳',
        color: '#ff9800',
        bg: '#fff3e0',
        progress: 10,
    },
    [ORDER_STATUS.CONFIRMED]: {
        label: 'Confirmed',
        icon: '✅',
        color: '#2196f3',
        bg: '#e3f2fd',
        progress: 25,
    },
    [ORDER_STATUS.PREPARING]: {
        label: 'Preparing',
        icon: '👨‍🍳',
        color: '#9c27b0',
        bg: '#f3e5f5',
        progress: 50,
    },
    [ORDER_STATUS.OUT_FOR_DELIVERY]: {
        label: 'Out for Delivery',
        icon: '🚚',
        color: '#ff9800',
        bg: '#fff3e0',
        progress: 75,
    },
    [ORDER_STATUS.DELIVERED]: {
        label: 'Delivered',
        icon: '📦',
        color: '#4caf50',
        bg: '#e8f5e9',
        progress: 100,
    },
    [ORDER_STATUS.CANCELLED]: {
        label: 'Cancelled',
        icon: '❌',
        color: '#f44336',
        bg: '#ffebee',
        progress: 0,
    },
};

// ============================================
// Payment Methods
// ============================================
export const PAYMENT_METHODS = {
    CARD: 'card',
    UPI: 'upi',
    CASH: 'cash',
    NET_BANKING: 'net_banking',
    WALLET: 'wallet',
};

export const PAYMENT_METHODS_CONFIG = {
    [PAYMENT_METHODS.CARD]: {
        label: 'Credit/Debit Card',
        icon: '💳',
        color: '#2196f3',
    },
    [PAYMENT_METHODS.UPI]: {
        label: 'UPI',
        icon: '📱',
        color: '#4caf50',
    },
    [PAYMENT_METHODS.CASH]: {
        label: 'Cash on Delivery',
        icon: '💰',
        color: '#ff9800',
    },
    [PAYMENT_METHODS.NET_BANKING]: {
        label: 'Net Banking',
        icon: '🏦',
        color: '#9c27b0',
    },
    [PAYMENT_METHODS.WALLET]: {
        label: 'Wallet',
        icon: '👛',
        color: '#00bcd4',
    },
};

// ============================================
// Delivery Status
// ============================================
export const DELIVERY_STATUS = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

export const DELIVERY_STATUS_CONFIG = {
    [DELIVERY_STATUS.PENDING]: {
        label: 'Pending Assignment',
        icon: '⏳',
        color: '#ff9800',
    },
    [DELIVERY_STATUS.ASSIGNED]: {
        label: 'Partner Assigned',
        icon: '👤',
        color: '#2196f3',
    },
    [DELIVERY_STATUS.PICKED_UP]: {
        label: 'Picked Up',
        icon: '📦',
        color: '#9c27b0',
    },
    [DELIVERY_STATUS.IN_TRANSIT]: {
        label: 'In Transit',
        icon: '🚚',
        color: '#00bcd4',
    },
    [DELIVERY_STATUS.DELIVERED]: {
        label: 'Delivered',
        icon: '✅',
        color: '#4caf50',
    },
    [DELIVERY_STATUS.CANCELLED]: {
        label: 'Cancelled',
        icon: '❌',
        color: '#f44336',
    },
};

// ============================================
// Cuisine Types
// ============================================
export const CUISINE_TYPES = [
    'North Indian',
    'South Indian',
    'Chinese',
    'Italian',
    'Mexican',
    'Japanese',
    'Thai',
    'Mediterranean',
    'American',
    'Fast Food',
    'Seafood',
    'Desserts',
    'Beverages',
    'Healthy',
    'Vegan',
    'Gluten Free',
];

// ============================================
// Price Ranges
// ============================================
export const PRICE_RANGES = {
    LOW: { min: 0, max: 200, label: '$', name: 'Budget' },
    MEDIUM: { min: 200, max: 500, label: '$$', name: 'Moderate' },
    HIGH: { min: 500, max: 1000, label: '$$$', name: 'Expensive' },
    LUXURY: { min: 1000, max: Infinity, label: '$$$$', name: 'Luxury' },
};

// ============================================
// Local Storage Keys
// ============================================
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
    USER_ROLE: 'userRole',
    USER_PERMISSIONS: 'userPermissions',
    THEME: 'theme',
    LANGUAGE: 'language',
    CART: 'cart',
    RECENT_ORDERS: 'recentOrders',
    SEARCH_HISTORY: 'searchHistory',
    LOCATION: 'userLocation',
    NOTIFICATIONS: 'notifications',
    LAST_ACTIVITY: 'lastActivity',
};

// ============================================
// App Constants
// ============================================
export const APP_CONSTANTS = {
    APP_NAME: 'FoodDelivery',
    APP_VERSION: '2.0.0',
    DEFAULT_LOCATION: {
        lat: 19.0760,
        lng: 72.8777,
        address: 'Mumbai, Maharashtra',
    },
    DEFAULT_PRICE_RANGE: { min: 0, max: 1000 },
    DEFAULT_SORT_BY: 'rating',
    ITEMS_PER_PAGE: 10,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    CART_MAX_ITEMS: 50,
    MIN_ORDER_AMOUNT: 100,
    DELIVERY_CHARGE: 40,
    FREE_DELIVERY_AMOUNT: 500,
    GST_PERCENTAGE: 5,
    PLATFORM_FEE: 10,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    OTP_EXPIRY: 5 * 60, // 5 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60, // 15 minutes
};

// ============================================
// Regex Patterns
// ============================================
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[6-9]\d{9}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    PINCODE: /^[1-9][0-9]{5}$/,
    NAME: /^[a-zA-Z\s\-']+$/,
    GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    CARD_NUMBER: /^\d{16}$/,
    CVV: /^\d{3,4}$/,
    UPI_ID: /^[\w.-]+@[\w.-]+$/,
};

// ============================================
// Sort Options
// ============================================
export const SORT_OPTIONS = {
    RESTAURANTS: [
        { value: 'rating', label: 'Highest Rating', icon: '⭐' },
        { value: 'delivery_time', label: 'Fastest Delivery', icon: '⏱️' },
        { value: 'price_low', label: 'Price: Low to High', icon: '💰' },
        { value: 'price_high', label: 'Price: High to Low', icon: '💵' },
        { value: 'distance', label: 'Nearest First', icon: '📍' },
        { value: 'popularity', label: 'Most Popular', icon: '🔥' },
    ],
    ORDERS: [
        { value: 'recent', label: 'Most Recent', icon: '📅' },
        { value: 'oldest', label: 'Oldest First', icon: '📆' },
        { value: 'highest', label: 'Highest Amount', icon: '💰' },
        { value: 'lowest', label: 'Lowest Amount', icon: '💵' },
    ],
    REVIEWS: [
        { value: 'recent', label: 'Most Recent', icon: '📅' },
        { value: 'highest', label: 'Highest Rating', icon: '⭐' },
        { value: 'lowest', label: 'Lowest Rating', icon: '☆' },
        { value: 'helpful', label: 'Most Helpful', icon: '👍' },
    ],
};

// ============================================
// Filter Options
// ============================================
export const FILTER_OPTIONS = {
    RATING: [
        { value: 0, label: 'All Ratings' },
        { value: 4, label: '4.0 & above' },
        { value: 4.5, label: '4.5 & above' },
        { value: 4.8, label: '4.8 & above' },
    ],
    DELIVERY_TIME: [
        { value: 0, label: 'Any Time' },
        { value: 30, label: 'Under 30 mins' },
        { value: 45, label: 'Under 45 mins' },
        { value: 60, label: 'Under 60 mins' },
    ],
    DISCOUNT: [
        { value: 0, label: 'Any Discount' },
        { value: 20, label: '20% & above' },
        { value: 30, label: '30% & above' },
        { value: 40, label: '40% & above' },
        { value: 50, label: '50% & above' },
    ],
    DISTANCE: [
        { value: 5, label: 'Within 5 km' },
        { value: 10, label: 'Within 10 km' },
        { value: 15, label: 'Within 15 km' },
        { value: 25, label: 'Within 25 km' },
        { value: 50, label: 'Any Distance' },
    ],
};

// ============================================
// Notification Types
// ============================================
export const NOTIFICATION_TYPES = {
    ORDER: 'order',
    DELIVERY: 'delivery',
    OFFER: 'offer',
    PROMOTION: 'promotion',
    SYSTEM: 'system',
    PAYMENT: 'payment',
};

export const NOTIFICATION_CONFIG = {
    [NOTIFICATION_TYPES.ORDER]: { icon: '📦', color: '#2196f3' },
    [NOTIFICATION_TYPES.DELIVERY]: { icon: '🚚', color: '#ff9800' },
    [NOTIFICATION_TYPES.OFFER]: { icon: '🎉', color: '#4caf50' },
    [NOTIFICATION_TYPES.PROMOTION]: { icon: '🏪', color: '#9c27b0' },
    [NOTIFICATION_TYPES.SYSTEM]: { icon: '⚙️', color: '#607d8b' },
    [NOTIFICATION_TYPES.PAYMENT]: { icon: '💰', color: '#00bcd4' },
};

// ============================================
// Theme Configuration
// ============================================
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
};

export const THEME_CONFIG = {
    [THEMES.LIGHT]: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#2c3e50',
        textSecondary: '#7f8c8d',
        border: '#e0e0e0',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800',
        info: '#2196f3',
    },
    [THEMES.DARK]: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#333333',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800',
        info: '#2196f3',
    },
};

// ============================================
// Language Configuration
// ============================================
export const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸', rtl: false },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', rtl: false },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩', rtl: false },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳', rtl: false },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', rtl: false },
];

// ============================================
// Error Messages
// ============================================
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your internet connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please login again.',
    CONNECTION_TIMEOUT: 'Connection timeout. Please try again.',
    FILE_TOO_LARGE: 'File size exceeds the limit.',
    INVALID_FILE_TYPE: 'Invalid file type.',
};

// ============================================
// Success Messages
// ============================================
export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful! Redirecting...',
    LOGOUT: 'Logout successful!',
    REGISTER: 'Account created successfully! Please verify your email.',
    PROFILE_UPDATE: 'Profile updated successfully!',
    PASSWORD_CHANGE: 'Password changed successfully!',
    ORDER_PLACED: 'Order placed successfully!',
    ORDER_CANCELLED: 'Order cancelled successfully!',
    REVIEW_SUBMITTED: 'Review submitted successfully!',
    PAYMENT_SUCCESS: 'Payment successful!',
    OFFER_APPLIED: 'Offer applied successfully!',
    ADDRESS_ADDED: 'Address added successfully!',
    ADDRESS_UPDATED: 'Address updated successfully!',
    ADDRESS_DELETED: 'Address deleted successfully!',
    CARD_ADDED: 'Card added successfully!',
    CARD_DELETED: 'Card deleted successfully!',
};

// ============================================
// Route Paths
// ============================================
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    RESTAURANTS: '/restaurants',
    RESTAURANT_DETAILS: (id) => `/restaurants/${id}`,
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAILS: (id) => `/orders/${id}`,
    PROFILE: '/profile',
    PROFILE_EDIT: '/profile/edit',
    ADDRESS_BOOK: '/profile/addresses',
    PAYMENT_METHODS: '/profile/payments',
    WISHLIST: '/profile/wishlist',
    REVIEWS: '/profile/reviews',
    NOTIFICATIONS: '/profile/notifications',
    ADMIN: '/admin',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_RESTAURANTS: '/admin/restaurants',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_DELIVERIES: '/admin/deliveries',
    ADMIN_OFFERS: '/admin/offers',
    ADMIN_ANALYTICS: '/admin/analytics',
    ADMIN_REPORTS: '/admin/reports',
    ADMIN_SETTINGS: '/admin/settings',
};

// ============================================
// Helper Functions
// ============================================
export const getStatusConfig = (status, configMap) => {
    return configMap[status] || { label: status, icon: '📦', color: '#95a5a6', bg: '#ecf0f1' };
};

export const getPaymentMethodConfig = (method) => {
    return PAYMENT_METHODS_CONFIG[method] || { label: method, icon: '💳', color: '#95a5a6' };
};

export const getUserRoleConfig = (role) => {
    return USER_ROLES_CONFIG[role] || USER_ROLES_CONFIG[USER_ROLES.USER];
};

export const getOrderStatusConfig = (status) => {
    return getStatusConfig(status, ORDER_STATUS_CONFIG);
};

export const getDeliveryStatusConfig = (status) => {
    return getStatusConfig(status, DELIVERY_STATUS_CONFIG);
};

// Default export
export default {
    API_ENDPOINTS,
    USER_ROLES,
    USER_ROLES_CONFIG,
    ORDER_STATUS,
    ORDER_STATUS_CONFIG,
    PAYMENT_METHODS,
    PAYMENT_METHODS_CONFIG,
    DELIVERY_STATUS,
    DELIVERY_STATUS_CONFIG,
    CUISINE_TYPES,
    PRICE_RANGES,
    STORAGE_KEYS,
    APP_CONSTANTS,
    REGEX_PATTERNS,
    SORT_OPTIONS,
    FILTER_OPTIONS,
    NOTIFICATION_TYPES,
    NOTIFICATION_CONFIG,
    THEMES,
    THEME_CONFIG,
    LANGUAGES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    getStatusConfig,
    getPaymentMethodConfig,
    getUserRoleConfig,
    getOrderStatusConfig,
    getDeliveryStatusConfig,
};
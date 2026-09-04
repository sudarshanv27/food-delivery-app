// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
        PROFILE: '/auth/profile',
    },
    USER: {
        PROFILE: '/user/profile',
        ADDRESSES: '/user/addresses',
        PAYMENT_METHODS: '/user/payment-methods',
        NOTIFICATIONS: '/user/notifications',
        PREFERENCES: '/user/preferences',
    },
    RESTAURANT: {
        LIST: '/restaurants',
        DETAIL: '/restaurants/:id',
        MENU: '/restaurants/:id/menu',
        SEARCH: '/restaurants/search',
        CATEGORIES: '/restaurants/categories',
        FAVORITES: '/restaurants/favorites',
        REVIEWS: '/restaurants/:id/reviews',
    },
    CART: {
        GET: '/cart',
        ADD: '/cart/add',
        UPDATE: '/cart/:id',
        REMOVE: '/cart/:id',
        CLEAR: '/cart',
        COUPON: '/cart/coupon',
    },
    ORDER: {
        LIST: '/orders',
        DETAIL: '/orders/:id',
        CREATE: '/orders',
        CANCEL: '/orders/:id/cancel',
        REORDER: '/orders/:id/reorder',
        TRACK: '/orders/:id/track',
        RATE: '/orders/:id/rate',
        INVOICE: '/orders/:id/invoice',
    },
    PAYMENT: {
        CREATE_INTENT: '/payments/create-intent',
        VERIFY: '/payments/verify',
        METHODS: '/payments/methods',
        TRANSACTIONS: '/payments/transactions',
        COUPONS: '/payments/coupons',
    },
    DELIVERY: {
        MY_DELIVERIES: '/delivery/my-deliveries',
        ACCEPT: '/delivery/:id/accept',
        PICKUP: '/delivery/:id/pickup',
        COMPLETE: '/delivery/:id/complete',
        UPDATE_LOCATION: '/delivery/update-location',
        EARNINGS: '/delivery/earnings',
        WITHDRAW: '/delivery/withdraw',
    },
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        RESTAURANTS: '/admin/restaurants',
        ORDERS: '/admin/orders',
        DELIVERY: '/admin/delivery',
        REPORTS: '/admin/reports',
        SETTINGS: '/admin/settings',
    },
};

// Order statuses
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    PICKED_UP: 'picked_up',
    ON_THE_WAY: 'on_the_way',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.CONFIRMED]: 'Confirmed',
    [ORDER_STATUS.PREPARING]: 'Preparing',
    [ORDER_STATUS.READY]: 'Ready',
    [ORDER_STATUS.PICKED_UP]: 'Picked Up',
    [ORDER_STATUS.ON_THE_WAY]: 'On The Way',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

export const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: '#ff9800',
    [ORDER_STATUS.CONFIRMED]: '#2196f3',
    [ORDER_STATUS.PREPARING]: '#9c27b0',
    [ORDER_STATUS.READY]: '#ff4757',
    [ORDER_STATUS.PICKED_UP]: '#ff4757',
    [ORDER_STATUS.ON_THE_WAY]: '#ff4757',
    [ORDER_STATUS.DELIVERED]: '#4caf50',
    [ORDER_STATUS.CANCELLED]: '#f44336',
};

// Payment methods
export const PAYMENT_METHODS = {
    CARD: 'card',
    UPI: 'upi',
    NETBANKING: 'netbanking',
    COD: 'cod',
};

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.CARD]: 'Credit/Debit Card',
    [PAYMENT_METHODS.UPI]: 'UPI',
    [PAYMENT_METHODS.NETBANKING]: 'Net Banking',
    [PAYMENT_METHODS.COD]: 'Cash on Delivery',
};

// User roles
export const USER_ROLES = {
    USER: 'user',
    RESTAURANT_OWNER: 'restaurant_owner',
    DELIVERY_PARTNER: 'delivery_partner',
    ADMIN: 'admin',
};

export const USER_ROLE_LABELS = {
    [USER_ROLES.USER]: 'Customer',
    [USER_ROLES.RESTAURANT_OWNER]: 'Restaurant Owner',
    [USER_ROLES.DELIVERY_PARTNER]: 'Delivery Partner',
    [USER_ROLES.ADMIN]: 'Administrator',
};

// Delivery partner statuses
export const DELIVERY_STATUS = {
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked_up',
    DELIVERED: 'delivered',
};

// Restaurant statuses
export const RESTAURANT_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [10, 25, 50, 100],
};

// Date formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_TIME: 'MMM DD, YYYY hh:mm A',
    API: 'YYYY-MM-DD',
    API_TIME: 'YYYY-MM-DD HH:mm:ss',
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    CART: 'cart',
    SAVED_FOR_LATER: 'savedForLater',
    THEME: 'theme',
    PREFERENCES: 'preferences',
    RECENT_SEARCHES: 'recentSearches',
    ADDRESSES: 'addresses',
};

// Socket events
export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    JOIN_ORDER_ROOM: 'join-order-room',
    LEAVE_ORDER_ROOM: 'leave-order-room',
    ORDER_UPDATE: 'order-update',
    NEW_ORDER: 'new-order',
    DELIVERY_ASSIGNED: 'delivery-assigned',
    DRIVER_LOCATION: 'driver-location',
    UPDATE_LOCATION: 'update-location',
    NOTIFICATION: 'notification',
};

// Price constants
export const PRICE_CONSTANTS = {
    TAX_RATE: 0.05, // 5% GST
    DELIVERY_FEE: 40,
    FREE_DELIVERY_THRESHOLD: 500,
    PACKAGING_FEE: 10,
};

// Rating constants
export const RATING = {
    MAX: 5,
    MIN: 1,
    DEFAULT: 0,
};

// File upload limits
export const FILE_UPLOAD = {
    MAX_SIZE_MB: 5,
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    MAX_IMAGES: 5,
};

// Timer constants (milliseconds)
export const TIMERS = {
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 500,
    REFRESH_INTERVAL: 30000,
    SESSION_TIMEOUT: 3600000, // 1 hour
};

// Map settings
export const MAP = {
    DEFAULT_CENTER: { lat: 28.6139, lng: 77.2090 }, // Delhi
    DEFAULT_ZOOM: 12,
    DELIVERY_ZOOM: 14,
};

export default {
    API_ENDPOINTS,
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS,
    PAYMENT_METHODS,
    PAYMENT_METHOD_LABELS,
    USER_ROLES,
    USER_ROLE_LABELS,
    DELIVERY_STATUS,
    RESTAURANT_STATUS,
    PAGINATION,
    DATE_FORMATS,
    STORAGE_KEYS,
    SOCKET_EVENTS,
    PRICE_CONSTANTS,
    RATING,
    FILE_UPLOAD,
    TIMERS,
    MAP,
};
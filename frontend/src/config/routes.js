// frontend/src/config/routes.js

// Route paths as constants to avoid typos
export const ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    PRODUCTS: '/products',
    PRODUCT_DETAILS: '/products/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    NOT_FOUND: '/404',
    ADMIN: {
        ROOT: '/admin',
        USERS: '/admin/users',
        PRODUCTS: '/admin/products',
        ORDERS: '/admin/orders',
        SETTINGS: '/admin/settings',
    }
};

// Route configuration with metadata
export const routeConfig = [
    {
        path: ROUTES.HOME,
        exact: true,
        component: 'Home',
        title: 'Home',
        requiresAuth: false,
        layout: 'default',
    },
    {
        path: ROUTES.ABOUT,
        exact: true,
        component: 'About',
        title: 'About Us',
        requiresAuth: false,
        layout: 'default',
    },
    {
        path: ROUTES.CONTACT,
        exact: true,
        component: 'Contact',
        title: 'Contact Us',
        requiresAuth: false,
        layout: 'default',
    },
    {
        path: ROUTES.LOGIN,
        exact: true,
        component: 'Login',
        title: 'Login',
        requiresAuth: false,
        layout: 'auth',
        redirectIfAuthenticated: ROUTES.DASHBOARD,
    },
    {
        path: ROUTES.REGISTER,
        exact: true,
        component: 'Register',
        title: 'Register',
        requiresAuth: false,
        layout: 'auth',
        redirectIfAuthenticated: ROUTES.DASHBOARD,
    },
    {
        path: ROUTES.DASHBOARD,
        exact: true,
        component: 'Dashboard',
        title: 'Dashboard',
        requiresAuth: true,
        layout: 'dashboard',
        roles: ['user', 'admin'],
    },
    {
        path: ROUTES.PROFILE,
        exact: true,
        component: 'Profile',
        title: 'Profile',
        requiresAuth: true,
        layout: 'dashboard',
    },
    {
        path: ROUTES.SETTINGS,
        exact: true,
        component: 'Settings',
        title: 'Settings',
        requiresAuth: true,
        layout: 'dashboard',
    },
    {
        path: ROUTES.PRODUCTS,
        exact: true,
        component: 'ProductList',
        title: 'Products',
        requiresAuth: false,
        layout: 'default',
    },
    {
        path: ROUTES.PRODUCT_DETAILS,
        exact: true,
        component: 'ProductDetails',
        title: 'Product Details',
        requiresAuth: false,
        layout: 'default',
    },
    {
        path: ROUTES.CART,
        exact: true,
        component: 'Cart',
        title: 'Shopping Cart',
        requiresAuth: false,
        layout: 'default',
    },
    {
        path: ROUTES.CHECKOUT,
        exact: true,
        component: 'Checkout',
        title: 'Checkout',
        requiresAuth: true,
        layout: 'checkout',
    },
    {
        path: ROUTES.ADMIN.ROOT,
        exact: true,
        component: 'AdminDashboard',
        title: 'Admin Dashboard',
        requiresAuth: true,
        layout: 'admin',
        roles: ['admin'],
    },
    {
        path: ROUTES.ADMIN.USERS,
        exact: true,
        component: 'AdminUsers',
        title: 'Manage Users',
        requiresAuth: true,
        layout: 'admin',
        roles: ['admin'],
    },
    {
        path: ROUTES.ADMIN.PRODUCTS,
        exact: true,
        component: 'AdminProducts',
        title: 'Manage Products',
        requiresAuth: true,
        layout: 'admin',
        roles: ['admin'],
    },
    {
        path: ROUTES.NOT_FOUND,
        exact: true,
        component: 'NotFound',
        title: '404 - Page Not Found',
        requiresAuth: false,
        layout: 'default',
    },
];

// Helper function to get route by path
export const getRouteByPath = (path) => {
    return routeConfig.find(route => route.path === path);
};

// Helper function to generate dynamic routes
export const generateDynamicRoute = (basePath, params) => {
    let route = basePath;
    Object.keys(params).forEach(key => {
        route = route.replace(`:${key}`, params[key]);
    });
    return route;
};

// API endpoints (optional, can be separated)
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH_TOKEN: '/api/auth/refresh',
    },
    USER: {
        PROFILE: '/api/user/profile',
        UPDATE_PROFILE: '/api/user/profile',
        CHANGE_PASSWORD: '/api/user/change-password',
    },
    PRODUCTS: {
        LIST: '/api/products',
        DETAILS: '/api/products/:id',
        CREATE: '/api/products',
        UPDATE: '/api/products/:id',
        DELETE: '/api/products/:id',
    },
    CART: {
        GET: '/api/cart',
        ADD: '/api/cart/add',
        UPDATE: '/api/cart/update',
        REMOVE: '/api/cart/remove',
        CLEAR: '/api/cart/clear',
    },
    ORDERS: {
        LIST: '/api/orders',
        CREATE: '/api/orders',
        DETAILS: '/api/orders/:id',
        UPDATE_STATUS: '/api/orders/:id/status',
    },
};

// Navigation menu configuration
export const navigationMenu = [
    {
        name: 'Home',
        path: ROUTES.HOME,
        icon: 'HomeIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: true,
    },
    {
        name: 'Products',
        path: ROUTES.PRODUCTS,
        icon: 'ProductsIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: true,
    },
    {
        name: 'Dashboard',
        path: ROUTES.DASHBOARD,
        icon: 'DashboardIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: false,
        roles: ['user', 'admin'],
    },
    {
        name: 'Admin',
        path: ROUTES.ADMIN.ROOT,
        icon: 'AdminIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: false,
        roles: ['admin'],
    },
    {
        name: 'Cart',
        path: ROUTES.CART,
        icon: 'CartIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: true,
    },
    {
        name: 'Login',
        path: ROUTES.LOGIN,
        icon: 'LoginIcon',
        showWhenAuthenticated: false,
        showWhenUnauthenticated: true,
    },
    {
        name: 'Register',
        path: ROUTES.REGISTER,
        icon: 'RegisterIcon',
        showWhenAuthenticated: false,
        showWhenUnauthenticated: true,
    },
    {
        name: 'Profile',
        path: ROUTES.PROFILE,
        icon: 'ProfileIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: false,
    },
    {
        name: 'Settings',
        path: ROUTES.SETTINGS,
        icon: 'SettingsIcon',
        showWhenAuthenticated: true,
        showWhenUnauthenticated: false,
    },
];

// Breadcrumb configuration
export const breadcrumbConfig = {
    [ROUTES.HOME]: ['Home'],
    [ROUTES.ABOUT]: ['Home', 'About'],
    [ROUTES.CONTACT]: ['Home', 'Contact'],
    [ROUTES.PRODUCTS]: ['Home', 'Products'],
    [ROUTES.PRODUCT_DETAILS]: ['Home', 'Products', 'Product Details'],
    [ROUTES.DASHBOARD]: ['Home', 'Dashboard'],
    [ROUTES.PROFILE]: ['Home', 'Dashboard', 'Profile'],
    [ROUTES.ADMIN.ROOT]: ['Home', 'Admin'],
    [ROUTES.ADMIN.USERS]: ['Home', 'Admin', 'Users'],
};

// Default export for easy importing
export default {
    ROUTES,
    routeConfig,
    navigationMenu,
    breadcrumbConfig,
    API_ENDPOINTS,
    getRouteByPath,
    generateDynamicRoute,
};
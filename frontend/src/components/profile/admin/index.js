// src/components/profile/admin/index.js

// ============================================
// Component Imports
// ============================================
import AdminDashboard from './AdminDashboard';
import AdminUserManagement from './AdminUserManagement';
import AdminRestaurantManagement from './AdminRestaurantManagement';
import AdminOrderManagement from './AdminOrderManagement';
import AdminDeliveryManagement from './AdminDeliveryManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';
import AdminOffersManagement from './AdminOffersManagement';
import AdminSupport from './AdminSupport';
import AdminLogs from './AdminLogs';
import AdminBackup from './AdminBackup';

// Layout Components
import AdminLayout from './AdminLayout';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ProtectedAdminRoute, {
    AdminContext,
    useAdminContext,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    adminLogout,
    withAdminProtection
} from './ProtectedAdminRoute';

// ============================================
// Primary Exports
// ============================================
export {
    // Main Components
    AdminDashboard,
    AdminUserManagement,
    AdminRestaurantManagement,
    AdminOrderManagement,
    AdminDeliveryManagement,
    AdminAnalytics,
    AdminReports,
    AdminSettings,
    AdminOffersManagement,
    AdminSupport,
    AdminLogs,
    AdminBackup,

    // Layout Components
    AdminLayout,
    AdminSidebar,
    AdminHeader,

    // Route Protection
    ProtectedAdminRoute,
    AdminContext,
    useAdminContext,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    adminLogout,
    withAdminProtection,
};

// ============================================
// Convenience Aliases
// ============================================
export {
    AdminDashboard as Dashboard,
    AdminUserManagement as UserManagement,
    AdminRestaurantManagement as RestaurantManagement,
    AdminOrderManagement as OrderManagement,
    AdminDeliveryManagement as DeliveryManagement,
    AdminAnalytics as Analytics,
    AdminReports as Reports,
    AdminSettings as Settings,
    AdminOffersManagement as OffersManagement,
    AdminSupport as Support,
    AdminLogs as Logs,
    AdminBackup as Backup,
    AdminLayout as Layout,
    AdminSidebar as Sidebar,
    AdminHeader as Header,
};

// ============================================
// Admin Configuration
// ============================================

// Navigation Menu Configuration
export const ADMIN_NAVIGATION = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        path: '/admin',
        component: 'AdminDashboard',
        permissions: ['view_dashboard'],
        exact: true
    },
    {
        id: 'users',
        label: 'User Management',
        icon: '👥',
        path: '/admin/users',
        component: 'AdminUserManagement',
        permissions: ['manage_users'],
        children: [
            { label: 'All Users', path: '/admin/users', icon: '👤' },
            { label: 'Customers', path: '/admin/users/customers', icon: '🛍️' },
            { label: 'Restaurant Owners', path: '/admin/users/owners', icon: '🏪' },
            { label: 'Delivery Partners', path: '/admin/users/drivers', icon: '🚚' },
            { label: 'Support Staff', path: '/admin/users/staff', icon: '🎧' }
        ]
    },
    {
        id: 'restaurants',
        label: 'Restaurants',
        icon: '🏪',
        path: '/admin/restaurants',
        component: 'AdminRestaurantManagement',
        permissions: ['manage_restaurants'],
        children: [
            { label: 'All Restaurants', path: '/admin/restaurants', icon: '🏪' },
            { label: 'Pending Approval', path: '/admin/restaurants/pending', icon: '⏳' },
            { label: 'Verified', path: '/admin/restaurants/verified', icon: '✅' },
            { label: 'Categories', path: '/admin/restaurants/categories', icon: '📁' }
        ]
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: '📦',
        path: '/admin/orders',
        component: 'AdminOrderManagement',
        permissions: ['manage_orders'],
        children: [
            { label: 'All Orders', path: '/admin/orders', icon: '📋' },
            { label: 'Pending', path: '/admin/orders/pending', icon: '⏳' },
            { label: 'Processing', path: '/admin/orders/processing', icon: '⚙️' },
            { label: 'Completed', path: '/admin/orders/completed', icon: '✅' },
            { label: 'Cancelled', path: '/admin/orders/cancelled', icon: '❌' }
        ]
    },
    {
        id: 'delivery',
        label: 'Delivery Management',
        icon: '🚚',
        path: '/admin/delivery',
        component: 'AdminDeliveryManagement',
        permissions: ['manage_delivery'],
        children: [
            { label: 'Active Deliveries', path: '/admin/delivery/active', icon: '🚚' },
            { label: 'Delivery Partners', path: '/admin/delivery/partners', icon: '👥' },
            { label: 'Tracking', path: '/admin/delivery/tracking', icon: '📍' },
            { label: 'Performance', path: '/admin/delivery/performance', icon: '📈' }
        ]
    },
    {
        id: 'offers',
        label: 'Offers & Promotions',
        icon: '🎫',
        path: '/admin/offers',
        component: 'AdminOffersManagement',
        permissions: ['manage_offers'],
        children: [
            { label: 'All Offers', path: '/admin/offers', icon: '🎫' },
            { label: 'Active Offers', path: '/admin/offers/active', icon: '✅' },
            { label: 'Expired', path: '/admin/offers/expired', icon: '⏰' },
            { label: 'Create Offer', path: '/admin/offers/create', icon: '➕' }
        ]
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: '📈',
        path: '/admin/analytics',
        component: 'AdminAnalytics',
        permissions: ['view_analytics'],
        children: [
            { label: 'Overview', path: '/admin/analytics', icon: '📊' },
            { label: 'Sales Reports', path: '/admin/analytics/sales', icon: '💰' },
            { label: 'User Insights', path: '/admin/analytics/users', icon: '👥' },
            { label: 'Performance', path: '/admin/analytics/performance', icon: '🎯' }
        ]
    },
    {
        id: 'reports',
        label: 'Reports',
        icon: '📑',
        path: '/admin/reports',
        component: 'AdminReports',
        permissions: ['view_reports'],
        children: [
            { label: 'Generate Reports', path: '/admin/reports', icon: '📊' },
            { label: 'Saved Reports', path: '/admin/reports/saved', icon: '💾' },
            { label: 'Scheduled Reports', path: '/admin/reports/scheduled', icon: '⏰' }
        ]
    },
    {
        id: 'support',
        label: 'Support',
        icon: '🎧',
        path: '/admin/support',
        component: 'AdminSupport',
        permissions: ['manage_support'],
        children: [
            { label: 'Tickets', path: '/admin/support/tickets', icon: '🎫' },
            { label: 'Live Chat', path: '/admin/support/chat', icon: '💬' },
            { label: 'FAQs', path: '/admin/support/faqs', icon: '❓' },
            { label: 'Feedback', path: '/admin/support/feedback', icon: '💭' }
        ]
    },
    {
        id: 'logs',
        label: 'System Logs',
        icon: '📋',
        path: '/admin/logs',
        component: 'AdminLogs',
        permissions: ['view_logs'],
        children: [
            { label: 'Activity Logs', path: '/admin/logs/activity', icon: '📜' },
            { label: 'Error Logs', path: '/admin/logs/errors', icon: '⚠️' },
            { label: 'Audit Trail', path: '/admin/logs/audit', icon: '🔍' }
        ]
    },
    {
        id: 'backup',
        label: 'Backup',
        icon: '💾',
        path: '/admin/backup',
        component: 'AdminBackup',
        permissions: ['manage_backup'],
        children: [
            { label: 'Database Backup', path: '/admin/backup/database', icon: '🗄️' },
            { label: 'File Backup', path: '/admin/backup/files', icon: '📁' },
            { label: 'Restore', path: '/admin/backup/restore', icon: '🔄' }
        ]
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        path: '/admin/settings',
        component: 'AdminSettings',
        permissions: ['manage_settings'],
        children: [
            { label: 'General', path: '/admin/settings/general', icon: '🔧' },
            { label: 'Security', path: '/admin/settings/security', icon: '🔒' },
            { label: 'Notifications', path: '/admin/settings/notifications', icon: '🔔' },
            { label: 'Integrations', path: '/admin/settings/integrations', icon: '🔌' }
        ]
    }
];

// Admin roles configuration
export const ADMIN_ROLES = {
    SUPER_ADMIN: {
        name: 'Super Admin',
        level: 1,
        permissions: ['*'],
        color: '#F44336',
        icon: '👑'
    },
    ADMIN: {
        name: 'Admin',
        level: 2,
        permissions: [
            'view_dashboard', 'manage_users', 'manage_restaurants', 'manage_orders',
            'manage_delivery', 'manage_offers', 'view_analytics', 'view_reports',
            'manage_support', 'view_logs', 'manage_settings'
        ],
        color: '#2196F3',
        icon: '👤'
    },
    MODERATOR: {
        name: 'Moderator',
        level: 3,
        permissions: [
            'view_dashboard', 'view_users', 'manage_orders', 'manage_delivery',
            'view_restaurants', 'manage_support'
        ],
        color: '#4CAF50',
        icon: '🛡️'
    },
    SUPPORT: {
        name: 'Support Staff',
        level: 4,
        permissions: ['view_orders', 'view_users', 'manage_support'],
        color: '#FF9800',
        icon: '🎧'
    }
};

// Component registry for dynamic loading
export const componentRegistry = {
    AdminDashboard,
    AdminUserManagement,
    AdminRestaurantManagement,
    AdminOrderManagement,
    AdminDeliveryManagement,
    AdminAnalytics,
    AdminReports,
    AdminSettings,
    AdminOffersManagement,
    AdminSupport,
    AdminLogs,
    AdminBackup,
    AdminLayout,
    AdminSidebar,
    AdminHeader
};

// Get component by name
export const getAdminComponent = (componentName) => {
    return componentRegistry[componentName] || AdminDashboard;
};

// Get navigation by permissions
export const getFilteredNavigation = (userPermissions) => {
    if (userPermissions.includes('*')) {
        return ADMIN_NAVIGATION;
    }

    return ADMIN_NAVIGATION.filter(item => {
        if (!item.permissions) return true;
        return item.permissions.some(permission => userPermissions.includes(permission));
    });
};

// Get breadcrumbs for current path
export const getBreadcrumbs = (pathname) => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    let currentPath = '';

    for (const path of paths) {
        currentPath += `/${path}`;
        const navItem = ADMIN_NAVIGATION.find(item => item.path === currentPath);
        if (navItem) {
            breadcrumbs.push({
                label: navItem.label,
                path: currentPath,
                icon: navItem.icon
            });
        } else {
            // Check children
            for (const item of ADMIN_NAVIGATION) {
                if (item.children) {
                    const child = item.children.find(c => c.path === currentPath);
                    if (child) {
                        breadcrumbs.push({
                            label: child.label,
                            path: currentPath,
                            icon: child.icon
                        });
                        break;
                    }
                }
            }
        }
    }

    return breadcrumbs;
};

// ============================================
// Utility Functions
// ============================================

// Format admin date
export const formatAdminDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Format admin currency
export const formatAdminCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Format admin number
export const formatAdminNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// Get status color
export const getStatusColor = (status) => {
    const colors = {
        active: '#4CAF50',
        inactive: '#F44336',
        pending: '#FF9800',
        approved: '#4CAF50',
        rejected: '#F44336',
        completed: '#4CAF50',
        cancelled: '#F44336',
        delivered: '#4CAF50',
        processing: '#2196F3'
    };
    return colors[status] || '#9E9E9E';
};

// Get status badge
export const getStatusBadge = (status, label) => {
    const color = getStatusColor(status);
    return {
        style: { background: color + '20', color: color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
        label: label || status.charAt(0).toUpperCase() + status.slice(1)
    };
};

// ============================================
// Local Storage Helpers
// ============================================

// Save admin preferences
export const saveAdminPreference = (key, value) => {
    try {
        const preferences = JSON.parse(localStorage.getItem('admin_preferences') || '{}');
        preferences[key] = value;
        localStorage.setItem('admin_preferences', JSON.stringify(preferences));
    } catch (error) {
        console.error('Error saving admin preference:', error);
    }
};

// Get admin preference
export const getAdminPreference = (key, defaultValue = null) => {
    try {
        const preferences = JSON.parse(localStorage.getItem('admin_preferences') || '{}');
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

// Clear admin data on logout
export const clearAdminData = () => {
    const itemsToKeep = ['theme', 'language'];
    const preferences = JSON.parse(localStorage.getItem('admin_preferences') || '{}');
    const keptPreferences = {};

    itemsToKeep.forEach(item => {
        if (preferences[item] !== undefined) {
            keptPreferences[item] = preferences[item];
        }
    });

    localStorage.clear();
    localStorage.setItem('admin_preferences', JSON.stringify(keptPreferences));
};

// ============================================
// Default Export
// ============================================
const AdminComponents = {
    // Components
    Dashboard: AdminDashboard,
    UserManagement: AdminUserManagement,
    RestaurantManagement: AdminRestaurantManagement,
    OrderManagement: AdminOrderManagement,
    DeliveryManagement: AdminDeliveryManagement,
    Analytics: AdminAnalytics,
    Reports: AdminReports,
    Settings: AdminSettings,
    OffersManagement: AdminOffersManagement,
    Support: AdminSupport,
    Logs: AdminLogs,
    Backup: AdminBackup,
    Layout: AdminLayout,
    Sidebar: AdminSidebar,
    Header: AdminHeader,

    // Route Protection
    ProtectedAdminRoute,
    AdminContext,
    useAdminContext,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    adminLogout,
    withAdminProtection,

    // Configurations
    ADMIN_NAVIGATION,
    ADMIN_ROLES,
    componentRegistry,
    getAdminComponent,
    getFilteredNavigation,
    getBreadcrumbs,

    // Utilities
    formatAdminDate,
    formatAdminCurrency,
    formatAdminNumber,
    getStatusColor,
    getStatusBadge,
    saveAdminPreference,
    getAdminPreference,
    clearAdminData
};

export default AdminComponents;
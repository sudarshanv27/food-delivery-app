// src/components/profile/index.js

// ============================================
// Component Imports
// ============================================
import UserProfileInfo from './UserProfileInfo';
import UserAddressBook from './UserAddressBook';
import UserOrderHistory from './UserOrderHistory';
import UserPaymentMethods from './UserPaymentMethods';
import UserPreferences from './UserPreferences';
import UserWishlist from './UserWishlist';
import UserReviews from './UserReviews';
import UserNotifications from './UserNotifications';
import UserProfileLayout from './UserProfileLayout';
import ProfileSidebar from './ProfileSidebar';
import ProfileHeader from './ProfileHeader';

// ============================================
// Primary Exports
// ============================================
export {
    UserProfileInfo,
    UserAddressBook,
    UserOrderHistory,
    UserPaymentMethods,
    UserPreferences,
    UserWishlist,
    UserReviews,
    UserNotifications,
    UserProfileLayout,
    ProfileSidebar,
    ProfileHeader
};

// ============================================
// Convenience Aliases
// ============================================
export {
    UserProfileInfo as ProfileInfo,
    UserAddressBook as AddressBook,
    UserOrderHistory as OrderHistory,
    UserPaymentMethods as PaymentMethods,
    UserPreferences as Preferences,
    UserWishlist as Wishlist,
    UserReviews as Reviews,
    UserNotifications as Notifications,
    UserProfileLayout as ProfileLayout,
    ProfileSidebar as Sidebar,
    ProfileHeader as Header
};

// ============================================
// Profile Configuration
// ============================================

// Tab configuration for profile sections
export const PROFILE_TABS = [
    {
        id: 'info',
        label: 'Profile Info',
        icon: '👤',
        component: 'UserProfileInfo',
        description: 'Manage your personal information',
        notificationCount: 0
    },
    {
        id: 'orders',
        label: 'Order History',
        icon: '📋',
        component: 'UserOrderHistory',
        description: 'View your past orders',
        notificationCount: 0
    },
    {
        id: 'addresses',
        label: 'Address Book',
        icon: '📍',
        component: 'UserAddressBook',
        description: 'Manage your delivery addresses',
        notificationCount: 0
    },
    {
        id: 'payments',
        label: 'Payment Methods',
        icon: '💳',
        component: 'UserPaymentMethods',
        description: 'Add or remove payment methods',
        notificationCount: 0
    },
    {
        id: 'wishlist',
        label: 'Wishlist',
        icon: '❤️',
        component: 'UserWishlist',
        description: 'Items you\'ve saved for later',
        notificationCount: 0
    },
    {
        id: 'reviews',
        label: 'Reviews',
        icon: '⭐',
        component: 'UserReviews',
        description: 'Your restaurant reviews',
        notificationCount: 0
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: '🔔',
        component: 'UserNotifications',
        description: 'Your alerts and updates',
        notificationCount: 0
    },
    {
        id: 'preferences',
        label: 'Preferences',
        icon: '⚙️',
        component: 'UserPreferences',
        description: 'Customize your experience',
        notificationCount: 0
    }
];

// Mobile bottom navigation tabs
export const MOBILE_BOTTOM_TABS = [
    { id: 'info', label: 'Profile', icon: '👤' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'preferences', label: 'Settings', icon: '⚙️' }
];

// ============================================
// Component Mapping
// ============================================

// Component registry for dynamic loading
export const componentRegistry = {
    info: UserProfileInfo,
    orders: UserOrderHistory,
    addresses: UserAddressBook,
    payments: UserPaymentMethods,
    wishlist: UserWishlist,
    reviews: UserReviews,
    notifications: UserNotifications,
    preferences: UserPreferences
};

// Get component by tab ID
export const getProfileComponent = (tabId) => {
    return componentRegistry[tabId] || UserProfileInfo;
};

// Get tab configuration by ID
export const getTabById = (tabId) => {
    return PROFILE_TABS.find(tab => tab.id === tabId) || PROFILE_TABS[0];
};

// Get tab index by ID
export const getTabIndex = (tabId) => {
    return PROFILE_TABS.findIndex(tab => tab.id === tabId);
};

// ============================================
// Profile Statistics & Data Helpers
// ============================================

// Calculate profile completion percentage
export const calculateProfileCompletion = (userData) => {
    const requiredFields = [
        'full_name',
        'email',
        'phone',
        'avatar',
        'date_of_birth',
        'gender'
    ];

    let completed = 0;
    requiredFields.forEach(field => {
        if (userData?.[field]) completed++;
    });

    // Add points for optional sections
    if (userData?.bio) completed += 0.5;
    if (userData?.social_links?.length > 0) completed += 0.5;

    return Math.min(Math.round((completed / requiredFields.length) * 100), 100);
};

// Calculate profile statistics
export const calculateProfileStats = (userData, ordersData, reviewsData, wishlistData) => {
    const totalOrders = ordersData?.length || 0;
    const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const totalReviews = reviewsData?.length || 0;
    const averageRating = reviewsData?.reduce((sum, review) => sum + (review.rating || 0), 0) / (totalReviews || 1);
    const helpfulVotes = reviewsData?.reduce((sum, review) => sum + (review.helpful_count || 0), 0) || 0;

    const wishlistCount = wishlistData?.length || 0;
    const wishlistValue = wishlistData?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

    return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        totalReviews,
        averageRating: averageRating.toFixed(1),
        helpfulVotes,
        wishlistCount,
        wishlistValue,
        memberSince: userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'N/A',
        lastActive: userData?.last_login ? new Date(userData.last_login).toLocaleDateString() : 'N/A',
        profileCompletion: calculateProfileCompletion(userData),
        loyaltyTier: getLoyaltyTier(totalOrders, totalSpent)
    };
};

// Get loyalty tier based on activity
export const getLoyaltyTier = (totalOrders, totalSpent) => {
    if (totalOrders >= 50 || totalSpent >= 50000) {
        return { name: 'Platinum', color: '#E5E4E2', icon: '💎', benefits: ['Priority Support', 'Free Delivery', 'Exclusive Deals'] };
    } else if (totalOrders >= 25 || totalSpent >= 25000) {
        return { name: 'Gold', color: '#FFD700', icon: '🥇', benefits: ['Free Delivery on ₹199+', 'Early Access to Deals'] };
    } else if (totalOrders >= 10 || totalSpent >= 10000) {
        return { name: 'Silver', color: '#C0C0C0', icon: '🥈', benefits: ['5% Cashback', 'Birthday Voucher'] };
    } else if (totalOrders >= 5 || totalSpent >= 5000) {
        return { name: 'Bronze', color: '#CD7F32', icon: '🥉', benefits: ['Exclusive Offers'] };
    }
    return { name: 'Welcome', color: '#4CAF50', icon: '🌟', benefits: ['Welcome Bonus'] };
};

// ============================================
// Form Validation Helpers
// ============================================

// Validate profile form
export const validateProfileForm = (formData) => {
    const errors = {};

    if (!formData.full_name?.trim()) {
        errors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
        errors.full_name = 'Name must be at least 2 characters';
    } else if (formData.full_name.trim().length > 100) {
        errors.full_name = 'Name must be less than 100 characters';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.full_name.trim())) {
        errors.full_name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
    }

    if (formData.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
            errors.date_of_birth = 'You must be at least 13 years old';
        } else if (age > 120) {
            errors.date_of_birth = 'Please enter a valid date of birth';
        }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

// Validate address form
export const validateAddressForm = (addressData) => {
    const errors = {};

    if (!addressData.street?.trim()) {
        errors.street = 'Street address is required';
    }

    if (!addressData.city?.trim()) {
        errors.city = 'City is required';
    }

    if (!addressData.state?.trim()) {
        errors.state = 'State is required';
    }

    if (!addressData.pincode?.trim()) {
        errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(addressData.pincode)) {
        errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!addressData.country?.trim()) {
        errors.country = 'Country is required';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

// ============================================
// Data Formatting Helpers
// ============================================

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

// Format date
export const formatDate = (date, format = 'PP') => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Get relative time
export const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    return `${years} year${years === 1 ? '' : 's'} ago`;
};

// ============================================
// Local Storage Helpers
// ============================================

// Save profile view preference
export const saveProfileTabPreference = (tabId) => {
    try {
        localStorage.setItem('profile_last_tab', tabId);
    } catch (error) {
        console.error('Error saving tab preference:', error);
    }
};

// Get saved profile tab preference
export const getSavedProfileTab = () => {
    try {
        return localStorage.getItem('profile_last_tab') || 'info';
    } catch (error) {
        return 'info';
    }
};

// Save profile view mode (grid/list)
export const saveProfileViewMode = (mode) => {
    try {
        localStorage.setItem('profile_view_mode', mode);
    } catch (error) {
        console.error('Error saving view mode:', error);
    }
};

// Get saved view mode
export const getSavedViewMode = () => {
    try {
        return localStorage.getItem('profile_view_mode') || 'grid';
    } catch (error) {
        return 'grid';
    }
};

// ============================================
// Event Tracking Helpers
// ============================================

// Track profile events
export const trackProfileEvent = (eventName, properties = {}) => {
    const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
        page: 'profile'
    };

    // Google Analytics
    if (window.gtag) {
        window.gtag('event', eventName, eventData);
    }

    // Facebook Pixel
    if (window.fbq) {
        window.fbq('track', eventName, eventData);
    }

    // Custom analytics
    console.log(`[Profile Event] ${eventName}:`, eventData);
};

// ============================================
// Profile Sections Configuration
// ============================================

// Sections that require authentication
export const PROTECTED_SECTIONS = [
    'info', 'orders', 'addresses', 'payments',
    'wishlist', 'reviews', 'notifications', 'preferences'
];

// Sections that show in sidebar
export const SIDEBAR_SECTIONS = PROFILE_TABS;

// Mobile sections (shown in bottom nav)
export const MOBILE_SECTIONS = MOBILE_BOTTOM_TABS;

// ============================================
// Default Export
// ============================================

// Default export for convenient importing
const profileComponents = {
    UserProfileInfo,
    UserAddressBook,
    UserOrderHistory,
    UserPaymentMethods,
    UserPreferences,
    UserWishlist,
    UserReviews,
    UserNotifications,
    UserProfileLayout,
    ProfileSidebar,
    ProfileHeader,
    // Aliases
    ProfileInfo: UserProfileInfo,
    AddressBook: UserAddressBook,
    OrderHistory: UserOrderHistory,
    PaymentMethods: UserPaymentMethods,
    Preferences: UserPreferences,
    Wishlist: UserWishlist,
    Reviews: UserReviews,
    Notifications: UserNotifications,
    ProfileLayout: UserProfileLayout,
    Sidebar: ProfileSidebar,
    Header: ProfileHeader,
    // Helpers
    PROFILE_TABS,
    MOBILE_BOTTOM_TABS,
    componentRegistry,
    getProfileComponent,
    getTabById,
    getTabIndex,
    calculateProfileStats,
    calculateProfileCompletion,
    validateProfileForm,
    validateAddressForm,
    formatCurrency,
    formatDate,
    getRelativeTime,
    saveProfileTabPreference,
    getSavedProfileTab,
    trackProfileEvent
};

export default profileComponents;
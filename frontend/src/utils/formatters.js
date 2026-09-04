/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(number);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (date, time, datetime, full)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'datetime') => {
    if (!date) return 'N/A';
    const d = new Date(date);

    const formats = {
        date: { year: 'numeric', month: 'short', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    };

    return d.toLocaleDateString('en-US', formats[format] || formats.datetime);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return phone;
};

/**
 * Format credit card number with spaces
 * @param {string} cardNumber - Card number
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * Format expiry date (MM/YY)
 * @param {string} expiry - Expiry date
 * @returns {string} Formatted expiry date
 */
export const formatExpiryDate = (expiry) => {
    if (!expiry) return '';
    const cleaned = expiry.replace(/\D/g, '');
    if (cleaned.length >= 2) {
        return cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '');
    }
    return cleaned;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

/**
 * Format distance in kilometers
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance
 */
export const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
};

/**
 * Format rating to stars
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star string (e.g., "★★★★☆")
 */
export const formatRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);

    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100, suffix = '...') => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
    if (!text) return '';
    return text.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Convert string to slug
 * @param {string} text - Text to convert
 * @returns {string} Slug
 */
export const slugify = (text) => {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

/**
 * Format order status for display
 * @param {string} status - Order status
 * @returns {string} Formatted status
 */
export const formatOrderStatus = (status) => {
    const statusMap = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        ready: 'Ready for Pickup',
        picked_up: 'Picked Up',
        on_the_way: 'On The Way',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
};

/**
 * Format payment method for display
 * @param {string} method - Payment method
 * @returns {string} Formatted payment method
 */
export const formatPaymentMethod = (method) => {
    const methodMap = {
        card: 'Credit/Debit Card',
        upi: 'UPI',
        netbanking: 'Net Banking',
        cod: 'Cash on Delivery',
    };
    return methodMap[method] || method;
};

/**
 * Format user role for display
 * @param {string} role - User role
 * @returns {string} Formatted role
 */
export const formatUserRole = (role) => {
    const roleMap = {
        user: 'Customer',
        restaurant_owner: 'Restaurant Owner',
        delivery_partner: 'Delivery Partner',
        admin: 'Administrator',
    };
    return roleMap[role] || role;
};

export default {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDate,
    formatRelativeTime,
    formatPhoneNumber,
    formatCardNumber,
    formatExpiryDate,
    formatFileSize,
    formatDuration,
    formatDistance,
    formatRatingStars,
    truncateText,
    capitalizeWords,
    slugify,
    formatOrderStatus,
    formatPaymentMethod,
    formatUserRole,
};
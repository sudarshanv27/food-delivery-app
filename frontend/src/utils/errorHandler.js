import toast from 'react-hot-toast';

/**
 * Error types for different categories
 */
export const ERROR_TYPES = {
    NETWORK: 'network',
    AUTH: 'auth',
    VALIDATION: 'validation',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    PERMISSION: 'permission',
    RATE_LIMIT: 'rate_limit',
    UNKNOWN: 'unknown',
};

/**
 * Get user-friendly error message
 * @param {Error|Object} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
    // Network errors
    if (error.message === 'Network Error' || !navigator.onLine) {
        return 'Please check your internet connection and try again.';
    }

    // API response errors
    if (error.response) {
        const { status, data } = error.response;
        const message = data?.message || data?.error;

        switch (status) {
            case 400:
                return message || 'Invalid request. Please check your input.';
            case 401:
                return message || 'Please login to continue.';
            case 403:
                return message || 'You do not have permission to perform this action.';
            case 404:
                return message || 'Resource not found.';
            case 409:
                return message || 'Conflict occurred. Please try again.';
            case 422:
                return message || 'Validation failed. Please check your input.';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
            case 502:
            case 503:
                return 'Server error. Please try again later.';
            default:
                return message || 'An unexpected error occurred.';
        }
    }

    // Client-side validation errors
    if (error.name === 'ValidationError') {
        return error.message || 'Please check your input.';
    }

    // Default error message
    return error.message || 'An unexpected error occurred.';
};

/**
 * Get error type based on error object
 * @param {Error|Object} error - Error object
 * @returns {string} Error type
 */
export const getErrorType = (error) => {
    if (error.message === 'Network Error' || !navigator.onLine) {
        return ERROR_TYPES.NETWORK;
    }

    if (error.response) {
        const { status } = error.response;
        if (status === 401) return ERROR_TYPES.AUTH;
        if (status === 403) return ERROR_TYPES.PERMISSION;
        if (status === 404) return ERROR_TYPES.NOT_FOUND;
        if (status === 422) return ERROR_TYPES.VALIDATION;
        if (status === 429) return ERROR_TYPES.RATE_LIMIT;
        if (status >= 500) return ERROR_TYPES.SERVER;
    }

    return ERROR_TYPES.UNKNOWN;
};

/**
 * Handle error and show toast notification
 * @param {Error|Object} error - Error object
 * @param {Object} options - Toast options
 */
export const handleError = (error, options = {}) => {
    const message = getErrorMessage(error);
    const errorType = getErrorType(error);

    console.error('Error:', error);

    // Custom handling for specific error types
    if (errorType === ERROR_TYPES.AUTH) {
        // Clear local storage and redirect to login for auth errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    }

    // Show toast notification
    toast.error(message, {
        duration: 5000,
        ...options,
    });

    return { message, type: errorType };
};

/**
 * Handle API response and extract data or throw error
 * @param {Promise} promise - API promise
 * @returns {Promise} Resolved data or throws error
 */
export const handleApiResponse = async (promise) => {
    try {
        const response = await promise;
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Create validation error
 * @param {Object} errors - Field errors
 * @returns {Error} Validation error
 */
export const createValidationError = (errors) => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = errors;
    return error;
};

/**
 * Format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted errors
 */
export const formatValidationErrors = (errors) => {
    const formatted = {};
    Object.keys(errors).forEach(key => {
        formatted[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
    });
    return formatted;
};

/**
 * Safe JSON parse with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {any} fallback - Fallback value if parse fails
 * @returns {any} Parsed object or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
};

/**
 * Retry failed request
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries (ms)
 * @returns {Promise} Result of function
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryRequest(fn, retries - 1, delay);
    }
};

/**
 * Log error to console with context
 * @param {string} context - Error context
 * @param {Error} error - Error object
 * @param {Object} extra - Extra data to log
 */
export const logError = (context, error, extra = {}) => {
    console.error(`[${context}]`, {
        message: error.message,
        stack: error.stack,
        ...extra,
    });
};

export default {
    ERROR_TYPES,
    getErrorMessage,
    getErrorType,
    handleError,
    handleApiResponse,
    createValidationError,
    formatValidationErrors,
    safeJsonParse,
    retryRequest,
    logError,
};
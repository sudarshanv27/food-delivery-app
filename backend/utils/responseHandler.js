/**
 * Unified Response Handler for consistent API responses
 */

// ================= SUCCESS RESPONSES =================

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created data
 * @param {string} message - Success message
 * @returns {Object} JSON response
 */
const sendCreated = (res, data = null, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const sendNoContent = (res) => {
    return res.status(204).send();
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - List of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} JSON response
 */
const sendPaginated = (res, items, total, page = 1, limit = 10) => {
    const totalPages = Math.ceil(total / limit);

    const response = {
        success: true,
        message: 'Data fetched successfully',
        timestamp: new Date().toISOString(),
        data: {
            items,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }
    };

    return res.status(200).json(response);
};

/**
 * Send login success response
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {Object} user - User data
 * @returns {Object} JSON response
 */
const sendLoginSuccess = (res, token, user) => {
    return res.status(200).json({
        success: true,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
        token,
        user: {
            id: user?.user_id || user?.id,
            name: user?.full_name || user?.name,
            email: user?.email,
            phone: user?.phone,
            type: user?.user_type || user?.type
        }
    });
};

/**
 * Send logout success response
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const sendLogoutSuccess = (res) => {
    return res.status(200).json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
    });
};

// ================= ERROR RESPONSES =================

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Array|Object} details - Additional error details
 * @returns {Object} JSON response
 */
const sendError = (res, message = 'Something went wrong', statusCode = 400, details = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (details) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send bad request error (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors
 * @returns {Object} JSON response
 */
const sendBadRequest = (res, message = 'Bad request', errors = null) => {
    return sendError(res, message, 400, errors);
};

/**
 * Send unauthorized error (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} JSON response
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
    return sendError(res, message, 401);
};

/**
 * Send forbidden error (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} JSON response
 */
const sendForbidden = (res, message = 'Access forbidden') => {
    return sendError(res, message, 403);
};

/**
 * Send not found error (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} JSON response
 */
const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, 404);
};

/**
 * Send conflict error (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} JSON response
 */
const sendConflict = (res, message = 'Resource already exists') => {
    return sendError(res, message, 409);
};

/**
 * Send validation error (422)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Array} errors - Validation errors
 * @returns {Object} JSON response
 */
const sendValidationError = (res, message = 'Validation failed', errors = null) => {
    return sendError(res, message, 422, errors);
};

/**
 * Send too many requests error (429)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @returns {Object} JSON response
 */
const sendTooManyRequests = (res, message = 'Too many requests, please try again later') => {
    return sendError(res, message, 429);
};

/**
 * Send internal server error (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Error} error - Error object (only in development)
 * @returns {Object} JSON response
 */
const sendInternalError = (res, message = 'Internal server error', error = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    // Only include error details in development mode
    if (error && process.env.NODE_ENV === 'development') {
        response.error = error.message;
        if (error.stack) {
            response.stack = error.stack;
        }
    }

    // Log error for debugging
    if (error) {
        console.error('Internal Error:', error.message);
    }

    return res.status(500).json(response);
};

// ================= BULK RESPONSES =================

/**
 * Send bulk operation response
 * @param {Object} res - Express response object
 * @param {Object} results - Results of bulk operations
 * @returns {Object} JSON response
 */
const sendBulkResponse = (res, results) => {
    return res.status(200).json({
        success: true,
        message: 'Bulk operation completed',
        timestamp: new Date().toISOString(),
        data: results
    });
};

// ================= FILE RESPONSES =================

/**
 * Send file download response
 * @param {Object} res - Express response object
 * @param {string} filePath - Path to file
 * @param {string} filename - Name of file
 * @returns {Object} File response
 */
const sendFile = (res, filePath, filename) => {
    return res.download(filePath, filename);
};

// ================= CUSTOM RESPONSES =================

/**
 * Send custom response
 * @param {Object} res - Express response object
 * @param {Object} customResponse - Custom response object
 * @returns {Object} JSON response
 */
const sendCustom = (res, customResponse) => {
    return res.status(customResponse.statusCode || 200).json({
        success: customResponse.success !== undefined ? customResponse.success : true,
        message: customResponse.message || 'Operation completed',
        timestamp: new Date().toISOString(),
        ...(customResponse.data && { data: customResponse.data })
    });
};

// ================= EXPORT ALL =================
module.exports = {
    // Success responses
    sendSuccess,
    sendCreated,
    sendNoContent,
    sendPaginated,
    sendLoginSuccess,
    sendLogoutSuccess,

    // Error responses
    sendError,
    sendBadRequest,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    sendConflict,
    sendValidationError,
    sendTooManyRequests,
    sendInternalError,

    // Other responses
    sendBulkResponse,
    sendFile,
    sendCustom
};
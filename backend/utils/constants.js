// ================= API RESPONSE MESSAGES =================
const MESSAGES = {
    // Success Messages
    SUCCESS: {
        LOGIN_SUCCESS: "Login successful",
        SIGNUP_SUCCESS: "User registered successfully",
        LOGOUT_SUCCESS: "Logout successful",
        PROFILE_FETCHED: "Profile fetched successfully",
        PROFILE_UPDATED: "Profile updated successfully",

        RESTAURANT_FETCHED: "Restaurants fetched successfully",
        RESTAURANT_DETAILS: "Restaurant details fetched successfully",
        RESTAURANT_ADDED: "Restaurant added successfully",
        RESTAURANT_UPDATED: "Restaurant updated successfully",
        RESTAURANT_DELETED: "Restaurant deleted successfully",

        MENU_FETCHED: "Menu fetched successfully",
        MENU_ADDED: "Menu item added successfully",
        MENU_UPDATED: "Menu item updated successfully",
        MENU_DELETED: "Menu item deleted successfully",

        CART_FETCHED: "Cart fetched successfully",
        CART_ADDED: "Item added to cart",
        CART_UPDATED: "Cart updated successfully",
        CART_REMOVED: "Item removed from cart",
        CART_CLEARED: "Cart cleared successfully",

        ORDER_CREATED: "Order created successfully",
        ORDER_FETCHED: "Orders fetched successfully",
        ORDER_STATUS_UPDATED: "Order status updated successfully",
        ORDER_CANCELLED: "Order cancelled successfully",

        PAYMENT_SUCCESS: "Payment processed successfully",
        PAYMENT_VERIFIED: "Payment verified successfully",

        REVIEW_ADDED: "Review added successfully",
        REVIEW_FETCHED: "Reviews fetched successfully",

        WALLET_ADDED: "Amount added to wallet successfully",
        WALLET_DEDUCTED: "Amount deducted from wallet successfully",
        WALLET_FETCHED: "Wallet balance fetched successfully",

        PROMO_APPLIED: "Promo code applied successfully",
        PROMO_REMOVED: "Promo code removed successfully",

        UPLOAD_SUCCESS: "File uploaded successfully",
        UPLOAD_DELETED: "File deleted successfully",
    },

    // Error Messages
    ERROR: {
        // Auth Errors
        INVALID_CREDENTIALS: "Invalid email or password",
        EMAIL_EXISTS: "Email already registered",
        PHONE_EXISTS: "Phone number already registered",
        USER_NOT_FOUND: "User not found",
        UNAUTHORIZED: "Unauthorized access",
        FORBIDDEN: "Access forbidden",
        TOKEN_MISSING: "No token provided",
        TOKEN_INVALID: "Invalid or expired token",
        TOKEN_EXPIRED: "Token has expired",

        // Validation Errors
        ALL_FIELDS_REQUIRED: "All fields are required",
        INVALID_EMAIL: "Invalid email format",
        INVALID_PHONE: "Invalid phone number format",
        PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
        PASSWORD_MISMATCH: "Passwords do not match",

        // Restaurant Errors
        RESTAURANT_NOT_FOUND: "Restaurant not found",
        RESTAURANT_CLOSED: "Restaurant is currently closed",
        RESTAURANT_NOT_ACTIVE: "Restaurant is not active",

        // Menu Errors
        MENU_ITEM_NOT_FOUND: "Menu item not found",
        MENU_ITEM_UNAVAILABLE: "Menu item is currently unavailable",

        // Cart Errors
        CART_EMPTY: "Cart is empty",
        CART_NOT_FOUND: "Cart not found",
        CART_ITEM_NOT_FOUND: "Cart item not found",

        // Order Errors
        ORDER_NOT_FOUND: "Order not found",
        ORDER_CANNOT_CANCEL: "Order cannot be cancelled at this stage",
        ORDER_ALREADY_DELIVERED: "Order already delivered",
        INVALID_ORDER_STATUS: "Invalid order status transition",

        // Payment Errors
        PAYMENT_FAILED: "Payment processing failed",
        PAYMENT_VERIFICATION_FAILED: "Payment verification failed",
        INSUFFICIENT_BALANCE: "Insufficient wallet balance",

        // Review Errors
        REVIEW_NOT_FOUND: "Review not found",
        ALREADY_REVIEWED: "You have already reviewed this order",
        CANNOT_REVIEW: "You can only review delivered orders",

        // Promo Errors
        PROMO_INVALID: "Invalid promo code",
        PROMO_EXPIRED: "Promo code has expired",
        PROMO_USED: "Promo code already used",
        PROMO_NOT_APPLICABLE: "Promo code not applicable for this order",

        // Upload Errors
        UPLOAD_FAILED: "File upload failed",
        INVALID_FILE_TYPE: "Invalid file type",
        FILE_TOO_LARGE: "File too large",

        // Database Errors
        DB_CONNECTION_FAILED: "Database connection failed",
        DB_QUERY_FAILED: "Database query failed",

        // Server Errors
        INTERNAL_SERVER_ERROR: "Internal server error",
        ROUTE_NOT_FOUND: "Route not found",
        RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
    }
};

// ================= HTTP STATUS CODES =================
const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};

// ================= USER TYPES =================
const USER_TYPES = {
    CUSTOMER: "customer",
    RESTAURANT_OWNER: "restaurant_owner",
    DELIVERY_PARTNER: "delivery_partner",
    ADMIN: "admin",
};

// ================= ORDER STATUS =================
const ORDER_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    READY_FOR_DELIVERY: "ready_for_delivery",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
};

// ================= PAYMENT STATUS =================
const PAYMENT_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
};

// ================= PAYMENT METHODS =================
const PAYMENT_METHODS = {
    CASH: "cash",
    CARD: "card",
    WALLET: "wallet",
    UPI: "upi",
    NET_BANKING: "net_banking",
};

// ================= ORDER SORT OPTIONS =================
const ORDER_SORT = {
    NEWEST: "created_at DESC",
    OLDEST: "created_at ASC",
    LOWEST_PRICE: "total_amount ASC",
    HIGHEST_PRICE: "total_amount DESC",
};

// ================= RESTAURANT SORT OPTIONS =================
const RESTAURANT_SORT = {
    RATING: "avg_rating DESC",
    DELIVERY_TIME: "estimated_delivery_time ASC",
    MIN_ORDER: "min_order_amount ASC",
    NAME_ASC: "name ASC",
    NAME_DESC: "name DESC",
};

// ================= FILE UPLOAD CONFIG =================
const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    MAX_FILES_PER_UPLOAD: 10,
};

// ================= PAGINATION =================
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};

// ================= CACHE DURATIONS (in seconds) =================
const CACHE_DURATIONS = {
    RESTAURANTS: 300, // 5 minutes
    MENU: 300, // 5 minutes
    USER_PROFILE: 600, // 10 minutes
    ORDERS: 60, // 1 minute
};

// ================= REGEX PATTERNS =================
const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[0-9]{10}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    PINCODE: /^[0-9]{6}$/,
    GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
};

// ================= DEFAULT VALUES =================
const DEFAULTS = {
    DELIVERY_FEE: 29,
    TAX_RATE: 0.05, // 5%
    MIN_ORDER_AMOUNT: 99,
    MAX_ORDER_AMOUNT: 50000,
    OTP_EXPIRY_MINUTES: 10,
    JWT_EXPIRY_DAYS: 7,
};

// ================= SOCKET EVENTS =================
const SOCKET_EVENTS = {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",
    JOIN_ORDER: "join-order",
    TRACK_DELIVERY: "track-delivery",
    UPDATE_LOCATION: "update-location",
    UPDATE_ORDER_STATUS: "update-order-status",
    DRIVER_LOCATION: "driver-location",
    ORDER_STATUS: "order-status",
    NEW_ORDER: "new-order",
    ORDER_ACCEPTED: "order-accepted",
    ORDER_PICKED: "order-picked",
    ORDER_DELIVERED: "order-delivered",
};

// ================= PROMO CODE TYPES =================
const PROMO_TYPES = {
    PERCENTAGE: "percentage",
    FIXED: "fixed",
    FREE_DELIVERY: "free_delivery",
};

// ================= NOTIFICATION TYPES =================
const NOTIFICATION_TYPES = {
    ORDER_CONFIRMED: "order_confirmed",
    ORDER_PREPARING: "order_preparing",
    ORDER_OUT_FOR_DELIVERY: "order_out_for_delivery",
    ORDER_DELIVERED: "order_delivered",
    ORDER_CANCELLED: "order_cancelled",
    PAYMENT_SUCCESS: "payment_success",
    PAYMENT_FAILED: "payment_failed",
    WALLET_CREDITED: "wallet_credited",
    WALLET_DEBITED: "wallet_debited",
    PROMO_APPLIED: "promo_applied",
    NEW_RESTAURANT: "new_restaurant",
    OFFER_AVAILABLE: "offer_available",
};

// ================= EXPORT ALL CONSTANTS =================
module.exports = {
    MESSAGES,
    STATUS_CODES,
    USER_TYPES,
    ORDER_STATUS,
    PAYMENT_STATUS,
    PAYMENT_METHODS,
    ORDER_SORT,
    RESTAURANT_SORT,
    UPLOAD_CONFIG,
    PAGINATION,
    CACHE_DURATIONS,
    REGEX,
    DEFAULTS,
    SOCKET_EVENTS,
    PROMO_TYPES,
    NOTIFICATION_TYPES,
};
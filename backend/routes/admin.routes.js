// backend/routes/admin.routes.js

const express = require('express');

const router = express.Router();

const {
    authenticate,
    isAdmin
} = require('../middleware/auth');

const {
    getStats,
    getRecentOrders,
    getRecentUsers,

    getAllUsers,
    updateUserStatus,

    getAllRestaurants,
    updateRestaurantStatus,

    getAllOrders,
    getAnalytics
} = require('../controllers/admin.controller');

// ============================================================
// ================= ADMIN PROTECTION =========================
// ============================================================

router.use(authenticate);
router.use(isAdmin);

// ============================================================
// ================= DASHBOARD ================================
// ============================================================

router.get(
    '/stats',
    getStats
);

router.get(
    '/orders/recent',
    getRecentOrders
);

router.get(
    '/users/recent',
    getRecentUsers
);

// ============================================================
// ================= USERS ====================================
// ============================================================

router.get(
    '/users',
    getAllUsers
);

router.put(
    '/users/:userId/status',
    updateUserStatus
);

// ============================================================
// ================= RESTAURANTS ===============================
// ============================================================

router.get(
    '/restaurants',
    getAllRestaurants
);

router.put(
    '/restaurants/:restaurantId/status',
    updateRestaurantStatus
);

// ============================================================
// ================= ORDERS ====================================
// ============================================================

router.get(
    '/orders',
    getAllOrders
);

// ============================================================
// ================= ANALYTICS ================================
// ============================================================

router.get(
    '/analytics',
    getAnalytics
);

// ============================================================
// ================= EXPORT ====================================
// ============================================================

module.exports = router;
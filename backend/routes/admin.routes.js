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
    getAllRestaurants
} = require('../controllers/admin.controller');

// ================= ADMIN PROTECTED ROUTES =================
router.use(authenticate);
router.use(isAdmin);

// Dashboard statistics
router.get('/stats', getStats);

// Recent orders
router.get('/orders/recent', getRecentOrders);

// Recent users
router.get('/users/recent', getRecentUsers);

// All restaurants
router.get('/restaurants', getAllRestaurants);

module.exports = router;
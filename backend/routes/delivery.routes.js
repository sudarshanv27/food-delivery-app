const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/auth');
const authenticate = authMiddleware.authenticate || authMiddleware;

const {
    getMyProfile,
    updateMyProfile,
    updateOnlineStatus,
    updateAvailability,
    getAvailableOrders,
    acceptOrder,
    updateDeliveryStatus,
    updateLocation,
    getMyDeliveries,
    getDeliveryTracking
} = require('../controllers/delivery.controller');

router.use(authenticate);

// ============================================================
// DELIVERY PARTNER PROFILE
// ============================================================

router.get('/profile', getMyProfile);

router.put('/profile', updateMyProfile);

// ============================================================
// ONLINE / AVAILABILITY
// ============================================================

router.put('/online-status', updateOnlineStatus);

router.put('/availability', updateAvailability);

// ============================================================
// ORDERS
// ============================================================

router.get('/available-orders', getAvailableOrders);

router.post('/accept/:orderId', acceptOrder);

router.get('/my-deliveries', getMyDeliveries);

// ============================================================
// DELIVERY STATUS
// ============================================================

router.put('/status/:orderId', updateDeliveryStatus);

// ============================================================
// LIVE LOCATION
// ============================================================

router.post('/location', updateLocation);

// ============================================================
// TRACKING HISTORY
// ============================================================

router.get('/tracking/:orderId', getDeliveryTracking);

module.exports = router;

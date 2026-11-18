// backend/routes/order.routes.js

const express = require('express');
const router = express.Router();

// ================= MIDDLEWARE =================

const authMiddleware = require('../middleware/auth');
const authenticate = authMiddleware.authenticate || authMiddleware;

// ================= CONTROLLER =================

const {
    createOrder,
    getUserOrders,
    getRestaurantOrders,
    getOrderDetails,
    updateOrderStatus,
    getOrderById,
    trackOrder,
    cancelOrder
} = require('../controllers/order.controller');

// ================= PROTECTED ROUTES =================

router.use(authenticate);

// =====================================================
// ORDER CREATION
// =====================================================

router.post('/create', createOrder);

// =====================================================
// ORDER LISTS
// =====================================================

// Customer's own orders
router.get('/my-orders', getUserOrders);

// Restaurant owner's orders
// IMPORTANT: This must be BEFORE /:orderId
router.get('/restaurant', getRestaurantOrders);

// Generic customer order list
router.get('/', getUserOrders);

// =====================================================
// ORDER DETAILS
// =====================================================

// /api/orders/details/:id
router.get('/details/:id', getOrderById);

// /api/orders/:orderId
router.get('/:orderId', getOrderDetails);

// =====================================================
// ORDER TRACKING
// =====================================================

router.get('/:id/track', trackOrder);

router.get('/track/:orderId', (req, res, next) => {
    req.params.id = req.params.orderId;
    next();
}, trackOrder);

// =====================================================
// ORDER STATUS
// =====================================================

// Restaurant owner / admin
router.put('/:orderId/status', updateOrderStatus);

router.patch('/:id/status', (req, res, next) => {
    req.params.orderId = req.params.id;
    next();
}, updateOrderStatus);

// =====================================================
// CANCEL ORDER
// =====================================================

// Customer cancellation
router.put('/:id/cancel', cancelOrder);

router.put('/:orderId/cancel', (req, res, next) => {
    req.params.id = req.params.orderId;
    next();
}, cancelOrder);

// =====================================================

module.exports = router;
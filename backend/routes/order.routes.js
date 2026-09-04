// backend/routes/order.routes.js

const express = require('express');
const router = express.Router();

// Import middleware (handle both possible export patterns)
const authMiddleware = require('../middleware/auth');
const authenticate = authMiddleware.authenticate || authMiddleware;

const {
    createOrder,
    getUserOrders,
    getOrderDetails,
    updateOrderStatus,
    getOrderById,
    trackOrder,
    cancelOrder
} = require('../controllers/order.controller');

// ================= PROTECTED ORDER ROUTES =================
// All order routes require authentication
router.use(authenticate);

// ================= ORDER CREATION & MANAGEMENT =================
// Create new order
router.post('/create', createOrder);

// Get logged-in user orders
router.get('/', getUserOrders);
router.get('/my-orders', getUserOrders); // Support both endpoint patterns

// Cancel order
router.put('/:id/cancel', cancelOrder);
router.put('/:orderId/cancel', (req, res, next) => {
    // Support both parameter names
    req.params.id = req.params.id || req.params.orderId;
    next();
}, cancelOrder);

// ================= ORDER RETRIEVAL =================
// Get single order details (supports both parameter patterns)
router.get('/:orderId', getOrderDetails);
router.get('/details/:id', getOrderById);
router.get('/:id', (req, res, next) => {
    // Check if this is a track request or regular details
    if (req.path.endsWith('/track')) {
        return next();
    }
    getOrderById(req, res, next);
});

// Track order in real-time
router.get('/:id/track', trackOrder);
router.get('/track/:orderId', trackOrder);

// ================= ORDER STATUS UPDATES =================
// Update order status (admin/restaurant owner)
router.put('/:orderId/status', updateOrderStatus);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
// backend/routes/delivery.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    getAvailableOrders,
    acceptOrder,
    updateDeliveryStatus,
    getMyDeliveries
} = require('../controllers/delivery.controller');

router.use(authenticate);

router.get('/available-orders', getAvailableOrders);
router.post('/accept/:orderId', acceptOrder);
router.put('/status/:orderId', updateDeliveryStatus);
router.get('/my-deliveries', getMyDeliveries);

module.exports = router;
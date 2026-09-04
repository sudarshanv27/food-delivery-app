// backend/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
    createPaymentOrder,
    verifyPayment,
    getPaymentStatus,
    refundPayment
} = require('../controllers/payment.controller');

// ================= USER PAYMENT ROUTES =================

// Create Razorpay Order
router.post('/create-order', authenticate, createPaymentOrder);

// Verify Payment
router.post('/verify', authenticate, verifyPayment);

// Get Payment Status by Order ID
router.get('/status/:orderId', authenticate, getPaymentStatus);

// ================= ADMIN PAYMENT ROUTES =================

// Refund Payment (Admin only)
router.post('/refund', authenticate, isAdmin, refundPayment);

module.exports = router;
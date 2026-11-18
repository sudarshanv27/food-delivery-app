require('dotenv').config();

const crypto = require('crypto');

const {
    sendSuccess,
    sendError,
    sendInternalError
} = require('../utils/responseHandler');

const { pool } = require('../config/database');

// ============================================================
// MOCK PAYMENT MODE
// ============================================================

const MOCK_PAYMENT_MODE = true;

// ============================================================
// CREATE PAYMENT ORDER
// ============================================================

const createPaymentOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', order_id } = req.body;

        const userId = req.user.userId;

        if (!amount || Number(amount) <= 0) {
            return sendError(
                res,
                'Valid payment amount is required',
                400
            );
        }

        if (!order_id) {
            return sendError(
                res,
                'Order ID is required',
                400
            );
        }

        // --------------------------------------------------------
        // Verify that the order belongs to the logged-in customer
        // --------------------------------------------------------

        const orderResult = await pool.query(
            `
            SELECT
                order_id,
                user_id,
                total_amount,
                payment_status,
                order_status
            FROM orders
            WHERE order_id = $1
              AND user_id = $2
            `,
            [order_id, userId]
        );

        if (orderResult.rows.length === 0) {
            return sendError(
                res,
                'Order not found',
                404
            );
        }

        const order = orderResult.rows[0];

        const requestedAmount = Number(amount);
        const orderAmount = Number(order.total_amount);

        // --------------------------------------------------------
        // Prevent payment amount manipulation
        // --------------------------------------------------------

        if (Math.abs(requestedAmount - orderAmount) > 0.01) {
            return sendError(
                res,
                `Payment amount must match order total: ?${orderAmount.toFixed(2)}`,
                400
            );
        }

        // --------------------------------------------------------
        // Generate mock payment order
        // --------------------------------------------------------

        const mockRazorpayOrderId =
            `mock_order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // --------------------------------------------------------
        // Store payment record
        // --------------------------------------------------------

        const paymentResult = await pool.query(
            `
            INSERT INTO payments (
                order_id,
                user_id,
                razorpay_order_id,
                amount,
                currency,
                payment_status
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                payment_id,
                order_id,
                user_id,
                razorpay_order_id,
                amount,
                currency,
                payment_status,
                created_at
            `,
            [
                order_id,
                userId,
                mockRazorpayOrderId,
                requestedAmount,
                currency,
                'created'
            ]
        );

        const payment = paymentResult.rows[0];

        return sendSuccess(
            res,
            {
                order: {
                    id: mockRazorpayOrderId,
                    amount: Math.round(requestedAmount * 100),
                    currency,
                    status: 'created'
                },
                payment,
                is_mock: true
            },
            'Mock payment order created successfully'
        );

    } catch (error) {

        console.error(
            'Create Payment Order Error:',
            error
        );

        return sendInternalError(
            res,
            'Failed to create payment order',
            error
        );
    }
};

// ============================================================
// VERIFY MOCK PAYMENT
// ============================================================

const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id,
            payment_method = 'mock_card'
        } = req.body;

        const userId = req.user.userId;

        if (!razorpay_order_id) {
            return sendError(
                res,
                'Payment order ID is required',
                400
            );
        }

        // --------------------------------------------------------
        // Find payment belonging to logged-in user
        // --------------------------------------------------------

        const paymentResult = await pool.query(
            `
            SELECT
                payment_id,
                order_id,
                user_id,
                razorpay_order_id,
                amount,
                currency,
                payment_status
            FROM payments
            WHERE razorpay_order_id = $1
              AND user_id = $2
            `,
            [razorpay_order_id, userId]
        );

        if (paymentResult.rows.length === 0) {
            return sendError(
                res,
                'Payment order not found',
                404
            );
        }

        const payment = paymentResult.rows[0];

        // --------------------------------------------------------
        // Verify order ID if supplied
        // --------------------------------------------------------

        if (
            order_id &&
            order_id !== payment.order_id
        ) {
            return sendError(
                res,
                'Payment order does not match the specified order',
                400
            );
        }

        // --------------------------------------------------------
        // Prevent duplicate verification
        // --------------------------------------------------------

        if (payment.payment_status === 'paid') {
            return sendSuccess(
                res,
                {
                    verified: true,
                    already_paid: true,
                    payment_id: payment.razorpay_payment_id,
                    order_id: payment.order_id,
                    payment_status: 'paid',
                    is_mock: true
                },
                'Payment was already verified'
            );
        }

        // --------------------------------------------------------
        // Mock payment ID
        // --------------------------------------------------------

        const mockPaymentId =
            razorpay_payment_id ||
            `mock_payment_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // --------------------------------------------------------
        // Mock signature
        // --------------------------------------------------------

        const mockSignature =
            razorpay_signature ||
            crypto
                .createHash('sha256')
                .update(
                    `${razorpay_order_id}|${mockPaymentId}`
                )
                .digest('hex');

        // --------------------------------------------------------
        // Update payment record
        // --------------------------------------------------------

        const updatedPaymentResult = await pool.query(
            `
            UPDATE payments
            SET
                razorpay_payment_id = $1,
                razorpay_signature = $2,
                payment_method = $3,
                payment_status = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE payment_id = $5
            RETURNING
                payment_id,
                order_id,
                razorpay_order_id,
                razorpay_payment_id,
                amount,
                currency,
                payment_method,
                payment_status,
                updated_at
            `,
            [
                mockPaymentId,
                mockSignature,
                payment_method,
                'paid',
                payment.payment_id
            ]
        );

        // --------------------------------------------------------
        // Update order payment status
        // --------------------------------------------------------

        await pool.query(
            `
            UPDATE orders
            SET
                payment_status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
              AND user_id = $3
            `,
            [
                'paid',
                payment.order_id,
                userId
            ]
        );

        return sendSuccess(
            res,
            {
                verified: true,
                payment: updatedPaymentResult.rows[0],
                order_id: payment.order_id,
                is_mock: MOCK_PAYMENT_MODE
            },
            'Mock payment verified successfully'
        );

    } catch (error) {

        console.error(
            'Payment Verification Error:',
            error
        );

        return sendInternalError(
            res,
            'Payment verification failed',
            error
        );
    }
};

// ============================================================
// GET PAYMENT STATUS
// ============================================================

const getPaymentStatus = async (req, res) => {
    try {

        const { orderId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                p.payment_id,
                p.order_id,
                p.razorpay_order_id,
                p.razorpay_payment_id,
                p.amount,
                p.currency,
                p.payment_method,
                p.payment_status,
                p.refund_id,
                p.refund_amount,
                p.failure_reason,
                p.created_at,
                p.updated_at,
                o.order_status
            FROM payments p
            INNER JOIN orders o
                ON o.order_id = p.order_id
            WHERE p.order_id = $1
              AND p.user_id = $2
            ORDER BY p.created_at DESC
            LIMIT 1
            `,
            [orderId, userId]
        );

        if (result.rows.length === 0) {
            return sendError(
                res,
                'Payment not found for this order',
                404
            );
        }

        return sendSuccess(
            res,
            result.rows[0],
            'Payment status fetched successfully'
        );

    } catch (error) {

        console.error(
            'Get Payment Status Error:',
            error
        );

        return sendInternalError(
            res,
            'Failed to fetch payment status',
            error
        );
    }
};

// ============================================================
// REFUND MOCK PAYMENT
// ============================================================

const refundPayment = async (req, res) => {
    try {

        const {
            orderId,
            paymentId,
            amount
        } = req.body;

        if (!orderId || !paymentId) {
            return sendError(
                res,
                'Order ID and Payment ID are required',
                400
            );
        }

        // --------------------------------------------------------
        // Find payment
        // --------------------------------------------------------

        const paymentResult = await pool.query(
            `
            SELECT
                p.payment_id,
                p.order_id,
                p.amount,
                p.payment_status,
                o.order_status
            FROM payments p
            INNER JOIN orders o
                ON o.order_id = p.order_id
            WHERE p.payment_id = $1
              AND p.order_id = $2
            `,
            [paymentId, orderId]
        );

        if (paymentResult.rows.length === 0) {
            return sendError(
                res,
                'Payment not found',
                404
            );
        }

        const payment = paymentResult.rows[0];

        if (payment.payment_status !== 'paid') {
            return sendError(
                res,
                'Only paid payments can be refunded',
                400
            );
        }

        if (
            payment.order_status !== 'cancelled' &&
            payment.order_status !== 'refunded'
        ) {
            return sendError(
                res,
                'Order is not eligible for refund',
                400
            );
        }

        const originalAmount =
            Number(payment.amount);

        const refundAmount =
            amount == null
                ? originalAmount
                : Number(amount);

        if (
            refundAmount <= 0 ||
            refundAmount > originalAmount
        ) {
            return sendError(
                res,
                'Invalid refund amount',
                400
            );
        }

        const refundId =
            `mock_refund_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        await pool.query(
            `
            UPDATE payments
            SET
                payment_status = $1,
                refund_id = $2,
                refund_amount = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE payment_id = $4
            `,
            [
                'refunded',
                refundId,
                refundAmount,
                paymentId
            ]
        );

        await pool.query(
            `
            UPDATE orders
            SET
                payment_status = $1,
                order_status = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $3
            `,
            [
                'refunded',
                'refunded',
                orderId
            ]
        );

        return sendSuccess(
            res,
            {
                refund_id: refundId,
                payment_id: paymentId,
                order_id: orderId,
                amount: refundAmount,
                status: 'refunded',
                is_mock: true
            },
            'Mock payment refunded successfully'
        );

    } catch (error) {

        console.error(
            'Refund Payment Error:',
            error
        );

        return sendInternalError(
            res,
            'Failed to process refund',
            error
        );
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentStatus,
    refundPayment
};

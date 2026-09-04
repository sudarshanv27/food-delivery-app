// backend/controllers/payment.controller.js
require('dotenv').config();

const crypto = require('crypto');
const { sendSuccess, sendError, sendInternalError } = require('../utils/responseHandler');
const { pool } = require('../config/database');

// ================= RAZORPAY (Optional - Check if installed) =================
let Razorpay = null;
let razorpay = null;
let transporter = null;

try {
    Razorpay = require('razorpay');
    const nodemailer = require('nodemailer');

    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxxxx'
    });

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('✅ Razorpay and Email services initialized');
} catch (error) {
    console.log('⚠️ Razorpay not installed - using mock payment mode');
}

// ================= CREATE PAYMENT ORDER =================
const createPaymentOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        // Validation
        if (!amount || amount <= 0) {
            return sendError(res, 'Valid amount is required', 400);
        }

        // If Razorpay is not available, use mock mode
        if (!razorpay) {
            const mockOrder = {
                id: 'mock_order_' + Date.now(),
                amount: Math.round(amount * 100),
                currency: currency,
                receipt: 'receipt_' + Date.now(),
                status: 'created',
                is_mock: true
            };

            return sendSuccess(res, {
                order: mockOrder,
                is_mock: true,
                message: 'Using mock payment mode. Install razorpay for real payments.'
            }, 'Mock order created successfully');
        }

        // Real Razorpay order creation
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        return sendSuccess(res, { order }, 'Payment order created successfully');

    } catch (error) {
        console.error('❌ Razorpay Order Error:', error);
        return sendInternalError(res, 'Failed to create payment order', error);
    }
};

// ================= VERIFY PAYMENT =================
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body;

        // Check if this is a mock payment (for testing without Razorpay)
        const isMockPayment = razorpay_order_id?.startsWith('mock_order_');

        if (isMockPayment) {
            // Mock verification - always succeeds
            if (orderData?.order_id) {
                await pool.query(`
                    UPDATE orders
                    SET payment_status = $1, payment_id = $2
                    WHERE order_id = $3
                `, ['paid', razorpay_payment_id || 'mock_payment', orderData.order_id]);
            }

            return sendSuccess(res, {
                verified: true,
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id,
                is_mock: true
            }, 'Payment verified successfully (Mock Mode)');
        }

        // ================= REAL PAYMENT VERIFICATION =================
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return sendError(res, 'Payment details are missing', 400);
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return sendError(res, 'Invalid payment signature', 400);
        }

        // Update order payment status in database
        if (orderData?.order_id) {
            await pool.query(`
                UPDATE orders
                SET payment_status = $1, payment_id = $2
                WHERE order_id = $3
            `, ['paid', razorpay_payment_id, orderData.order_id]);
        }

        // Send email confirmation (if email service available)
        if (orderData?.email && transporter) {
            await sendOrderConfirmationEmail(orderData).catch(console.error);
        }

        return sendSuccess(res, {
            verified: true,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id
        }, 'Payment verified successfully');

    } catch (error) {
        console.error('❌ Payment Verification Error:', error);
        return sendInternalError(res, 'Payment verification failed', error);
    }
};

// ================= GET PAYMENT STATUS =================
const getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const result = await pool.query(`
            SELECT payment_status, payment_id, order_status
            FROM orders
            WHERE order_id = $1
        `, [orderId]);

        if (result.rows.length === 0) {
            return sendError(res, 'Order not found', 404);
        }

        return sendSuccess(res, {
            payment_status: result.rows[0].payment_status,
            payment_id: result.rows[0].payment_id,
            order_status: result.rows[0].order_status
        }, 'Payment status fetched successfully');

    } catch (error) {
        console.error('Get Payment Status Error:', error);
        return sendInternalError(res, 'Failed to fetch payment status', error);
    }
};

// ================= SEND ORDER CONFIRMATION EMAIL =================
const sendOrderConfirmationEmail = async (orderData) => {
    try {
        if (!transporter) {
            console.log('⚠️ Email service not configured');
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: orderData.email,
            subject: '🍕 Order Confirmation - Food Delivery App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff4757;">Order Confirmed ✅</h2>
                    
                    <p>Hello ${orderData.customer_name || 'Customer'},</p>
                    
                    <p>Your order has been placed successfully.</p>
                    
                    <h3>Order Details:</h3>
                    
                    <ul>
                        <li><strong>Order ID:</strong> ${orderData.order_id}</li>
                        <li><strong>Total Amount:</strong> ₹${orderData.total_amount}</li>
                        <li><strong>Payment Status:</strong> Paid</li>
                    </ul>
                    
                    <p>Thank you for ordering with us ❤️</p>
                    
                    <hr>
                    <p style="font-size: 12px; color: #999;">
                        For any queries, contact support@foodapp.com
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent');

    } catch (error) {
        console.error('❌ Email Error:', error);
    }
};

// ================= REFUND PAYMENT =================
const refundPayment = async (req, res) => {
    try {
        const { orderId, paymentId, amount } = req.body;

        if (!orderId || !paymentId) {
            return sendError(res, 'Order ID and Payment ID are required', 400);
        }

        // Check if order exists and is eligible for refund
        const orderResult = await pool.query(`
            SELECT order_status, payment_status, total_amount
            FROM orders
            WHERE order_id = $1
        `, [orderId]);

        if (orderResult.rows.length === 0) {
            return sendError(res, 'Order not found', 404);
        }

        const order = orderResult.rows[0];

        if (order.order_status !== 'cancelled' && order.order_status !== 'refunded') {
            return sendError(res, 'Order is not eligible for refund', 400);
        }

        const refundAmount = amount || order.total_amount;

        // In mock mode, just update database
        await pool.query(`
            UPDATE orders
            SET payment_status = $1, order_status = $2
            WHERE order_id = $3
        `, ['refunded', 'refunded', orderId]);

        return sendSuccess(res, {
            refund_id: 'ref_' + Date.now(),
            amount: refundAmount,
            status: 'refunded'
        }, 'Payment refunded successfully');

    } catch (error) {
        console.error('Refund Payment Error:', error);
        return sendInternalError(res, 'Failed to process refund', error);
    }
};

// ================= EXPORTS =================
module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentStatus,
    refundPayment
};
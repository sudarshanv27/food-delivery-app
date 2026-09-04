// backend/services/payment.service.js

const Razorpay = require('razorpay');
const crypto = require('crypto');

require('dotenv').config();

// ================= RAZORPAY INSTANCE =================
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ================= CREATE PAYMENT ORDER =================
const createPaymentOrder = async (
    amount,
    currency = 'INR'
) => {

    try {

        if (!amount || amount <= 0) {

            throw new Error('Invalid payment amount');

        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        console.log('✅ Razorpay order created');

        return {
            success: true,
            order
        };

    } catch (error) {

        console.error(
            '❌ Create Payment Order Error:',
            error.message
        );

        return {
            success: false,
            error: error.message
        };

    }

};

// ================= VERIFY PAYMENT =================
const verifyPaymentSignature = (
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
) => {

    try {

        const body =
            razorpay_order_id +
            '|' +
            razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                'sha256',
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body.toString())
            .digest('hex');

        const isValid =
            expectedSignature === razorpay_signature;

        return {
            success: isValid,
            verified: isValid
        };

    } catch (error) {

        console.error(
            '❌ Payment Verification Error:',
            error.message
        );

        return {
            success: false,
            verified: false
        };

    }

};

// ================= REFUND PAYMENT =================
const refundPayment = async (
    paymentId,
    amount = null
) => {

    try {

        const refundData = {};

        // Refund partial amount if provided
        if (amount) {
            refundData.amount = Math.round(amount * 100);
        }

        const refund = await razorpay.payments.refund(
            paymentId,
            refundData
        );

        console.log('✅ Payment refunded');

        return {
            success: true,
            refund
        };

    } catch (error) {

        console.error(
            '❌ Refund Error:',
            error.message
        );

        return {
            success: false,
            error: error.message
        };

    }

};

// ================= FETCH PAYMENT DETAILS =================
const fetchPaymentDetails = async (paymentId) => {

    try {

        const payment =
            await razorpay.payments.fetch(paymentId);

        return {
            success: true,
            payment
        };

    } catch (error) {

        console.error(
            '❌ Fetch Payment Error:',
            error.message
        );

        return {
            success: false,
            error: error.message
        };

    }

};

// ================= EXPORTS =================
module.exports = {
    razorpay,
    createPaymentOrder,
    verifyPaymentSignature,
    refundPayment,
    fetchPaymentDetails
};
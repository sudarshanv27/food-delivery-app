// backend/services/notification.service.js

require('dotenv').config();

// ================= SEND PUSH NOTIFICATION =================
const sendPushNotification = async (
    userId,
    title,
    body,
    data = {}
) => {

    try {

        // ================= DEMO / PLACEHOLDER =================
        console.log(`
🔔 Push Notification Sent
--------------------------------
User ID : ${userId}
Title   : ${title}
Message : ${body}
Data    : ${JSON.stringify(data)}
--------------------------------
        `);

        /*
        =====================================================
        FIREBASE CLOUD MESSAGING (FCM) IMPLEMENTATION
        =====================================================

        Example:

        const admin = require('firebase-admin');

        await admin.messaging().send({
            token: userDeviceToken,
            notification: {
                title,
                body
            },
            data
        });

        =====================================================
        */

        return {
            success: true,
            message: 'Notification sent successfully'
        };

    } catch (error) {

        console.error(
            '❌ Push Notification Error:',
            error.message
        );

        return {
            success: false,
            error: error.message
        };

    }

};

// ================= ORDER STATUS NOTIFICATION =================
const sendOrderStatusNotification = async (
    userId,
    orderNumber,
    status
) => {

    const statusMessages = {
        pending: 'Your order has been placed successfully.',
        confirmed: 'Your order has been confirmed.',
        preparing: 'Your food is being prepared.',
        out_for_delivery: 'Your order is out for delivery.',
        delivered: 'Your order has been delivered.',
        cancelled: 'Your order has been cancelled.'
    };

    return await sendPushNotification(
        userId,
        `Order ${orderNumber}`,
        statusMessages[status] || 'Order status updated',
        {
            orderNumber,
            status
        }
    );

};

// ================= EXPORTS =================
module.exports = {
    sendPushNotification,
    sendOrderStatusNotification
};
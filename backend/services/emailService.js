// backend/services/email.service.js

const nodemailer = require('nodemailer');

require('dotenv').config();

// ================= EMAIL TRANSPORTER =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ================= VERIFY EMAIL SERVICE =================
transporter.verify((error, success) => {

    if (error) {
        console.error('❌ Email Service Error:', error.message);
    } else {
        console.log('📧 Email Service Ready');
    }

});

// ================= SEND ORDER CONFIRMATION =================
const sendOrderConfirmation = async (userEmail, orderDetails) => {

    try {

        const mailOptions = {
            from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Order Confirmation - ${orderDetails.order_number}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    
                    <h1 style="color: #ff4757;">
                        🎉 Order Confirmed!
                    </h1>

                    <p>
                        Thank you for ordering with us.
                    </p>

                    <h3>Order Details</h3>

                    <table style="border-collapse: collapse; width: 100%;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">
                                Order Number:
                            </td>
                            <td style="padding: 8px;">
                                ${orderDetails.order_number}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 8px; font-weight: bold;">
                                Total Amount:
                            </td>
                            <td style="padding: 8px;">
                                ₹${orderDetails.total_amount}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 8px; font-weight: bold;">
                                Payment Method:
                            </td>
                            <td style="padding: 8px;">
                                ${orderDetails.payment_method || 'Online'}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 8px; font-weight: bold;">
                                Delivery Time:
                            </td>
                            <td style="padding: 8px;">
                                30 - 40 Minutes
                            </td>
                        </tr>
                    </table>

                    <br />

                    <p>
                        We are preparing your delicious food 🍕🍔🍟
                    </p>

                    <hr />

                    <p style="font-size: 12px; color: gray;">
                        Food Delivery App Team
                    </p>

                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log('✅ Order confirmation email sent');

        return true;

    } catch (error) {

        console.error('❌ Email Sending Error:', error.message);

        return false;

    }

};

// ================= SEND CUSTOM EMAIL =================
const sendCustomEmail = async (to, subject, html) => {

    try {

        await transporter.sendMail({
            from: `"Food Delivery App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log('✅ Custom email sent');

        return true;

    } catch (error) {

        console.error('❌ Custom Email Error:', error.message);

        return false;

    }

};

// ================= EXPORTS =================
module.exports = {
    sendOrderConfirmation,
    sendCustomEmail
};
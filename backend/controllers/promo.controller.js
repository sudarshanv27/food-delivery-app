// backend/controllers/promo.controller.js

require('dotenv').config();

const { Pool } = require('pg');

// ================= DATABASE =================
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'food_delivery',
    password: process.env.DB_PASSWORD || 'sudarshan',
    port: process.env.DB_PORT || 5432,
});

// ================= VALIDATE PROMO =================
const validatePromo = async (req, res) => {

    const {
        code,
        subtotal
    } = req.body;

    try {

        // ================= VALIDATION =================
        if (!code || !subtotal) {

            return res.status(400).json({
                success: false,
                message: 'Promo code and subtotal are required'
            });

        }

        // ================= FETCH PROMO =================
        const promoResult = await pool.query(`
            SELECT *
            FROM promo_codes
            WHERE code = $1
            AND is_active = true
            AND expires_at > NOW()
        `, [code.toUpperCase()]);

        // Invalid promo
        if (promoResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                valid: false,
                message: 'Invalid or expired promo code'
            });

        }

        const promo = promoResult.rows[0];

        // ================= MINIMUM ORDER CHECK =================
        if (
            promo.min_order_amount &&
            subtotal < promo.min_order_amount
        ) {

            return res.status(400).json({
                success: false,
                valid: false,
                message: `Minimum order amount is ₹${promo.min_order_amount}`
            });

        }

        // ================= CALCULATE DISCOUNT =================
        let discount = 0;

        // Percentage discount
        if (promo.discount_type === 'percentage') {

            discount =
                (subtotal * promo.discount_value) / 100;

            // Max discount limit
            if (promo.max_discount) {

                discount = Math.min(
                    discount,
                    promo.max_discount
                );

            }

        }

        // Fixed discount
        else if (promo.discount_type === 'fixed') {

            discount = promo.discount_value;

        }

        // Prevent negative total
        const finalAmount = Math.max(
            subtotal - discount,
            0
        );

        // ================= RESPONSE =================
        res.status(200).json({
            success: true,
            valid: true,
            message: 'Promo code applied successfully',
            discount: Number(discount.toFixed(2)),
            finalAmount: Number(finalAmount.toFixed(2)),
            promo: {
                code: promo.code,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value,
                max_discount: promo.max_discount
            }
        });

    } catch (error) {

        console.error('❌ Promo Error:', error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};

// ================= GET ALL ACTIVE PROMOS =================
const getActivePromos = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                promo_id,
                code,
                description,
                discount_type,
                discount_value,
                max_discount,
                min_order_amount,
                expires_at
            FROM promo_codes
            WHERE is_active = true
            AND expires_at > NOW()
            ORDER BY expires_at ASC
        `);

        res.status(200).json({
            success: true,
            promos: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

};

// ================= EXPORTS =================
module.exports = {
    validatePromo,
    getActivePromos
};
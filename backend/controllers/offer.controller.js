// backend/controllers/offer.controller.js
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all active offers for a restaurant
const getRestaurantOffers = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const result = await pool.query(
            `SELECT * FROM offers WHERE restaurant_id = $1 AND is_active = true 
             AND valid_until > NOW() ORDER BY created_at DESC`,
            [restaurantId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Offers Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch offers' });
    }
};

// Validate and apply offer
const validateOffer = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        
        const result = await pool.query(
            `SELECT * FROM offers WHERE code = $1 AND is_active = true 
             AND valid_until > NOW() AND (usage_limit IS NULL OR used_count < usage_limit)`,
            [code]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
        }
        
        const offer = result.rows[0];
        
        if (subtotal < offer.min_order_amount) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order amount of ₹${offer.min_order_amount} required` 
            });
        }
        
        let discount = 0;
        if (offer.discount_type === 'percentage') {
            discount = (subtotal * offer.discount_value) / 100;
            if (offer.max_discount) {
                discount = Math.min(discount, offer.max_discount);
            }
        } else {
            discount = offer.discount_value;
        }
        
        res.json({
            success: true,
            data: {
                offer_id: offer.offer_id,
                discount,
                message: `Coupon applied! You saved ₹${discount}`
            }
        });
    } catch (error) {
        console.error('Validate Offer Error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate offer' });
    }
};

// Create offer (Restaurant Owner only)
const createOffer = async (req, res) => {
    try {
        const { restaurant_id, code, title, description, discount_type, discount_value, min_order_amount, max_discount, valid_until, usage_limit } = req.body;
        const offerId = uuidv4();
        
        // Check if user owns this restaurant
        const restaurantCheck = await pool.query(
            `SELECT * FROM restaurants WHERE restaurant_id = $1 AND owner_id = $2`,
            [restaurant_id, req.user.userId]
        );
        
        if (restaurantCheck.rows.length === 0 && req.user.userType !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        await pool.query(
            `INSERT INTO offers (offer_id, restaurant_id, code, title, description, discount_type, 
             discount_value, min_order_amount, max_discount, valid_until, usage_limit)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [offerId, restaurant_id, code.toUpperCase(), title, description, discount_type, 
             discount_value, min_order_amount, max_discount, valid_until, usage_limit]
        );
        
        res.status(201).json({ success: true, message: 'Offer created successfully' });
    } catch (error) {
        console.error('Create Offer Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create offer' });
    }
};

module.exports = {
    getRestaurantOffers,
    validateOffer,
    createOffer
};
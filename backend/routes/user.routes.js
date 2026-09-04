// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, full_name, email, phone, user_type, avatar_url, created_at 
             FROM users WHERE user_id = $1`,
            [req.user.userId]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { full_name, phone, avatar_url } = req.body;
        await pool.query(
            `UPDATE users SET full_name = COALESCE($1, full_name), 
             phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url),
             updated_at = CURRENT_TIMESTAMP WHERE user_id = $4`,
            [full_name, phone, avatar_url, req.user.userId]
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Get user addresses
router.get('/addresses', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC`,
            [req.user.userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
    }
});

// Add address
router.post('/addresses', authenticate, async (req, res) => {
    try {
        const { address, latitude, longitude, landmark, address_type, is_default } = req.body;
        const addressId = require('uuid').v4();

        if (is_default) {
            await pool.query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [req.user.userId]);
        }

        await pool.query(
            `INSERT INTO addresses (address_id, user_id, address, latitude, longitude, landmark, address_type, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [addressId, req.user.userId, address, latitude, longitude, landmark, address_type, is_default || false]
        );
        res.status(201).json({ success: true, message: 'Address added' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
});

// Delete address
router.delete('/addresses/:id', authenticate, async (req, res) => {
    try {
        await pool.query(`DELETE FROM addresses WHERE address_id = $1 AND user_id = $2`, [req.params.id, req.user.userId]);
        res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete address' });
    }
});

module.exports = router;
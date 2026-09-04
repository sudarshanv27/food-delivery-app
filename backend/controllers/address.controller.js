// backend/controllers/address.controller.js
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get user addresses
const getAddresses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
            [userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Addresses Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
    }
};

// Add address
const addAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { address, latitude, longitude, landmark, address_type, is_default } = req.body;
        const addressId = uuidv4();

        if (is_default) {
            await pool.query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
        }

        await pool.query(
            `INSERT INTO addresses (address_id, user_id, address, latitude, longitude, landmark, address_type, is_default)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [addressId, userId, address, latitude, longitude, landmark, address_type, is_default || false]
        );

        res.status(201).json({ success: true, message: 'Address added successfully', data: { address_id: addressId } });
    } catch (error) {
        console.error('Add Address Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { address, latitude, longitude, landmark, address_type, is_default } = req.body;

        if (is_default) {
            await pool.query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
        }

        await pool.query(
            `UPDATE addresses SET address = COALESCE($1, address), latitude = COALESCE($2, latitude),
             longitude = COALESCE($3, longitude), landmark = COALESCE($4, landmark),
             address_type = COALESCE($5, address_type), is_default = COALESCE($6, is_default),
             updated_at = CURRENT_TIMESTAMP
             WHERE address_id = $7 AND user_id = $8`,
            [address, latitude, longitude, landmark, address_type, is_default, id, userId]
        );

        res.json({ success: true, message: 'Address updated successfully' });
    } catch (error) {
        console.error('Update Address Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update address' });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await pool.query(`DELETE FROM addresses WHERE address_id = $1 AND user_id = $2`, [id, userId]);
        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete Address Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete address' });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await pool.query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
        await pool.query(`UPDATE addresses SET is_default = true WHERE address_id = $1 AND user_id = $2`, [id, userId]);

        res.json({ success: true, message: 'Default address set successfully' });
    } catch (error) {
        console.error('Set Default Address Error:', error);
        res.status(500).json({ success: false, message: 'Failed to set default address' });
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
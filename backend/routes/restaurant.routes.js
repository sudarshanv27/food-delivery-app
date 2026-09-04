// backend/routes/restaurant.routes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

// ================= PUBLIC ROUTES =================

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                restaurant_id as id,
                name,
                description,
                address,
                cuisine_types,
                avg_rating as rating,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time as delivery_time,
                is_open,
                logo_url,
                cover_image_url
            FROM restaurants 
            WHERE is_active = true 
            ORDER BY avg_rating DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurants'
        });
    }
});

// Get popular restaurants
router.get('/popular', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                restaurant_id as id,
                name,
                cuisine_types,
                avg_rating as rating,
                delivery_fee,
                estimated_delivery_time as delivery_time
            FROM restaurants 
            WHERE is_active = true 
            ORDER BY avg_rating DESC 
            LIMIT 10
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching popular restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch popular restaurants'
        });
    }
});

// Get cuisine categories
router.get('/categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT UNNEST(cuisine_types) as category
            FROM restaurants
            WHERE is_active = true
            ORDER BY category
        `);

        res.json({
            success: true,
            data: result.rows.map(row => row.category)
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// Search restaurants
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const result = await pool.query(`
            SELECT 
                restaurant_id as id,
                name,
                description,
                address,
                cuisine_types,
                avg_rating as rating,
                delivery_fee,
                estimated_delivery_time as delivery_time
            FROM restaurants 
            WHERE (name ILIKE $1 OR array_to_string(cuisine_types, ',') ILIKE $1)
            AND is_active = true
        `, [`%${query}%`]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error searching restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search restaurants'
        });
    }
});

// Get nearby restaurants (based on location)
router.get('/nearby/:lat/:lng', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                restaurant_id as id,
                name,
                description,
                address,
                cuisine_types,
                avg_rating as rating,
                delivery_fee,
                estimated_delivery_time as delivery_time
            FROM restaurants 
            WHERE is_active = true
            ORDER BY avg_rating DESC
            LIMIT 20
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby restaurants'
        });
    }
});

// Get restaurant by ID with menu
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get restaurant details
        const restaurantResult = await pool.query(`
            SELECT 
                restaurant_id as id,
                name,
                description,
                address,
                cuisine_types,
                avg_rating as rating,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time as delivery_time,
                is_open,
                logo_url,
                cover_image_url
            FROM restaurants 
            WHERE restaurant_id = $1 AND is_active = true
        `, [id]);

        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Get menu items
        const menuResult = await pool.query(`
            SELECT 
                item_id as id,
                name,
                description,
                price,
                image_url,
                is_vegetarian,
                is_available,
                preparation_time
            FROM menu_items 
            WHERE restaurant_id = $1 AND is_available = true
            ORDER BY name
        `, [id]);

        res.json({
            success: true,
            data: {
                ...restaurantResult.rows[0],
                menu: menuResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant details'
        });
    }
});

// ================= ADMIN ROUTES (Protected) =================

// Add new restaurant (Admin only)
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            name,
            description,
            address,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time
        } = req.body;

        // Check if user is admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const result = await pool.query(`
            INSERT INTO restaurants (
                name, description, address, cuisine_types, 
                delivery_fee, min_order_amount, estimated_delivery_time, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING restaurant_id as id, name
        `, [name, description, address, cuisine_types, delivery_fee, min_order_amount, estimated_delivery_time]);

        res.status(201).json({
            success: true,
            message: 'Restaurant added successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add restaurant'
        });
    }
});

// Update restaurant (Admin only)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const {
            name,
            description,
            address,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time,
            is_open
        } = req.body;

        const result = await pool.query(`
            UPDATE restaurants 
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                address = COALESCE($3, address),
                cuisine_types = COALESCE($4, cuisine_types),
                delivery_fee = COALESCE($5, delivery_fee),
                min_order_amount = COALESCE($6, min_order_amount),
                estimated_delivery_time = COALESCE($7, estimated_delivery_time),
                is_open = COALESCE($8, is_open),
                updated_at = CURRENT_TIMESTAMP
            WHERE restaurant_id = $9
            RETURNING restaurant_id as id, name
        `, [name, description, address, cuisine_types, delivery_fee, min_order_amount, estimated_delivery_time, is_open, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update restaurant'
        });
    }
});

// Delete restaurant (soft delete - Admin only)
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const result = await pool.query(`
            UPDATE restaurants 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE restaurant_id = $1 AND is_active = true
            RETURNING restaurant_id as id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found or already deleted'
            });
        }

        res.json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete restaurant'
        });
    }
});
// Add these routes before module.exports

// Filter restaurants (by price, rating, cuisine)
router.get('/filter', async (req, res) => {
    try {
        const { min_rating, max_price, cuisine, veg_only, sort_by } = req.query;
        
        let query = `
            SELECT r.* FROM restaurants r
            WHERE r.is_active = true
        `;
        const params = [];
        let paramIndex = 1;
        
        if (min_rating) {
            query += ` AND r.avg_rating >= $${paramIndex++}`;
            params.push(min_rating);
        }
        
        if (cuisine) {
            query += ` AND $${paramIndex++} = ANY(r.cuisine_types)`;
            params.push(cuisine);
        }
        
        let orderBy = 'ORDER BY r.avg_rating DESC';
        if (sort_by === 'delivery_time') orderBy = 'ORDER BY r.estimated_delivery_time ASC';
        if (sort_by === 'delivery_fee') orderBy = 'ORDER BY r.delivery_fee ASC';
        if (sort_by === 'price_high') orderBy = 'ORDER BY r.min_order_amount DESC';
        if (sort_by === 'price_low') orderBy = 'ORDER BY r.min_order_amount ASC';
        
        query += ` ${orderBy}`;
        
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Filter Restaurants Error:', error);
        res.status(500).json({ success: false, message: 'Failed to filter restaurants' });
    }
});

// Get nearby restaurants (based on lat/lng)
router.get('/nearby/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        // Simple distance calculation - you can use PostGIS for production
        const result = await pool.query(`
            SELECT r.*,
            (6371 * acos(
                cos(radians($1)) * cos(radians(COALESCE(r.latitude, 0))) *
                cos(radians(COALESCE(r.longitude, 0)) - radians($2)) +
                sin(radians($1)) * sin(radians(COALESCE(r.latitude, 0)))
            )) AS distance
            FROM restaurants r
            WHERE r.is_active = true
            ORDER BY distance ASC
            LIMIT 50
        `, [lat, lng]);
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Nearby Restaurants Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch nearby restaurants' });
    }
});
module.exports = router;
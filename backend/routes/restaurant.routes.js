// backend/routes/restaurant.routes.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

// ============================================================
// PUBLIC ROUTES
// ============================================================

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


// ============================================================
// GET POPULAR RESTAURANTS
// ============================================================

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


// ============================================================
// GET CUISINE CATEGORIES
// ============================================================

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


// ============================================================
// SEARCH RESTAURANTS
// ============================================================

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
            WHERE (
                name ILIKE $1
                OR array_to_string(cuisine_types, ',') ILIKE $1
            )
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


// ============================================================
// FILTER RESTAURANTS
// IMPORTANT: This route must come BEFORE /:id
// ============================================================

router.get('/filter', async (req, res) => {
    try {
        const {
            min_rating,
            max_price,
            cuisine,
            veg_only,
            sort_by
        } = req.query;

        let query = `
            SELECT r.*
            FROM restaurants r
            WHERE r.is_active = true
        `;

        const params = [];
        let paramIndex = 1;


        // Minimum rating filter
        if (min_rating) {
            query += ` AND r.avg_rating >= $${paramIndex++}`;
            params.push(min_rating);
        }


        // Cuisine filter
        if (cuisine) {
            query += ` AND $${paramIndex++} = ANY(r.cuisine_types)`;
            params.push(cuisine);
        }


        // Maximum price filter
        if (max_price) {
            query += ` AND r.min_order_amount <= $${paramIndex++}`;
            params.push(max_price);
        }


        // Sorting
        let orderBy = 'ORDER BY r.avg_rating DESC';

        if (sort_by === 'delivery_time') {
            orderBy = 'ORDER BY r.estimated_delivery_time ASC';
        }

        if (sort_by === 'delivery_fee') {
            orderBy = 'ORDER BY r.delivery_fee ASC';
        }

        if (sort_by === 'price_high') {
            orderBy = 'ORDER BY r.min_order_amount DESC';
        }

        if (sort_by === 'price_low') {
            orderBy = 'ORDER BY r.min_order_amount ASC';
        }

        query += ` ${orderBy}`;


        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Filter Restaurants Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to filter restaurants'
        });
    }
});


// ============================================================
// GET NEARBY RESTAURANTS
// Based on latitude and longitude
// ============================================================

router.get('/nearby/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;

        // Simple distance calculation.
        // PostGIS can be used later for production.
        const result = await pool.query(`
            SELECT 
                r.*,
                (
                    6371 * acos(
                        cos(radians($1))
                        * cos(radians(COALESCE(r.latitude, 0)))
                        * cos(
                            radians(COALESCE(r.longitude, 0))
                            - radians($2)
                        )
                        + sin(radians($1))
                        * sin(radians(COALESCE(r.latitude, 0)))
                    )
                ) AS distance
            FROM restaurants r
            WHERE r.is_active = true
            ORDER BY distance ASC
            LIMIT 50
        `, [lat, lng]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Nearby Restaurants Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby restaurants'
        });
    }
});


// ============================================================
// GET RESTAURANT BY ID WITH MENU
// IMPORTANT: This route must come AFTER specific routes
// ============================================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;


        // ----------------------------------------------------
        // Get restaurant details
        // ----------------------------------------------------

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
            WHERE restaurant_id = $1
            AND is_active = true
        `, [id]);


        // Restaurant not found
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }


        // ----------------------------------------------------
        // Get menu items
        // ----------------------------------------------------

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
            WHERE restaurant_id = $1
            AND is_available = true
            ORDER BY name
        `, [id]);


        // ----------------------------------------------------
        // Return restaurant + menu
        // ----------------------------------------------------

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


// ============================================================
// ADMIN ROUTES (PROTECTED)
// ============================================================


// ============================================================
// ADD NEW RESTAURANT
// Admin only
// ============================================================

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


        // Check admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }


        const result = await pool.query(`
            INSERT INTO restaurants (
                name,
                description,
                address,
                cuisine_types,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING restaurant_id as id, name
        `, [
            name,
            description,
            address,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time
        ]);


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


// ============================================================
// UPDATE RESTAURANT
// Admin only
// ============================================================

router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;


        // Check admin
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
            SET
                name = COALESCE($1, name),
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
        `, [
            name,
            description,
            address,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time,
            is_open,
            id
        ]);


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


// ============================================================
// DELETE RESTAURANT
// Soft delete - Admin only
// ============================================================

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;


        // Check admin
        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }


        const result = await pool.query(`
            UPDATE restaurants
            SET
                is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE restaurant_id = $1
            AND is_active = true
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


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
// backend/controllers/restaurant.controller.js
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const {
    sendSuccess,
    sendError,
    sendNotFound,
    sendInternalError,
    sendPaginated
} = require('../utils/responseHandler');

// ================= GET NEARBY RESTAURANTS =================
const getNearbyRestaurants = async (req, res) => {
    try {
        const { lat, lng, limit = 50 } = req.query;

        const result = await pool.query(`
            SELECT
                restaurant_id,
                name,
                description,
                address,
                logo_url,
                cuisine_types,
                avg_rating,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time,
                is_open,
                is_active
            FROM restaurants
            WHERE is_active = true
            ORDER BY avg_rating DESC
            LIMIT $1
        `, [limit]);

        const countResult = await pool.query('SELECT COUNT(*) FROM restaurants WHERE is_active = true');

        return sendSuccess(res, {
            restaurants: result.rows,
            count: result.rows.length,
            total: parseInt(countResult.rows[0].count)
        }, 'Restaurants fetched successfully');

    } catch (error) {
        console.error('Get Nearby Restaurants Error:', error.message);
        return sendInternalError(res, 'Failed to fetch restaurants', error);
    }
};

// ================= GET RESTAURANT BY ID =================
const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurantResult = await pool.query(`
            SELECT 
                restaurant_id,
                name,
                description,
                address,
                logo_url,
                cover_image_url,
                cuisine_types,
                avg_rating,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time,
                is_open,
                is_active
            FROM restaurants
            WHERE restaurant_id = $1 AND is_active = true
        `, [id]);

        if (restaurantResult.rows.length === 0) {
            return sendNotFound(res, 'Restaurant not found');
        }

        const menuResult = await pool.query(`
            SELECT 
                item_id,
                name,
                description,
                price,
                image_url,
                is_vegetarian,
                is_available,
                preparation_time
            FROM menu_items
            WHERE restaurant_id = $1 AND is_available = true
            ORDER BY name ASC
        `, [id]);

        return sendSuccess(res, {
            restaurant: restaurantResult.rows[0],
            menu: menuResult.rows,
            total_menu_items: menuResult.rows.length
        }, 'Restaurant details fetched successfully');

    } catch (error) {
        console.error('Get Restaurant Error:', error.message);
        return sendInternalError(res, 'Failed to fetch restaurant details', error);
    }
};

// ================= SEARCH RESTAURANTS =================
const searchRestaurants = async (req, res) => {
    try {
        const { query } = req.params;
        const { limit = 30 } = req.query;

        if (!query || query.trim().length < 2) {
            return sendSuccess(res, {
                restaurants: [],
                count: 0,
                search_term: query || ''
            }, 'No search term provided');
        }

        const searchTerm = `%${query.trim()}%`;

        const result = await pool.query(`
            SELECT 
                restaurant_id,
                name,
                logo_url,
                avg_rating,
                cuisine_types,
                delivery_fee,
                estimated_delivery_time,
                is_open
            FROM restaurants
            WHERE (name ILIKE $1 OR cuisine_types ILIKE $1) AND is_active = true
            ORDER BY avg_rating DESC
            LIMIT $2
        `, [searchTerm, limit]);

        const countResult = await pool.query(`
            SELECT COUNT(*) 
            FROM restaurants 
            WHERE (name ILIKE $1 OR cuisine_types ILIKE $1) AND is_active = true
        `, [searchTerm]);

        return sendSuccess(res, {
            restaurants: result.rows,
            count: result.rows.length,
            total: parseInt(countResult.rows[0].count),
            search_term: query
        }, 'Search completed successfully');

    } catch (error) {
        console.error('Restaurant Search Error:', error.message);
        return sendInternalError(res, 'Search failed', error);
    }
};

// ================= GET RESTAURANTS WITH PAGINATION =================
const getRestaurantsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { cuisine, sort_by = 'rating' } = req.query;

        let sqlQuery = `
            SELECT 
                restaurant_id,
                name,
                logo_url,
                cuisine_types,
                avg_rating,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time,
                is_open
            FROM restaurants
            WHERE is_active = true
        `;

        const values = [];
        let paramIndex = 1;

        if (cuisine && cuisine !== 'all') {
            sqlQuery += ` AND cuisine_types ILIKE $${paramIndex}`;
            values.push(`%${cuisine}%`);
            paramIndex++;
        }

        switch (sort_by) {
            case 'rating':
                sqlQuery += ` ORDER BY avg_rating DESC NULLS LAST`;
                break;
            case 'delivery_time':
                sqlQuery += ` ORDER BY estimated_delivery_time ASC`;
                break;
            case 'delivery_fee':
                sqlQuery += ` ORDER BY delivery_fee ASC`;
                break;
            case 'name':
                sqlQuery += ` ORDER BY name ASC`;
                break;
            default:
                sqlQuery += ` ORDER BY avg_rating DESC NULLS LAST`;
        }

        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(limit, offset);

        const result = await pool.query(sqlQuery, values);

        let countQuery = 'SELECT COUNT(*) FROM restaurants WHERE is_active = true';
        let countValues = [];
        let countIndex = 1;

        if (cuisine && cuisine !== 'all') {
            countQuery += ` AND cuisine_types ILIKE $${countIndex}`;
            countValues.push(`%${cuisine}%`);
        }

        const totalResult = await pool.query(countQuery, countValues);
        const total = parseInt(totalResult.rows[0].count);

        return sendPaginated(res, result.rows, total, page, limit);

    } catch (error) {
        console.error('Get Restaurants Paginated Error:', error.message);
        return sendInternalError(res, 'Failed to fetch restaurants', error);
    }
};

// ================= GET RESTAURANT CATEGORIES =================
const getRestaurantCategories = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT 
                UNNEST(string_to_array(cuisine_types, ',')) as category
            FROM restaurants
            WHERE is_active = true AND cuisine_types IS NOT NULL
            ORDER BY category ASC
        `);

        const categories = result.rows.map(row => row.category.trim());

        return sendSuccess(res, {
            categories: ['All', ...categories],
            count: categories.length
        }, 'Categories fetched successfully');

    } catch (error) {
        console.error('Get Restaurant Categories Error:', error.message);
        return sendInternalError(res, 'Failed to fetch categories', error);
    }
};

// ================= GET POPULAR RESTAURANTS =================
const getPopularRestaurants = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const result = await pool.query(`
            SELECT 
                r.restaurant_id,
                r.name,
                r.logo_url,
                r.avg_rating,
                r.cuisine_types,
                r.delivery_fee,
                COUNT(o.order_id) as total_orders
            FROM restaurants r
            LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
            WHERE r.is_active = true
            GROUP BY r.restaurant_id
            ORDER BY total_orders DESC, r.avg_rating DESC
            LIMIT $1
        `, [limit]);

        return sendSuccess(res, {
            restaurants: result.rows,
            count: result.rows.length
        }, 'Popular restaurants fetched successfully');

    } catch (error) {
        console.error('Get Popular Restaurants Error:', error.message);
        return sendInternalError(res, 'Failed to fetch popular restaurants', error);
    }
};

// ================= ADD RESTAURANT (Admin only) =================
const addRestaurant = async (req, res) => {
    try {
        const {
            name,
            description,
            address,
            logo_url,
            cover_image_url,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time
        } = req.body;

        if (!name || !address) {
            return sendError(res, 'Name and address are required', 400);
        }

        const restaurantId = uuidv4();

        await pool.query(`
            INSERT INTO restaurants (
                restaurant_id, name, description, address, logo_url,
                cover_image_url, cuisine_types, delivery_fee, 
                min_order_amount, estimated_delivery_time, is_active, is_open
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, true)
        `, [restaurantId, name, description, address, logo_url,
            cover_image_url, cuisine_types, delivery_fee, min_order_amount, estimated_delivery_time]);

        return sendSuccess(res, { restaurant_id: restaurantId }, 'Restaurant added successfully', 201);

    } catch (error) {
        console.error('Add Restaurant Error:', error.message);
        return sendInternalError(res, 'Failed to add restaurant', error);
    }
};

// ================= UPDATE RESTAURANT (Admin only) =================
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            address,
            logo_url,
            cover_image_url,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time,
            is_open,
            is_active
        } = req.body;

        // Check if restaurant exists
        const checkResult = await pool.query(
            'SELECT restaurant_id FROM restaurants WHERE restaurant_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return sendNotFound(res, 'Restaurant not found');
        }

        const result = await pool.query(`
            UPDATE restaurants 
            SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                address = COALESCE($3, address),
                logo_url = COALESCE($4, logo_url),
                cover_image_url = COALESCE($5, cover_image_url),
                cuisine_types = COALESCE($6, cuisine_types),
                delivery_fee = COALESCE($7, delivery_fee),
                min_order_amount = COALESCE($8, min_order_amount),
                estimated_delivery_time = COALESCE($9, estimated_delivery_time),
                is_open = COALESCE($10, is_open),
                is_active = COALESCE($11, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE restaurant_id = $12
            RETURNING *
        `, [name, description, address, logo_url, cover_image_url,
            cuisine_types, delivery_fee, min_order_amount, estimated_delivery_time,
            is_open, is_active, id]);

        return sendSuccess(res, result.rows[0], 'Restaurant updated successfully');

    } catch (error) {
        console.error('Update Restaurant Error:', error.message);
        return sendInternalError(res, 'Failed to update restaurant', error);
    }
};

// ================= DELETE RESTAURANT (Admin only - Soft Delete) =================
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if restaurant exists
        const checkResult = await pool.query(
            'SELECT restaurant_id FROM restaurants WHERE restaurant_id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return sendNotFound(res, 'Restaurant not found');
        }

        // Soft delete - just mark as inactive
        await pool.query(
            'UPDATE restaurants SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE restaurant_id = $1',
            [id]
        );

        return sendSuccess(res, null, 'Restaurant deleted successfully');

    } catch (error) {
        console.error('Delete Restaurant Error:', error.message);
        return sendInternalError(res, 'Failed to delete restaurant', error);
    }
};

module.exports = {
    getNearbyRestaurants,
    getRestaurantById,
    searchRestaurants,
    getRestaurantsPaginated,
    getRestaurantCategories,
    getPopularRestaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant
};
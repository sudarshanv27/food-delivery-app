// backend/models/Restaurant.js

const { pool } = require("../config/database");

// =====================================================
// RESTAURANT MODEL
// =====================================================

const Restaurant = {

    // =================================================
    // GET ALL ACTIVE RESTAURANTS
    // =================================================

    async getAll() {
        const result = await pool.query(`
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
            WHERE is_active = true
            ORDER BY avg_rating DESC NULLS LAST
        `);

        return result.rows;
    },


    // =================================================
    // GET RESTAURANT BY ID
    // =================================================

    async findById(restaurantId) {
        const result = await pool.query(`
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
            WHERE restaurant_id = $1
        `, [restaurantId]);

        return result.rows[0] || null;
    },


    // =================================================
    // CREATE RESTAURANT
    // =================================================

    async create(data) {

        const {
            restaurant_id,
            name,
            description,
            address,
            logo_url,
            cover_image_url,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time
        } = data;

        const result = await pool.query(`
            INSERT INTO restaurants (
                restaurant_id,
                name,
                description,
                address,
                logo_url,
                cover_image_url,
                cuisine_types,
                delivery_fee,
                min_order_amount,
                estimated_delivery_time,
                is_active,
                is_open
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, true, true
            )
            RETURNING *
        `, [
            restaurant_id,
            name,
            description,
            address,
            logo_url,
            cover_image_url,
            cuisine_types,
            delivery_fee,
            min_order_amount,
            estimated_delivery_time
        ]);

        return result.rows[0];
    },


    // =================================================
    // UPDATE RESTAURANT
    // =================================================

    async update(restaurantId, data) {

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
        } = data;

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
                estimated_delivery_time =
                    COALESCE($9, estimated_delivery_time),
                is_open = COALESCE($10, is_open),
                is_active = COALESCE($11, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE restaurant_id = $12
            RETURNING *
        `, [
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
            is_active,
            restaurantId
        ]);

        return result.rows[0] || null;
    },


    // =================================================
    // SOFT DELETE RESTAURANT
    // =================================================

    async delete(restaurantId) {

        const result = await pool.query(`
            UPDATE restaurants
            SET
                is_active = false,
                updated_at = CURRENT_TIMESTAMP
            WHERE restaurant_id = $1
            RETURNING restaurant_id
        `, [restaurantId]);

        return result.rows[0] || null;
    },


    // =================================================
    // CHECK RESTAURANT EXISTS
    // =================================================

    async exists(restaurantId) {

        const result = await pool.query(`
            SELECT restaurant_id
            FROM restaurants
            WHERE restaurant_id = $1
        `, [restaurantId]);

        return result.rows.length > 0;
    }

};


module.exports = Restaurant;
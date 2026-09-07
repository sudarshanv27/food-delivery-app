// backend/models/Menu.js

const { pool } = require("../config/database");

// =====================================================
// MENU MODEL
// =====================================================

const Menu = {

    // =================================================
    // GET ALL MENU ITEMS FOR RESTAURANT
    // =================================================

    async getByRestaurantId(restaurantId) {

        const result = await pool.query(`
            SELECT
                item_id,
                restaurant_id,
                name,
                description,
                price,
                image_url,
                is_vegetarian,
                is_available,
                preparation_time
            FROM menu_items
            WHERE restaurant_id = $1
            ORDER BY name ASC
        `, [restaurantId]);

        return result.rows;
    },


    // =================================================
    // GET AVAILABLE MENU ITEMS
    // =================================================

    async getAvailableByRestaurantId(restaurantId) {

        const result = await pool.query(`
            SELECT
                item_id,
                restaurant_id,
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
            ORDER BY name ASC
        `, [restaurantId]);

        return result.rows;
    },


    // =================================================
    // GET MENU ITEM BY ID
    // =================================================

    async findById(itemId) {

        const result = await pool.query(`
            SELECT
                item_id,
                restaurant_id,
                name,
                description,
                price,
                image_url,
                is_vegetarian,
                is_available,
                preparation_time
            FROM menu_items
            WHERE item_id = $1
        `, [itemId]);

        return result.rows[0] || null;
    },


    // =================================================
    // CREATE MENU ITEM
    // =================================================

    async create(data) {

        const {
            item_id,
            restaurant_id,
            name,
            description,
            price,
            image_url,
            is_vegetarian = false,
            is_available = true,
            preparation_time
        } = data;

        const result = await pool.query(`
            INSERT INTO menu_items (
                item_id,
                restaurant_id,
                name,
                description,
                price,
                image_url,
                is_vegetarian,
                is_available,
                preparation_time
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9
            )
            RETURNING *
        `, [
            item_id,
            restaurant_id,
            name,
            description,
            price,
            image_url,
            is_vegetarian,
            is_available,
            preparation_time
        ]);

        return result.rows[0];
    },


    // =================================================
    // UPDATE MENU ITEM
    // =================================================

    async update(itemId, data) {

        const {
            name,
            description,
            price,
            image_url,
            is_vegetarian,
            is_available,
            preparation_time
        } = data;

        const result = await pool.query(`
            UPDATE menu_items
            SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                image_url = COALESCE($4, image_url),
                is_vegetarian = COALESCE($5, is_vegetarian),
                is_available = COALESCE($6, is_available),
                preparation_time =
                    COALESCE($7, preparation_time)
            WHERE item_id = $8
            RETURNING *
        `, [
            name,
            description,
            price,
            image_url,
            is_vegetarian,
            is_available,
            preparation_time,
            itemId
        ]);

        return result.rows[0] || null;
    },


    // =================================================
    // DELETE MENU ITEM
    // =================================================

    async delete(itemId) {

        const result = await pool.query(`
            DELETE FROM menu_items
            WHERE item_id = $1
            RETURNING item_id
        `, [itemId]);

        return result.rows[0] || null;
    },


    // =================================================
    // CHANGE AVAILABILITY
    // =================================================

    async setAvailability(itemId, isAvailable) {

        const result = await pool.query(`
            UPDATE menu_items
            SET is_available = $1
            WHERE item_id = $2
            RETURNING *
        `, [
            isAvailable,
            itemId
        ]);

        return result.rows[0] || null;
    }

};


module.exports = Menu;
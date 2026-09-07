const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const {
    sendSuccess,
    sendError,
    sendNotFound,
    sendInternalError
} = require('../utils/responseHandler');

/**
 * GET /api/cart
 * Get the current user's cart with all items.
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(`
            SELECT
                c.cart_id,
                c.restaurant_id,
                r.name AS restaurant_name,
                ci.cart_item_id,
                ci.menu_item_id,
                ci.item_name,
                ci.quantity,
                ci.price,
                (ci.quantity * ci.price) AS total_price,
                ci.special_instructions,
                ci.created_at
            FROM carts c
            LEFT JOIN restaurants r
                ON c.restaurant_id = r.restaurant_id
            LEFT JOIN cart_items ci
                ON c.cart_id = ci.cart_id
            WHERE c.user_id = $1
            ORDER BY ci.created_at DESC
        `, [userId]);

        const rows = result.rows;

        if (rows.length === 0) {
            return sendSuccess(
                res,
                {
                    cart_id: null,
                    restaurant_id: null,
                    restaurant_name: null,
                    items: [],
                    subtotal: 0,
                    item_count: 0
                },
                'Cart is empty'
            );
        }

        const firstRow = rows[0];

        const items = rows
            .filter(row => row.cart_item_id !== null)
            .map(row => ({
                cart_item_id: row.cart_item_id,
                menu_item_id: row.menu_item_id,
                item_name: row.item_name,
                quantity: Number(row.quantity),
                price: Number(row.price),
                total_price: Number(row.total_price),
                special_instructions: row.special_instructions,
                created_at: row.created_at
            }));

        const subtotal = items.reduce(
            (sum, item) => sum + item.total_price,
            0
        );

        const itemCount = items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        return sendSuccess(
            res,
            {
                cart_id: firstRow.cart_id,
                restaurant_id: firstRow.restaurant_id,
                restaurant_name: firstRow.restaurant_name,
                items,
                subtotal,
                item_count: itemCount
            },
            'Cart fetched successfully'
        );

    } catch (error) {
        console.error('Get Cart Error:', error.message);
        return sendInternalError(
            res,
            'Failed to fetch cart',
            error
        );
    }
};


/**
 * POST /api/cart/add
 * Add a menu item to the user's cart.
 */
const addToCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;

        const {
            restaurant_id,
            item_id,
            quantity = 1,
            special_instructions = ''
        } = req.body;

        if (!restaurant_id || !item_id) {
            return sendError(
                res,
                'restaurant_id and item_id are required',
                400
            );
        }

        if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
            return sendError(
                res,
                'Quantity must be a positive integer',
                400
            );
        }

        const requestedQuantity = Number(quantity);

        await client.query('BEGIN');

        // Verify the restaurant and menu item from the database.
        const menuResult = await client.query(`
            SELECT
                mi.item_id,
                mi.name,
                mi.price,
                mi.is_available,
                mi.restaurant_id
            FROM menu_items mi
            WHERE mi.item_id = $1
              AND mi.restaurant_id = $2
        `, [item_id, restaurant_id]);

        if (menuResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return sendNotFound(
                res,
                'Menu item not found for this restaurant'
            );
        }

        const menuItem = menuResult.rows[0];

        if (!menuItem.is_available) {
            await client.query('ROLLBACK');

            return sendError(
                res,
                'This menu item is currently unavailable',
                400
            );
        }

        // Get the user's active cart.
        let cartResult = await client.query(`
            SELECT cart_id, restaurant_id
            FROM carts
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
            FOR UPDATE
        `, [userId]);

        let cartId;

        if (cartResult.rows.length === 0) {

            cartId = uuidv4();

            await client.query(`
                INSERT INTO carts (
                    cart_id,
                    user_id,
                    restaurant_id
                )
                VALUES ($1, $2, $3)
            `, [
                cartId,
                userId,
                restaurant_id
            ]);

        } else {

            cartId = cartResult.rows[0].cart_id;

            const existingRestaurantId =
                cartResult.rows[0].restaurant_id;

            if (
                existingRestaurantId &&
                existingRestaurantId !== restaurant_id
            ) {
                await client.query('ROLLBACK');

                return sendError(
                    res,
                    'Cart contains items from another restaurant. Clear the cart before adding items from a different restaurant.',
                    409
                );
            }

            // Make sure the cart is associated with this restaurant.
            if (!existingRestaurantId) {
                await client.query(`
                    UPDATE carts
                    SET restaurant_id = $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE cart_id = $2
                `, [
                    restaurant_id,
                    cartId
                ]);
            }
        }

        // Check whether this menu item already exists in the cart.
        const existingItemResult = await client.query(`
            SELECT
                cart_item_id,
                quantity
            FROM cart_items
            WHERE cart_id = $1
              AND menu_item_id = $2
            FOR UPDATE
        `, [
            cartId,
            item_id
        ]);

        let cartItemId;
        let finalQuantity;

        if (existingItemResult.rows.length > 0) {

            const existingItem = existingItemResult.rows[0];

            finalQuantity =
                Number(existingItem.quantity) + requestedQuantity;

            cartItemId = existingItem.cart_item_id;

            await client.query(`
                UPDATE cart_items
                SET quantity = $1,
                    price = $2,
                    special_instructions = $3
                WHERE cart_item_id = $4
            `, [
                finalQuantity,
                menuItem.price,
                special_instructions,
                cartItemId
            ]);

        } else {

            cartItemId = uuidv4();
            finalQuantity = requestedQuantity;

            await client.query(`
                INSERT INTO cart_items (
                    cart_item_id,
                    cart_id,
                    menu_item_id,
                    item_name,
                    quantity,
                    price,
                    special_instructions
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                cartItemId,
                cartId,
                menuItem.item_id,
                menuItem.name,
                finalQuantity,
                menuItem.price,
                special_instructions
            ]);
        }

        await client.query(`
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
        `, [cartId]);

        await client.query('COMMIT');

        return sendSuccess(
            res,
            {
                cart_id: cartId,
                cart_item_id: cartItemId,
                menu_item_id: menuItem.item_id,
                item_name: menuItem.name,
                quantity: finalQuantity,
                price: Number(menuItem.price)
            },
            'Item added to cart successfully',
            201
        );

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Add To Cart Error:', error.message);

        return sendInternalError(
            res,
            'Failed to add item to cart',
            error
        );

    } finally {
        client.release();
    }
};


/**
 * PUT /api/cart/:cartId
 * Update the quantity of a cart item.
 */
const updateCartItem = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.userId;

        if (
            quantity === undefined ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return sendError(
                res,
                'Quantity must be a non-negative integer',
                400
            );
        }

        const newQuantity = Number(quantity);

        const checkItem = await pool.query(`
            SELECT
                ci.cart_item_id,
                ci.cart_id
            FROM cart_items ci
            INNER JOIN carts c
                ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = $1
              AND c.user_id = $2
        `, [
            cartId,
            userId
        ]);

        if (checkItem.rows.length === 0) {
            return sendNotFound(
                res,
                'Cart item not found'
            );
        }

        if (newQuantity === 0) {

            await pool.query(`
                DELETE FROM cart_items
                WHERE cart_item_id = $1
            `, [cartId]);

            return sendSuccess(
                res,
                null,
                'Cart item removed successfully'
            );
        }

        await pool.query(`
            UPDATE cart_items
            SET quantity = $1
            WHERE cart_item_id = $2
        `, [
            newQuantity,
            cartId
        ]);

        await pool.query(`
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
        `, [
            checkItem.rows[0].cart_id
        ]);

        return sendSuccess(
            res,
            {
                cart_item_id: cartId,
                quantity: newQuantity
            },
            'Cart item updated successfully'
        );

    } catch (error) {
        console.error('Update Cart Item Error:', error.message);

        return sendInternalError(
            res,
            'Failed to update cart item',
            error
        );
    }
};


/**
 * DELETE /api/cart/:cartId
 * Remove one cart item.
 */
const removeFromCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const userId = req.user.userId;

        const checkItem = await pool.query(`
            SELECT
                ci.cart_item_id,
                ci.cart_id
            FROM cart_items ci
            INNER JOIN carts c
                ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = $1
              AND c.user_id = $2
        `, [
            cartId,
            userId
        ]);

        if (checkItem.rows.length === 0) {
            return sendNotFound(
                res,
                'Cart item not found'
            );
        }

        await pool.query(`
            DELETE FROM cart_items
            WHERE cart_item_id = $1
        `, [cartId]);

        await pool.query(`
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
        `, [
            checkItem.rows[0].cart_id
        ]);

        return sendSuccess(
            res,
            null,
            'Cart item removed successfully'
        );

    } catch (error) {
        console.error('Remove From Cart Error:', error.message);

        return sendInternalError(
            res,
            'Failed to remove cart item',
            error
        );
    }
};


/**
 * DELETE /api/cart
 * Clear the user's cart.
 */
const clearCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;

        await client.query('BEGIN');

        const cartResult = await client.query(`
            SELECT cart_id
            FROM carts
            WHERE user_id = $1
        `, [userId]);

        if (cartResult.rows.length === 0) {
            await client.query('COMMIT');

            return sendSuccess(
                res,
                null,
                'Cart is already empty'
            );
        }

        await client.query(`
            DELETE FROM carts
            WHERE user_id = $1
        `, [userId]);

        await client.query('COMMIT');

        return sendSuccess(
            res,
            null,
            'Cart cleared successfully'
        );

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Clear Cart Error:', error.message);

        return sendInternalError(
            res,
            'Failed to clear cart',
            error
        );

    } finally {
        client.release();
    }
};


/**
 * GET /api/cart/summary
 * Get cart subtotal, delivery fee, tax and total.
 */
const getCartSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(`
            SELECT
                c.cart_id,
                c.restaurant_id,
                r.name AS restaurant_name,
                COUNT(ci.cart_item_id) AS line_item_count,
                COALESCE(
                    SUM(ci.quantity * ci.price),
                    0
                ) AS subtotal,
                COALESCE(
                    SUM(ci.quantity),
                    0
                ) AS item_count
            FROM carts c
            LEFT JOIN restaurants r
                ON c.restaurant_id = r.restaurant_id
            LEFT JOIN cart_items ci
                ON c.cart_id = ci.cart_id
            WHERE c.user_id = $1
            GROUP BY
                c.cart_id,
                c.restaurant_id,
                r.name
            ORDER BY c.created_at DESC
            LIMIT 1
        `, [userId]);

        if (result.rows.length === 0) {
            return sendSuccess(
                res,
                {
                    cart_id: null,
                    restaurant_id: null,
                    restaurant_name: null,
                    item_count: 0,
                    subtotal: 0,
                    delivery_fee: 0,
                    tax: 0,
                    total: 0
                },
                'Cart is empty'
            );
        }

        const cart = result.rows[0];

        const subtotal = Number(cart.subtotal);
        const itemCount = Number(cart.item_count);

        const deliveryFee = subtotal > 0 ? 29 : 0;
        const tax = Number((subtotal * 0.05).toFixed(2));
        const total = Number(
            (subtotal + deliveryFee + tax).toFixed(2)
        );

        return sendSuccess(
            res,
            {
                cart_id: cart.cart_id,
                restaurant_id: cart.restaurant_id,
                restaurant_name: cart.restaurant_name,
                item_count: itemCount,
                subtotal,
                delivery_fee: deliveryFee,
                tax,
                total
            },
            'Cart summary fetched successfully'
        );

    } catch (error) {
        console.error('Get Cart Summary Error:', error.message);

        return sendInternalError(
            res,
            'Failed to fetch cart summary',
            error
        );
    }
};


/**
 * POST /api/cart/check-restaurant
 * Check whether adding a restaurant would conflict
 * with the current cart.
 */
const checkRestaurantConsistency = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { restaurant_id } = req.body;

        if (!restaurant_id) {
            return sendError(
                res,
                'restaurant_id is required',
                400
            );
        }

        const result = await pool.query(`
            SELECT restaurant_id
            FROM carts
            WHERE user_id = $1
              AND restaurant_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 1
        `, [userId]);

        if (result.rows.length === 0) {
            return sendSuccess(
                res,
                {
                    has_conflict: false
                },
                'No restaurant conflict'
            );
        }

        const existingRestaurantId =
            result.rows[0].restaurant_id;

        if (existingRestaurantId !== restaurant_id) {
            return sendSuccess(
                res,
                {
                    has_conflict: true,
                    existing_restaurant_id: existingRestaurantId,
                    message:
                        'Cart contains items from a different restaurant. Clear the cart before adding items from another restaurant.'
                },
                'Restaurant conflict detected'
            );
        }

        return sendSuccess(
            res,
            {
                has_conflict: false
            },
            'No restaurant conflict'
        );

    } catch (error) {
        console.error(
            'Check Restaurant Consistency Error:',
            error.message
        );

        return sendInternalError(
            res,
            'Failed to check restaurant consistency',
            error
        );
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    checkRestaurantConsistency
};
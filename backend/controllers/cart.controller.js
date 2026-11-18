// backend/controllers/cart.controller.js

const { pool } = require('../config/database');


// =====================================================
// GET CART
// GET /api/cart
// =====================================================

const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cartResult = await pool.query(
            `
            SELECT
                c.cart_id,
                c.restaurant_id,
                r.name AS restaurant_name
            FROM carts c
            LEFT JOIN restaurants r
                ON c.restaurant_id = r.restaurant_id
            WHERE c.user_id = $1
              AND c.status = 'active'
            LIMIT 1
            `,
            [userId]
        );

        if (cartResult.rows.length === 0) {
            return res.json({
                success: true,
                message: 'Cart is empty',
                timestamp: new Date().toISOString(),
                data: {
                    cart_id: null,
                    restaurant_id: null,
                    restaurant_name: null,
                    items: [],
                    subtotal: 0,
                    item_count: 0
                }
            });
        }

        const cart = cartResult.rows[0];

        const itemsResult = await pool.query(
            `
            SELECT
                cart_item_id,
                menu_item_id,
                item_name,
                quantity,
                price,
                COALESCE(
                    total_price,
                    price * quantity
                ) AS total_price,
                COALESCE(
                    special_instructions,
                    ''
                ) AS special_instructions,
                created_at
            FROM cart_items
            WHERE cart_id = $1
            ORDER BY created_at ASC
            `,
            [cart.cart_id]
        );

        const items = itemsResult.rows.map(item => ({
            ...item,
            quantity: Number(item.quantity),
            price: Number(item.price),
            total_price: Number(item.total_price)
        }));

        const subtotal = items.reduce(
            (sum, item) => sum + item.total_price,
            0
        );

        const itemCount = items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        return res.json({
            success: true,
            message: 'Cart fetched successfully',
            timestamp: new Date().toISOString(),
            data: {
                cart_id: cart.cart_id,
                restaurant_id: cart.restaurant_id,
                restaurant_name: cart.restaurant_name,
                items,
                subtotal: Number(subtotal.toFixed(2)),
                item_count: itemCount
            }
        });

    } catch (error) {
        console.error('Get Cart Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            timestamp: new Date().toISOString()
        });
    }
};


// =====================================================
// ADD TO CART
// POST /api/cart/add
// =====================================================

const addToCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;

        const {
            restaurant_id,
            item_id,
            quantity
        } = req.body;

        if (!restaurant_id || !item_id) {
            return res.status(400).json({
                success: false,
                message: 'restaurant_id and item_id are required',
                timestamp: new Date().toISOString()
            });
        }

        const requestedQuantity = Number(quantity || 1);

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer',
                timestamp: new Date().toISOString()
            });
        }

        await client.query('BEGIN');

        // -------------------------------------------------
        // Verify menu item belongs to restaurant
        // -------------------------------------------------

        const menuResult = await client.query(
            `
            SELECT
                item_id,
                restaurant_id,
                name,
                price,
                is_available
            FROM menu_items
            WHERE item_id = $1
              AND restaurant_id = $2
            FOR UPDATE
            `,
            [item_id, restaurant_id]
        );

        if (menuResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
                timestamp: new Date().toISOString()
            });
        }

        const menuItem = menuResult.rows[0];

        if (!menuItem.is_available) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Menu item is currently unavailable',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Find active cart
        // -------------------------------------------------

        const cartResult = await client.query(
            `
            SELECT
                cart_id,
                restaurant_id
            FROM carts
            WHERE user_id = $1
              AND status = 'active'
            FOR UPDATE
            `,
            [userId]
        );

        let cartId;

        if (cartResult.rows.length === 0) {

            // Create new cart
            const newCart = await client.query(
                `
                INSERT INTO carts (
                    user_id,
                    restaurant_id,
                    status
                )
                VALUES (
                    $1,
                    $2,
                    'active'
                )
                RETURNING cart_id
                `,
                [userId, restaurant_id]
            );

            cartId = newCart.rows[0].cart_id;

        } else {

            const existingCart = cartResult.rows[0];

            // Prevent mixing restaurants
            if (
                existingCart.restaurant_id &&
                existingCart.restaurant_id !== restaurant_id
            ) {
                await client.query('ROLLBACK');

                return res.status(409).json({
                    success: false,
                    message: 'Cart contains items from another restaurant',
                    timestamp: new Date().toISOString()
                });
            }

            cartId = existingCart.cart_id;

            await client.query(
                `
                UPDATE carts
                SET
                    restaurant_id = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE cart_id = $2
                `,
                [restaurant_id, cartId]
            );
        }

        // -------------------------------------------------
        // Check whether item already exists
        // -------------------------------------------------

        const existingItemResult = await client.query(
            `
            SELECT
                cart_item_id,
                quantity
            FROM cart_items
            WHERE cart_id = $1
              AND menu_item_id = $2
            FOR UPDATE
            `,
            [cartId, item_id]
        );

        let cartItemId;
        let finalQuantity;

        if (existingItemResult.rows.length > 0) {

            // Existing item → increase quantity
            cartItemId = existingItemResult.rows[0].cart_item_id;

            finalQuantity =
                Number(existingItemResult.rows[0].quantity) +
                requestedQuantity;

            await client.query(
                `
                UPDATE cart_items
                SET
                    quantity = $1::integer,
                    price = $2::numeric,
                    unit_price = $2::numeric,
                    total_price = $2::numeric * $1::numeric
                WHERE cart_item_id = $3
                `,
                [
                    finalQuantity,
                    menuItem.price,
                    cartItemId
                ]
            );

        } else {

            // New item
            finalQuantity = requestedQuantity;

            const newItemResult = await client.query(
                `
                INSERT INTO cart_items (
                    cart_id,
                    menu_item_id,
                    item_name,
                    quantity,
                    price,
                    unit_price,
                    total_price
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4::integer,
                    $5::numeric,
                    $5::numeric,
                    $5::numeric * $4::numeric
                )
                RETURNING cart_item_id
                `,
                [
                    cartId,
                    menuItem.item_id,
                    menuItem.name,
                    finalQuantity,
                    menuItem.price
                ]
            );

            cartItemId = newItemResult.rows[0].cart_item_id;
        }

        // -------------------------------------------------
        // Update cart timestamp
        // -------------------------------------------------

        await client.query(
            `
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
            `,
            [cartId]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            timestamp: new Date().toISOString(),
            data: {
                cart_id: cartId,
                cart_item_id: cartItemId,
                menu_item_id: menuItem.item_id,
                item_name: menuItem.name,
                quantity: finalQuantity,
                price: Number(menuItem.price)
            }
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Add To Cart Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            timestamp: new Date().toISOString()
        });

    } finally {
        client.release();
    }
};


// =====================================================
// UPDATE CART ITEM
// PUT /api/cart/:cartId/items/:cartItemId
// =====================================================

const updateCartItem = async (req, res) => {
    try {
        const {
            cartId,
            cartItemId
        } = req.params;

        const {
            quantity
        } = req.body;

        const userId = req.user.userId;

        // Convert quantity to number
        const newQuantity = Number(quantity);

        // Validate quantity
        if (
            quantity === undefined ||
            !Number.isInteger(newQuantity) ||
            newQuantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a non-negative integer',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Verify cart belongs to current user
        // -------------------------------------------------

        const cartResult = await pool.query(
            `
            SELECT
                cart_id
            FROM carts
            WHERE cart_id = $1
              AND user_id = $2
              AND status = 'active'
            `,
            [cartId, userId]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Verify cart item belongs to this cart
        // -------------------------------------------------

        const itemResult = await pool.query(
            `
            SELECT
                cart_item_id,
                unit_price
            FROM cart_items
            WHERE cart_item_id = $1
              AND cart_id = $2
            `,
            [cartItemId, cartId]
        );

        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Quantity = 0 → remove item
        // -------------------------------------------------

        if (newQuantity === 0) {

            await pool.query(
                `
                DELETE FROM cart_items
                WHERE cart_item_id = $1
                  AND cart_id = $2
                `,
                [cartItemId, cartId]
            );

            await pool.query(
                `
                UPDATE carts
                SET updated_at = CURRENT_TIMESTAMP
                WHERE cart_id = $1
                `,
                [cartId]
            );

            return res.json({
                success: true,
                message: 'Cart item removed successfully',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Update quantity
        // -------------------------------------------------

        const updateResult = await pool.query(
            `
            UPDATE cart_items
            SET
                quantity = $1::integer,
                total_price = unit_price * $1::numeric
            WHERE cart_item_id = $2
              AND cart_id = $3
            RETURNING
                cart_item_id,
                quantity,
                unit_price,
                total_price
            `,
            [
                newQuantity,
                cartItemId,
                cartId
            ]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item could not be updated',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Update cart timestamp
        // -------------------------------------------------

        await pool.query(
            `
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
            `,
            [cartId]
        );

        const updatedItem = updateResult.rows[0];

        return res.json({
            success: true,
            message: 'Cart item updated successfully',
            timestamp: new Date().toISOString(),
            data: {
                cart_id: cartId,
                cart_item_id: updatedItem.cart_item_id,
                quantity: Number(updatedItem.quantity),
                unit_price: Number(updatedItem.unit_price),
                total_price: Number(updatedItem.total_price)
            }
        });

    } catch (error) {

        console.error('Update Cart Item Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            timestamp: new Date().toISOString()
        });
    }
};


// =====================================================
// REMOVE CART ITEM
// DELETE /api/cart/:cartId/items/:cartItemId
// =====================================================

const removeCartItem = async (req, res) => {
    try {
        const {
            cartId,
            cartItemId
        } = req.params;

        const userId = req.user.userId;

        // -------------------------------------------------
        // Verify cart belongs to current user
        // -------------------------------------------------

        const cartResult = await pool.query(
            `
            SELECT
                cart_id
            FROM carts
            WHERE cart_id = $1
              AND user_id = $2
              AND status = 'active'
            `,
            [cartId, userId]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Delete item
        // -------------------------------------------------

        const deleteResult = await pool.query(
            `
            DELETE FROM cart_items
            WHERE cart_item_id = $1
              AND cart_id = $2
            RETURNING cart_item_id
            `,
            [cartItemId, cartId]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Update cart timestamp
        // -------------------------------------------------

        await pool.query(
            `
            UPDATE carts
            SET updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
            `,
            [cartId]
        );

        return res.json({
            success: true,
            message: 'Cart item removed successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {

        console.error('Remove Cart Item Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to remove cart item',
            timestamp: new Date().toISOString()
        });
    }
};


// =====================================================
// CLEAR CART
// DELETE /api/cart
// =====================================================

const clearCart = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;

        await client.query('BEGIN');

        // -------------------------------------------------
        // Find active cart
        // -------------------------------------------------

        const cartResult = await client.query(
            `
            SELECT
                cart_id
            FROM carts
            WHERE user_id = $1
              AND status = 'active'
            `,
            [userId]
        );

        if (cartResult.rows.length === 0) {
            await client.query('COMMIT');

            return res.json({
                success: true,
                message: 'Cart is already empty',
                timestamp: new Date().toISOString()
            });
        }

        // -------------------------------------------------
        // Delete active cart
        // -------------------------------------------------

        await client.query(
            `
            DELETE FROM carts
            WHERE user_id = $1
              AND status = 'active'
            `,
            [userId]
        );

        await client.query('COMMIT');

        return res.json({
            success: true,
            message: 'Cart cleared successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Clear Cart Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            timestamp: new Date().toISOString()
        });

    } finally {
        client.release();
    }
};


// =====================================================
// GET CART SUMMARY
// GET /api/cart/summary
// =====================================================

const getCartSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cartResult = await pool.query(
            `
            SELECT
                c.cart_id,
                c.restaurant_id,
                r.name AS restaurant_name
            FROM carts c
            LEFT JOIN restaurants r
                ON c.restaurant_id = r.restaurant_id
            WHERE c.user_id = $1
              AND c.status = 'active'
            LIMIT 1
            `,
            [userId]
        );

        if (cartResult.rows.length === 0) {
            return res.json({
                success: true,
                message: 'Cart summary fetched successfully',
                timestamp: new Date().toISOString(),
                data: {
                    cart_id: null,
                    restaurant_id: null,
                    restaurant_name: null,
                    item_count: 0,
                    subtotal: 0,
                    delivery_fee: 0,
                    tax: 0,
                    total: 0
                }
            });
        }

        const cart = cartResult.rows[0];

        const itemsResult = await pool.query(
            `
            SELECT
                quantity,
                COALESCE(
                    total_price,
                    price * quantity
                ) AS total_price
            FROM cart_items
            WHERE cart_id = $1
            `,
            [cart.cart_id]
        );

        const itemCount = itemsResult.rows.reduce(
            (sum, item) => sum + Number(item.quantity),
            0
        );

        const subtotal = itemsResult.rows.reduce(
            (sum, item) => sum + Number(item.total_price),
            0
        );

        const restaurantResult = await pool.query(
            `
            SELECT
                delivery_fee
            FROM restaurants
            WHERE restaurant_id = $1
            `,
            [cart.restaurant_id]
        );

        const deliveryFee =
            subtotal > 0 && restaurantResult.rows.length > 0
                ? Number(restaurantResult.rows[0].delivery_fee || 0)
                : 0;

        const tax = Number(
            (subtotal * 0.05).toFixed(2)
        );

        const total = Number(
            (subtotal + deliveryFee + tax).toFixed(2)
        );

        return res.json({
            success: true,
            message: 'Cart summary fetched successfully',
            timestamp: new Date().toISOString(),
            data: {
                cart_id: cart.cart_id,
                restaurant_id: cart.restaurant_id,
                restaurant_name: cart.restaurant_name,
                item_count: itemCount,
                subtotal: Number(subtotal.toFixed(2)),
                delivery_fee: deliveryFee,
                tax,
                total
            }
        });

    } catch (error) {

        console.error('Get Cart Summary Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch cart summary',
            timestamp: new Date().toISOString()
        });
    }
};


// =====================================================
// CHECK RESTAURANT CONSISTENCY
// POST /api/cart/check-restaurant
// =====================================================

const checkRestaurantConsistency = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            restaurant_id
        } = req.body;

        if (!restaurant_id) {
            return res.status(400).json({
                success: false,
                message: 'restaurant_id is required',
                timestamp: new Date().toISOString()
            });
        }

        const result = await pool.query(
            `
            SELECT
                cart_id,
                restaurant_id
            FROM carts
            WHERE user_id = $1
              AND status = 'active'
            LIMIT 1
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                message: 'Restaurant is compatible with empty cart',
                timestamp: new Date().toISOString(),
                data: {
                    consistent: true
                }
            });
        }

        const consistent =
            result.rows[0].restaurant_id === restaurant_id;

        return res.json({
            success: true,
            message: consistent
                ? 'Restaurant is compatible with cart'
                : 'Cart belongs to another restaurant',
            timestamp: new Date().toISOString(),
            data: {
                consistent,
                cart_restaurant_id: result.rows[0].restaurant_id,
                requested_restaurant_id: restaurant_id
            }
        });

    } catch (error) {

        console.error(
            'Check Restaurant Consistency Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to check restaurant consistency',
            timestamp: new Date().toISOString()
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartSummary,
    checkRestaurantConsistency
};
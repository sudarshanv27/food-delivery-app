// backend/controllers/cart.controller.js
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const {
    sendSuccess,
    sendError,
    sendNotFound,
    sendInternalError
} = require('../utils/responseHandler');

// ================= GET CART =================
const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch cart items
        const result = await pool.query(
            `
            SELECT 
                cart_id,
                restaurant_id,
                item_id,
                item_name,
                quantity,
                price,
                total_price,
                special_instructions,
                created_at
            FROM cart
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

        // Calculate subtotal and item count
        const subtotal = result.rows.reduce((sum, item) => sum + Number(item.total_price), 0);
        const itemCount = result.rows.reduce((sum, item) => sum + Number(item.quantity), 0);

        return sendSuccess(res, {
            items: result.rows,
            subtotal: subtotal,
            item_count: itemCount
        }, 'Cart fetched successfully');

    } catch (error) {
        console.error('Get Cart Error:', error.message);
        return sendInternalError(res, 'Failed to fetch cart', error);
    }
};

// ================= ADD TO CART =================
const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            restaurant_id,
            item_id,
            item_name,
            price,
            quantity = 1,
            special_instructions = ''
        } = req.body;

        // Validation
        if (!restaurant_id || !item_id || !item_name || !price) {
            return sendError(res, 'Missing required fields: restaurant_id, item_id, item_name, price are required', 400);
        }

        // Check if item already exists in cart
        const existingItem = await pool.query(
            `
            SELECT cart_id, quantity, price
            FROM cart
            WHERE user_id = $1 AND item_id = $2
            `,
            [userId, item_id]
        );

        // If item exists, update quantity
        if (existingItem.rows.length > 0) {
            const existing = existingItem.rows[0];
            const updatedQuantity = existing.quantity + quantity;
            const updatedTotal = updatedQuantity * price;

            await pool.query(
                `
                UPDATE cart
                SET quantity = $1, total_price = $2
                WHERE cart_id = $3
                `,
                [updatedQuantity, updatedTotal, existing.cart_id]
            );

            return sendSuccess(res, null, 'Cart item updated successfully');
        }

        // Insert new item
        const cartId = uuidv4();
        const totalPrice = price * quantity;

        await pool.query(
            `
            INSERT INTO cart (
                cart_id, user_id, restaurant_id, item_id, item_name,
                quantity, price, total_price, special_instructions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [cartId, userId, restaurant_id, item_id, item_name, quantity, price, totalPrice, special_instructions]
        );

        return sendSuccess(res, { cart_id: cartId }, 'Item added to cart successfully', 201);

    } catch (error) {
        console.error('Add To Cart Error:', error.message);
        return sendInternalError(res, 'Failed to add item to cart', error);
    }
};

// ================= UPDATE CART ITEM =================
const updateCartItem = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.userId;

        // Validation
        if (quantity === undefined || quantity < 0) {
            return sendError(res, 'Valid quantity required (must be >= 0)', 400);
        }

        // Check if cart item exists
        const checkItem = await pool.query(
            'SELECT cart_id FROM cart WHERE cart_id = $1 AND user_id = $2',
            [cartId, userId]
        );

        if (checkItem.rows.length === 0) {
            return sendNotFound(res, 'Cart item not found');
        }

        // Remove item if quantity is 0
        if (quantity === 0) {
            await pool.query(
                'DELETE FROM cart WHERE cart_id = $1 AND user_id = $2',
                [cartId, userId]
            );
            return sendSuccess(res, null, 'Item removed from cart');
        }

        // Update quantity
        await pool.query(
            `
            UPDATE cart
            SET quantity = $1, total_price = price * $1
            WHERE cart_id = $2 AND user_id = $3
            `,
            [quantity, cartId, userId]
        );

        return sendSuccess(res, null, 'Cart updated successfully');

    } catch (error) {
        console.error('Update Cart Error:', error.message);
        return sendInternalError(res, 'Failed to update cart', error);
    }
};

// ================= REMOVE FROM CART =================
const removeFromCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const userId = req.user.userId;

        // Check if cart item exists
        const checkItem = await pool.query(
            'SELECT cart_id FROM cart WHERE cart_id = $1 AND user_id = $2',
            [cartId, userId]
        );

        if (checkItem.rows.length === 0) {
            return sendNotFound(res, 'Cart item not found');
        }

        await pool.query(
            'DELETE FROM cart WHERE cart_id = $1 AND user_id = $2',
            [cartId, userId]
        );

        return sendSuccess(res, null, 'Item removed from cart');

    } catch (error) {
        console.error('Remove From Cart Error:', error.message);
        return sendInternalError(res, 'Failed to remove item', error);
    }
};

// ================= CLEAR CART =================
const clearCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        await pool.query(
            'DELETE FROM cart WHERE user_id = $1',
            [userId]
        );

        return sendSuccess(res, null, 'Cart cleared successfully');

    } catch (error) {
        console.error('Clear Cart Error:', error.message);
        return sendInternalError(res, 'Failed to clear cart', error);
    }
};

// ================= GET CART SUMMARY (for checkout) =================
const getCartSummary = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT 
                COUNT(*) as item_count,
                COALESCE(SUM(total_price), 0) as subtotal,
                MIN(restaurant_id) as restaurant_id,
                MIN(restaurant_name) as restaurant_name
            FROM cart 
            WHERE user_id = $1
            GROUP BY restaurant_id
            `,
            [userId]
        );

        if (result.rows.length === 0) {
            return sendSuccess(res, {
                item_count: 0,
                subtotal: 0,
                delivery_fee: 0,
                tax: 0,
                total: 0
            }, 'Cart is empty');
        }

        const subtotal = parseFloat(result.rows[0].subtotal);
        const deliveryFee = 29;
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + deliveryFee + tax;

        return sendSuccess(res, {
            item_count: parseInt(result.rows[0].item_count),
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            tax: tax,
            total: total,
            restaurant_id: result.rows[0].restaurant_id,
            restaurant_name: result.rows[0].restaurant_name
        }, 'Cart summary fetched successfully');

    } catch (error) {
        console.error('Get Cart Summary Error:', error.message);
        return sendInternalError(res, 'Failed to fetch cart summary', error);
    }
};

// ================= CHECK RESTAURANT CONSISTENCY =================
const checkRestaurantConsistency = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { restaurant_id } = req.body;

        if (!restaurant_id) {
            return sendError(res, 'Restaurant ID is required', 400);
        }

        const result = await pool.query(
            `
            SELECT DISTINCT restaurant_id 
            FROM cart 
            WHERE user_id = $1 AND restaurant_id != $2
            `,
            [userId, restaurant_id]
        );

        if (result.rows.length > 0) {
            return sendSuccess(res, {
                has_conflict: true,
                existing_restaurant_id: result.rows[0].restaurant_id,
                message: 'Cart contains items from a different restaurant. Clear cart or continue with existing items?'
            }, 'Restaurant conflict detected');
        }

        return sendSuccess(res, { has_conflict: false }, 'No restaurant conflict');

    } catch (error) {
        console.error('Check Restaurant Consistency Error:', error.message);
        return sendInternalError(res, 'Failed to check restaurant consistency', error);
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
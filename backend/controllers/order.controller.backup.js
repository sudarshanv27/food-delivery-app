// backend/controllers/order.controller.js

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// ================= CREATE ORDER =================
const createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;

        const {
            restaurant_id,
            restaurant_name,
            items,
            subtotal,
            delivery_fee = 0,
            tax = 0,
            total_amount,
            delivery_address,
            delivery_latitude,
            delivery_longitude,
            payment_method = 'cash',
            special_instructions = '',
            offer_code
        } = req.body;

        // ================= VALIDATION =================
        if (
            !restaurant_id ||
            !Array.isArray(items) ||
            items.length === 0 ||
            total_amount === undefined ||
            total_amount === null
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: restaurant_id, items, or total_amount'
            });
        }

        if (!delivery_address) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required'
            });
        }

        // ================= START TRANSACTION =================
        await client.query('BEGIN');

        // ================= GET RESTAURANT =================
        const restaurantResult = await client.query(
            `SELECT
                restaurant_id,
                name,
                delivery_fee,
                min_order_amount,
                is_open,
                is_active
             FROM restaurants
             WHERE restaurant_id = $1`,
            [restaurant_id]
        );

        if (restaurantResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        const restaurant = restaurantResult.rows[0];

        if (!restaurant.is_active) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Restaurant is currently unavailable'
            });
        }

        const finalRestaurantName = restaurant_name || restaurant.name;

        // ================= APPLY PROMO CODE =================
        let discount_amount = 0;
        let appliedPromoCode = null;

        if (offer_code) {
            const promoResult = await client.query(
                `SELECT *
                 FROM "promoCodes"
                 WHERE UPPER(code) = UPPER($1)
                   AND is_active = true
                   AND starts_at <= NOW()
                   AND (expires_at IS NULL OR expires_at > NOW())
                   AND (usage_limit IS NULL OR used_count < usage_limit)`,
                [offer_code]
            );

            if (promoResult.rows.length > 0) {
                const promo = promoResult.rows[0];

                const orderSubtotal = Number(subtotal || 0);
                const minimumOrder = Number(promo.min_order_amount || 0);

                if (orderSubtotal >= minimumOrder) {
                    if (promo.discount_type === 'percentage') {
                        discount_amount =
                            (orderSubtotal * Number(promo.discount_value)) / 100;

                        if (promo.max_discount !== null) {
                            discount_amount = Math.min(
                                discount_amount,
                                Number(promo.max_discount)
                            );
                        }
                    } else if (promo.discount_type === 'fixed') {
                        discount_amount = Number(promo.discount_value);
                    } else if (promo.discount_type === 'free_delivery') {
                        discount_amount = Number(delivery_fee || 0);
                    }

                    // Never allow discount to exceed subtotal + delivery fee
                    discount_amount = Math.min(
                        discount_amount,
                        orderSubtotal + Number(delivery_fee || 0)
                    );

                    appliedPromoCode = promo.code;

                    // Increase promo usage
                    await client.query(
                        `UPDATE "promoCodes"
                         SET used_count = used_count + 1
                         WHERE promo_id = $1`,
                        [promo.promo_id]
                    );
                }
            }
        }

        // ================= CALCULATE FINAL TOTAL =================
        const subtotalAmount = Number(subtotal || 0);
        const deliveryFeeAmount = Number(delivery_fee || restaurant.delivery_fee || 0);
        const taxAmount = Number(tax || 0);

        const finalTotalAmount =
            subtotalAmount +
            deliveryFeeAmount +
            taxAmount -
            discount_amount;

        if (finalTotalAmount < 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Invalid order total'
            });
        }

        // ================= GENERATE ORDER ID =================
        const orderId = uuidv4();

        const order_number =
            `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // ================= INSERT ORDER =================
        await client.query(
            `INSERT INTO orders (
                order_id,
                order_number,
                user_id,
                restaurant_id,
                restaurant_name,
                items,
                subtotal,
                delivery_fee,
                tax_amount,
                discount_amount,
                total_amount,
                delivery_address,
                delivery_latitude,
                delivery_longitude,
                special_instructions,
                payment_method,
                order_status,
                payment_status,
                promo_code,
                promo_discount
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20
            )`,
            [
                orderId,
                order_number,
                userId,
                restaurant_id,
                finalRestaurantName,
                JSON.stringify(items),
                subtotalAmount,
                deliveryFeeAmount,
                taxAmount,
                discount_amount,
                finalTotalAmount,
                delivery_address,
                delivery_latitude || null,
                delivery_longitude || null,
                special_instructions,
                payment_method,
                'pending',
                'pending',
                appliedPromoCode,
                discount_amount
            ]
        );

        // ================= INSERT ORDER ITEMS =================
        for (const item of items) {
            const menuItemId =
                item.menu_item_id ||
                item.item_id ||
                item.menuItemId ||
                null;

            const variantId =
                item.variant_id ||
                item.variantId ||
                null;

            const itemName =
                item.item_name ||
                item.name ||
                'Menu Item';

            const quantity = Number(item.quantity || 1);

            const unitPrice = Number(
                item.unit_price ||
                item.price ||
                0
            );

            const itemTotal =
                Number(
                    item.total_price ||
                    item.total ||
                    unitPrice * quantity
                );

            await client.query(
                `INSERT INTO order_items (
                    order_item_id,
                    order_id,
                    menu_item_id,
                    variant_id,
                    item_name,
                    quantity,
                    unit_price,
                    total_price
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    uuidv4(),
                    orderId,
                    menuItemId,
                    variantId,
                    itemName,
                    quantity,
                    unitPrice,
                    itemTotal
                ]
            );
        }

        // ================= CLEAR CART =================
        const cartResult = await client.query(
            `SELECT cart_id
             FROM carts
             WHERE user_id = $1
               AND restaurant_id = $2
               AND status = 'active'
             LIMIT 1`,
            [userId, restaurant_id]
        );

        if (cartResult.rows.length > 0) {
            const cartId = cartResult.rows[0].cart_id;

            await client.query(
                `DELETE FROM cart_items
                 WHERE cart_id = $1`,
                [cartId]
            );

            await client.query(
                `UPDATE carts
                 SET status = 'completed',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE cart_id = $1`,
                [cartId]
            );
        }

        // ================= COMMIT =================
        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: orderId,
                order_number,
                discount_amount,
                final_total: finalTotalAmount
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');

        console.error('Create Order Error:', err);

        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error:
                process.env.NODE_ENV === 'development'
                    ? err.message
                    : undefined
        });
    } finally {
        client.release();
    }
};


// ================= GET USER ORDERS =================
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                order_id,
                order_number,
                restaurant_id,
                restaurant_name,
                items,
                subtotal,
                delivery_fee,
                tax_amount,
                discount_amount,
                total_amount,
                order_status,
                payment_status,
                payment_method,
                delivery_address,
                created_at,
                updated_at
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (err) {
        console.error('Get Orders Error:', err.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};


// ================= GET ORDER DETAILS =================
const getOrderDetails = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { orderId } = req.params;

        const result = await pool.query(
            `SELECT
                o.*,
                d.status AS delivery_status,
                d.latitude AS current_latitude,
                d.longitude AS current_longitude,
                d.updated_at AS delivery_updated_at,
                u.full_name AS delivery_partner_name,
                u.phone AS delivery_partner_phone
             FROM orders o
             LEFT JOIN delivery_tracking d
                ON o.order_id = d.order_id
             LEFT JOIN users u
                ON d.delivery_partner_id = u.user_id
             WHERE o.order_id = $1
               AND o.user_id = $2
             ORDER BY d.updated_at DESC
             LIMIT 1`,
            [orderId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Get Order Details Error:', err.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
};


// ================= GET ORDER BY ID =================
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.userType;

        let query = `
            SELECT
                o.*,
                d.status AS delivery_status,
                d.latitude AS current_latitude,
                d.longitude AS current_longitude,
                d.updated_at AS delivery_updated_at,
                u.full_name AS delivery_partner_name,
                u.phone AS delivery_partner_phone
            FROM orders o
            LEFT JOIN delivery_tracking d
                ON o.order_id = d.order_id
            LEFT JOIN users u
                ON d.delivery_partner_id = u.user_id
            WHERE o.order_id = $1
        `;

        const queryParams = [id];

        // Admin can view any order.
        // Other users can view only their own order.
        if (userRole !== 'admin') {
            query += ` AND o.user_id = $2`;
            queryParams.push(userId);
        }

        query += `
            ORDER BY d.updated_at DESC
            LIMIT 1
        `;

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get Order Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};


// ================= TRACK ORDER =================
const trackOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                o.order_status,
                o.order_number,
                o.restaurant_name,
                o.total_amount,
                d.status AS delivery_status,
                d.latitude AS current_latitude,
                d.longitude AS current_longitude,
                d.updated_at AS location_updated_at,
                o.estimated_delivery_time,
                u.full_name AS delivery_partner_name,
                u.phone AS delivery_partner_phone
             FROM orders o
             LEFT JOIN delivery_tracking d
                ON o.order_id = d.order_id
             LEFT JOIN users u
                ON d.delivery_partner_id = u.user_id
             WHERE o.order_id = $1
               AND o.user_id = $2
             ORDER BY d.updated_at DESC
             LIMIT 1`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Track Order Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to track order'
        });
    }
};


// ================= UPDATE ORDER STATUS =================
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const userRole = req.user.userType;

        const validStatuses = [
            'pending',
            'confirmed',
            'preparing',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'refunded'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        let query = `
            UPDATE orders
            SET order_status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
        `;

        const queryParams = [status, orderId];

        // Restaurant owners can update orders belonging
        // to their restaurants.
        if (userRole !== 'admin') {
            query += `
                AND restaurant_id IN (
                    SELECT restaurant_id
                    FROM restaurants
                    WHERE owner_id = $3
                )
            `;

            queryParams.push(req.user.userId);
        }

        query += ` RETURNING *`;

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    'Order not found or you do not have permission to update it'
            });
        }

        return res.json({
            success: true,
            message: 'Order status updated successfully',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Update Order Status Error:', err.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};


// ================= CANCEL ORDER =================
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `UPDATE orders
             SET order_status = 'cancelled',
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_id = $1
               AND user_id = $2
               AND order_status = 'pending'
             RETURNING order_id, order_number, order_status`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    'Order cannot be cancelled. Either order not found or already processed.'
            });
        }

        return res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Cancel Order Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
};


// ================= EXPORT =================
module.exports = {
    createOrder,
    getUserOrders,
    getOrderDetails,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder
};
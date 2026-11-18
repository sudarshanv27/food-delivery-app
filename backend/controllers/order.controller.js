// backend/controllers/order.controller.js

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');


// =====================================================
// CREATE ORDER
// POST /api/orders/create
// =====================================================

const createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.userId;

        const {
            restaurant_id,
            items,
            delivery_address,
            payment_method = 'cash',
            special_instructions = ''
        } = req.body;

        // =================================================
        // VALIDATION
        // =================================================

        if (!restaurant_id) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order items are required'
            });
        }

        if (!delivery_address) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required'
            });
        }

        const validPaymentMethods = [
            'cash',
            'online',
            'card',
            'upi'
        ];

        if (!validPaymentMethods.includes(payment_method)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        // =================================================
        // START TRANSACTION
        // =================================================

        await client.query('BEGIN');

        // =================================================
        // GET RESTAURANT
        // =================================================

        const restaurantResult = await client.query(
            `
            SELECT
                restaurant_id,
                name,
                delivery_fee,
                min_order_amount,
                is_open,
                is_active
            FROM restaurants
            WHERE restaurant_id = $1
            FOR UPDATE
            `,
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

        // =================================================
        // RESTAURANT AVAILABILITY
        // =================================================

        if (!restaurant.is_active) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Restaurant is currently unavailable'
            });
        }

        if (!restaurant.is_open) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Restaurant is currently closed'
            });
        }

        // =================================================
        // GET ACTIVE CART
        // =================================================

        const cartResult = await client.query(
            `
            SELECT cart_id
            FROM carts
            WHERE user_id = $1
              AND restaurant_id = $2
              AND status = 'active'
            LIMIT 1
            FOR UPDATE
            `,
            [userId, restaurant_id]
        );

        if (cartResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Active cart not found'
            });
        }

        const cartId = cartResult.rows[0].cart_id;

        // =================================================
        // GET CART ITEMS
        // =================================================

        const cartItemsResult = await client.query(
            `
            SELECT
                ci.cart_item_id,
                ci.menu_item_id,
                ci.item_name,
                ci.quantity,
                ci.unit_price,
                ci.total_price,
                mi.name AS current_item_name,
                mi.price AS current_price,
                mi.is_available,
                mi.restaurant_id
            FROM cart_items ci
            INNER JOIN menu_items mi
                ON ci.menu_item_id = mi.item_id
            WHERE ci.cart_id = $1
            FOR UPDATE
            `,
            [cartId]
        );

        if (cartItemsResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // =================================================
        // VALIDATE CART ITEMS
        // =================================================

        let calculatedSubtotal = 0;

        const orderItems = [];

        for (const cartItem of cartItemsResult.rows) {

            if (cartItem.restaurant_id !== restaurant_id) {
                await client.query('ROLLBACK');

                return res.status(400).json({
                    success: false,
                    message: 'Cart contains an item from another restaurant'
                });
            }

            if (!cartItem.is_available) {
                await client.query('ROLLBACK');

                return res.status(400).json({
                    success: false,
                    message: `${cartItem.current_item_name} is currently unavailable`
                });
            }

            const quantity = Number(cartItem.quantity);
            const unitPrice = Number(cartItem.current_price);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                await client.query('ROLLBACK');

                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for ${cartItem.current_item_name}`
                });
            }

            if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                await client.query('ROLLBACK');

                return res.status(400).json({
                    success: false,
                    message: `Invalid price for ${cartItem.current_item_name}`
                });
            }

            const itemTotal = unitPrice * quantity;

            calculatedSubtotal += itemTotal;

            orderItems.push({
                menu_item_id: cartItem.menu_item_id,
                item_name: cartItem.current_item_name,
                quantity,
                unit_price: unitPrice,
                total_price: itemTotal
            });
        }

        // =================================================
        // MINIMUM ORDER CHECK
        // =================================================

        const minimumOrderAmount =
            Number(restaurant.min_order_amount || 0);

        if (calculatedSubtotal < minimumOrderAmount) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: `Minimum order amount is ₹${minimumOrderAmount.toFixed(2)}`,
                data: {
                    subtotal: Number(calculatedSubtotal.toFixed(2)),
                    minimum_order_amount: minimumOrderAmount
                }
            });
        }

        // =================================================
        // DELIVERY FEE
        // =================================================

        const deliveryFeeAmount =
            Number(restaurant.delivery_fee || 0);

        // =================================================
        // TAX
        // =================================================
        // Current project rule: 5% tax

        const taxAmount =
            calculatedSubtotal * 0.05;

        // =================================================
        // DISCOUNT
        // =================================================
        // Promo system will be added later when promo_codes
        // table/module is implemented.

        const discountAmount = 0;
        const promoCode = null;
        const promoDiscount = 0;

        // =================================================
        // FINAL TOTAL
        // =================================================

        const finalTotalAmount =
            calculatedSubtotal +
            deliveryFeeAmount +
            taxAmount -
            discountAmount;

        if (finalTotalAmount < 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Invalid order total'
            });
        }

        // =================================================
        // GENERATE ORDER ID
        // =================================================

        const orderId = uuidv4();

        const orderNumber =
            `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // =================================================
        // ITEMS JSON
        // =================================================

        const itemsJson = JSON.stringify(orderItems);

        // =================================================
        // INSERT ORDER
        // =================================================

        await client.query(
            `
            INSERT INTO orders (
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
                special_instructions,
                payment_method,
                order_status,
                payment_status,
                promo_code,
                promo_discount
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                $14,
                $15,
                $16,
                $17,
                $18
            )
            `,
            [
                orderId,
                orderNumber,
                userId,
                restaurant_id,
                restaurant.name,
                itemsJson,
                calculatedSubtotal,
                deliveryFeeAmount,
                taxAmount,
                discountAmount,
                finalTotalAmount,
                delivery_address,
                special_instructions,
                payment_method,
                'pending',
                'pending',
                promoCode,
                promoDiscount
            ]
        );

        // =================================================
        // INSERT ORDER ITEMS
        // =================================================

        for (const item of orderItems) {

            await client.query(
                `
                INSERT INTO order_items (
                    order_item_id,
                    order_id,
                    menu_item_id,
                    variant_id,
                    item_name,
                    quantity,
                    unit_price,
                    total_price
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                `,
                [
                    uuidv4(),
                    orderId,
                    item.menu_item_id,
                    null,
                    item.item_name,
                    item.quantity,
                    item.unit_price,
                    item.total_price
                ]
            );
        }

        // =================================================
        // CLEAR CART
        // =================================================

        await client.query(
            `
            DELETE FROM cart_items
            WHERE cart_id = $1
            `,
            [cartId]
        );

        await client.query(
            `
            UPDATE carts
            SET status = 'completed',
                updated_at = CURRENT_TIMESTAMP
            WHERE cart_id = $1
            `,
            [cartId]
        );

        // =================================================
        // COMMIT
        // =================================================

        await client.query('COMMIT');

        // =================================================
        // RESPONSE
        // =================================================

        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: orderId,
                order_number: orderNumber,
                restaurant_id: restaurant_id,
                restaurant_name: restaurant.name,
                subtotal: Number(calculatedSubtotal.toFixed(2)),
                delivery_fee: Number(deliveryFeeAmount.toFixed(2)),
                tax_amount: Number(taxAmount.toFixed(2)),
                discount_amount: Number(discountAmount.toFixed(2)),
                total_amount: Number(finalTotalAmount.toFixed(2)),
                payment_method,
                payment_status: 'pending',
                order_status: 'pending'
            }
        });

    } catch (err) {

        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error(
                'Rollback Error:',
                rollbackError.message
            );
        }

        console.error(
            'Create Order Error:',
            err
        );

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


// =====================================================
// GET USER ORDERS
// GET /api/orders
// GET /api/orders/my-orders
// =====================================================

const getUserOrders = async (req, res) => {

    try {

        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                o.order_id,
                o.order_number,
                o.user_id,
                o.restaurant_id,
                o.restaurant_name,
                o.items,
                o.subtotal,
                o.delivery_fee,
                o.tax_amount,
                o.discount_amount,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.delivery_address,
                o.special_instructions,
                o.created_at,
                o.updated_at,
                o.delivered_at,
                o.delivery_partner_id,
                o.estimated_delivery_time,
                o.actual_delivery_time,
                o.promo_code,
                o.promo_discount
            FROM orders o
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
            `,
            [userId]
        );

        return res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (err) {

        console.error(
            'Get User Orders Error:',
            err.message
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};


// =====================================================
// GET RESTAURANT ORDERS
// GET /api/orders/restaurant
// =====================================================

const getRestaurantOrders = async (req, res) => {

    try {

        const ownerId = req.user.userId;
        const userRole = req.user.userType;

        // =================================================
        // ROLE CHECK
        // =================================================

        if (
            userRole !== 'restaurant_owner' &&
            userRole !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Restaurant owners only.'
            });
        }

        let query = `
            SELECT
                o.order_id,
                o.order_number,
                o.user_id,
                u.full_name AS customer_name,
                u.phone AS customer_phone,
                o.restaurant_id,
                o.restaurant_name,
                o.items,
                o.subtotal,
                o.delivery_fee,
                o.tax_amount,
                o.discount_amount,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.delivery_address,
                o.special_instructions,
                o.created_at,
                o.updated_at,
                o.delivered_at,
                o.delivery_partner_id,
                o.estimated_delivery_time,
                o.actual_delivery_time,
                o.promo_code,
                o.promo_discount
            FROM orders o
            INNER JOIN restaurants r
                ON o.restaurant_id = r.restaurant_id
            LEFT JOIN users u
                ON o.user_id = u.user_id
        `;

        const queryParams = [];

        // =================================================
        // RESTAURANT OWNER
        // =================================================

        if (userRole === 'restaurant_owner') {

            query += `
                WHERE r.owner_id = $1
            `;

            queryParams.push(ownerId);
        }

        // =================================================
        // ADMIN
        // =================================================

        query += `
            ORDER BY o.created_at DESC
        `;

        const result = await pool.query(
            query,
            queryParams
        );

        return res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (err) {

        console.error(
            'Get Restaurant Orders Error:',
            err.message
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant orders'
        });
    }
};


// =====================================================
// GET ORDER DETAILS
// GET /api/orders/:orderId
// =====================================================

const getOrderDetails = async (req, res) => {

    try {

        const userId = req.user.userId;
        const { orderId } = req.params;

        const result = await pool.query(
            `
            SELECT
                o.order_id,
                o.order_number,
                o.user_id,
                o.restaurant_id,
                o.restaurant_name,
                o.items,
                o.subtotal,
                o.delivery_fee,
                o.tax_amount,
                o.discount_amount,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.delivery_address,
                o.special_instructions,
                o.created_at,
                o.updated_at,
                o.delivered_at,
                o.delivery_partner_id,
                o.estimated_delivery_time,
                o.actual_delivery_time,
                o.promo_code,
                o.promo_discount
            FROM orders o
            WHERE o.order_id = $1
              AND o.user_id = $2
            `,
            [orderId, userId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // =================================================
        // GET ORDER ITEMS
        // =================================================

        const itemsResult = await pool.query(
            `
            SELECT
                order_item_id,
                menu_item_id,
                variant_id,
                item_name,
                quantity,
                unit_price,
                total_price
            FROM order_items
            WHERE order_id = $1
            ORDER BY created_at ASC
            `,
            [orderId]
        );

        const order = result.rows[0];

        order.items = itemsResult.rows;

        return res.json({
            success: true,
            data: order
        });

    } catch (err) {

        console.error(
            'Get Order Details Error:',
            err.message
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
};


// =====================================================
// GET ORDER BY ID
// GET /api/orders/details/:id
// =====================================================

const getOrderById = async (req, res) => {

    try {

        const { id } = req.params;

        const userId = req.user.userId;
        const userRole = req.user.userType;

        let query = `
            SELECT
                o.order_id,
                o.order_number,
                o.user_id,
                o.restaurant_id,
                o.restaurant_name,
                o.items,
                o.subtotal,
                o.delivery_fee,
                o.tax_amount,
                o.discount_amount,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.delivery_address,
                o.special_instructions,
                o.created_at,
                o.updated_at,
                o.delivered_at,
                o.delivery_partner_id,
                o.estimated_delivery_time,
                o.actual_delivery_time,
                o.promo_code,
                o.promo_discount
            FROM orders o
            WHERE o.order_id = $1
        `;

        const queryParams = [id];

        // =================================================
        // CUSTOMER
        // =================================================

        if (
            userRole !== 'admin' &&
            userRole !== 'restaurant_owner'
        ) {
            query += `
                AND o.user_id = $2
            `;

            queryParams.push(userId);
        }

        // =================================================
        // RESTAURANT OWNER
        // =================================================

        if (userRole === 'restaurant_owner') {
            query += `
                AND o.restaurant_id IN (
                    SELECT restaurant_id
                    FROM restaurants
                    WHERE owner_id = $2
                )
            `;

            queryParams.push(userId);
        }

        const result = await pool.query(
            query,
            queryParams
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const itemsResult = await pool.query(
            `
            SELECT
                order_item_id,
                menu_item_id,
                variant_id,
                item_name,
                quantity,
                unit_price,
                total_price
            FROM order_items
            WHERE order_id = $1
            ORDER BY created_at ASC
            `,
            [id]
        );

        const order = result.rows[0];

        order.items = itemsResult.rows;

        return res.json({
            success: true,
            data: order
        });

    } catch (error) {

        console.error(
            'Get Order By ID Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};


// =====================================================
// TRACK ORDER
// GET /api/orders/:id/track
// =====================================================
//
// delivery_tracking table does not exist yet.
// Therefore this endpoint currently returns order-level
// tracking information only.
//
// =====================================================

const trackOrder = async (req, res) => {

    try {

        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                o.order_id,
                o.order_number,
                o.restaurant_name,
                o.order_status,
                o.total_amount,
                o.delivery_address,
                o.estimated_delivery_time,
                o.delivery_partner_id,
                o.actual_delivery_time,
                o.created_at,
                o.updated_at
            FROM orders o
            WHERE o.order_id = $1
              AND o.user_id = $2
            `,
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

        console.error(
            'Track Order Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to track order'
        });
    }
};


// =====================================================
// UPDATE ORDER STATUS
// PUT /api/orders/:orderId/status
// PATCH /api/orders/:id/status
// =====================================================

const updateOrderStatus = async (req, res) => {

    try {

        const orderId =
            req.params.orderId || req.params.id;

        const { status } = req.body;

        const userId = req.user.userId;
        const userRole = req.user.userType;

        // =================================================
        // VALID STATUSES
        // =================================================

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
                message: 'Invalid order status',
                valid_statuses: validStatuses
            });
        }

        // =================================================
        // ADMIN
        // =================================================

        let query = `
            UPDATE orders
            SET
                order_status = $1,
                updated_at = CURRENT_TIMESTAMP
        `;

        const queryParams = [
            status,
            orderId
        ];

        // =================================================
        // DELIVERED TIMESTAMP
        // =================================================

        if (status === 'delivered') {

            query += `,
                delivered_at = CURRENT_TIMESTAMP,
                actual_delivery_time = CURRENT_TIMESTAMP
            `;
        }

        // =================================================
        // NON-ADMIN
        // =================================================

        query += `
            WHERE order_id = $2
        `;

        if (userRole !== 'admin') {

            if (userRole !== 'restaurant_owner') {

                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            query += `
                AND restaurant_id IN (
                    SELECT restaurant_id
                    FROM restaurants
                    WHERE owner_id = $3
                )
            `;

            queryParams.push(userId);
        }

        query += `
            RETURNING
                order_id,
                order_number,
                order_status,
                payment_status,
                updated_at,
                delivered_at,
                actual_delivery_time
        `;

        const result = await pool.query(
            query,
            queryParams
        );

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

        console.error(
            'Update Order Status Error:',
            err.message
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
};


// =====================================================
// CANCEL ORDER
// PUT /api/orders/:id/cancel
// =====================================================

const cancelOrder = async (req, res) => {

    try {

        const { id } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            UPDATE orders
            SET
                order_status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
              AND user_id = $2
              AND order_status = 'pending'
            RETURNING
                order_id,
                order_number,
                order_status,
                updated_at
            `,
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

        console.error(
            'Cancel Order Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createOrder,
    getUserOrders,
    getRestaurantOrders,
    getOrderDetails,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    cancelOrder
};
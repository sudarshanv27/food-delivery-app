// backend/controllers/order.controller.js

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// ================= CREATE ORDER =================
const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            restaurant_id,
            restaurant_name,
            items,
            subtotal,
            delivery_fee,
            tax,
            total_amount,
            delivery_address,
            delivery_latitude,
            delivery_longitude,
            payment_method = 'cash',
            special_instructions = '',
            offer_code
        } = req.body;

        // ================= VALIDATION =================
        if (!restaurant_id || !items || !Array.isArray(items) || items.length === 0 || !total_amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: restaurant_id, items, or total_amount'
            });
        }

        // Generate order number and ID
        const order_number = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const orderId = uuidv4();

        // ================= APPLY OFFER IF PROVIDED =================
        let discount_amount = 0;
        let offer_applied_id = null;

        if (offer_code) {
            try {
                const offerResult = await pool.query(
                    `SELECT * FROM offers WHERE code = $1 AND is_active = true 
                     AND valid_until > NOW() AND (usage_limit IS NULL OR used_count < usage_limit)`,
                    [offer_code]
                );

                if (offerResult.rows.length > 0) {
                    const offer = offerResult.rows[0];
                    const minOrderAmount = offer.min_order_amount || 0;

                    if (subtotal >= minOrderAmount) {
                        if (offer.discount_type === 'percentage') {
                            discount_amount = (subtotal * offer.discount_value) / 100;
                            if (offer.max_discount) {
                                discount_amount = Math.min(discount_amount, offer.max_discount);
                            }
                        } else {
                            discount_amount = offer.discount_value;
                        }
                        offer_applied_id = offer.offer_id;

                        // Update offer usage count
                        await pool.query(
                            `UPDATE offers SET used_count = used_count + 1 WHERE offer_id = $1`,
                            [offer.offer_id]
                        );
                    }
                }
            } catch (offerError) {
                console.error('Offer Application Error:', offerError.message);
                // Continue without offer if there's an error
            }
        }

        // ================= GET OR VALIDATE RESTAURANT NAME =================
        let finalRestaurantName = restaurant_name;

        if (!finalRestaurantName && restaurant_id) {
            try {
                const restaurantResult = await pool.query(
                    `SELECT name FROM restaurants WHERE restaurant_id = $1`,
                    [restaurant_id]
                );
                finalRestaurantName = restaurantResult.rows[0]?.name || null;
            } catch (restError) {
                console.error('Restaurant Fetch Error:', restError.message);
            }
        }

        // ================= INSERT ORDER =================
        const finalTotalAmount = total_amount - discount_amount;

        await pool.query(
            `INSERT INTO orders (
                order_id, order_number, user_id, restaurant_id, restaurant_name,
                items, subtotal, delivery_fee, tax, discount_amount, total_amount,
                delivery_address, delivery_latitude, delivery_longitude, special_instructions,
                payment_method, order_status, payment_status, offer_applied_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
            [
                orderId, order_number, userId, restaurant_id, finalRestaurantName,
                JSON.stringify(items), subtotal || 0, delivery_fee || 0, tax || 0,
                discount_amount, finalTotalAmount,
                delivery_address || '', delivery_latitude || null, delivery_longitude || null,
                special_instructions,
                payment_method, 'pending', 'pending', offer_applied_id
            ]
        );

        // ================= CLEAR USER CART =================
        try {
            // Try both possible cart table structures
            const cartResult = await pool.query(
                `SELECT cart_id FROM carts WHERE user_id = $1`,
                [userId]
            );

            if (cartResult.rows.length > 0) {
                await pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartResult.rows[0].cart_id]);
            }

            // Also try the simple cart table if it exists
            await pool.query(`DELETE FROM cart WHERE user_id = $1`, [userId]);
        } catch (cartError) {
            console.error('Cart Clear Error:', cartError.message);
            // Don't fail the order if cart clearing fails
        }

        // ================= RESPONSE =================
        return res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: orderId,
                order_number: order_number,
                discount_amount: discount_amount,
                final_total: finalTotalAmount
            }
        });

    } catch (err) {
        console.error('Create Order Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
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
                tax,
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

        // Fetch order with delivery tracking information
        const result = await pool.query(
            `SELECT 
                o.*,
                d.status as delivery_status,
                d.current_latitude,
                d.current_longitude,
                d.updated_at as delivery_updated_at,
                u.full_name as delivery_partner_name,
                u.phone as delivery_partner_phone
            FROM orders o
            LEFT JOIN deliveries d ON o.order_id = d.order_id
            LEFT JOIN users u ON d.partner_id = u.user_id
            WHERE o.order_id = $1 AND o.user_id = $2`,
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

// ================= GET ORDER BY ID (for admin/partner) =================
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        let query = `
            SELECT 
                o.*,
                d.status as delivery_status,
                d.current_latitude,
                d.current_longitude,
                u.full_name as delivery_partner_name,
                u.phone as delivery_partner_phone
            FROM orders o
            LEFT JOIN deliveries d ON o.order_id = d.order_id
            LEFT JOIN users u ON d.partner_id = u.user_id
            WHERE o.order_id = $1
        `;

        const queryParams = [id];

        // If not admin, restrict to user's own orders
        if (userRole !== 'admin') {
            query += ` AND o.user_id = $2`;
            queryParams.push(userId);
        }

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

// ================= TRACK ORDER (REAL-TIME) =================
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
                d.status as delivery_status, 
                d.current_latitude, 
                d.current_longitude,
                d.updated_at as location_updated_at,
                d.estimated_delivery_time
            FROM orders o
            LEFT JOIN deliveries d ON o.order_id = d.order_id
            WHERE o.order_id = $1 AND o.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Track Order Error:', error);
        res.status(500).json({
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
        const userRole = req.user.role;

        // ================= VALID STATUSES =================
        const validStatuses = [
            'pending',
            'confirmed',
            'preparing',
            'out_for_delivery',
            'delivered',
            'cancelled'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        // Check if user has permission (admin or restaurant owner)
        let query = `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2`;
        const queryParams = [status, orderId];

        if (userRole !== 'admin') {
            // For restaurant owners, add restaurant_id check
            query += ` AND restaurant_id IN (SELECT restaurant_id FROM restaurants WHERE owner_id = $3)`;
            queryParams.push(req.user.userId);
        }

        query += ` RETURNING *`;

        const result = await pool.query(query, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or you do not have permission to update it'
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

        // Only allow cancellation if order is still pending
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
                message: 'Order cannot be cancelled. Either order not found or already processed.'
            });
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({
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
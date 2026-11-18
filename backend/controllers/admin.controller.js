// backend/controllers/admin.controller.js

const { pool } = require('../config/database');


// ============================================================
// ================= GET DASHBOARD STATS ======================
// ============================================================

const getStats = async (req, res) => {
    try {

        const totalOrders = await pool.query(`
            SELECT COUNT(*) AS count
            FROM orders
        `);

        const totalUsers = await pool.query(`
            SELECT COUNT(*) AS count
            FROM users
            WHERE user_type = $1
        `, ['customer']);

        const totalRestaurants = await pool.query(`
            SELECT COUNT(*) AS count
            FROM restaurants
        `);

        const totalRevenue = await pool.query(`
            SELECT COALESCE(
                SUM(total_amount),
                0
            ) AS revenue
            FROM orders
            WHERE order_status = $1
        `, ['delivered']);

        const pendingOrders = await pool.query(`
            SELECT COUNT(*) AS count
            FROM orders
            WHERE order_status = $1
        `, ['pending']);

        const completedOrders = await pool.query(`
            SELECT COUNT(*) AS count
            FROM orders
            WHERE order_status = $1
        `, ['delivered']);

        const cancelledOrders = await pool.query(`
            SELECT COUNT(*) AS count
            FROM orders
            WHERE order_status = $1
        `, ['cancelled']);

        const avgOrderValue = await pool.query(`
            SELECT COALESCE(
                AVG(total_amount),
                0
            ) AS average
            FROM orders
        `);

        return res.json({
            success: true,

            stats: {
                totalOrders:
                    parseInt(
                        totalOrders.rows[0].count,
                        10
                    ),

                totalUsers:
                    parseInt(
                        totalUsers.rows[0].count,
                        10
                    ),

                totalRestaurants:
                    parseInt(
                        totalRestaurants.rows[0].count,
                        10
                    ),

                totalRevenue:
                    parseFloat(
                        totalRevenue.rows[0].revenue
                    ),

                pendingOrders:
                    parseInt(
                        pendingOrders.rows[0].count,
                        10
                    ),

                completedOrders:
                    parseInt(
                        completedOrders.rows[0].count,
                        10
                    ),

                cancelledOrders:
                    parseInt(
                        cancelledOrders.rows[0].count,
                        10
                    ),

                avgOrderValue:
                    Math.round(
                        parseFloat(
                            avgOrderValue.rows[0].average
                        )
                    )
            }
        });

    } catch (error) {

        console.error(
            'Get Stats Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to fetch dashboard stats'
        });
    }
};


// ============================================================
// ================= GET RECENT ORDERS ========================
// ============================================================

const getRecentOrders = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                o.order_id,
                o.order_number,
                u.full_name AS customer,
                COALESCE(
                    o.restaurant_name,
                    r.name
                ) AS restaurant,
                o.total_amount AS amount,
                o.order_status AS status,
                o.payment_method,
                o.payment_status,
                o.created_at AS date

            FROM orders o

            LEFT JOIN users u
                ON o.user_id = u.user_id

            LEFT JOIN restaurants r
                ON o.restaurant_id = r.restaurant_id

            ORDER BY o.created_at DESC

            LIMIT 10
        `);

        return res.json({
            success: true,
            orders: result.rows,
            data: result.rows
        });

    } catch (error) {

        console.error(
            'Get Recent Orders Error:',
            error
        );

        return res.status(500).json({
            success: false,
            orders: [],
            data: []
        });
    }
};


// ============================================================
// ================= GET RECENT USERS =========================
// ============================================================

const getRecentUsers = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                user_id,
                full_name AS name,
                email,
                phone,
                user_type,
                is_active,
                is_verified,
                created_at AS "joinDate"

            FROM users

            WHERE user_type = 'customer'

            ORDER BY created_at DESC

            LIMIT 10
        `);

        return res.json({
            success: true,
            users: result.rows,
            data: result.rows
        });

    } catch (error) {

        console.error(
            'Get Recent Users Error:',
            error
        );

        return res.status(500).json({
            success: false,
            users: [],
            data: []
        });
    }
};


// ============================================================
// ================= GET ALL USERS ============================
// ============================================================

const getAllUsers = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                user_id,
                full_name,
                email,
                phone,
                user_type,
                avatar_url,
                is_active,
                is_verified,
                created_at,
                updated_at

            FROM users

            ORDER BY created_at DESC
        `);

        return res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {

        console.error(
            'Get All Users Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to fetch users'
        });
    }
};


// ============================================================
// ================= UPDATE USER STATUS =======================
// ============================================================

const updateUserStatus = async (req, res) => {
    try {

        const { userId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message:
                    'is_active must be a boolean'
            });
        }

        const result = await pool.query(`
            UPDATE users

            SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE user_id = $2

            RETURNING
                user_id,
                full_name,
                email,
                user_type,
                is_active,
                updated_at
        `, [
            is_active,
            userId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found'
            });
        }

        return res.json({
            success: true,
            message:
                'User status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {

        console.error(
            'Update User Status Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to update user status'
        });
    }
};


// ============================================================
// ================= GET ALL RESTAURANTS ======================
// ============================================================

const getAllRestaurants = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                r.restaurant_id,
                r.owner_id,
                r.name,
                r.description,
                r.address,
                r.latitude,
                r.longitude,
                r.logo_url,
                r.cover_image_url,
                r.cuisine_types,
                r.avg_rating AS rating,
                r.delivery_fee,
                r.min_order_amount,
                r.estimated_delivery_time,
                r.is_open,
                r.is_active,
                r.created_at,
                r.updated_at,

                u.full_name AS owner_name,
                u.email AS owner_email,
                u.phone AS owner_phone

            FROM restaurants r

            LEFT JOIN users u
                ON r.owner_id = u.user_id

            ORDER BY r.created_at DESC
        `);

        return res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {

        console.error(
            'Get All Restaurants Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to fetch restaurants'
        });
    }
};


// ============================================================
// ================= UPDATE RESTAURANT STATUS =================
// ============================================================

const updateRestaurantStatus = async (req, res) => {
    try {

        const { restaurantId } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message:
                    'is_active must be a boolean'
            });
        }

        const result = await pool.query(`
            UPDATE restaurants

            SET
                is_active = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE restaurant_id = $2

            RETURNING *
        `, [
            is_active,
            restaurantId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    'Restaurant not found'
            });
        }

        return res.json({
            success: true,
            message:
                'Restaurant status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {

        console.error(
            'Update Restaurant Status Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to update restaurant status'
        });
    }
};


// ============================================================
// ================= GET ALL ORDERS ============================
// ============================================================

const getAllOrders = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                o.*,

                u.full_name AS customer_name,
                u.email AS customer_email,

                COALESCE(
                    o.restaurant_name,
                    r.name
                ) AS restaurant_name_from_db

            FROM orders o

            LEFT JOIN users u
                ON o.user_id = u.user_id

            LEFT JOIN restaurants r
                ON o.restaurant_id = r.restaurant_id

            ORDER BY o.created_at DESC
        `);

        return res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {

        console.error(
            'Get All Orders Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to fetch orders'
        });
    }
};


// ============================================================
// ================= ADMIN ANALYTICS ==========================
// ============================================================

const getAnalytics = async (req, res) => {

    try {

        // -----------------------------------------------------
        // DATE FILTER
        // -----------------------------------------------------

        const {
            start_date,
            end_date
        } = req.query;

        const startDate =
            start_date || '2000-01-01';

        const endDate =
            end_date || '2999-12-31';


        // -----------------------------------------------------
        // OVERVIEW
        // -----------------------------------------------------

        const overview = await pool.query(`
            SELECT

                COUNT(*)::INTEGER
                    AS total_orders,

                COUNT(*) FILTER (
                    WHERE order_status = 'delivered'
                )::INTEGER
                    AS completed_orders,

                COUNT(*) FILTER (
                    WHERE order_status = 'cancelled'
                )::INTEGER
                    AS cancelled_orders,

                COUNT(*) FILTER (
                    WHERE order_status = 'pending'
                )::INTEGER
                    AS pending_orders,

                COUNT(*) FILTER (
                    WHERE order_status = 'refunded'
                )::INTEGER
                    AS refunded_orders,

                COALESCE(
                    SUM(total_amount),
                    0
                )::NUMERIC
                    AS total_revenue,

                COALESCE(
                    AVG(total_amount),
                    0
                )::NUMERIC
                    AS average_order_value

            FROM orders

            WHERE created_at >= $1::DATE

            AND created_at <
                ($2::DATE + INTERVAL '1 day')
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // ORDERS + REVENUE BY DAY
        // -----------------------------------------------------

        const ordersByDay = await pool.query(`
            SELECT

                DATE(created_at)
                    AS date,

                COUNT(*)::INTEGER
                    AS orders,

                COALESCE(
                    SUM(total_amount),
                    0
                )::NUMERIC
                    AS revenue

            FROM orders

            WHERE created_at >= $1::DATE

            AND created_at <
                ($2::DATE + INTERVAL '1 day')

            GROUP BY DATE(created_at)

            ORDER BY date
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // CUSTOMER GROWTH
        // -----------------------------------------------------

        const userGrowth = await pool.query(`
            SELECT

                DATE(created_at)
                    AS date,

                COUNT(*)::INTEGER
                    AS users

            FROM users

            WHERE user_type = 'customer'

            AND created_at >= $1::DATE

            AND created_at <
                ($2::DATE + INTERVAL '1 day')

            GROUP BY DATE(created_at)

            ORDER BY date
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------------

        const orderStatus = await pool.query(`
            SELECT

                COALESCE(
                    order_status,
                    'unknown'
                ) AS status,

                COUNT(*)::INTEGER
                    AS count

            FROM orders

            WHERE created_at >= $1::DATE

            AND created_at <
                ($2::DATE + INTERVAL '1 day')

            GROUP BY order_status

            ORDER BY count DESC
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // PAYMENT METHODS
        // -----------------------------------------------------

        const paymentMethods = await pool.query(`
            SELECT

                COALESCE(
                    payment_method,
                    'unknown'
                ) AS method,

                COUNT(*)::INTEGER
                    AS count,

                COALESCE(
                    SUM(total_amount),
                    0
                )::NUMERIC
                    AS revenue

            FROM orders

            WHERE created_at >= $1::DATE

            AND created_at <
                ($2::DATE + INTERVAL '1 day')

            GROUP BY payment_method

            ORDER BY count DESC
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // TOP RESTAURANTS
        // -----------------------------------------------------

        const topRestaurants = await pool.query(`
            SELECT

                r.restaurant_id,

                r.name,

                COUNT(o.order_id)::INTEGER
                    AS orders,

                COALESCE(
                    SUM(o.total_amount),
                    0
                )::NUMERIC
                    AS revenue,

                COALESCE(
                    AVG(o.total_amount),
                    0
                )::NUMERIC
                    AS average_order_value

            FROM orders o

            INNER JOIN restaurants r
                ON o.restaurant_id =
                   r.restaurant_id

            WHERE o.created_at >= $1::DATE

            AND o.created_at <
                ($2::DATE + INTERVAL '1 day')

            GROUP BY
                r.restaurant_id,
                r.name

            ORDER BY revenue DESC

            LIMIT 10
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // TOP DISHES
        // -----------------------------------------------------

        const topDishes = await pool.query(`
            SELECT

                oi.menu_item_id,

                COALESCE(
                    oi.item_name,
                    'Unknown Item'
                ) AS name,

                SUM(
                    oi.quantity
                )::INTEGER
                    AS quantity,

                COALESCE(
                    SUM(oi.total_price),
                    0
                )::NUMERIC
                    AS revenue

            FROM order_items oi

            INNER JOIN orders o
                ON oi.order_id =
                   o.order_id

            WHERE o.created_at >= $1::DATE

            AND o.created_at <
                ($2::DATE + INTERVAL '1 day')

            GROUP BY
                oi.menu_item_id,
                oi.item_name

            ORDER BY quantity DESC

            LIMIT 10
        `, [
            startDate,
            endDate
        ]);


        // -----------------------------------------------------
        // DELIVERY PERFORMANCE
        // -----------------------------------------------------

        const deliveryPerformance =
            await pool.query(`
                SELECT

                    COUNT(*) FILTER (
                        WHERE order_status =
                        'delivered'
                    )::INTEGER
                        AS delivered_orders,

                    COALESCE(
                        AVG(
                            EXTRACT(
                                EPOCH FROM (
                                    actual_delivery_time -
                                    created_at
                                )
                            ) / 60
                        ) FILTER (
                            WHERE
                            actual_delivery_time
                            IS NOT NULL

                            AND order_status =
                            'delivered'
                        ),
                        0
                    )::NUMERIC
                        AS average_delivery_time

                FROM orders

                WHERE created_at >= $1::DATE

                AND created_at <
                    ($2::DATE + INTERVAL '1 day')
            `, [
                startDate,
                endDate
            ]);


        // -----------------------------------------------------
        // CUSTOMER SUMMARY
        // -----------------------------------------------------

        const customerSummary =
            await pool.query(`
                SELECT

                    COUNT(*) FILTER (
                        WHERE user_type =
                        'customer'
                    )::INTEGER
                        AS total_customers,

                    COUNT(*) FILTER (
                        WHERE user_type =
                        'customer'

                        AND is_active = true
                    )::INTEGER
                        AS active_customers

                FROM users
            `);


        // -----------------------------------------------------
        // RESTAURANT SUMMARY
        // -----------------------------------------------------

        const restaurantSummary =
            await pool.query(`
                SELECT

                    COUNT(*)::INTEGER
                        AS total_restaurants,

                    COUNT(*) FILTER (
                        WHERE is_active = true
                    )::INTEGER
                        AS active_restaurants,

                    COALESCE(
                        AVG(avg_rating),
                        0
                    )::NUMERIC
                        AS average_rating

                FROM restaurants
            `);


        // -----------------------------------------------------
        // DELIVERY PARTNER SUMMARY
        // -----------------------------------------------------

        const deliverySummary =
            await pool.query(`
                SELECT

                    COUNT(*)::INTEGER
                        AS total_delivery_partners,

                    COUNT(*) FILTER (
                        WHERE is_online = true
                    )::INTEGER
                        AS online_delivery_partners,

                    COUNT(*) FILTER (
                        WHERE is_available = true
                    )::INTEGER
                        AS available_delivery_partners

                FROM delivery_partners
            `);


        // -----------------------------------------------------
        // CONVERT VALUES
        // -----------------------------------------------------

        const stats =
            overview.rows[0];

        const delivery =
            deliveryPerformance.rows[0];

        const customers =
            customerSummary.rows[0];

        const restaurants =
            restaurantSummary.rows[0];

        const deliveryPartners =
            deliverySummary.rows[0];


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return res.json({

            success: true,

            data: {

                overview: {

                    total_orders:
                        Number(
                            stats.total_orders
                        ),

                    completed_orders:
                        Number(
                            stats.completed_orders
                        ),

                    cancelled_orders:
                        Number(
                            stats.cancelled_orders
                        ),

                    pending_orders:
                        Number(
                            stats.pending_orders
                        ),

                    refunded_orders:
                        Number(
                            stats.refunded_orders
                        ),

                    total_revenue:
                        Number(
                            stats.total_revenue
                        ),

                    average_order_value:
                        Number(
                            stats.average_order_value
                        )
                },


                orders_by_day:
                    ordersByDay.rows.map(
                        row => ({
                            date:
                                row.date,

                            orders:
                                Number(
                                    row.orders
                                ),

                            revenue:
                                Number(
                                    row.revenue
                                )
                        })
                    ),


                user_growth:
                    userGrowth.rows.map(
                        row => ({
                            date:
                                row.date,

                            users:
                                Number(
                                    row.users
                                )
                        })
                    ),


                order_status:
                    orderStatus.rows.map(
                        row => ({
                            status:
                                row.status,

                            count:
                                Number(
                                    row.count
                                )
                        })
                    ),


                payment_methods:
                    paymentMethods.rows.map(
                        row => ({
                            method:
                                row.method,

                            count:
                                Number(
                                    row.count
                                ),

                            revenue:
                                Number(
                                    row.revenue
                                )
                        })
                    ),


                top_restaurants:
                    topRestaurants.rows.map(
                        row => ({
                            restaurant_id:
                                row.restaurant_id,

                            name:
                                row.name,

                            orders:
                                Number(
                                    row.orders
                                ),

                            revenue:
                                Number(
                                    row.revenue
                                ),

                            average_order_value:
                                Number(
                                    row.average_order_value
                                )
                        })
                    ),


                top_dishes:
                    topDishes.rows.map(
                        row => ({
                            menu_item_id:
                                row.menu_item_id,

                            name:
                                row.name,

                            quantity:
                                Number(
                                    row.quantity
                                ),

                            revenue:
                                Number(
                                    row.revenue
                                )
                        })
                    ),


                delivery_performance: {

                    delivered_orders:
                        Number(
                            delivery.delivered_orders
                        ),

                    average_delivery_time:
                        Number(
                            delivery.average_delivery_time
                        )
                },


                customers: {

                    total:
                        Number(
                            customers.total_customers
                        ),

                    active:
                        Number(
                            customers.active_customers
                        )
                },


                restaurants: {

                    total:
                        Number(
                            restaurants.total_restaurants
                        ),

                    active:
                        Number(
                            restaurants.active_restaurants
                        ),

                    average_rating:
                        Number(
                            restaurants.average_rating
                        )
                },


                delivery_partners: {

                    total:
                        Number(
                            deliveryPartners
                                .total_delivery_partners
                        ),

                    online:
                        Number(
                            deliveryPartners
                                .online_delivery_partners
                        ),

                    available:
                        Number(
                            deliveryPartners
                                .available_delivery_partners
                        )
                },


                period: {

                    start_date:
                        startDate,

                    end_date:
                        endDate
                }
            }
        });

    } catch (error) {

        console.error(
            'Get Analytics Error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to fetch analytics'
        });
    }
};


// ============================================================
// ================= MODULE EXPORTS ===========================
// ============================================================

module.exports = {

    getStats,

    getRecentOrders,

    getRecentUsers,

    getAllUsers,

    updateUserStatus,

    getAllRestaurants,

    updateRestaurantStatus,

    getAllOrders,

    getAnalytics
};
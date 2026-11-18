// backend/controllers/admin.controller.js

const { pool } = require('../config/database');

// ================= GET DASHBOARD STATS =================
const getStats = async (
    req,
    res
) => {

    try {

        // ================= TOTAL ORDERS =================
        const totalOrders =
            await pool.query(
                `SELECT COUNT(*) FROM orders`
            );

        // ================= TOTAL USERS =================
        const totalUsers =
            await pool.query(

                `
        SELECT COUNT(*)
        FROM users
        WHERE user_type = $1
        `,

                ['customer']

            );

        // ================= TOTAL RESTAURANTS =================
        const totalRestaurants =
            await pool.query(
                `SELECT COUNT(*) FROM restaurants`
            );

        // ================= TOTAL REVENUE =================
        const totalRevenue =
            await pool.query(

                `
        SELECT COALESCE(
          SUM(total_amount),
          0
        )
        FROM orders
        WHERE order_status = $1
        `,

                ['delivered']

            );

        // ================= PENDING ORDERS =================
        const pendingOrders =
            await pool.query(

                `
        SELECT COUNT(*)
        FROM orders
        WHERE order_status = $1
        `,

                ['pending']

            );

        // ================= COMPLETED ORDERS =================
        const completedOrders =
            await pool.query(

                `
        SELECT COUNT(*)
        FROM orders
        WHERE order_status = $1
        `,

                ['delivered']

            );

        // ================= CANCELLED ORDERS =================
        const cancelledOrders =
            await pool.query(

                `
        SELECT COUNT(*)
        FROM orders
        WHERE order_status = $1
        `,

                ['cancelled']

            );

        // ================= AVERAGE ORDER VALUE =================
        const avgOrderValue =
            await pool.query(

                `
        SELECT COALESCE(
          AVG(total_amount),
          0
        )
        FROM orders
        `

            );

        // ================= RESPONSE =================
        return res.json({

            success: true,

            stats: {

                totalOrders:
                    parseInt(
                        totalOrders.rows[0].count
                    ),

                totalUsers:
                    parseInt(
                        totalUsers.rows[0].count
                    ),

                totalRestaurants:
                    parseInt(
                        totalRestaurants.rows[0].count
                    ),

                totalRevenue:
                    parseFloat(
                        totalRevenue.rows[0]
                            .coalesce
                    ),

                pendingOrders:
                    parseInt(
                        pendingOrders.rows[0]
                            .count
                    ),

                completedOrders:
                    parseInt(
                        completedOrders.rows[0]
                            .count
                    ),

                cancelledOrders:
                    parseInt(
                        cancelledOrders.rows[0]
                            .count
                    ),

                avgOrderValue:
                    Math.round(
                        parseFloat(
                            avgOrderValue.rows[0]
                                .coalesce
                        )
                    )

            }

        });

    } catch (err) {

        console.error(
            'Get Stats Error:',
            err.message
        );

        return res.status(500).json({

            success: false,

            message:
                'Failed to fetch dashboard stats'

        });

    }

};

// ================= GET RECENT ORDERS =================
const getRecentOrders = async (
    req,
    res
) => {

    try {

        const result =
            await pool.query(

                `
        SELECT
          o.order_id,
          o.order_number,
          u.full_name AS customer,
          o.restaurant_name AS restaurant,
          o.total_amount AS amount,
          o.order_status AS status,
          o.created_at AS date
        FROM orders o
        JOIN users u
        ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
        LIMIT 10
        `

            );

        return res.json({

            success: true,

            orders: result.rows

        });

    } catch (err) {

        console.error(
            'Get Recent Orders Error:',
            err.message
        );

        return res.status(500).json({

            success: false,

            orders: []

        });

    }

};

// ================= GET RECENT USERS =================
const getRecentUsers = async (
    req,
    res
) => {

    try {

        const result =
            await pool.query(

                `
        SELECT
          user_id,
          full_name AS name,
          email,
          created_at AS joinDate
        FROM users
        WHERE user_type = 'customer'
        ORDER BY created_at DESC
        LIMIT 10
        `

            );

        return res.json({

            success: true,

            users: result.rows

        });

    } catch (err) {

        console.error(
            'Get Recent Users Error:',
            err.message
        );

        return res.status(500).json({

            success: false,

            users: []

        });

    }

};

// ================= GET ALL RESTAURANTS =================
const getAllRestaurants = async (
    req,
    res
) => {

    try {

        const result =
            await pool.query(

                `
        SELECT
          restaurant_id,
          name,
          avg_rating AS rating,
          is_open AS status,
          delivery_fee,
          estimated_delivery_time
        FROM restaurants
        ORDER BY avg_rating DESC
        `

            );

        return res.json({

            success: true,

            restaurants: result.rows

        });

    } catch (err) {

        console.error(
            'Get Restaurants Error:',
            err.message
        );

        return res.status(500).json({

            success: false,

            restaurants: []

        });

    }

};

// ================= EXPORT =================
module.exports = {

    getStats,

    getRecentOrders,

    getRecentUsers,

    getAllRestaurants

};

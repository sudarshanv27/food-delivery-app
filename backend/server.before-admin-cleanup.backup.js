// backend/server.js

// ================= ENVIRONMENT =================
require("dotenv").config();

// ================= CORE =================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const http = require("http");
const path = require("path");

// ================= UTILITIES =================
const createFolders = require("./utils/createFolders");
createFolders();

// ================= DATABASE =================
const {
    pool,
    testConnection,
} = require("./config/database");

// ================= SOCKET =================
const {
    initializeSocket,
} = require("./config/socket");

// ================= AUTHENTICATION =================
const {
    authenticate,
    isAdmin,
} = require("./middleware/auth");

// ================= ROUTES =================
const authRoutes =
    require("./routes/auth.routes");

const restaurantRoutes =
    require("./routes/restaurant.routes");

const cartRoutes =
    require("./routes/cart.routes");

const orderRoutes =
    require("./routes/order.routes");

const adminRoutes =
    require("./routes/admin.routes");

const reviewRoutes =
    require("./routes/review.routes");

// Optional routes
const addressRoutes =
    require("./routes/address.routes");

const offerRoutes =
    require("./routes/offer.routes");

const deliveryRoutes =
    require("./routes/delivery.routes");

const paymentRoutes =
    require("./routes/payment.routes");

// ================= APP =================
const app = express();

const server =
    http.createServer(app);

// ================= SOCKET.IO =================
initializeSocket(server);

// ================= GLOBAL MIDDLEWARE =================

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(
    helmet()
);

app.use(
    compression()
);

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// ================= STATIC FILES =================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);

// ================= RATE LIMITER =================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many requests. Please try again later.",
    },
});

app.use(
    "/api",
    limiter
);

// ================= DATABASE TEST =================

testConnection();

// ================= ROOT ROUTE =================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Food Delivery API is running",
        version: "1.0.0",
    });
});

// ================= HEALTH CHECK =================

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            success: true,
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error(
            "Health Check Error:",
            error.message
        );

        res.status(503).json({
            success: false,
            status: "unhealthy",
            database: "disconnected",
        });
    }
});

// ============================================================
// ======================= API ROUTES =========================
// ============================================================

// ================= AUTH =================

app.use(
    "/api/auth",
    authRoutes
);

// ================= RESTAURANTS =================

app.use(
    "/api/restaurants",
    restaurantRoutes
);

// ================= CART =================

app.use(
    "/api/cart",
    cartRoutes
);

// ================= ORDERS =================

app.use(
    "/api/orders",
    orderRoutes
);

// ================= ADMIN =================

app.use(
    "/api/admin",
    adminRoutes
);

// ================= REVIEWS =================

app.use(
    "/api/reviews",
    reviewRoutes
);

// ================= ADDRESSES =================

app.use(
    "/api/addresses",
    addressRoutes
);

// ================= OFFERS =================

app.use(
    "/api/offers",
    offerRoutes
);

// ================= DELIVERY =================

app.use(
    "/api/delivery",
    deliveryRoutes
);

// ================= PAYMENTS =================

app.use(
    "/api/payments",
    paymentRoutes
);

// ============================================================
// =============== RESTAURANT OWNER APIs ======================
// ============================================================

// ================= RESTAURANT OWNER STATS ====================

app.get(
    "/api/restaurant/stats",
    authenticate,
    async (req, res) => {
        try {
            const userId =
                req.user.userId;

            const result =
                await pool.query(
                    `
                    SELECT
                        COUNT(DISTINCT o.order_id)::INTEGER
                            AS total_orders,

                        COUNT(
                            DISTINCT CASE
                                WHEN o.order_status = 'delivered'
                                THEN o.order_id
                            END
                        )::INTEGER
                            AS completed_orders,

                        COUNT(
                            DISTINCT CASE
                                WHEN o.order_status IN (
                                    'pending',
                                    'confirmed',
                                    'preparing',
                                    'ready_for_delivery',
                                    'out_for_delivery'
                                )
                                THEN o.order_id
                            END
                        )::INTEGER
                            AS active_orders,

                        COALESCE(
                            SUM(
                                CASE
                                    WHEN o.order_status = 'delivered'
                                    THEN o.total_amount
                                    ELSE 0
                                END
                            ),
                            0
                        ) AS total_revenue

                    FROM orders o

                    INNER JOIN restaurants r
                        ON o.restaurant_id =
                           r.restaurant_id

                    WHERE r.owner_id = $1
                    `,
                    [userId]
                );

            res.json({
                success: true,
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Restaurant Stats Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch restaurant statistics",
            });
        }
    }
);

// ================= RESTAURANT OWNER ORDERS ===================

app.get(
    "/api/restaurant/orders",
    authenticate,
    async (req, res) => {
        try {
            const userId =
                req.user.userId;

            const result =
                await pool.query(
                    `
                    SELECT
                        o.order_id,
                        o.order_number,
                        o.restaurant_id,
                        o.restaurant_name,
                        o.items,
                        o.subtotal,
                        o.delivery_fee,
                        o.tax,
                        o.total_amount,
                        o.payment_method,
                        o.payment_status,
                        o.order_status,
                        o.delivery_address,
                        o.created_at,
                        u.full_name AS customer_name,
                        u.phone AS customer_phone

                    FROM orders o

                    INNER JOIN restaurants r
                        ON o.restaurant_id =
                           r.restaurant_id

                    LEFT JOIN users u
                        ON o.user_id =
                           u.user_id

                    WHERE r.owner_id = $1

                    ORDER BY o.created_at DESC
                    `,
                    [userId]
                );

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length,
            });

        } catch (error) {
            console.error(
                "Restaurant Orders Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch restaurant orders",
            });
        }
    }
);

// ================= RESTAURANT OWNER UPDATE ORDER ============

app.put(
    "/api/restaurant/orders/:orderId/status",
    authenticate,
    async (req, res) => {
        try {
            const {
                orderId,
            } = req.params;

            const {
                status,
            } = req.body;

            const userId =
                req.user.userId;

            const validStatuses = [
                "pending",
                "confirmed",
                "preparing",
                "ready_for_delivery",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "refunded",
            ];

            if (
                !validStatuses.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order status",
                });
            }

            const result =
                await pool.query(
                    `
                    UPDATE orders o

                    SET
                        order_status = $1,
                        updated_at =
                            CURRENT_TIMESTAMP

                    FROM restaurants r

                    WHERE o.order_id = $2
                      AND o.restaurant_id =
                          r.restaurant_id
                      AND r.owner_id = $3

                    RETURNING o.*
                    `,
                    [
                        status,
                        orderId,
                        userId,
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Order not found or you do not have permission",
                });
            }

            res.json({
                success: true,
                message:
                    "Order status updated successfully",
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Restaurant Order Status Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update order status",
            });
        }
    }
);

// ============================================================
// =============== RESTAURANT OWNER MENU APIs ================
// ============================================================

// ================= GET RESTAURANT OWNER MENU =================
app.get(
    "/api/restaurant/menu",
    authenticate,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const result = await pool.query(
                `
                SELECT
                    mi.item_id,
                    mi.restaurant_id,
                    mi.name,
                    mi.description,
                    mi.price,
                    mi.image_url,
                    mi.is_vegetarian,
                    mi.is_available,
                    mi.preparation_time,
                    mi.created_at
                FROM menu_items mi
                INNER JOIN restaurants r
                    ON mi.restaurant_id = r.restaurant_id
                WHERE r.owner_id = $1
                ORDER BY mi.created_at DESC
                `,
                [userId]
            );

            return res.json({
                success: true,
                data: result.rows,
                count: result.rows.length,
            });

        } catch (error) {
            console.error(
                "Restaurant Menu Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch restaurant menu",
                error: error.message,
            });
        }
    }
);


// ================= ADD MENU ITEM ===============================
app.post(
    "/api/restaurant/menu",
    authenticate,
    async (req, res) => {
        try {
            const userId = req.user.userId;

            const {
                restaurant_id,
                name,
                description = "",
                price,
                image_url = null,
                is_vegetarian = false,
                is_available = true,
                preparation_time = 15,
            } = req.body;

            // Validate required fields
            if (
                !restaurant_id ||
                !name ||
                price === undefined ||
                price === null
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "restaurant_id, name and price are required",
                });
            }

            // Verify restaurant ownership
            const ownerCheck = await pool.query(
                `
                SELECT restaurant_id
                FROM restaurants
                WHERE restaurant_id = $1
                  AND owner_id = $2
                `,
                [
                    restaurant_id,
                    userId,
                ]
            );

            if (ownerCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not own this restaurant",
                });
            }

            // Generate menu item ID
            const { v4: uuidv4 } = require("uuid");
            const itemId = uuidv4();

            // Insert menu item
            const result = await pool.query(
                `
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
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9
                )
                RETURNING *
                `,
                [
                    itemId,
                    restaurant_id,
                    name,
                    description,
                    price,
                    image_url,
                    is_vegetarian,
                    is_available,
                    preparation_time,
                ]
            );

            return res.status(201).json({
                success: true,
                message:
                    "Menu item created successfully",
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Add Menu Item Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to create menu item",
                error: error.message,
            });
        }
    }
);


// ================= UPDATE MENU ITEM =============================
app.put(
    "/api/restaurant/menu/:itemId",
    authenticate,
    async (req, res) => {
        try {
            const {
                itemId,
            } = req.params;

            const userId =
                req.user.userId;

            const {
                name,
                description,
                price,
                image_url,
                is_vegetarian,
                is_available,
                preparation_time,
            } = req.body;

            const result = await pool.query(
                `
                UPDATE menu_items mi

                SET
                    name = COALESCE($1, mi.name),

                    description =
                        COALESCE(
                            $2,
                            mi.description
                        ),

                    price =
                        COALESCE(
                            $3,
                            mi.price
                        ),

                    image_url =
                        COALESCE(
                            $4,
                            mi.image_url
                        ),

                    is_vegetarian =
                        COALESCE(
                            $5,
                            mi.is_vegetarian
                        ),

                    is_available =
                        COALESCE(
                            $6,
                            mi.is_available
                        ),

                    preparation_time =
                        COALESCE(
                            $7,
                            mi.preparation_time
                        )

                FROM restaurants r

                WHERE mi.item_id = $8
                  AND mi.restaurant_id =
                      r.restaurant_id
                  AND r.owner_id = $9

                RETURNING mi.*
                `,
                [
                    name,
                    description,
                    price,
                    image_url,
                    is_vegetarian,
                    is_available,
                    preparation_time,
                    itemId,
                    userId,
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Menu item not found or you do not have permission",
                });
            }

            return res.json({
                success: true,
                message:
                    "Menu item updated successfully",
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Update Menu Item Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update menu item",
                error: error.message,
            });
        }
    }
);


// ================= DELETE MENU ITEM =============================
app.delete(
    "/api/restaurant/menu/:itemId",
    authenticate,
    async (req, res) => {
        try {
            const {
                itemId,
            } = req.params;

            const userId =
                req.user.userId;

            const result = await pool.query(
                `
                DELETE FROM menu_items mi

                USING restaurants r

                WHERE mi.item_id = $1
                  AND mi.restaurant_id =
                      r.restaurant_id
                  AND r.owner_id = $2

                RETURNING mi.*
                `,
                [
                    itemId,
                    userId,
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Menu item not found or you do not have permission",
                });
            }

            return res.json({
                success: true,
                message:
                    "Menu item deleted successfully",
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Delete Menu Item Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete menu item",
                error: error.message,
            });
        }
    }
);

// ============================================================
// ======================= ADMIN APIs ==========================
// ============================================================

// ================= ADMIN STATS ===============================

app.get(
    "/api/admin/stats",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `
                    SELECT
                        (SELECT COUNT(*)
                         FROM users)
                            AS total_users,

                        (SELECT COUNT(*)
                         FROM restaurants)
                            AS total_restaurants,

                        (SELECT COUNT(*)
                         FROM orders)
                            AS total_orders,

                        (SELECT COALESCE(
                            SUM(total_amount),
                            0
                         )
                         FROM orders
                         WHERE order_status =
                               'delivered')
                            AS total_revenue,

                        (SELECT COUNT(*)
                         FROM orders
                         WHERE order_status =
                               'pending')
                            AS pending_orders,

                        (SELECT COUNT(*)
                         FROM orders
                         WHERE order_status =
                               'delivered')
                            AS delivered_orders,

                        (SELECT COUNT(*)
                         FROM orders
                         WHERE order_status =
                               'cancelled')
                            AS cancelled_orders
                    `
                );

            res.json({
                success: true,
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Admin Stats Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch admin statistics",
            });
        }
    }
);

// ================= ADMIN USERS ===============================

app.get(
    "/api/admin/users",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `
                    SELECT
                        user_id,
                        full_name,
                        email,
                        phone,
                        user_type,
                        avatar_url,
                        wallet_balance,
                        is_active,
                        created_at,
                        updated_at
                    FROM users
                    ORDER BY created_at DESC
                    `
                );

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length,
            });

        } catch (error) {
            console.error(
                "Admin Users Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch users",
            });
        }
    }
);

// ================= ADMIN USER STATUS =========================

app.put(
    "/api/admin/users/:userId/status",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const {
                userId,
            } = req.params;

            const {
                is_active,
            } = req.body;

            const result =
                await pool.query(
                    `
                    UPDATE users
                    SET
                        is_active = $1,
                        updated_at =
                            CURRENT_TIMESTAMP
                    WHERE user_id = $2
                    RETURNING
                        user_id,
                        full_name,
                        email,
                        user_type,
                        is_active
                    `,
                    [
                        is_active,
                        userId,
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found",
                });
            }

            res.json({
                success: true,
                message:
                    "User status updated successfully",
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Admin User Status Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update user status",
            });
        }
    }
);

// ================= ADMIN RESTAURANTS ==========================

app.get(
    "/api/admin/restaurants",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `
                    SELECT
                        r.*,
                        u.full_name AS owner_name,
                        u.email AS owner_email,
                        u.phone AS owner_phone

                    FROM restaurants r

                    LEFT JOIN users u
                        ON r.owner_id =
                           u.user_id

                    ORDER BY
                        r.created_at DESC
                    `
                );

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length,
            });

        } catch (error) {
            console.error(
                "Admin Restaurants Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch restaurants",
            });
        }
    }
);

// ================= ADMIN RESTAURANT STATUS ===================

app.put(
    "/api/admin/restaurants/:restaurantId/status",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const {
                restaurantId,
            } = req.params;

            const {
                is_active,
            } = req.body;

            const result =
                await pool.query(
                    `
                    UPDATE restaurants
                    SET
                        is_active = $1,
                        updated_at =
                            CURRENT_TIMESTAMP
                    WHERE restaurant_id = $2
                    RETURNING *
                    `,
                    [
                        is_active,
                        restaurantId,
                    ]
                );

            if (
                result.rows.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Restaurant not found",
                });
            }

            res.json({
                success: true,
                message:
                    "Restaurant status updated successfully",
                data: result.rows[0],
            });

        } catch (error) {
            console.error(
                "Admin Restaurant Status Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update restaurant status",
            });
        }
    }
);

// ================= ADMIN ORDERS ==============================

app.get(
    "/api/admin/orders",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `
                    SELECT
                        o.*,
                        u.full_name AS customer_name,
                        u.email AS customer_email,
                        r.name AS restaurant_name_from_db

                    FROM orders o

                    LEFT JOIN users u
                        ON o.user_id =
                           u.user_id

                    LEFT JOIN restaurants r
                        ON o.restaurant_id =
                           r.restaurant_id

                    ORDER BY
                        o.created_at DESC
                    `
                );

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length,
            });

        } catch (error) {
            console.error(
                "Admin Orders Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch orders",
            });
        }
    }
);

// ================= ADMIN ANALYTICS ===========================

app.get(
    "/api/admin/analytics",
    authenticate,
    isAdmin,
    async (req, res) => {
        try {
            const ordersByDay =
                await pool.query(
                    `
                    SELECT
                        DATE(created_at) AS date,
                        COUNT(*)::INTEGER
                            AS orders,
                        COALESCE(
                            SUM(total_amount),
                            0
                        ) AS revenue
                    FROM orders
                    WHERE created_at >=
                        CURRENT_DATE - INTERVAL '6 days'
                    GROUP BY DATE(created_at)
                    ORDER BY date
                    `
                );

            const orderStatus =
                await pool.query(
                    `
                    SELECT
                        order_status,
                        COUNT(*)::INTEGER AS count
                    FROM orders
                    GROUP BY order_status
                    ORDER BY count DESC
                    `
                );

            const paymentMethods =
                await pool.query(
                    `
                    SELECT
                        payment_method,
                        COUNT(*)::INTEGER AS count,
                        COALESCE(
                            SUM(total_amount),
                            0
                        ) AS revenue
                    FROM orders
                    GROUP BY payment_method
                    ORDER BY count DESC
                    `
                );

            res.json({
                success: true,
                data: {
                    orders_by_day:
                        ordersByDay.rows,

                    order_status:
                        orderStatus.rows,

                    payment_methods:
                        paymentMethods.rows,
                },
            });

        } catch (error) {
            console.error(
                "Admin Analytics Error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch analytics",
            });
        }
    }
);

// ============================================================
// ================= ERROR HANDLING ============================
// ============================================================

// 404 HANDLER

app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message:
                `Route not found: ${req.method} ${req.originalUrl}`,
        });
    }
);

// GLOBAL ERROR HANDLER

app.use(
    (
        err,
        req,
        res,
        next
    ) => {
        console.error(
            "Global Error:",
            err
        );

        res.status(
            err.status || 500
        ).json({
            success: false,
            message:
                err.message ||
                "Internal server error",
        });
    }
);

// ============================================================
// ======================= SERVER START ========================
// ============================================================

const PORT =
    process.env.PORT || 5000;

server.listen(
    PORT,
    () => {
        console.log(
            "========================================"
        );

        console.log(
            "🚀 Food Delivery API Server"
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            `🌐 http://localhost:${PORT}`
        );

        console.log(
            `❤️  Health: http://localhost:${PORT}/health`
        );

        console.log(
            "========================================"
        );
    }
);

// ================= GRACEFUL SHUTDOWN =========================

const shutdown = async (
    signal
) => {
    console.log(
        `${signal} received. Shutting down server...`
    );

    server.close(
        async () => {
            try {
                await pool.end();

                console.log(
                    "Database connection closed."
                );

                process.exit(0);
            } catch (error) {
                console.error(
                    "Shutdown Error:",
                    error.message
                );

                process.exit(1);
            }
        }
    );
};

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);




// ================= IMPORTS =================
require("dotenv").config();

const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const compression =
    require("compression");

const rateLimit =
    require("express-rate-limit");

const http = require("http");

const path = require("path");

// ================= CREATE UPLOAD FOLDERS =================
const createFolders =
    require("./utils/createFolders");

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

// ================= APP =================
const app = express();

const server =
    http.createServer(app);

// ================= SOCKET.IO =================
initializeSocket(server);

// ================= MIDDLEWARE =================
app.use(cors());

app.use(helmet());

app.use(compression());

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
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
    windowMs:
        15 * 60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        success: false,

        message:
            "Too many requests. Please try again later.",
    },
});

app.use("/api", limiter);

// ================= DATABASE TEST =================
testConnection();

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,

        message:
            "🍕 Food Delivery Backend Running 🚀",
    });
});

// ================= HEALTH ROUTE =================
app.get(
    "/health",
    async (req, res) => {
        try {
            await pool.query(
                "SELECT NOW()"
            );

            res.status(200).json({
                success: true,

                database:
                    "Connected",

                timestamp:
                    new Date().toISOString(),
            });
        } catch (error) {
            res.status(500).json({
                success: false,

                database:
                    "Disconnected",

                error:
                    error.message,
            });
        }
    }
);

// ================= TEST ROUTE =================
app.get(
    "/api/test",
    (req, res) => {
        res.json({
            success: true,

            message:
                "Backend API is working!",

            timestamp:
                new Date().toISOString(),

            endpoints: [
                "POST /api/auth/signup",

                "POST /api/auth/login",

                "GET /api/auth/profile",

                "GET /api/restaurants",

                "GET /api/restaurants/:id",

                "POST /api/cart/add",

                "GET /api/cart",

                "POST /api/orders/create",

                "GET /api/orders/my-orders",
            ],
        });
    }
);

// ================= API ROUTES =================
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/restaurants",
    restaurantRoutes
);

app.use(
    "/api/cart",
    cartRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/reviews",
    reviewRoutes
);

// ================= 404 ROUTE =================
app.use((req, res) => {
    res.status(404).json({
        success: false,

        message:
            "Route not found",
    });
});

// ================= GLOBAL ERROR HANDLER =================
app.use(
    (
        err,
        req,
        res,
        next
    ) => {
        console.error(
            "❌ Server Error:",
            err.message
        );

        res.status(500).json({
            success: false,

            message:
                "Internal Server Error",

            error:
                process.env.NODE_ENV ===
                    "development"
                    ? err.message
                    : undefined,
        });
    }
);

// ================= START SERVER =================
const PORT =
    process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `🚀 Server running on port ${PORT}`
    );

    console.log(
        `🌐 http://localhost:${PORT}`
    );

    console.log(
        `📝 API Test: http://localhost:${PORT}/api/test`
    );

    console.log(
        `📂 Uploads Ready`
    );

    console.log(
        `🔌 Socket.IO Ready`
    );

    console.log(
        `🗄️ Database Connected`
    );
});// Add this with your other route imports
const restaurantRoutes = require('./routes/restaurant.routes');

// Add this with your other app.use statements
app.use('/api/restaurants', restaurantRoutes);// Add these with your other route imports
const orderRoutes = require('./routes/order.routes');
const addressRoutes = require('./routes/address.routes');
const offerRoutes = require('./routes/offer.routes');
const deliveryRoutes = require('./routes/delivery.routes');

// Add these with your other app.use statements
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/delivery', deliveryRoutes);
const userRoutes = require('./routes/user.routes');
app.use('/api/user', userRoutes);
// Add to backend/server.js - Restaurant Owner APIs

// Get restaurant owner's dashboard stats
app.get('/api/restaurant/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get restaurant owned by this user
        const restaurantResult = await pool.query(
            `SELECT restaurant_id FROM restaurants WHERE owner_id = $1`,
            [userId]
        );
        
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        const restaurantId = restaurantResult.rows[0].restaurant_id;
        
        // Get today's orders count
        const ordersResult = await pool.query(
            `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
             FROM orders WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE`,
            [restaurantId]
        );
        
        // Get menu items count
        const menuResult = await pool.query(
            `SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = $1`,
            [restaurantId]
        );
        
        // Get rating
        const ratingResult = await pool.query(
            `SELECT COALESCE(AVG(rating), 0) as rating FROM reviews WHERE restaurant_id = $1`,
            [restaurantId]
        );
        
        res.json({
            success: true,
            data: {
                orders: parseInt(ordersResult.rows[0].count),
                revenue: parseFloat(ordersResult.rows[0].revenue),
                items: parseInt(menuResult.rows[0].count),
                rating: parseFloat(ratingResult.rows[0].rating).toFixed(1)
            }
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// Get restaurant owner's orders
app.get('/api/restaurant/orders', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const restaurantResult = await pool.query(
            `SELECT restaurant_id FROM restaurants WHERE owner_id = $1`,
            [userId]
        );
        
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        const restaurantId = restaurantResult.rows[0].restaurant_id;
        
        const ordersResult = await pool.query(
            `SELECT o.*, u.full_name as customer_name 
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.user_id
             WHERE o.restaurant_id = $1 
             ORDER BY o.created_at DESC`,
            [restaurantId]
        );
        
        res.json({ success: true, data: ordersResult.rows });
    } catch (error) {
        console.error('Orders Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Update order status (restaurant owner)
app.put('/api/restaurant/orders/:orderId/status', authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        
        // Verify restaurant ownership
        const restaurantResult = await pool.query(
            `SELECT r.restaurant_id FROM restaurants r
             JOIN orders o ON o.restaurant_id = r.restaurant_id
             WHERE o.order_id = $1 AND r.owner_id = $2`,
            [orderId, userId]
        );
        
        if (restaurantResult.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        await pool.query(
            `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2`,
            [status, orderId]
        );
        
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order' });
    }
});

// Get restaurant menu (owner)
app.get('/api/restaurant/menu', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const restaurantResult = await pool.query(
            `SELECT restaurant_id FROM restaurants WHERE owner_id = $1`,
            [userId]
        );
        
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        const restaurantId = restaurantResult.rows[0].restaurant_id;
        
        const menuResult = await pool.query(
            `SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY created_at DESC`,
            [restaurantId]
        );
        
        res.json({ success: true, data: menuResult.rows });
    } catch (error) {
        console.error('Menu Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch menu' });
    }
});

// Add menu item
app.post('/api/restaurant/menu', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description, price, is_vegetarian, preparation_time } = req.body;
        
        const restaurantResult = await pool.query(
            `SELECT restaurant_id FROM restaurants WHERE owner_id = $1`,
            [userId]
        );
        
        if (restaurantResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        
        const restaurantId = restaurantResult.rows[0].restaurant_id;
        const itemId = require('uuid').v4();
        
        await pool.query(
            `INSERT INTO menu_items (item_id, restaurant_id, name, description, price, is_vegetarian, preparation_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [itemId, restaurantId, name, description, price, is_vegetarian || false, preparation_time || 15]
        );
        
        res.status(201).json({ success: true, message: 'Menu item added' });
    } catch (error) {
        console.error('Add Menu Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add menu item' });
    }
});

// Update menu item
app.put('/api/restaurant/menu/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, description, price, is_vegetarian, is_available, preparation_time } = req.body;
        const userId = req.user.userId;
        
        // Verify ownership
        const ownershipCheck = await pool.query(
            `SELECT mi.item_id FROM menu_items mi
             JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
             WHERE mi.item_id = $1 AND r.owner_id = $2`,
            [itemId, userId]
        );
        
        if (ownershipCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        await pool.query(
            `UPDATE menu_items SET 
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                is_vegetarian = COALESCE($4, is_vegetarian),
                is_available = COALESCE($5, is_available),
                preparation_time = COALESCE($6, preparation_time)
             WHERE item_id = $7`,
            [name, description, price, is_vegetarian, is_available, preparation_time, itemId]
        );
        
        res.json({ success: true, message: 'Menu item updated' });
    } catch (error) {
        console.error('Update Menu Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update menu item' });
    }
});

// Delete menu item
app.delete('/api/restaurant/menu/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.userId;
        
        const ownershipCheck = await pool.query(
            `SELECT mi.item_id FROM menu_items mi
             JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
             WHERE mi.item_id = $1 AND r.owner_id = $2`,
            [itemId, userId]
        );
        
        if (ownershipCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        
        await pool.query(`DELETE FROM menu_items WHERE item_id = $1`, [itemId]);
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
        console.error('Delete Menu Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete menu item' });
    }
});
// Add these to your backend/server.js - Admin APIs

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query(
            `SELECT user_type FROM users WHERE user_id = $1`,
            [userId]
        );
        
        if (result.rows.length === 0 || result.rows[0].user_type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Authorization failed' });
    }
};

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
    try {
        // Total users
        const usersResult = await pool.query(`SELECT COUNT(*) as count FROM users`);
        
        // Total restaurants
        const restaurantsResult = await pool.query(`SELECT COUNT(*) as count FROM restaurants WHERE is_active = true`);
        
        // Total orders today
        const ordersResult = await pool.query(
            `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue 
             FROM orders WHERE DATE(created_at) = CURRENT_DATE`
        );
        
        // Total delivery partners
        const deliveryResult = await pool.query(
            `SELECT COUNT(*) as count FROM users WHERE user_type = 'delivery'`
        );
        
        res.json({
            success: true,
            data: {
                totalUsers: parseInt(usersResult.rows[0].count),
                totalRestaurants: parseInt(restaurantsResult.rows[0].count),
                todayOrders: parseInt(ordersResult.rows[0].count),
                todayRevenue: parseFloat(ordersResult.rows[0].revenue),
                totalDeliveryPartners: parseInt(deliveryResult.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// Get all users (Admin)
app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, full_name, email, phone, user_type, is_verified, is_active, created_at 
             FROM users ORDER BY created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Update user status (activate/deactivate)
app.put('/api/admin/users/:userId/status', authenticate, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { is_active } = req.body;
        
        await pool.query(`UPDATE users SET is_active = $1 WHERE user_id = $2`, [is_active, userId]);
        res.json({ success: true, message: 'User status updated' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// Get all restaurants (Admin)
app.get('/api/admin/restaurants', authenticate, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT r.*, u.full_name as owner_name 
             FROM restaurants r
             LEFT JOIN users u ON r.owner_id = u.user_id
             ORDER BY r.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Restaurants Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
    }
});

// Approve/Reject restaurant
app.put('/api/admin/restaurants/:restaurantId/status', authenticate, isAdmin, async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { is_active } = req.body;
        
        await pool.query(`UPDATE restaurants SET is_active = $1 WHERE restaurant_id = $2`, [is_active, restaurantId]);
        res.json({ success: true, message: 'Restaurant status updated' });
    } catch (error) {
        console.error('Update Restaurant Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update restaurant' });
    }
});

// Get all orders (Admin)
app.get('/api/admin/orders', authenticate, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.*, u.full_name as customer_name, r.name as restaurant_name
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.user_id
             LEFT JOIN restaurants r ON o.restaurant_id = r.restaurant_id
             ORDER BY o.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Get platform analytics (Admin)
app.get('/api/admin/analytics', authenticate, isAdmin, async (req, res) => {
    try {
        // Orders by day (last 7 days)
        const ordersByDay = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue
            FROM orders 
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        
        // Top restaurants by orders
        const topRestaurants = await pool.query(`
            SELECT r.name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as revenue
            FROM restaurants r
            JOIN orders o ON r.restaurant_id = o.restaurant_id
            GROUP BY r.restaurant_id
            ORDER BY order_count DESC
            LIMIT 5
        `);
        
        res.json({
            success: true,
            data: {
                ordersByDay: ordersByDay.rows,
                topRestaurants: topRestaurants.rows
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
    }
});
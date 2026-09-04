// backend/config/database.js
const { Pool } = require("pg");
require("dotenv").config();

// ================= POSTGRES CONNECTION =================
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'food_delivery_app',  // ✅ Using your correct database name
    password: 'sudarshan',
    port: 5432,
});

// ================= TEST CONNECTION =================
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT NOW()");
        console.log("✅ PostgreSQL connected successfully at:", result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error("❌ PostgreSQL connection error:", error.message);
        return false;
    }
};

// ================= CREATE TABLES IF NOT EXISTS =================
const createTables = async () => {
    try {
        // First, ensure we can connect
        await testConnection();

        console.log("📋 Creating database tables if not exist...");

        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                user_type VARCHAR(20) DEFAULT 'customer',
                avatar_url TEXT,
                is_active BOOLEAN DEFAULT true,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Users table ready");

        // Restaurants table (matches your existing schema)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS restaurants (
                restaurant_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                owner_id UUID REFERENCES users(user_id),
                name VARCHAR(150) NOT NULL,
                description TEXT,
                address TEXT NOT NULL,
                logo_url TEXT,
                cover_image_url TEXT,
                cuisine_types TEXT[],
                avg_rating DECIMAL(3,2) DEFAULT 0,
                delivery_fee DECIMAL(10,2) DEFAULT 0,
                min_order_amount DECIMAL(10,2) DEFAULT 0,
                estimated_delivery_time INTEGER DEFAULT 30,
                is_open BOOLEAN DEFAULT true,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Restaurants table ready");

        // Menu items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS menu_items (
                item_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                restaurant_id UUID REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image_url TEXT,
                is_vegetarian BOOLEAN DEFAULT false,
                is_available BOOLEAN DEFAULT true,
                preparation_time INTEGER DEFAULT 15,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Menu items table ready");

        // Cart table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS carts (
                cart_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                restaurant_id UUID REFERENCES restaurants(restaurant_id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Carts table ready");

        // Cart items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                cart_item_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                cart_id UUID REFERENCES carts(cart_id) ON DELETE CASCADE,
                menu_item_id UUID REFERENCES menu_items(item_id),
                item_name VARCHAR(200) NOT NULL,
                quantity INTEGER DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                special_instructions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Cart items table ready");

        // Orders table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                order_number VARCHAR(20) UNIQUE NOT NULL,
                user_id UUID REFERENCES users(user_id),
                restaurant_id UUID REFERENCES restaurants(restaurant_id),
                restaurant_name VARCHAR(150) NOT NULL,
                items JSONB NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                delivery_fee DECIMAL(10,2) NOT NULL,
                tax DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(30),
                payment_status VARCHAR(20) DEFAULT 'pending',
                order_status VARCHAR(30) DEFAULT 'pending',
                delivery_address TEXT NOT NULL,
                special_instructions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                delivered_at TIMESTAMP
            )
        `);
        console.log("✅ Orders table ready");

        // Reviews table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                review_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES users(user_id),
                restaurant_id UUID REFERENCES restaurants(restaurant_id),
                order_id UUID REFERENCES orders(order_id),
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Reviews table ready");

        console.log("✅ All database tables are ready");
        return true;
    } catch (error) {
        console.error("❌ Error creating tables:", error.message);
        return false;
    }
};

// ================= INSERT SAMPLE DATA =================
const insertSampleData = async () => {
    try {
        // Check if restaurants already exist
        const result = await pool.query("SELECT COUNT(*) FROM restaurants");
        if (parseInt(result.rows[0].count) === 0) {
            console.log("📝 Inserting sample restaurant data...");

            await pool.query(`
                INSERT INTO restaurants (name, description, address, cuisine_types, avg_rating, delivery_fee, min_order_amount, estimated_delivery_time) VALUES 
                ('Pizza Palace', 'Authentic Italian pizza with fresh ingredients', '123 Main St, Downtown', ARRAY['Italian', 'Pizza', 'Pasta'], 4.5, 2.99, 10.00, 35),
                ('Burger King', 'Flame-grilled burgers and fast food', '456 Oak Ave, Midtown', ARRAY['American', 'Burgers', 'Fast Food'], 4.3, 1.99, 8.00, 25),
                ('Sushi Master', 'Fresh sushi and Japanese cuisine', '789 Pine St, Uptown', ARRAY['Japanese', 'Sushi', 'Seafood'], 4.7, 3.99, 15.00, 40),
                ('Taco Bell', 'Mexican fast food with tacos and burritos', '321 Elm St, Westside', ARRAY['Mexican', 'Tacos', 'Fast Food'], 4.2, 1.49, 5.00, 20),
                ('KFC', 'Famous fried chicken', '987 Cedar Ln, Southside', ARRAY['American', 'Fried Chicken', 'Fast Food'], 4.1, 1.99, 8.00, 25)
            `);
            console.log("✅ Sample restaurant data inserted");
        }
    } catch (error) {
        console.error("❌ Error inserting sample data:", error.message);
    }
};

// ================= INITIALIZE DATABASE =================
const initializeDatabase = async () => {
    await createTables();
    await insertSampleData();
};

// ================= RUN INITIALIZATION =================
if (require.main === module) {
    initializeDatabase();
}

module.exports = {
    pool,
    testConnection,
    createTables,
    initializeDatabase
};
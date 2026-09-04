-- ================= EXTENSIONS =================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================= USERS TABLE =================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_type VARCHAR(20) DEFAULT 'customer' CHECK (user_type IN ('customer', 'restaurant_owner', 'delivery_partner', 'admin')),
    avatar_url TEXT,
    wallet_balance DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= RESTAURANTS TABLE =================
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    logo_url TEXT,
    cover_image_url TEXT,
    cuisine_types TEXT[],
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    estimated_delivery_time INTEGER DEFAULT 30,
    is_open BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= MENU CATEGORIES TABLE =================
CREATE TABLE IF NOT EXISTS menu_categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= MENU ITEMS TABLE =================
CREATE TABLE IF NOT EXISTS menu_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(category_id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= ITEM VARIANTS TABLE =================
CREATE TABLE IF NOT EXISTS item_variants (
    variant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES menu_items(item_id) ON DELETE CASCADE,
    size_name VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= CARTS TABLE =================
CREATE TABLE IF NOT EXISTS carts (
    cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= CART ITEMS TABLE =================
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(cart_id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(item_id),
    variant_id UUID REFERENCES item_variants(variant_id),
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= ORDERS TABLE =================
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(user_id),
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    delivery_partner_id UUID REFERENCES users(user_id),
    restaurant_name VARCHAR(150) NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) CHECK (payment_method IN ('cash', 'card', 'wallet', 'upi', 'net_banking')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    order_status VARCHAR(30) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    special_instructions TEXT,
    promo_code VARCHAR(50),
    promo_discount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= ORDER ITEMS TABLE =================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(item_id),
    variant_id UUID REFERENCES item_variants(variant_id),
    item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= REVIEWS TABLE =================
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    restaurant_id UUID REFERENCES restaurants(restaurant_id),
    order_id UUID REFERENCES orders(order_id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= PROMO CODES TABLE =================
CREATE TABLE IF NOT EXISTS promoCodes (
    promo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed', 'free_delivery')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= WALLET TRANSACTIONS TABLE =================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('credit', 'debit')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    order_id UUID REFERENCES orders(order_id),
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= NOTIFICATIONS TABLE =================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= DELIVERY TRACKING TABLE =================
CREATE TABLE IF NOT EXISTS delivery_tracking (
    tracking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(order_id),
    delivery_partner_id UUID REFERENCES users(user_id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================= INDEXES FOR PERFORMANCE =================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_types);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ================= TRIGGER FOR UPDATED_AT =================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================= INSERT SAMPLE DATA =================
-- Insert sample admin user (password: admin123)
-- Note: In production, use bcrypt hash
INSERT INTO users (user_id, full_name, email, phone, password_hash, user_type) 
VALUES 
    (uuid_generate_v4(), 'Admin User', 'admin@foodapp.com', '9999999999', '$2a$10$YourHashedPasswordHere', 'admin'),
    (uuid_generate_v4(), 'Demo Restaurant', 'restaurant@foodapp.com', '8888888888', '$2a$10$YourHashedPasswordHere', 'restaurant_owner'),
    (uuid_generate_v4(), 'Demo Delivery', 'delivery@foodapp.com', '7777777777', '$2a$10$YourHashedPasswordHere', 'delivery_partner'),
    (uuid_generate_v4(), 'Demo Customer', 'customer@foodapp.com', '6666666666', '$2a$10$YourHashedPasswordHere', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample restaurants
INSERT INTO restaurants (restaurant_id, name, description, address, cuisine_types, delivery_fee, min_order_amount, is_open) 
VALUES 
    (uuid_generate_v4(), 'Pizza Paradise', 'Best Italian pizza in town', 'MG Road, Bangalore', ARRAY['Italian', 'Pizza'], 2.99, 200, true),
    (uuid_generate_v4(), 'Burger Hub', 'Juicy burgers made fresh', 'Indiranagar, Bangalore', ARRAY['American', 'Burgers'], 1.99, 150, true),
    (uuid_generate_v4(), 'Sushi Master', 'Authentic Japanese cuisine', 'Koramangala, Bangalore', ARRAY['Japanese', 'Sushi'], 3.99, 300, true)
ON CONFLICT DO NOTHING;

-- Insert sample promo code
INSERT INTO promoCodes (code, description, discount_type, discount_value, min_order_amount, expires_at) 
VALUES ('WELCOME10', '10% off on first order', 'percentage', 10, 200, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
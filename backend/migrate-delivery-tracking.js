const { pool } = require('./config/database');

async function migrate() {
    try {
        console.log('Starting delivery tracking migration...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS delivery_tracking (
                tracking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
                delivery_partner_id UUID NOT NULL REFERENCES users(user_id),
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                status VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order
            ON delivery_tracking(order_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_delivery_tracking_partner
            ON delivery_tracking(delivery_partner_id);
        `);

        console.log('? Delivery tracking migration completed successfully.');
    } catch (error) {
        console.error('? Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();

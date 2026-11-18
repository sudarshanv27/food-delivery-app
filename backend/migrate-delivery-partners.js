const { pool } = require('./config/database');

async function migrate() {
    try {
        console.log('Starting delivery partner migration...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS delivery_partners (
                partner_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

                user_id UUID NOT NULL UNIQUE
                    REFERENCES users(user_id) ON DELETE CASCADE,

                vehicle_type VARCHAR(50),
                vehicle_number VARCHAR(50),

                license_number VARCHAR(100),

                is_online BOOLEAN NOT NULL DEFAULT false,
                is_available BOOLEAN NOT NULL DEFAULT false,

                current_latitude DECIMAL(10,8),
                current_longitude DECIMAL(11,8),

                rating DECIMAL(3,2) NOT NULL DEFAULT 0,
                total_deliveries INTEGER NOT NULL DEFAULT 0,
                total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,

                verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (verification_status IN ('pending', 'verified', 'rejected')),

                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_delivery_partners_user
            ON delivery_partners(user_id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_delivery_partners_available
            ON delivery_partners(is_online, is_available);
        `);

        console.log('? Delivery partner migration completed successfully.');
    } catch (error) {
        console.error('? Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();

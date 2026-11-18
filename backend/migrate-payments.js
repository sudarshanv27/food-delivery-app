const { pool } = require('./config/database');

(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
                payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(user_id),
                razorpay_order_id VARCHAR(100),
                razorpay_payment_id VARCHAR(100),
                razorpay_signature VARCHAR(255),
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) NOT NULL DEFAULT 'INR',
                payment_method VARCHAR(50),
                payment_status VARCHAR(30) NOT NULL DEFAULT 'created',
                refund_id VARCHAR(100),
                refund_amount DECIMAL(10,2),
                failure_reason TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_payments_order_id
                ON payments(order_id);

            CREATE INDEX IF NOT EXISTS idx_payments_user_id
                ON payments(user_id);

            CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id
                ON payments(razorpay_order_id);

            CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id
                ON payments(razorpay_payment_id);
        `);

        console.log('? Payments table created successfully');
    } catch (error) {
        console.error('? Payment migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();

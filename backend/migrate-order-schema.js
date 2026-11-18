const { pool } = require("./config/database");

async function migrateOrderSchema() {
    const client = await pool.connect();

    try {
        console.log("Starting order/cart schema migration...");

        await client.query("BEGIN");

        // ================= CARTS =================
        await client.query(`
            ALTER TABLE carts
            ADD COLUMN IF NOT EXISTS status VARCHAR(20)
            DEFAULT 'active'
        `);

        // ================= CART ITEMS =================
        await client.query(`
            ALTER TABLE cart_items
            ADD COLUMN IF NOT EXISTS variant_id UUID
        `);

        await client.query(`
            ALTER TABLE cart_items
            ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2)
        `);

        await client.query(`
            ALTER TABLE cart_items
            ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2)
        `);

        // Preserve existing cart item prices
        await client.query(`
            UPDATE cart_items
            SET unit_price = price
            WHERE unit_price IS NULL
        `);

        await client.query(`
            UPDATE cart_items
            SET total_price = unit_price * quantity
            WHERE total_price IS NULL
        `);

        // ================= ORDERS =================
        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS delivery_partner_id UUID
        `);

        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP
        `);

        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP
        `);

        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2)
            DEFAULT 0
        `);

        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50)
        `);

        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS promo_discount DECIMAL(10,2)
            DEFAULT 0
        `);

        // The application expects tax_amount.
        // Copy the existing tax values into the new column.
        await client.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2)
            DEFAULT 0
        `);

        await client.query(`
            UPDATE orders
            SET tax_amount = COALESCE(tax, 0)
            WHERE tax_amount = 0
              AND tax IS NOT NULL
        `);

        // ================= ORDER ITEMS =================
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
                menu_item_id UUID REFERENCES menu_items(item_id),
                variant_id UUID,
                item_name VARCHAR(200) NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ================= FOREIGN KEY =================
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'orders_delivery_partner_id_fkey'
                ) THEN
                    ALTER TABLE orders
                    ADD CONSTRAINT orders_delivery_partner_id_fkey
                    FOREIGN KEY (delivery_partner_id)
                    REFERENCES users(user_id);
                END IF;
            END
            $$;
        `);

        await client.query("COMMIT");

        console.log("✅ Order/cart schema migration completed successfully.");

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("❌ Migration failed:", error.message);
        console.error("Transaction rolled back.");

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateOrderSchema();
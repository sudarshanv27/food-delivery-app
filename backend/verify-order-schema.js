const { pool } = require("./config/database");

async function verify() {
    try {
        const result = await pool.query(`
            SELECT table_name, column_name
            FROM information_schema.columns
            WHERE table_name IN ('carts', 'cart_items', 'orders', 'order_items')
            ORDER BY table_name, ordinal_position
        `);

        console.table(result.rows);
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await pool.end();
    }
}

verify();
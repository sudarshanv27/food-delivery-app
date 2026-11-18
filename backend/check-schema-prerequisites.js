const { pool } = require("./config/database");

async function check() {
    try {
        const result = await pool.query(`
            SELECT
                to_regclass('public.item_variants') AS item_variants,
                to_regclass('public.order_items') AS order_items,
                to_regclass('public.carts') AS carts,
                to_regclass('public.cart_items') AS cart_items,
                to_regclass('public.orders') AS orders
        `);

        console.log(result.rows[0]);
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await pool.end();
    }
}

check();
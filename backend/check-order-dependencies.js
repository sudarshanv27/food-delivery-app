const { pool } = require("./config/database");

async function check() {
    try {
        const result = await pool.query(`
            SELECT
                EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'orders'
                      AND column_name = 'delivery_latitude'
                ) AS has_delivery_latitude,

                EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'orders'
                      AND column_name = 'delivery_longitude'
                ) AS has_delivery_longitude,

                to_regclass('public."promoCodes"') AS promo_codes
        `);

        console.log(result.rows[0]);
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await pool.end();
    }
}

check();
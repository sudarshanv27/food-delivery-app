const { pool } = require("./config/database");

async function check() {
    try {
        const result = await pool.query(`
            SELECT
                to_regclass('public.delivery_tracking') AS delivery_tracking
        `);

        console.log(result.rows[0]);

        if (result.rows[0].delivery_tracking) {
            const columns = await pool.query(`
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'delivery_tracking'
                ORDER BY ordinal_position
            `);

            console.table(columns.rows);
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await pool.end();
    }
}

check();
const { pool } = require("./config/database");

async function check() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'promo_codes'
            ORDER BY ordinal_position
        `);

        console.table(result.rows);
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await pool.end();
    }
}

check();
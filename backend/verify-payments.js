const { pool } = require('./config/database');

(async () => {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'payments'
            ORDER BY ordinal_position
        `);

        console.table(result.rows);
    } catch (error) {
        console.error('Verification failed:', error.message);
    } finally {
        await pool.end();
    }
})();

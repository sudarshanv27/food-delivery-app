const { pool } = require('./config/database');

(async () => {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name ILIKE '%payment%'
            ORDER BY table_name
        `);

        console.log(result.rows);
    } catch (error) {
        console.error('Database check failed:', error.message);
    } finally {
        await pool.end();
    }
})();

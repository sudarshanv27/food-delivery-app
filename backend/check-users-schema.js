const { pool } = require('./config/database');

async function checkUsersSchema() {
    try {
        const result = await pool.query(`
            SELECT
                column_name,
                data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
            ORDER BY ordinal_position
        `);

        console.table(result.rows);
    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

checkUsersSchema();

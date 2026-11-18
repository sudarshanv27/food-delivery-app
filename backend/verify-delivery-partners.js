const { pool } = require('./config/database');

pool.query(`
    SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'delivery_partners'
    ORDER BY ordinal_position
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

const { pool } = require('./config/database');

pool.query(`
    SELECT
        table_name,
        column_name,
        data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name NOT IN ('users')
      AND (
          column_name ILIKE '%delivery%'
          OR column_name ILIKE '%partner%'
      )
    ORDER BY table_name, ordinal_position
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

const { pool } = require('./config/database');

pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND (
          table_name ILIKE '%deliver%'
          OR table_name ILIKE '%partner%'
      )
    ORDER BY table_name
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

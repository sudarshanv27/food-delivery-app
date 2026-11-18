const { pool } = require('./config/database');

pool.query(`
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'delivery_partners'
    ) AS exists
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

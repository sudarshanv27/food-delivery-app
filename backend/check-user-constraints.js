const { pool } = require('./config/database');

pool.query(`
    SELECT
        constraint_name,
        constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND constraint_type = 'CHECK'
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

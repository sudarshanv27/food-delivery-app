const { pool } = require('./config/database');

pool.query(`
    SELECT
        user_type,
        COUNT(*) AS user_count
    FROM users
    GROUP BY user_type
    ORDER BY user_type
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

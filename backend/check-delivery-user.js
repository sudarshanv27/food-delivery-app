const { pool } = require('./config/database');

pool.query(`
    SELECT
        user_id,
        full_name,
        email,
        phone,
        user_type,
        is_active,
        is_verified,
        created_at
    FROM users
    WHERE user_type = 'delivery'
`)
.then(result => {
    console.table(result.rows);
    process.exit(0);
})
.catch(error => {
    console.error(error.message);
    process.exit(1);
});

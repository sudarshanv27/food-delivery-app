const { pool } = require('./config/database');

pool.query(
    "SELECT user_id, email, full_name, user_type, is_active, is_verified FROM users WHERE user_type = $1",
    ['admin']
)
.then(result => {
    console.table(result.rows);
    pool.end();
})
.catch(error => {
    console.error(error.message);
    pool.end();
});

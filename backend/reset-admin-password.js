const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function resetAdminPassword() {
    try {
        const passwordHash = await bcrypt.hash('AdminTest123', 10);

        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2',
            [passwordHash, 'admin@foodapp.com']
        );

        console.log('Admin password reset successfully.');
        console.log('Test password: AdminTest123');
    } catch (error) {
        console.error('Password reset failed:', error.message);
    } finally {
        await pool.end();
    }
}

resetAdminPassword();

const { pool } = require('./config/database');

async function createDeliveryPartner() {
    try {
        console.log('Creating delivery partner profile...');

        const result = await pool.query(`
            INSERT INTO delivery_partners (
                user_id,
                vehicle_type,
                vehicle_number,
                license_number,
                verification_status
            )
            SELECT
                user_id,
                'motorcycle',
                'TS09DEMO1234',
                'DEMO-LICENSE-001',
                'verified'
            FROM users
            WHERE user_type = 'delivery'
              AND email = 'delivery@foodie.com'
            ON CONFLICT (user_id)
            DO UPDATE SET
                vehicle_type = EXCLUDED.vehicle_type,
                vehicle_number = EXCLUDED.vehicle_number,
                license_number = EXCLUDED.license_number,
                verification_status = EXCLUDED.verification_status,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `);

        if (result.rows.length === 0) {
            console.log('? Delivery user was not found.');
        } else {
            console.table(result.rows);
            console.log('? Delivery partner profile created successfully.');
        }
    } catch (error) {
        console.error('? Failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

createDeliveryPartner();

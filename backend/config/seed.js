const { hashPassword, generateRandomPassword } = require('../utils/hashPassword');

const seedUsers = async () => {
    try {
        // Generate random passwords for demo users
        const adminPassword = generateRandomPassword(10);
        const customerPassword = generateRandomPassword(10);
        
        const hashedAdminPassword = await hashPassword(adminPassword);
        const hashedCustomerPassword = await hashPassword(customerPassword);
        
        // Create demo users
        await pool.query(`
            INSERT INTO users (user_id, full_name, email, phone, password_hash, user_type)
            VALUES 
            (gen_random_uuid(), 'Admin User', 'admin@foodapp.com', '9999999999', $1, 'admin'),
            (gen_random_uuid(), 'Test Customer', 'customer@foodapp.com', '8888888888', $2, 'customer')
        `, [hashedAdminPassword, hashedCustomerPassword]);
        
        console.log('Demo users created successfully!');
        console.log(`Admin Password: ${adminPassword}`);
        console.log(`Customer Password: ${customerPassword}`);
        
    } catch (error) {
        console.error('Seed error:', error);
    }
};
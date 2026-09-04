// backend/models/auth.model.js
const { pool } = require("../config/database");

// ================= CREATE USER =================
const createUser = async (user_id, full_name, email, phone, password_hash, user_type = 'customer') => {
    const query = `
        INSERT INTO users (
            user_id, 
            full_name, 
            email, 
            phone, 
            password_hash, 
            user_type
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, full_name, email, phone, user_type, created_at
    `;
    const values = [user_id, full_name, email, phone, password_hash, user_type];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// ================= FIND USER BY EMAIL =================
const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

// ================= FIND USER BY ID =================
const findUserById = async (user_id) => {
    const query = `
        SELECT 
            user_id, 
            full_name, 
            email, 
            phone, 
            user_type, 
            avatar_url,
            created_at,
            updated_at
        FROM users 
        WHERE user_id = $1
    `;
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
};

// ================= FIND USER BY PHONE =================
const findUserByPhone = async (phone) => {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const result = await pool.query(query, [phone]);
    return result.rows[0];
};

// ================= UPDATE USER PASSWORD =================
const updateUserPassword = async (user_id, hashedPassword) => {
    const query = `
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $2
        RETURNING user_id
    `;
    const result = await pool.query(query, [hashedPassword, user_id]);
    return result.rows[0];
};

// ================= UPDATE USER PROFILE =================
const updateUserProfile = async (user_id, updates) => {
    const { full_name, phone, avatar_url } = updates;

    let query = `
        UPDATE users 
        SET 
            full_name = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            avatar_url = COALESCE($3, avatar_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
        RETURNING user_id, full_name, email, phone, user_type, avatar_url, created_at, updated_at
    `;

    const result = await pool.query(query, [full_name, phone, avatar_url, user_id]);
    return result.rows[0];
};

// ================= DELETE USER =================
const deleteUser = async (user_id) => {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id';
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
};

// ================= GET ALL USERS (Admin) =================
const getAllUsers = async (limit = 100, offset = 0) => {
    const query = `
        SELECT 
            user_id, 
            full_name, 
            email, 
            phone, 
            user_type, 
            avatar_url,
            created_at,
            updated_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
};

// ================= GET USER COUNT =================
const getUserCount = async (user_type = null) => {
    let query = 'SELECT COUNT(*) FROM users';
    let values = [];

    if (user_type) {
        query += ' WHERE user_type = $1';
        values.push(user_type);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
};

// ================= GET USERS BY TYPE =================
const getUsersByType = async (user_type, limit = 100, offset = 0) => {
    const query = `
        SELECT 
            user_id, 
            full_name, 
            email, 
            phone, 
            user_type, 
            avatar_url,
            created_at,
            updated_at
        FROM users 
        WHERE user_type = $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_type, limit, offset]);
    return result.rows;
};

// ================= UPDATE USER TYPE (Admin) =================
const updateUserType = async (user_id, user_type) => {
    const query = `
        UPDATE users 
        SET user_type = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $2
        RETURNING user_id, user_type
    `;
    const result = await pool.query(query, [user_type, user_id]);
    return result.rows[0];
};

// ================= TOGGLE USER ACTIVE STATUS =================
const toggleUserActive = async (user_id, is_active) => {
    const query = `
        UPDATE users 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $2
        RETURNING user_id, is_active
    `;
    const result = await pool.query(query, [is_active, user_id]);
    return result.rows[0];
};

// ================= SEARCH USERS =================
const searchUsers = async (searchTerm, limit = 50) => {
    const query = `
        SELECT 
            user_id, 
            full_name, 
            email, 
            phone, 
            user_type, 
            avatar_url,
            created_at
        FROM users 
        WHERE 
            full_name ILIKE $1 
            OR email ILIKE $1 
            OR phone ILIKE $1
        ORDER BY full_name ASC
        LIMIT $2
    `;
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
};

module.exports = {
    // Basic CRUD
    createUser,
    findUserByEmail,
    findUserById,
    findUserByPhone,
    updateUserPassword,
    updateUserProfile,
    deleteUser,

    // Admin functions
    getAllUsers,
    getUserCount,
    getUsersByType,
    updateUserType,
    toggleUserActive,
    searchUsers
};
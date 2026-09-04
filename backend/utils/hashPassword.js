// backend/utils/hashPassword.js
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ================= CONSTANTS =================
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 50;

// ================= PASSWORD HASHING =================

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    try {
        if (!password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        return hashedPassword;
    } catch (error) {
        console.error('Password hashing error:', error.message);
        throw new Error('Failed to hash password');
    }
};

/**
 * Hash password synchronously (use only if async is not available)
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
const hashPasswordSync = (password) => {
    try {
        if (!password) {
            throw new Error('Password is required');
        }
        return bcrypt.hashSync(password, SALT_ROUNDS);
    } catch (error) {
        console.error('Password hashing error:', error.message);
        throw new Error('Failed to hash password');
    }
};

// ================= PASSWORD COMPARISON =================

/**
 * Compare plain text password with hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        if (!plainPassword || !hashedPassword) {
            return false;
        }
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error.message);
        return false;
    }
};

/**
 * Compare password synchronously (use only if async is not available)
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {boolean} True if passwords match
 */
const comparePasswordSync = (plainPassword, hashedPassword) => {
    try {
        if (!plainPassword || !hashedPassword) {
            return false;
        }
        return bcrypt.compareSync(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Password comparison error:', error.message);
        return false;
    }
};

// ================= PASSWORD VALIDATION =================

/**
 * Validate password strength with detailed options
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid, errors, strength }
 */
const validatePasswordStrength = (password, options = {}) => {
    const {
        minLength = MIN_PASSWORD_LENGTH,
        maxLength = MAX_PASSWORD_LENGTH,
        requireNumber = true,
        requireUppercase = true,
        requireLowercase = true,
        requireSpecialChar = true
    } = options;

    const errors = [];

    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors, strength: 'invalid' };
    }

    // Length checks
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (password.length > maxLength) {
        errors.push(`Password must be less than ${maxLength} characters`);
    }

    // Character checks
    if (requireNumber && !/\d/.test(password)) {
        errors.push('Password should contain at least one number');
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password should contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password should contain at least one lowercase letter');
    }

    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password should contain at least one special character');
    }

    // Calculate password strength
    let strengthScore = 0;
    if (password.length >= 8) strengthScore++;
    if (password.length >= 12) strengthScore++;
    if (/\d/.test(password)) strengthScore++;
    if (/[A-Z]/.test(password)) strengthScore++;
    if (/[a-z]/.test(password)) strengthScore++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++;

    let strength = 'weak';
    if (strengthScore >= 5) strength = 'strong';
    else if (strengthScore >= 3) strength = 'medium';

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score: strengthScore
    };
};

/**
 * Quick password validation (less strict, for basic checks)
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, message }
 */
const isPasswordValid = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }

    return { isValid: true, message: 'Password is valid' };
};

// ================= PASSWORD GENERATION =================

/**
 * Generate a random secure password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} Random secure password
 */
const generateRandomPassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + specialChars;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate a simple random password (no special chars, for testing)
 * @param {number} length - Length of password (default: 8)
 * @returns {string} Simple random password
 */
const generateSimplePassword = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// ================= PASSWORD MASKING =================

/**
 * Mask a password for display (e.g., "pass****")
 * @param {string} password - Password to mask
 * @returns {string} Masked password
 */
const maskPassword = (password) => {
    if (!password) return '';
    if (password.length <= 4) return '*'.repeat(password.length);
    return password.substring(0, 2) + '*'.repeat(password.length - 4) + password.substring(password.length - 2);
};

// ================= EXPORTS =================
module.exports = {
    // Main functions
    hashPassword,
    comparePassword,
    validatePasswordStrength,
    generateRandomPassword,

    // Sync versions
    hashPasswordSync,
    comparePasswordSync,

    // Additional utilities
    isPasswordValid,
    generateSimplePassword,
    maskPassword
};
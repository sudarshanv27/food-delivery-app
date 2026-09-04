// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate JWT Token for user authentication
 * @param {Object} payload - Payload to encode (user_id, email, user_type)
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    // Handle both object with user_id or direct payload
    const tokenPayload = payload.user_id ? {
        user_id: payload.user_id,
        email: payload.email,
        user_type: payload.user_type
    } : payload;

    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    const secret = process.env.JWT_SECRET || 'your_secret_key';
    return jwt.sign(tokenPayload, secret, options);
};

/**
 * Generate Refresh Token (longer validity)
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
    const payload = {
        user_id: user.user_id,
        email: user.email,
        user_type: user.user_type,
        isRefreshToken: true
    };

    const options = {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    };

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your_refresh_secret';
    return jwt.sign(payload, secret, options);
};

/**
 * Generate both Access and Refresh tokens
 * @param {Object} user - User object with user_id, email, user_type
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
    const accessToken = generateToken({
        user_id: user.user_id,
        email: user.email,
        user_type: user.user_type
    });

    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken };
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @param {boolean} isRefreshToken - Whether this is a refresh token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token, isRefreshToken = false) => {
    try {
        if (!token) return null;

        const secret = isRefreshToken
            ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your_refresh_secret')
            : (process.env.JWT_SECRET || 'your_secret_key');

        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
};

/**
 * Decode JWT Token without verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload
 */
const decodeToken = (token) => {
    try {
        if (!token) return null;
        return jwt.decode(token);
    } catch (error) {
        console.error('Token decode failed:', error.message);
        return null;
    }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Object|null} New access token or null
 */
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = verifyToken(refreshToken, true);

        if (!decoded || !decoded.isRefreshToken) {
            return null;
        }

        const newAccessToken = generateToken({
            user_id: decoded.user_id,
            email: decoded.email,
            user_type: decoded.user_type
        });

        return {
            accessToken: newAccessToken,
            userId: decoded.user_id,
            email: decoded.email,
            userType: decoded.user_type
        };
    } catch (error) {
        console.error('Refresh token failed:', error.message);
        return null;
    }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
};

module.exports = {
    generateToken,
    generateRefreshToken,
    generateTokens,
    verifyToken,
    decodeToken,
    isTokenExpired,
    getTokenExpiration,
    refreshAccessToken,
    extractTokenFromHeader
};
// backend/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

        // Add user info to request
        req.user = {
            userId: decoded.user_id,
            email: decoded.email,
            userType: decoded.user_type
        };

        next();
    } catch (error) {
        console.error("Authentication Error:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

module.exports = {
    authenticate
};
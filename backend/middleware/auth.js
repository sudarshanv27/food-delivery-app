// backend/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");

// ================= AUTHENTICATE USER =================
const authenticate = (
    req,
    res,
    next
) => {
    try {
        // ================= GET TOKEN =================
        const authHeader =
            req.headers.authorization;

        // ================= CHECK TOKEN =================
        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {
            return res.status(401).json({
                success: false,

                message:
                    "Access denied. No token provided",
            });
        }

        // ================= EXTRACT TOKEN =================
        const token =
            authHeader.split(" ")[1];

        // ================= VERIFY TOKEN =================
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET ||
                "your_secret_key"
            );

        // ================= STORE USER =================
        req.user = decoded;

        next();
    } catch (error) {
        console.error(
            "Authentication Error:",
            error.message
        );

        return res.status(401).json({
            success: false,

            message:
                "Invalid or expired token",
        });
    }
};

// ================= ADMIN CHECK =================
const isAdmin = (
    req,
    res,
    next
) => {
    try {
        // ================= CHECK USER =================
        if (!req.user) {
            return res.status(401).json({
                success: false,

                message:
                    "Unauthorized access",
            });
        }

        // ================= ALLOWED ROLES =================
        const allowedRoles = [
            "admin",
            "super_admin",
        ];

        // ================= CHECK ROLE =================
        if (
            !allowedRoles.includes(
                req.user.userType
            )
        ) {
            return res.status(403).json({
                success: false,

                message:
                    "Admin access required",
            });
        }

        next();
    } catch (error) {
        console.error(
            "Admin Middleware Error:",
            error.message
        );

        return res.status(500).json({
            success: false,

            message:
                "Internal server error",
        });
    }
};

module.exports = {
    authenticate,
    isAdmin,
};
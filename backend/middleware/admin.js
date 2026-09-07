// backend/middleware/admin.js

// ================= ADMIN MIDDLEWARE =================
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
                message: "Unauthorized access",
            });
        }

        // ================= CHECK ROLE =================
        const allowedRoles = [
            "admin",
            "super_admin",
        ];

        if (
            !allowedRoles.includes(
                req.user.userType
            )
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            });
        }

        // ================= NEXT =================
        next();

    } catch (error) {
        console.error(
            "Admin Middleware Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ================= EXPORT =================
module.exports = {
    isAdmin,
};
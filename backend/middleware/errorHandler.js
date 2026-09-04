// backend/middleware/errorHandler.js

// ================= GLOBAL ERROR HANDLER =================
const errorHandler = (
    err,
    req,
    res,
    next
) => {
    console.error(
        "❌ Server Error:",
        err
    );

    // ================= DEFAULT VALUES =================
    let statusCode =
        err.statusCode || 500;

    let message =
        err.message ||
        "Internal Server Error";

    // ================= POSTGRESQL ERRORS =================
    if (err.code === "23505") {
        statusCode = 400;

        message =
            "Duplicate value already exists";
    }

    if (err.code === "22P02") {
        statusCode = 400;

        message =
            "Invalid input syntax";
    }

    if (err.code === "23503") {
        statusCode = 400;

        message =
            "Related resource not found";
    }

    // ================= JWT ERRORS =================
    if (
        err.name ===
        "JsonWebTokenError"
    ) {
        statusCode = 401;

        message = "Invalid token";
    }

    if (
        err.name ===
        "TokenExpiredError"
    ) {
        statusCode = 401;

        message = "Token expired";
    }

    // ================= RESPONSE =================
    return res.status(statusCode).json({
        success: false,
        message,

        // Show stack only in development
        ...(process.env.NODE_ENV ===
            "development" && {
            stack: err.stack,
        }),
    });
};

module.exports = errorHandler;
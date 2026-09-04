// backend/routes/auth.routes.js

const express = require("express");
const router = express.Router();

// Import controller
const authController = require("../controllers/auth.controller");

// Import middleware with error handling
let authenticate;
try {
    const authMiddleware = require("../middleware/auth.middleware");
    authenticate = authMiddleware.authenticate;

    if (!authenticate) {
        console.error("authenticate function is undefined in middleware");
        throw new Error("authenticate middleware not exported correctly");
    }
} catch (error) {
    console.error("Error loading auth middleware:", error.message);
    // Create a temporary middleware to avoid crashing
    authenticate = (req, res, next) => {
        console.error("Authentication middleware not properly configured");
        res.status(401).json({ success: false, message: "Authentication not configured" });
    };
}

console.log("Available controller functions:", Object.keys(authController));
console.log("Authenticate middleware loaded:", typeof authenticate === "function");

// ================= PUBLIC ROUTES =================
router.post("/send-otp", authController.sendSignupOTP);
router.post("/verify-otp", authController.verifyOTPAndSignup);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPasswordSendOTP);
router.post("/reset-password", authController.verifyOTPAndResetPassword);

// ================= PROTECTED ROUTES =================
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
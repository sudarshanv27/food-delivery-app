// backend/controllers/auth.controller.js

const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const { pool } = require("../config/database");

const {
    sendSuccess,
    sendError,
    sendInternalError,
    sendNotFound
} = require("../utils/responseHandler");

const {
    hashPassword,
    comparePassword,
    validatePasswordStrength
} = require("../utils/hashPassword");

const { sendCustomEmail } = require("../services/emailService");

// ============================================================
// OTP STORAGE
// ============================================================

// Development/simple implementation.
// For production, use Redis or another persistent OTP store.
const otpStore = new Map();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const findUserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
};

const findUserById = async (userId) => {
    const result = await pool.query(
        `SELECT
            user_id,
            full_name,
            email,
            phone,
            user_type,
            avatar_url,
            is_verified,
            is_active,
            created_at
         FROM users
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

const updateUserPassword = async (userId, hashedPassword) => {
    await pool.query(
        `UPDATE users
         SET password_hash = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [hashedPassword, userId]
    );
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// SEND OTP EMAIL
// ============================================================

const sendOTPByEmail = async (email, otp) => {
    const subject = "Food Delivery App - Email Verification OTP";

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Email Verification</title>
        </head>

        <body style="
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <div style="
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                padding: 30px;
                border-radius: 10px;
            ">

                <h2 style="margin-top: 0;">
                    Food Delivery App
                </h2>

                <p>Hello,</p>

                <p>
                    Thank you for registering with Food Delivery App.
                </p>

                <p>
                    Please use the following OTP to verify your email address:
                </p>

                <div style="
                    text-align: center;
                    margin: 30px 0;
                ">

                    <span style="
                        display: inline-block;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        padding: 15px 25px;
                        background: #f2f2f2;
                        border-radius: 8px;
                    ">
                        ${otp}
                    </span>

                </div>

                <p>
                    This OTP is valid for <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request this verification code,
                    you can safely ignore this email.
                </p>

                <hr style="
                    border: none;
                    border-top: 1px solid #ddd;
                    margin: 30px 0;
                ">

                <p style="
                    font-size: 12px;
                    color: #777;
                ">
                    Food Delivery App Team
                </p>

            </div>

        </body>
        </html>
    `;

    const sent = await sendCustomEmail(
        email,
        subject,
        html
    );

    if (!sent) {
        throw new Error("Failed to send OTP email");
    }

    console.log(`OTP email sent successfully to ${email}`);

    return true;
};

// ============================================================
// 1. SEND SIGNUP OTP
// POST /api/auth/send-otp
// ============================================================

const sendSignupOTP = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            password,
            user_type = "customer"
        } = req.body;

        console.log("========================================");
        console.log("Signup OTP Request:", {
            full_name,
            email,
            phone,
            user_type
        });

        // ----------------------------------------------------
        // Validation
        // ----------------------------------------------------

        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10}$/;

        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number. 10 digits required."
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Allowed user types
        const allowedUserTypes = [
            "customer",
            "restaurant_owner",
            "delivery_partner"
        ];

        if (!allowedUserTypes.includes(user_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user type"
            });
        }

        // ----------------------------------------------------
        // Check existing user
        // ----------------------------------------------------

        const existingUser = await findUserByEmail(
            normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered. Please login."
            });
        }

        // ----------------------------------------------------
        // Generate OTP
        // ----------------------------------------------------

        const otp = generateOTP();

        const expiresAt = Date.now() + 10 * 60 * 1000;

        // ----------------------------------------------------
        // Hash password
        // ----------------------------------------------------

        const hashedPassword = await hashPassword(password);

        // ----------------------------------------------------
        // Store OTP
        // ----------------------------------------------------

        otpStore.set(normalizedEmail, {
            otp,
            expiresAt,
            userData: {
                full_name: full_name.trim(),
                email: normalizedEmail,
                phone,
                password: hashedPassword,
                user_type
            }
        });

        console.log("Signup OTP generated.");

        // ----------------------------------------------------
        // Send email
        // ----------------------------------------------------

        await sendOTPByEmail(
            normalizedEmail,
            otp
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: {
                email: normalizedEmail,
                expiresIn: "10 minutes"
            }
        });

    } catch (error) {

        console.error("Send OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });
    }
};

// ============================================================
// 2. VERIFY OTP AND COMPLETE SIGNUP
// POST /api/auth/verify-otp
// ============================================================

const verifyOTPAndSignup = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const storedData = otpStore.get(normalizedEmail);

        if (!storedData) {
            return res.status(404).json({
                success: false,
                message: "No OTP request found. Please request a new OTP."
            });
        }

        // ----------------------------------------------------
        // Check expiry
        // ----------------------------------------------------

        if (Date.now() > storedData.expiresAt) {

            otpStore.delete(normalizedEmail);

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // ----------------------------------------------------
        // Check OTP
        // ----------------------------------------------------

        if (storedData.otp !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        const { userData } = storedData;

        // ----------------------------------------------------
        // Double-check email
        // ----------------------------------------------------

        const existingUser = await findUserByEmail(
            userData.email
        );

        if (existingUser) {
            otpStore.delete(normalizedEmail);

            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        // ----------------------------------------------------
        // Create user
        // ----------------------------------------------------

        const userId = uuidv4();

        await pool.query(
            `INSERT INTO users (
                user_id,
                full_name,
                email,
                phone,
                password_hash,
                user_type,
                is_verified,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                userId,
                userData.full_name,
                userData.email,
                userData.phone,
                userData.password,
                userData.user_type,
                true,
                true
            ]
        );

        // ----------------------------------------------------
        // Remove OTP
        // ----------------------------------------------------

        otpStore.delete(normalizedEmail);

        // ----------------------------------------------------
        // Generate JWT
        // ----------------------------------------------------

        const token = jwt.sign(
            {
                user_id: userId,
                email: userData.email,
                user_type: userData.user_type
            },
            process.env.JWT_SECRET || "your_secret_key",
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        console.log("User created successfully.");

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                token,
                user: {
                    id: userId,
                    name: userData.full_name,
                    email: userData.email,
                    phone: userData.phone,
                    type: userData.user_type,
                    isVerified: true
                }
            }
        });

    } catch (error) {

        console.error("Verify OTP Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
};

// ============================================================
// 3. RESEND OTP
// POST /api/auth/resend-otp
// ============================================================

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(
                res,
                "Email is required",
                400
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const storedData = otpStore.get(normalizedEmail);

        if (!storedData) {
            return sendError(
                res,
                "No pending registration found. Please start over.",
                404
            );
        }

        // Generate new OTP
        const newOTP = generateOTP();

        const expiresAt = Date.now() + 10 * 60 * 1000;

        storedData.otp = newOTP;
        storedData.expiresAt = expiresAt;

        otpStore.set(
            normalizedEmail,
            storedData
        );

        await sendOTPByEmail(
            normalizedEmail,
            newOTP
        );

        return sendSuccess(
            res,
            {
                email: normalizedEmail,
                expiresIn: "10 minutes"
            },
            "OTP resent successfully"
        );

    } catch (error) {

        console.error(
            "Resend OTP Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to resend OTP",
            error
        );
    }
};

// ============================================================
// 4. LOGIN
// POST /api/auth/login
// ============================================================

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findUserByEmail(
            normalizedEmail
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please sign up first."
            });
        }

        // ----------------------------------------------------
        // Check account status
        // ----------------------------------------------------

        if (user.is_active === false) {
            return res.status(403).json({
                success: false,
                message: "Your account is currently inactive."
            });
        }

        // ----------------------------------------------------
        // Compare password
        // ----------------------------------------------------

        const isPasswordValid = await comparePassword(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }

        // ----------------------------------------------------
        // Verify email
        // ----------------------------------------------------

        if (user.is_verified === false) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        // ----------------------------------------------------
        // Generate JWT
        // ----------------------------------------------------

        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                user_type: user.user_type
            },
            process.env.JWT_SECRET || "your_secret_key",
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                phone: user.phone,
                type: user.user_type,
                isVerified: user.is_verified
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

// ============================================================
// 5. FORGOT PASSWORD - SEND OTP
// POST /api/auth/forgot-password
// ============================================================

const forgotPasswordSendOTP = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return sendError(
                res,
                "Email is required",
                400
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findUserByEmail(
            normalizedEmail
        );

        if (!user) {
            return sendNotFound(
                res,
                "No account found with this email"
            );
        }

        const otp = generateOTP();

        const expiresAt = Date.now() + 10 * 60 * 1000;

        otpStore.set(
            `reset_${normalizedEmail}`,
            {
                otp,
                expiresAt,
                userId: user.user_id
            }
        );

        await sendOTPByEmail(
            normalizedEmail,
            otp
        );

        return sendSuccess(
            res,
            {
                email: normalizedEmail,
                expiresIn: "10 minutes"
            },
            "Password reset OTP sent successfully"
        );

    } catch (error) {

        console.error(
            "Forgot Password OTP Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to send OTP",
            error
        );
    }
};

// ============================================================
// 6. VERIFY OTP AND RESET PASSWORD
// POST /api/auth/reset-password
// ============================================================

const verifyOTPAndResetPassword = async (req, res) => {
    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;

        if (!email || !otp || !newPassword) {
            return sendError(
                res,
                "Email, OTP, and new password are required",
                400
            );
        }

        // Password validation
        const {
            isValid,
            errors
        } = validatePasswordStrength(newPassword);

        if (!isValid) {
            return sendError(
                res,
                "Password validation failed",
                400,
                errors
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const storedData = otpStore.get(
            `reset_${normalizedEmail}`
        );

        if (!storedData) {
            return sendError(
                res,
                "No OTP request found. Please request a new OTP.",
                404
            );
        }

        // Check expiry
        if (Date.now() > storedData.expiresAt) {

            otpStore.delete(
                `reset_${normalizedEmail}`
            );

            return sendError(
                res,
                "OTP has expired. Please request a new OTP.",
                400
            );
        }

        // Verify OTP
        if (storedData.otp !== String(otp).trim()) {
            return sendError(
                res,
                "Invalid OTP. Please try again.",
                400
            );
        }

        // Hash new password
        const hashedPassword =
            await hashPassword(newPassword);

        // Update password
        await updateUserPassword(
            storedData.userId,
            hashedPassword
        );

        // Remove OTP
        otpStore.delete(
            `reset_${normalizedEmail}`
        );

        return sendSuccess(
            res,
            null,
            "Password reset successfully. You can now login with your new password."
        );

    } catch (error) {

        console.error(
            "Reset Password Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to reset password",
            error
        );
    }
};

// ============================================================
// 7. GET PROFILE
// GET /api/auth/profile
// ============================================================

const getProfile = async (req, res) => {
    try {

        const user = await findUserById(
            req.user.userId
        );

        if (!user) {
            return sendNotFound(
                res,
                "User not found"
            );
        }

        return sendSuccess(
            res,
            user,
            "Profile fetched successfully"
        );

    } catch (error) {

        console.error(
            "Profile Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to fetch profile",
            error
        );
    }
};

// ============================================================
// 8. UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================

const updateProfile = async (req, res) => {
    try {

        const { userId } = req.user;

        const {
            full_name,
            phone,
            avatar_url
        } = req.body;

        // Validate phone if supplied
        if (
            phone !== undefined &&
            phone !== null &&
            !/^[0-9]{10}$/.test(phone)
        ) {
            return sendError(
                res,
                "Invalid phone number. 10 digits required.",
                400
            );
        }

        const result = await pool.query(
            `UPDATE users
             SET
                full_name = COALESCE($1, full_name),
                phone = COALESCE($2, phone),
                avatar_url = COALESCE($3, avatar_url),
                updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4
             RETURNING
                user_id,
                full_name,
                email,
                phone,
                user_type,
                avatar_url,
                is_verified,
                is_active`,
            [
                full_name,
                phone,
                avatar_url,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return sendNotFound(
                res,
                "User not found"
            );
        }

        return sendSuccess(
            res,
            result.rows[0],
            "Profile updated successfully"
        );

    } catch (error) {

        console.error(
            "Update Profile Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to update profile",
            error
        );
    }
};

// ============================================================
// 9. CHANGE PASSWORD
// POST /api/auth/change-password
// ============================================================

const changePassword = async (req, res) => {
    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(
                res,
                "Current password and new password are required",
                400
            );
        }

        const userResult = await pool.query(
            `SELECT password_hash
             FROM users
             WHERE user_id = $1`,
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            return sendNotFound(
                res,
                "User not found"
            );
        }

        // Check current password
        const isMatch = await comparePassword(
            currentPassword,
            userResult.rows[0].password_hash
        );

        if (!isMatch) {
            return sendError(
                res,
                "Current password is incorrect",
                401
            );
        }

        // Validate new password
        const {
            isValid,
            errors
        } = validatePasswordStrength(newPassword);

        if (!isValid) {
            return sendError(
                res,
                "Password validation failed",
                400,
                errors
            );
        }

        // Hash and update
        const hashedPassword =
            await hashPassword(newPassword);

        await updateUserPassword(
            req.user.userId,
            hashedPassword
        );

        return sendSuccess(
            res,
            null,
            "Password changed successfully"
        );

    } catch (error) {

        console.error(
            "Change Password Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to change password",
            error
        );
    }
};

// ============================================================
// 10. LOGOUT
// POST /api/auth/logout
// ============================================================

const logout = async (req, res) => {
    try {

        // JWT is stateless.
        // Client should remove the stored token.

        return sendSuccess(
            res,
            null,
            "Logged out successfully"
        );

    } catch (error) {

        console.error(
            "Logout Error:",
            error.message
        );

        return sendInternalError(
            res,
            "Failed to logout",
            error
        );
    }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    sendSignupOTP,
    verifyOTPAndSignup,
    resendOTP,
    login,
    forgotPasswordSendOTP,
    verifyOTPAndResetPassword,
    getProfile,
    updateProfile,
    changePassword,
    logout
};
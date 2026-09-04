// backend/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/database");
const {
    sendSuccess,
    sendError,
    sendUnauthorized,
    sendLoginSuccess,
    sendInternalError,
    sendNotFound
} = require("../utils/responseHandler");
const { generateToken, generateTokens } = require("../utils/generateToken");
const { hashPassword, comparePassword, validatePasswordStrength, generateRandomPassword } = require("../utils/hashPassword");

// ================= OTP STORAGE (In production, use Redis) =================
const otpStore = new Map(); // { email: { otp, expiresAt, userData } }

// ================= HELPER FUNCTIONS =================
const findUserByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

const findUserById = async (userId) => {
    const result = await pool.query(
        "SELECT user_id, full_name, email, phone, user_type, is_verified, created_at FROM users WHERE user_id = $1",
        [userId]
    );
    return result.rows[0];
};

const updateUserPassword = async (userId, hashedPassword) => {
    await pool.query(
        "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
        [hashedPassword, userId]
    );
};

const verifyUserEmail = async (email) => {
    await pool.query(
        "UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE email = $1",
        [email]
    );
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SEND OTP VIA EMAIL (DEVELOPMENT MODE) =================
// Only ONE version of this function - remove any duplicates
const sendOTPByEmail = async (email, otp) => {
    // Just log OTP to console for development
    console.log(`=================================`);
    console.log(`📧 DEVELOPMENT MODE - EMAIL VERIFICATION`);
    console.log(`To: ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`=================================`);
    return true; // Always return success in development
};

// ================= 1. SEND OTP FOR SIGNUP =================
const sendSignupOTP = async (req, res) => {
    try {
        const { full_name, email, phone, password, user_type = "customer" } = req.body;

        console.log('========================================');
        console.log('Signup OTP Request:', { full_name, email, phone, user_type });

        // Validation
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate phone format (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number (10 digits required)"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered. Please login."
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Store OTP and user data
        otpStore.set(email, {
            otp,
            expiresAt,
            userData: {
                full_name,
                email,
                phone,
                password: hashedPassword,
                user_type
            }
        });

        console.log(`✅ OTP Generated for ${email}: ${otp}`);

        // Send OTP (logs to console in development)
        await sendOTPByEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: {
                email,
                expiresIn: "10 minutes"
            }
        });

    } catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP: " + error.message
        });
    }
};

// ================= 2. VERIFY OTP & COMPLETE SIGNUP =================
const verifyOTPAndSignup = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log('Verify OTP Request:', { email, otp });

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        // Get stored OTP data
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(404).json({
                success: false,
                message: "No OTP request found. Please request a new OTP."
            });
        }

        // Check if OTP expired
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // Create user in database
        const userId = uuidv4();
        const { userData } = storedData;

        await pool.query(
            `INSERT INTO users (user_id, full_name, email, phone, password_hash, user_type, is_verified, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, userData.full_name, userData.email, userData.phone, userData.password, userData.user_type, true, true]
        );

        // Clear OTP from store
        otpStore.delete(email);

        // Generate token
        const token = require('jsonwebtoken').sign(
            { user_id: userId, email: userData.email, user_type: userData.user_type },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        console.log('✅ User created and OTP verified successfully');

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
            message: "Failed to verify OTP: " + error.message
        });
    }
};

// ================= 3. RESEND OTP =================
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, "Email is required", 400);
        }

        const storedData = otpStore.get(email);

        if (!storedData) {
            return sendError(res, "No pending registration found. Please start over.", 404);
        }

        // Generate new OTP
        const newOTP = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        // Update stored data
        storedData.otp = newOTP;
        storedData.expiresAt = expiresAt;
        otpStore.set(email, storedData);

        // Send new OTP
        await sendOTPByEmail(email, newOTP);

        return sendSuccess(res, {
            email,
            message: "New OTP sent successfully",
            expiresIn: "10 minutes"
        }, "OTP resent successfully");

    } catch (error) {
        console.error("Resend OTP Error:", error.message);
        return sendInternalError(res, "Failed to resend OTP", error);
    }
};

// ================= 4. LOGIN =================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please sign up first."
            });
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password. Please try again."
            });
        }

        if (user.is_verified === false) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        const token = require('jsonwebtoken').sign(
            { user_id: user.user_id, email: user.email, user_type: user.user_type },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
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
            message: "Login failed: " + error.message
        });
    }
};

// ================= 5. FORGOT PASSWORD - SEND OTP =================
const forgotPasswordSendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, "Email is required", 400);
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return sendNotFound(res, "No account found with this email");
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        otpStore.set(`reset_${email}`, {
            otp,
            expiresAt,
            userId: user.user_id
        });

        await sendOTPByEmail(email, otp);

        return sendSuccess(res, {
            email,
            message: "Password reset OTP sent to your email",
            expiresIn: "10 minutes"
        }, "OTP sent successfully");

    } catch (error) {
        console.error("Forgot Password OTP Error:", error.message);
        return sendInternalError(res, "Failed to send OTP", error);
    }
};

// ================= 6. VERIFY OTP & RESET PASSWORD =================
const verifyOTPAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return sendError(res, "Email, OTP, and new password are required", 400);
        }

        const { isValid, errors } = validatePasswordStrength(newPassword);
        if (!isValid) {
            return sendError(res, "Password validation failed", 400, errors);
        }

        const storedData = otpStore.get(`reset_${email}`);

        if (!storedData) {
            return sendError(res, "No OTP request found. Please request a new OTP.", 404);
        }

        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(`reset_${email}`);
            return sendError(res, "OTP has expired. Please request a new OTP.", 400);
        }

        if (storedData.otp !== otp) {
            return sendError(res, "Invalid OTP. Please try again.", 400);
        }

        const hashedPassword = await hashPassword(newPassword);
        await updateUserPassword(storedData.userId, hashedPassword);

        otpStore.delete(`reset_${email}`);

        return sendSuccess(res, null, "Password reset successfully. You can now login with your new password.");

    } catch (error) {
        console.error("Reset Password Error:", error.message);
        return sendInternalError(res, "Failed to reset password", error);
    }
};

// ================= 7. GET PROFILE =================
const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user.userId);

        if (!user) {
            return sendNotFound(res, "User not found");
        }

        return sendSuccess(res, user, "Profile fetched successfully");

    } catch (error) {
        console.error("Profile Error:", error.message);
        return sendInternalError(res, "Failed to fetch profile", error);
    }
};

// ================= 8. UPDATE PROFILE =================
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const { full_name, phone, avatar_url } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name),
                 phone = COALESCE($2, phone),
                 avatar_url = COALESCE($3, avatar_url),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $4
             RETURNING user_id, full_name, email, phone, user_type, avatar_url, is_verified`,
            [full_name, phone, avatar_url, userId]
        );

        if (result.rows.length === 0) {
            return sendNotFound(res, "User not found");
        }

        return sendSuccess(res, result.rows[0], "Profile updated successfully");

    } catch (error) {
        console.error("Update Profile Error:", error.message);
        return sendInternalError(res, "Failed to update profile", error);
    }
};

// ================= 9. CHANGE PASSWORD =================
const changePassword = async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, "Current password and new password are required", 400);
        }

        const userResult = await pool.query(
            "SELECT password_hash FROM users WHERE user_id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return sendNotFound(res, "User not found");
        }

        const isMatch = await comparePassword(currentPassword, userResult.rows[0].password_hash);
        if (!isMatch) {
            return sendError(res, "Current password is incorrect", 401);
        }

        const { isValid, errors } = validatePasswordStrength(newPassword);
        if (!isValid) {
            return sendError(res, "Password validation failed", 400, errors);
        }

        const hashedPassword = await hashPassword(newPassword);
        await updateUserPassword(userId, hashedPassword);

        return sendSuccess(res, null, "Password changed successfully");

    } catch (error) {
        console.error("Change Password Error:", error.message);
        return sendInternalError(res, "Failed to change password", error);
    }
};

// ================= 10. LOGOUT =================
const logout = async (req, res) => {
    try {
        return sendSuccess(res, null, "Logged out successfully");

    } catch (error) {
        console.error("Logout Error:", error.message);
        return sendInternalError(res, "Failed to logout", error);
    }
};

// ================= EXPORTS =================
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
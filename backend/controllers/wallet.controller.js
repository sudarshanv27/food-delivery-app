// backend/controllers/wallet.controller.js
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const {
    sendSuccess,
    sendError,
    sendInternalError,
    sendNotFound
} = require('../utils/responseHandler');

// ================= GET WALLET BALANCE =================
const getWallet = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(`
            SELECT wallet_balance
            FROM users
            WHERE user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return sendNotFound(res, 'User not found');
        }

        const balance = parseFloat(result.rows[0].wallet_balance) || 0;

        return sendSuccess(res, {
            balance: balance,
            currency: 'INR'
        }, 'Wallet balance fetched successfully');

    } catch (error) {
        console.error('❌ Wallet Fetch Error:', error);
        return sendInternalError(res, 'Failed to fetch wallet balance', error);
    }
};

// ================= ADD MONEY TO WALLET =================
const addMoney = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, payment_id, payment_method = 'razorpay' } = req.body;

        // Validation
        if (!amount || amount <= 0) {
            return sendError(res, 'Valid amount is required (minimum ₹1)', 400);
        }

        if (amount > 50000) {
            return sendError(res, 'Maximum amount per transaction is ₹50,000', 400);
        }

        await pool.query('BEGIN');

        const transactionId = uuidv4();

        // Insert transaction record
        await pool.query(`
            INSERT INTO wallet_transactions (
                transaction_id,
                user_id,
                amount,
                type,
                status,
                payment_id,
                payment_method,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
            transactionId,
            userId,
            amount,
            'credit',
            'completed',
            payment_id || null,
            payment_method
        ]);

        // Update user's wallet balance
        await pool.query(`
            UPDATE users
            SET wallet_balance = COALESCE(wallet_balance, 0) + $1,
                updated_at = NOW()
            WHERE user_id = $2
        `, [amount, userId]);

        await pool.query('COMMIT');

        // Get updated balance
        const balanceResult = await pool.query(`
            SELECT wallet_balance FROM users WHERE user_id = $1
        `, [userId]);

        return sendSuccess(res, {
            added: amount,
            new_balance: parseFloat(balanceResult.rows[0].wallet_balance),
            transaction_id: transactionId
        }, 'Money added to wallet successfully');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Add Money Error:', error);
        return sendInternalError(res, 'Failed to add money to wallet', error);
    }
};

// ================= DEDUCT MONEY FROM WALLET =================
const deductMoney = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, order_id, description } = req.body;

        if (!amount || amount <= 0) {
            return sendError(res, 'Valid amount is required', 400);
        }

        await pool.query('BEGIN');

        // Check current balance
        const balanceResult = await pool.query(`
            SELECT wallet_balance
            FROM users
            WHERE user_id = $1
        `, [userId]);

        if (balanceResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return sendNotFound(res, 'User not found');
        }

        const currentBalance = parseFloat(balanceResult.rows[0].wallet_balance) || 0;

        if (currentBalance < amount) {
            await pool.query('ROLLBACK');
            return sendError(res, 'Insufficient wallet balance', 400);
        }

        const transactionId = uuidv4();

        // Insert debit transaction
        await pool.query(`
            INSERT INTO wallet_transactions (
                transaction_id,
                user_id,
                amount,
                type,
                status,
                order_id,
                description,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
            transactionId,
            userId,
            amount,
            'debit',
            'completed',
            order_id || null,
            description || 'Wallet payment for order'
        ]);

        // Update wallet balance
        await pool.query(`
            UPDATE users
            SET wallet_balance = wallet_balance - $1,
                updated_at = NOW()
            WHERE user_id = $2
        `, [amount, userId]);

        await pool.query('COMMIT');

        // Get updated balance
        const newBalanceResult = await pool.query(`
            SELECT wallet_balance FROM users WHERE user_id = $1
        `, [userId]);

        return sendSuccess(res, {
            deducted: amount,
            new_balance: parseFloat(newBalanceResult.rows[0].wallet_balance),
            transaction_id: transactionId
        }, 'Money deducted from wallet successfully');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Deduct Money Error:', error);
        return sendInternalError(res, 'Failed to deduct money from wallet', error);
    }
};

// ================= GET WALLET TRANSACTIONS =================
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 50, offset = 0, type } = req.query;

        let query = `
            SELECT
                transaction_id,
                amount,
                type,
                status,
                payment_id,
                order_id,
                description,
                created_at
            FROM wallet_transactions
            WHERE user_id = $1
        `;

        const queryParams = [userId];
        let paramIndex = 2;

        if (type && (type === 'credit' || type === 'debit')) {
            query += ` AND type = $${paramIndex}`;
            queryParams.push(type);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, queryParams);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) FROM wallet_transactions WHERE user_id = $1
        `;
        const countParams = [userId];

        if (type && (type === 'credit' || type === 'debit')) {
            countQuery += ` AND type = $2`;
            countParams.push(type);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        // Calculate summary
        const summaryResult = await pool.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
                COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as total_debit
            FROM wallet_transactions
            WHERE user_id = $1 AND status = 'completed'
        `, [userId]);

        return sendSuccess(res, {
            transactions: result.rows,
            summary: {
                total_credited: parseFloat(summaryResult.rows[0].total_credit),
                total_debited: parseFloat(summaryResult.rows[0].total_debit),
                net_balance: parseFloat(summaryResult.rows[0].total_credit) - parseFloat(summaryResult.rows[0].total_debit)
            },
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: total,
                has_more: (parseInt(offset) + parseInt(limit)) < total
            }
        }, 'Wallet transactions fetched successfully');

    } catch (error) {
        console.error('❌ Transaction Error:', error);
        return sendInternalError(res, 'Failed to fetch transactions', error);
    }
};

// ================= GET SINGLE TRANSACTION =================
const getTransactionById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { transactionId } = req.params;

        const result = await pool.query(`
            SELECT
                transaction_id,
                amount,
                type,
                status,
                payment_id,
                order_id,
                description,
                created_at
            FROM wallet_transactions
            WHERE transaction_id = $1 AND user_id = $2
        `, [transactionId, userId]);

        if (result.rows.length === 0) {
            return sendNotFound(res, 'Transaction not found');
        }

        return sendSuccess(res, result.rows[0], 'Transaction fetched successfully');

    } catch (error) {
        console.error('❌ Get Transaction Error:', error);
        return sendInternalError(res, 'Failed to fetch transaction', error);
    }
};

// ================= CHECK IF WALLET HAS SUFFICIENT BALANCE =================
const checkBalance = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return sendError(res, 'Valid amount is required', 400);
        }

        const result = await pool.query(`
            SELECT wallet_balance FROM users WHERE user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return sendNotFound(res, 'User not found');
        }

        const currentBalance = parseFloat(result.rows[0].wallet_balance) || 0;
        const hasSufficientBalance = currentBalance >= amount;

        return sendSuccess(res, {
            current_balance: currentBalance,
            requested_amount: amount,
            has_sufficient_balance: hasSufficientBalance,
            shortfall: hasSufficientBalance ? 0 : amount - currentBalance
        }, 'Balance check completed');

    } catch (error) {
        console.error('❌ Check Balance Error:', error);
        return sendInternalError(res, 'Failed to check balance', error);
    }
};

// ================= ADMIN: GET ALL TRANSACTIONS =================
const getAllTransactions = async (req, res) => {
    try {
        const { limit = 100, offset = 0, user_id } = req.query;

        let query = `
            SELECT
                wt.transaction_id,
                wt.user_id,
                u.full_name as user_name,
                u.email as user_email,
                wt.amount,
                wt.type,
                wt.status,
                wt.payment_id,
                wt.order_id,
                wt.created_at
            FROM wallet_transactions wt
            JOIN users u ON wt.user_id = u.user_id
        `;

        const queryParams = [];
        let paramIndex = 1;

        if (user_id) {
            query += ` WHERE wt.user_id = $${paramIndex}`;
            queryParams.push(user_id);
            paramIndex++;
        }

        query += ` ORDER BY wt.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, queryParams);

        return sendSuccess(res, {
            transactions: result.rows,
            count: result.rows.length
        }, 'All transactions fetched successfully');

    } catch (error) {
        console.error('❌ Get All Transactions Error:', error);
        return sendInternalError(res, 'Failed to fetch transactions', error);
    }
};

// ================= EXPORTS =================
module.exports = {
    getWallet,
    addMoney,
    deductMoney,
    getTransactions,
    getTransactionById,
    checkBalance,
    getAllTransactions
};
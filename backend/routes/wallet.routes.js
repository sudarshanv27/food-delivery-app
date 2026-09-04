// backend/routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
    getWallet,
    addMoney,
    deductMoney,
    getTransactions,
    getTransactionById,
    checkBalance,
    getAllTransactions
} = require('../controllers/wallet.controller');

// ================= USER WALLET ROUTES (Authentication required) =================

// Get wallet balance
router.get('/balance', authenticate, getWallet);

// Get wallet balance (alternative endpoint)
router.get('/', authenticate, getWallet);

// Add money to wallet
router.post('/add', authenticate, addMoney);

// Add money to wallet (alternative endpoint)
router.post('/add-money', authenticate, addMoney);

// Deduct money from wallet (for order payments)
router.post('/deduct', authenticate, deductMoney);

// Get transaction history with pagination
router.get('/transactions', authenticate, getTransactions);

// Get single transaction by ID
router.get('/transactions/:transactionId', authenticate, getTransactionById);

// Check if wallet has sufficient balance
router.post('/check-balance', authenticate, checkBalance);

// ================= ADMIN WALLET ROUTES =================

// Get all user transactions (Admin only)
router.get('/admin/transactions', authenticate, isAdmin, getAllTransactions);

module.exports = router;
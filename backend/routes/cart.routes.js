// backend/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    checkRestaurantConsistency
} = require('../controllers/cart.controller');

// ================= ALL CART ROUTES REQUIRE AUTHENTICATION =================
router.use(authenticate);

// ================= CART ROUTES =================
// Get user cart
router.get('/', getCart);

// Get cart summary for checkout
router.get('/summary', getCartSummary);

// Add item to cart
router.post('/add', addToCart);

// Check restaurant consistency (prevents mixing restaurants)
router.post('/check-restaurant', checkRestaurantConsistency);

// Update cart item quantity
router.put('/:cartId', updateCartItem);

// Remove single cart item
router.delete('/:cartId', removeFromCart);

// Clear entire cart
router.delete('/', clearCart);

module.exports = router;
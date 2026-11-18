// backend/routes/cart.routes.js

const express = require('express');

const router = express.Router();

const {
    authenticate
} = require('../middleware/auth');

const {
    getCart,
    getCartSummary,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    checkRestaurantConsistency
} = require('../controllers/cart.controller');

// =====================================================
// ALL CART ROUTES REQUIRE AUTHENTICATION
// =====================================================

router.use(authenticate);


// =====================================================
// GET CART
// GET /api/cart
// =====================================================

router.get(
    '/',
    getCart
);


// =====================================================
// GET CART SUMMARY
// GET /api/cart/summary
// =====================================================

router.get(
    '/summary',
    getCartSummary
);


// =====================================================
// ADD ITEM TO CART
// POST /api/cart/add
// =====================================================

router.post(
    '/add',
    addToCart
);


// =====================================================
// CHECK RESTAURANT CONSISTENCY
// POST /api/cart/check-restaurant
// =====================================================

router.post(
    '/check-restaurant',
    checkRestaurantConsistency
);


// =====================================================
// UPDATE CART ITEM
// PUT /api/cart/:cartId/items/:cartItemId
// =====================================================

router.put(
    '/:cartId/items/:cartItemId',
    updateCartItem
);


// =====================================================
// REMOVE CART ITEM
// DELETE /api/cart/:cartId/items/:cartItemId
// =====================================================

router.delete(
    '/:cartId/items/:cartItemId',
    removeCartItem
);


// =====================================================
// CLEAR CART
// DELETE /api/cart
// =====================================================

router.delete(
    '/',
    clearCart
);


// =====================================================

module.exports = router;
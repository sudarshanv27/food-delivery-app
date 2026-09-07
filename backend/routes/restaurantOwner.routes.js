const express = require("express");

const router = express.Router();

const {
    authenticate,
} = require("../middleware/auth.middleware");

// =====================================================
// RESTAURANT OWNER AUTHENTICATION
// =====================================================

// All restaurant-owner routes require authentication
router.use(authenticate);


// =====================================================
// RESTAURANT OWNER DASHBOARD
// =====================================================

// Get restaurant owner statistics
router.get("/stats", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant owner stats endpoint",
        user: req.user,
    });
});


// =====================================================
// RESTAURANT OWNER ORDERS
// =====================================================

// Get restaurant orders
router.get("/orders", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant owner orders endpoint",
        user: req.user,
    });
});


// Update order status
router.put("/orders/:orderId/status", (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    res.json({
        success: true,
        message: "Restaurant order status endpoint",
        orderId,
        status,
        user: req.user,
    });
});


// =====================================================
// RESTAURANT MENU
// =====================================================

// Get restaurant menu
router.get("/menu", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant menu endpoint",
        user: req.user,
    });
});


// Add menu item
router.post("/menu", (req, res) => {
    res.json({
        success: true,
        message: "Add menu item endpoint",
        data: req.body,
        user: req.user,
    });
});


// Update menu item
router.put("/menu/:itemId", (req, res) => {
    const { itemId } = req.params;

    res.json({
        success: true,
        message: "Update menu item endpoint",
        itemId,
        data: req.body,
        user: req.user,
    });
});


// Delete menu item
router.delete("/menu/:itemId", (req, res) => {
    const { itemId } = req.params;

    res.json({
        success: true,
        message: "Delete menu item endpoint",
        itemId,
        user: req.user,
    });
});


// =====================================================
// RESTAURANT OWNER PROFILE
// =====================================================

// Get owner profile
router.get("/profile", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant owner profile endpoint",
        user: req.user,
    });
});


// Update owner profile
router.put("/profile", (req, res) => {
    res.json({
        success: true,
        message: "Update restaurant owner profile endpoint",
        data: req.body,
        user: req.user,
    });
});


// =====================================================
// RESTAURANT EARNINGS
// =====================================================

// Get earnings
router.get("/earnings", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant earnings endpoint",
        user: req.user,
    });
});


// =====================================================
// RESTAURANT ANALYTICS
// =====================================================

// Get restaurant analytics
router.get("/analytics", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant analytics endpoint",
        user: req.user,
    });
});


// =====================================================
// RESTAURANT REVIEWS
// =====================================================

// Get restaurant reviews
router.get("/reviews", (req, res) => {
    res.json({
        success: true,
        message: "Restaurant reviews endpoint",
        user: req.user,
    });
});


module.exports = router;

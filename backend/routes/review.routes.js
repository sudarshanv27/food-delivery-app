const express = require('express');

const router = express.Router();

const {
    authenticate
} = require('../middleware/auth');

const {
    addReview,
    getRestaurantReviews
} = require('../controllers/review.controller');

// Add Review
router.post(
    '/',
    authenticate,
    addReview
);

// Get Restaurant Reviews
router.get(
    '/:restaurantId',
    getRestaurantReviews
);

module.exports = router;
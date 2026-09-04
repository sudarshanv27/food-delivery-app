// backend/routes/offer.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    getRestaurantOffers,
    validateOffer,
    createOffer
} = require('../controllers/offer.controller');

router.get('/restaurant/:restaurantId', getRestaurantOffers);
router.post('/validate', validateOffer);
router.post('/create', authenticate, createOffer);

module.exports = router;
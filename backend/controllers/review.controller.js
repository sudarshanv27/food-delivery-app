// backend/controllers/review.controller.js

const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// ================= ADD REVIEW =================
const addReview = async (req, res) => {

    const {
        order_id,
        rating,
        comment
    } = req.body;

    const user_id = req.user.userId;

    try {

        // ================= VALIDATION =================
        if (!order_id || !rating) {

            return res.status(400).json({
                success: false,
                message: 'Order ID and rating are required'
            });

        }

        // Rating validation
        if (rating < 1 || rating > 5) {

            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });

        }

        // ================= CHECK DELIVERED ORDER =================
        const orderCheck = await pool.query(
            `
            SELECT *
            FROM orders
            WHERE order_id = $1
            AND user_id = $2
            AND order_status = $3
            `,
            [
                order_id,
                user_id,
                'delivered'
            ]
        );

        // Order not found
        if (orderCheck.rows.length === 0) {

            return res.status(403).json({
                success: false,
                message: 'You can only review delivered orders'
            });

        }

        const order = orderCheck.rows[0];

        // ================= CHECK EXISTING REVIEW =================
        const existingReview = await pool.query(
            `
            SELECT *
            FROM reviews
            WHERE order_id = $1
            AND user_id = $2
            `,
            [
                order_id,
                user_id
            ]
        );

        if (existingReview.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: 'Review already submitted'
            });

        }

        // ================= CREATE REVIEW =================
        const review_id = uuidv4();

        await pool.query(
            `
            INSERT INTO reviews (
                review_id,
                user_id,
                restaurant_id,
                order_id,
                rating,
                comment,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            `,
            [
                review_id,
                user_id,
                order.restaurant_id,
                order_id,
                rating,
                comment || ''
            ]
        );

        // ================= UPDATE RESTAURANT AVG RATING =================
        const avgResult = await pool.query(
            `
            SELECT AVG(rating)::numeric(10,2) AS average_rating
            FROM reviews
            WHERE restaurant_id = $1
            `,
            [order.restaurant_id]
        );

        const averageRating =
            avgResult.rows[0].average_rating || 0;

        await pool.query(
            `
            UPDATE restaurants
            SET avg_rating = $1
            WHERE restaurant_id = $2
            `,
            [
                averageRating,
                order.restaurant_id
            ]
        );

        // ================= SUCCESS RESPONSE =================
        return res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review: {
                review_id,
                restaurant_id: order.restaurant_id,
                order_id,
                rating,
                comment: comment || ''
            }
        });

    } catch (err) {

        console.error('❌ Add Review Error:', err);

        return res.status(500).json({
            success: false,
            message: 'Failed to add review'
        });

    }

};

// ================= GET RESTAURANT REVIEWS =================
const getRestaurantReviews = async (req, res) => {

    const { restaurant_id } = req.params;

    try {

        const result = await pool.query(
            `
            SELECT
                r.review_id,
                r.rating,
                r.comment,
                r.created_at,
                u.full_name AS user_name
            FROM reviews r
            JOIN users u
            ON r.user_id = u.user_id
            WHERE r.restaurant_id = $1
            ORDER BY r.created_at DESC
            `,
            [restaurant_id]
        );

        return res.status(200).json({
            success: true,
            reviews: result.rows
        });

    } catch (err) {

        console.error('❌ Get Reviews Error:', err);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });

    }

};

// ================= EXPORTS =================
module.exports = {
    addReview,
    getRestaurantReviews
};
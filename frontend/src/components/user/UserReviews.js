import React, { useState, useEffect } from 'react';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmationDialog from '../common/ConfirmationDialog';
import './UserReviews.css';

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        rating: 0,
        comment: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockReviews = [
                {
                    id: 1,
                    restaurantId: 1,
                    restaurantName: 'Pizza Hut',
                    restaurantImage: '/pizza-hut.jpg',
                    rating: 5,
                    comment: 'Absolutely delicious pizza! The crust was perfect and toppings were fresh. Will order again!',
                    date: '2024-01-15T18:30:00',
                    helpful: 24,
                    userHelped: false,
                    images: ['/pizza-review1.jpg', '/pizza-review2.jpg']
                },
                {
                    id: 2,
                    restaurantId: 2,
                    restaurantName: "McDonald's",
                    restaurantImage: '/mcdonalds.jpg',
                    rating: 4,
                    comment: 'Good burger, fast delivery. The fries were a bit cold though.',
                    date: '2024-01-10T19:15:00',
                    helpful: 12,
                    userHelped: false,
                    images: []
                },
                {
                    id: 3,
                    restaurantId: 3,
                    restaurantName: 'Biryani House',
                    restaurantImage: '/biryani.jpg',
                    rating: 5,
                    comment: 'Best biryani in town! The aroma and taste are amazing. Highly recommended!',
                    date: '2024-01-05T20:00:00',
                    helpful: 38,
                    userHelped: true,
                    images: ['/biryani-review1.jpg']
                }
            ];
            setReviews(mockReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setEditForm({
            rating: review.rating,
            comment: review.comment
        });
        setShowEditModal(true);
    };

    const handleUpdateReview = async () => {
        if (editForm.rating === 0) {
            setErrors({ rating: 'Please select a rating' });
            return;
        }

        if (!editForm.comment.trim()) {
            setErrors({ comment: 'Please write a review' });
            return;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            setReviews(prev => prev.map(review =>
                review.id === editingReview.id
                    ? { ...review, rating: editForm.rating, comment: editForm.comment }
                    : review
            ));

            setShowEditModal(false);
            setEditingReview(null);
            setEditForm({ rating: 0, comment: '' });
        } catch (error) {
            console.error('Error updating review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setReviews(prev => prev.filter(review => review.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setReviews(prev => prev.map(review =>
                review.id === reviewId
                    ? { ...review, helpful: review.helpful + 1, userHelped: true }
                    : review
            ));
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading && reviews.length === 0) {
        return (
            <div className="user-reviews-loading">
                <div className="spinner"></div>
                <p>Loading your reviews...</p>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="user-reviews-empty">
                <div className="empty-icon">⭐</div>
                <h3>No Reviews Yet</h3>
                <p>You haven't written any reviews yet. Rate restaurants you've ordered from!</p>
                <Button variant="primary" onClick={() => window.location.href = '/orders'}>
                    View Your Orders
                </Button>
            </div>
        );
    }

    return (
        <div className="user-reviews">
            <div className="reviews-header">
                <h2>My Reviews</h2>
                <div className="reviews-stats">
                    <div className="stat-card">
                        <div className="stat-value">{reviews.length}</div>
                        <div className="stat-label">Total Reviews</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                        </div>
                        <div className="stat-label">Average Rating</div>
                    </div>
                </div>
            </div>

            <div className="reviews-list">
                {reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="restaurant-info">
                                <img
                                    src={review.restaurantImage || '/default-restaurant.jpg'}
                                    alt={review.restaurantName}
                                    className="restaurant-image"
                                />
                                <div>
                                    <h3 className="restaurant-name">{review.restaurantName}</h3>
                                    <RatingStars rating={review.rating} size="small" readonly />
                                </div>
                            </div>
                            <div className="review-actions">
                                <button
                                    className="action-btn edit-btn"
                                    onClick={() => handleEdit(review)}
                                    aria-label="Edit review"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="action-btn delete-btn"
                                    onClick={() => setDeleteConfirm({ id: review.id, name: review.restaurantName })}
                                    aria-label="Delete review"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <div className="review-body">
                            <p className="review-comment">{review.comment}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                    {review.images.map((img, index) => (
                                        <img key={index} src={img} alt={`Review ${index + 1}`} className="review-image" />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="review-footer">
                            <div className="review-date">
                                📅 {formatDate(review.date)}
                            </div>
                            <button
                                className={`helpful-btn ${review.userHelped ? 'helped' : ''}`}
                                onClick={() => handleHelpful(review.id)}
                                disabled={review.userHelped}
                            >
                                👍 {review.helpful} people found this helpful
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Review Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingReview(null);
                    setErrors({});
                }}
                title="Edit Your Review"
                size="medium"
            >
                <div className="edit-review-form">
                    <div className="restaurant-edit-info">
                        <img
                            src={editingReview?.restaurantImage}
                            alt={editingReview?.restaurantName}
                            className="edit-restaurant-image"
                        />
                        <div>
                            <h4>{editingReview?.restaurantName}</h4>
                            <RatingStars rating={editForm.rating} size="medium" interactive onChange={(rating) => {
                                setEditForm(prev => ({ ...prev, rating }));
                                setErrors(prev => ({ ...prev, rating: '' }));
                            }} />
                            {errors.rating && <span className="error-message">{errors.rating}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Your Review</label>
                        <textarea
                            value={editForm.comment}
                            onChange={(e) => {
                                setEditForm(prev => ({ ...prev, comment: e.target.value }));
                                setErrors(prev => ({ ...prev, comment: '' }));
                            }}
                            rows={5}
                            placeholder="Share your experience..."
                            className={errors.comment ? 'error' : ''}
                        />
                        {errors.comment && <span className="error-message">{errors.comment}</span>}
                    </div>

                    <div className="edit-actions">
                        <Button
                            variant="primary"
                            onClick={handleUpdateReview}
                            isLoading={isLoading}
                        >
                            Update Review
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingReview(null);
                                setErrors({});
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDelete}
                title="Delete Review"
                message={`Are you sure you want to delete your review for "${deleteConfirm?.name}"?`}
                confirmText="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserReviews;
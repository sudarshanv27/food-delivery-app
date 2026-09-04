// src/components/restaurant/RestaurantReviews.js (Fixed version)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RatingStars from '../common/RatingStars';
import Button from '../common/Button';
import Modal from '../common/Modal';
import './RestaurantReviews.css';

const RestaurantReviews = ({ restaurantId, restaurantName }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [reportReason, setReportReason] = useState('');
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        title: '',
        comment: '',
        images: [],
        isAnonymous: false
    });
    const [errors, setErrors] = useState({});
    const [uploadingImages, setUploadingImages] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [restaurantId, filter, sortBy]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockReviews = [
                {
                    id: 1,
                    userName: 'John Doe',
                    userAvatar: null,
                    rating: 5,
                    title: 'Amazing food!',
                    comment: 'The food was absolutely delicious. Great service and fast delivery. Will definitely order again! The flavors were authentic and the portion sizes were generous.',
                    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                    helpful: 24,
                    userHelped: false,
                    images: [],
                    reply: null,
                    verified: true,
                    orderCount: 12
                },
                {
                    id: 2,
                    userName: 'Jane Smith',
                    userAvatar: null,
                    rating: 4,
                    title: 'Good experience',
                    comment: 'Food was tasty but delivery took a bit longer than expected. Overall good experience.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    helpful: 12,
                    userHelped: false,
                    images: [],
                    reply: 'Thank you for your feedback! We will work on improving our delivery time.',
                    verified: true,
                    orderCount: 5
                },
                {
                    id: 3,
                    userName: 'Mike Johnson',
                    userAvatar: null,
                    rating: 5,
                    title: 'Best restaurant in town',
                    comment: 'Hands down the best food I have had in a while. The quality is exceptional and the prices are reasonable.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                    helpful: 38,
                    userHelped: true,
                    images: [],
                    reply: null,
                    verified: true,
                    orderCount: 8
                }
            ];
            setReviews(mockReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (reviewForm.rating === 0) newErrors.rating = 'Please select a rating';
        if (!reviewForm.comment.trim()) newErrors.comment = 'Please write a review';
        if (reviewForm.comment.length < 10) newErrors.comment = 'Review must be at least 10 characters';
        if (reviewForm.comment.length > 2000) newErrors.comment = 'Review must be less than 2000 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitReview = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const newReview = {
                id: Date.now(),
                userName: reviewForm.isAnonymous ? 'Anonymous User' : 'You',
                userAvatar: null,
                rating: reviewForm.rating,
                title: reviewForm.title || 'My Review',
                comment: reviewForm.comment,
                date: new Date(),
                helpful: 0,
                userHelped: false,
                images: reviewForm.images,
                reply: null,
                verified: false,
                orderCount: 0
            };
            setReviews(prev => [newReview, ...prev]);
            setShowReviewModal(false);
            setReviewForm({ rating: 0, title: '', comment: '', images: [], isAnonymous: false });
            setErrors({});
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            setReviews(prev => prev.map(review =>
                review.id === reviewId && !review.userHelped
                    ? { ...review, helpful: review.helpful + 1, userHelped: true }
                    : review
            ));
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const handleReport = async () => {
        if (!reportReason) {
            alert('Please select a reason');
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            alert('Thank you for reporting. We will review this content.');
            setShowReportModal(false);
            setReportReason('');
            setSelectedReview(null);
        } catch (error) {
            console.error('Error reporting review:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + reviewForm.images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setUploadingImages(true);
        const imageUrls = [];
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large (max 5MB)`);
                continue;
            }
            const reader = new FileReader();
            await new Promise((resolve) => {
                reader.onloadend = () => {
                    imageUrls.push(reader.result);
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }
        setReviewForm(prev => ({
            ...prev,
            images: [...prev.images, ...imageUrls]
        }));
        setUploadingImages(false);
    };

    const removeImage = (index) => {
        setReviewForm(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // This is the key fix - calculate filtered and sorted reviews
    const getFilteredAndSortedReviews = useMemo(() => {
        let filtered = [...reviews];

        // Filter by rating
        if (filter !== 'all') {
            filtered = filtered.filter(review => review.rating === parseInt(filter));
        }

        // Sort
        if (sortBy === 'recent') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortBy === 'highest') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'lowest') {
            filtered.sort((a, b) => a.rating - b.rating);
        } else if (sortBy === 'helpful') {
            filtered.sort((a, b) => b.helpful - a.helpful);
        }

        return filtered;
    }, [reviews, filter, sortBy]);

    const formatDate = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const ratingDistribution = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
    };

    const recommendationRate = reviews.length > 0
        ? (reviews.filter(r => r.rating >= 4).length / reviews.length) * 100
        : 0;

    return (
        <div className="restaurant-reviews">
            {/* Summary Section */}
            <div className="reviews-summary">
                <div className="summary-left">
                    <div className="average-rating">{averageRating.toFixed(1)}</div>
                    <div className="rating-stars-wrapper">
                        <RatingStars rating={averageRating} size="large" readonly />
                    </div>
                    <div className="total-reviews">{reviews.length.toLocaleString()} reviews</div>
                    <div className="recommendation-rate">
                        <span className="rate-icon">👍</span>
                        <span>{Math.round(recommendationRate)}% recommend this restaurant</span>
                    </div>
                </div>

                <div className="summary-middle">
                    <div className="rating-distribution">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingDistribution[star];
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={star} className="distribution-row">
                                    <span className="star-label">{star} ★</span>
                                    <div className="bar-container">
                                        <div className="bar-fill" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className="bar-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="summary-right">
                    <Button variant="primary" onClick={() => setShowReviewModal(true)} icon="✍️">
                        Write a Review
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="reviews-filters">
                <div className="filter-group">
                    <span className="filter-label">Filter by:</span>
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === '5' ? 'active' : ''}`} onClick={() => setFilter('5')}>5 ★</button>
                        <button className={`filter-btn ${filter === '4' ? 'active' : ''}`} onClick={() => setFilter('4')}>4 ★</button>
                        <button className={`filter-btn ${filter === '3' ? 'active' : ''}`} onClick={() => setFilter('3')}>3 ★</button>
                        <button className={`filter-btn ${filter === '2' ? 'active' : ''}`} onClick={() => setFilter('2')}>2 ★</button>
                        <button className={`filter-btn ${filter === '1' ? 'active' : ''}`} onClick={() => setFilter('1')}>1 ★</button>
                    </div>
                </div>

                <div className="sort-group">
                    <span className="sort-label">Sort by:</span>
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                        <option value="helpful">Most Helpful</option>
                    </select>
                </div>
            </div>

            {/* Reviews List - Using the correct variable name */}
            {isLoading && reviews.length === 0 ? (
                <div className="reviews-loading">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Loading reviews...</p>
                </div>
            ) : getFilteredAndSortedReviews.length === 0 ? (
                <div className="reviews-empty">
                    <div className="empty-icon">💬</div>
                    <h3>No reviews yet</h3>
                    <p>Be the first to share your experience!</p>
                    <Button variant="primary" onClick={() => setShowReviewModal(true)}>Write a Review</Button>
                </div>
            ) : (
                <div className="reviews-list">
                    {getFilteredAndSortedReviews.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <div className="user-info">
                                    <img
                                        src={review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=667eea&color=fff`}
                                        alt={review.userName}
                                        className="user-avatar"
                                    />
                                    <div>
                                        <div className="user-name">
                                            {review.userName}
                                            {review.verified && <span className="verified-badge" title="Verified Purchase">✓ Verified</span>}
                                            {review.orderCount > 0 && <span className="order-count">{review.orderCount} orders</span>}
                                        </div>
                                        <div className="review-date">{formatDate(review.date)}</div>
                                    </div>
                                </div>
                                <div className="review-actions">
                                    <RatingStars rating={review.rating} size="small" readonly />
                                    <button className="report-btn" onClick={() => {
                                        setSelectedReview(review);
                                        setShowReportModal(true);
                                    }} title="Report">
                                        🚩
                                    </button>
                                </div>
                            </div>

                            {review.title && <h4 className="review-title">{review.title}</h4>}
                            <p className="review-comment">{review.comment}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="review-images">
                                    {review.images.map((img, index) => (
                                        <div key={index} className="image-wrapper">
                                            <img src={img} alt={`Review ${index + 1}`} className="review-image" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {review.reply && (
                                <div className="restaurant-reply">
                                    <div className="reply-header">
                                        <span className="reply-icon">🏪</span>
                                        <span className="reply-restaurant">{restaurantName} responded</span>
                                    </div>
                                    <p className="reply-text">{review.reply}</p>
                                </div>
                            )}

                            <div className="review-footer">
                                <button
                                    className={`helpful-btn ${review.userHelped ? 'active' : ''}`}
                                    onClick={() => handleHelpful(review.id)}
                                    disabled={review.userHelped}
                                >
                                    👍 <span>Helpful ({review.helpful})</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Write Review Modal */}
            <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title={`Write a Review for ${restaurantName}`} size="medium">
                <div className="review-form">
                    <div className="form-group">
                        <label>Your Rating <span className="required">*</span></label>
                        <RatingStars rating={reviewForm.rating} size="large" interactive onChange={(rating) => {
                            setReviewForm(prev => ({ ...prev, rating }));
                            setErrors(prev => ({ ...prev, rating: '' }));
                        }} />
                        {errors.rating && <span className="error-message">{errors.rating}</span>}
                    </div>

                    <div className="form-group">
                        <label>Review Title (Optional)</label>
                        <input type="text" value={reviewForm.title} onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Summarize your experience" maxLength="100" />
                        <small className="char-count">{reviewForm.title.length}/100</small>
                    </div>

                    <div className="form-group">
                        <label>Your Review <span className="required">*</span></label>
                        <textarea value={reviewForm.comment} onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Share your experience with this restaurant..." rows={5} className={errors.comment ? 'error' : ''} />
                        {errors.comment && <span className="error-message">{errors.comment}</span>}
                        <small className="char-count">{reviewForm.comment.length}/2000 characters</small>
                    </div>

                    <div className="form-group">
                        <label>Upload Photos (Optional)</label>
                        <div className="image-upload-area">
                            <label className="upload-label">
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImages} />
                                <span className="upload-icon">📸</span>
                                <span>{uploadingImages ? 'Uploading...' : 'Click to upload photos'}</span>
                                <small>Max 5 images, 5MB each</small>
                            </label>
                            <div className="image-preview">
                                {reviewForm.images.map((img, index) => (
                                    <div key={index} className="preview-image">
                                        <img src={img} alt={`Preview ${index + 1}`} />
                                        <button className="remove-image" onClick={() => removeImage(index)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={reviewForm.isAnonymous} onChange={(e) => setReviewForm(prev => ({ ...prev, isAnonymous: e.target.checked }))} />
                            <span>Post anonymously</span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <Button variant="primary" onClick={handleSubmitReview} isLoading={isLoading}>Submit Review</Button>
                        <Button variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                    </div>
                </div>
            </Modal>

            {/* Report Modal */}
            <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report Review" size="small">
                <div className="report-form">
                    <p>Why are you reporting this review?</p>
                    <div className="report-reasons">
                        {['Spam', 'Offensive content', 'Fake review', 'Harassment', 'Other'].map(reason => (
                            <label key={reason} className="radio-label">
                                <input type="radio" name="reason" value={reason} checked={reportReason === reason} onChange={(e) => setReportReason(e.target.value)} />
                                <span>{reason}</span>
                            </label>
                        ))}
                    </div>
                    <div className="form-actions">
                        <Button variant="primary" onClick={handleReport}>Submit Report</Button>
                        <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RestaurantReviews;
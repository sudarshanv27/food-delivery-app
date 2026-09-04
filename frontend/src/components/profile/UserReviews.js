// src/components/profile/UserReviews.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UserReviews.css';

const UserReviews = ({ onReviewUpdate, userId, isEditable = true }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [expandedReview, setExpandedReview] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageUploadProgress, setImageUploadProgress] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalReviews, setTotalReviews] = useState(0);
    const observerRef = useRef();
    const fileInputRef = useRef();

    const [stats, setStats] = useState({
        total: 0,
        average: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
        totalHelpful: 0,
        totalWithPhotos: 0,
        averageHelpful: 0
    });

    const [formData, setFormData] = useState({
        restaurant_id: '',
        restaurant_name: '',
        rating: 5,
        title: '',
        comment: '',
        images: [],
        tags: [],
        order_id: null,
        visit_date: new Date().toISOString().split('T')[0],
        price_range: '$$',
        wait_time: null
    });

    const [formErrors, setFormErrors] = useState({});
    const [suggestedTags, setSuggestedTags] = useState([
        'Food', 'Service', 'Ambiance', 'Value', 'Cleanliness', 'Location',
        'Parking', 'Delivery', 'Takeout', 'Family Friendly', 'Vegetarian',
        'Vegan', 'Gluten Free', 'Romantic', 'Business Meeting'
    ]);

    const calculateStats = useCallback((reviewsData) => {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + (review.rating || 0), 0);
        const average = total > 0 ? sum / total : 0;
        const totalHelpful = reviewsData.reduce((acc, review) => acc + (review.helpful_count || 0), 0);
        const totalWithPhotos = reviewsData.filter(r => r.images && r.images.length > 0).length;
        const averageHelpful = total > 0 ? totalHelpful / total : 0;

        const fiveStar = reviewsData.filter(r => r.rating === 5).length;
        const fourStar = reviewsData.filter(r => r.rating === 4).length;
        const threeStar = reviewsData.filter(r => r.rating === 3).length;
        const twoStar = reviewsData.filter(r => r.rating === 2).length;
        const oneStar = reviewsData.filter(r => r.rating === 1).length;

        setStats({
            total,
            average,
            fiveStar,
            fourStar,
            threeStar,
            twoStar,
            oneStar,
            totalHelpful,
            totalWithPhotos,
            averageHelpful
        });
    }, []);

    const fetchReviews = useCallback(async (reset = true) => {
        try {
            if (reset) {
                setLoading(true);
                setPage(1);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/users/reviews', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: reset ? 1 : page,
                    limit: 10,
                    sort: sortBy,
                    filter: filter !== 'all' ? filter : undefined,
                    year: selectedYear !== 'all' ? selectedYear : undefined,
                    search: searchTerm || undefined
                }
            });

            const newReviews = response.data.data || response.data.reviews || [];
            const total = response.data.total || newReviews.length;

            if (reset) {
                setReviews(newReviews);
                setTotalReviews(total);
                calculateStats(newReviews);
            } else {
                setReviews(prev => [...prev, ...newReviews]);
            }

            setHasMore(newReviews.length === 10 && reviews.length + newReviews.length < total);

            if (onReviewUpdate && reset) onReviewUpdate(newReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            if (reset) {
                const mockReviews = generateMockReviews();
                setReviews(mockReviews);
                setTotalReviews(mockReviews.length);
                calculateStats(mockReviews);
                toast.error('Using demo data. API not available.', { duration: 3000 });
            }
        } finally {
            if (reset) setLoading(false);
        }
    }, [calculateStats, onReviewUpdate, page, sortBy, filter, selectedYear, searchTerm]);

    // Infinite scroll
    useEffect(() => {
        if (!loading && hasMore && page > 1) {
            fetchReviews(false);
        }
    }, [page]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0.1
        };

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prev => prev + 1);
            }
        }, options);

        const sentinel = document.getElementById('reviews-sentinel');
        if (sentinel) observerRef.current.observe(sentinel);

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, loading]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== undefined) {
                fetchReviews(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchReviews(true);
    }, [sortBy, filter, selectedYear]);

    const generateMockReviews = () => {
        const restaurants = [
            { name: 'Pizza Hut', cuisine: 'Italian', price: '$$' },
            { name: "McDonald's", cuisine: 'Fast Food', price: '$' },
            { name: 'KFC', cuisine: 'Fast Food', price: '$' },
            { name: 'Dominos', cuisine: 'Italian', price: '$$' },
            { name: 'Starbucks', cuisine: 'Cafe', price: '$$' },
            { name: 'Burger King', cuisine: 'Fast Food', price: '$' }
        ];

        const reviews = [];
        const now = new Date();

        for (let i = 0; i < 25; i++) {
            const rating = Math.floor(Math.random() * 5) + 1;
            const helpfulCount = Math.floor(Math.random() * 50);
            const date = new Date(now - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
            const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

            reviews.push({
                id: i + 1,
                restaurant_id: Math.floor(Math.random() * 100) + 1,
                restaurant_name: restaurant.name,
                cuisine: restaurant.cuisine,
                rating: rating,
                title: getRandomTitle(rating),
                comment: getRandomComment(rating),
                images: Math.random() > 0.7 ? [`/api/placeholder/100/100?${i}`] : [],
                tags: ['food', 'service', 'ambiance'].slice(0, Math.floor(Math.random() * 3) + 1),
                created_at: date.toISOString(),
                updated_at: date.toISOString(),
                helpful_count: helpfulCount,
                user_helpful: Math.random() > 0.8,
                reply: rating >= 4 ? 'Thank you for your wonderful review! We appreciate your feedback.' :
                    rating <= 2 ? 'We apologize for your experience. Please contact us to make it right.' : null,
                order_id: `ORD${100000 + i}`,
                visit_date: new Date(date - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                price_range: restaurant.price,
                wait_time: Math.floor(Math.random() * 30) + 5
            });
        }
        return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const getRandomTitle = (rating) => {
        const titles = {
            5: ['Absolutely Amazing!', 'Best Experience Ever!', 'Perfect in Every Way'],
            4: ['Great Experience', 'Very Satisfied', 'Would Recommend'],
            3: ['Decent Experience', 'Average Service', 'Nothing Special'],
            2: ['Disappointing', 'Needs Improvement', 'Below Expectations'],
            1: ['Terrible Experience', 'Worst Ever', 'Avoid at All Costs']
        };
        const options = titles[rating] || titles[3];
        return options[Math.floor(Math.random() * options.length)];
    };

    const getRandomComment = (rating) => {
        const comments = {
            5: 'The food was exceptional, service was prompt, and the ambiance was perfect. Will definitely return!',
            4: 'Great food and good service. Slightly pricey but worth it overall.',
            3: 'Decent food but nothing extraordinary. Service was okay but could be improved.',
            2: 'Disappointed with the quality. Food was cold and service was slow.',
            1: 'Horrible experience. Would not recommend to anyone. Food was inedible.'
        };
        return comments[rating] || comments[3];
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.restaurant_name.trim()) {
            errors.restaurant_name = 'Restaurant name is required';
        }

        if (!formData.comment.trim()) {
            errors.comment = 'Review comment is required';
        } else if (formData.comment.trim().length < 10) {
            errors.comment = 'Review must be at least 10 characters';
        } else if (formData.comment.trim().length > 2000) {
            errors.comment = 'Review must be less than 2000 characters';
        }

        if (formData.title && formData.title.length > 200) {
            errors.title = 'Title must be less than 200 characters';
        }

        if (formData.visit_date && new Date(formData.visit_date) > new Date()) {
            errors.visit_date = 'Visit date cannot be in the future';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setUploadingImage(true);

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                continue;
            }

            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                continue;
            }

            try {
                const imageId = Date.now() + Math.random();
                setImageUploadProgress(prev => ({ ...prev, [imageId]: 0 }));

                // Simulate upload progress
                for (let progress = 0; progress <= 100; progress += 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    setImageUploadProgress(prev => ({ ...prev, [imageId]: progress }));
                }

                const reader = new FileReader();
                const compressedImage = await compressImage(file);

                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, reader.result]
                    }));
                    setImageUploadProgress(prev => {
                        const newProgress = { ...prev };
                        delete newProgress[imageId];
                        return newProgress;
                    });
                };
                reader.readAsDataURL(compressedImage);
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error(`Failed to upload ${file.name}`);
            }
        }

        setUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1200;
                    const maxHeight = 1200;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        toast.success('Image removed');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const submitData = {
                restaurant_name: formData.restaurant_name.trim(),
                rating: formData.rating,
                title: formData.title.trim(),
                comment: formData.comment.trim(),
                images: formData.images,
                tags: formData.tags,
                visit_date: formData.visit_date,
                price_range: formData.price_range,
                wait_time: formData.wait_time
            };

            if (editingReview) {
                await axios.put(`/api/users/reviews/${editingReview.id}`, submitData, config);
                toast.success('Review updated successfully', { icon: '✏️' });
            } else {
                await axios.post('/api/users/reviews', submitData, config);
                toast.success('Review added successfully', { icon: '⭐' });
            }

            await fetchReviews(true);
            resetForm();
        } catch (error) {
            console.error('Error saving review:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save review';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/reviews/${showDeleteConfirm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Review deleted successfully');
            await fetchReviews(true);
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.response?.data?.message || 'Failed to delete review');
        }
    };

    const handleMarkHelpful = async (reviewId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/users/reviews/${reviewId}/helpful`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Thanks for your feedback!', { icon: '👍' });
            await fetchReviews(true);
        } catch (error) {
            console.error('Error marking helpful:', error);
            toast.error('Failed to mark as helpful');
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setEditingReview(null);
        setFormErrors({});
        setFormData({
            restaurant_id: '',
            restaurant_name: '',
            rating: 5,
            title: '',
            comment: '',
            images: [],
            tags: [],
            order_id: null,
            visit_date: new Date().toISOString().split('T')[0],
            price_range: '$$',
            wait_time: null
        });
    };

    const editReview = (review) => {
        setEditingReview(review);
        setFormData({
            restaurant_id: review.restaurant_id,
            restaurant_name: review.restaurant_name,
            rating: review.rating,
            title: review.title || '',
            comment: review.comment,
            images: review.images || [],
            tags: review.tags || [],
            order_id: review.order_id,
            visit_date: review.visit_date || new Date().toISOString().split('T')[0],
            price_range: review.price_range || '$$',
            wait_time: review.wait_time || null
        });
        setShowAddForm(true);
    };

    const shareReview = async (review) => {
        const shareData = {
            title: `My review of ${review.restaurant_name}`,
            text: `${review.title || 'Check out my review'} - ${review.rating}/5 stars`,
            url: `${window.location.origin}/restaurant/${review.restaurant_id}/review/${review.id}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Shared successfully!');
            } catch (err) {
                navigator.clipboard.writeText(shareData.url);
                toast.success('Link copied to clipboard!');
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            toast.success('Link copied to clipboard!');
        }
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <span className="star-rating-display" aria-label={`${rating} out of 5 stars`}>
                {'★'.repeat(fullStars)}
                {hasHalfStar && '½'}
                {'☆'.repeat(emptyStars)}
            </span>
        );
    };

    const getStarButtons = () => {
        return [1, 2, 3, 4, 5].map(star => (
            <button
                key={star}
                type="button"
                className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, rating: star })}
                onMouseEnter={(e) => {
                    const stars = e.currentTarget.parentElement.children;
                    for (let i = 0; i < star; i++) stars[i].classList.add('hover');
                }}
                onMouseLeave={(e) => {
                    const stars = e.currentTarget.parentElement.children;
                    Array.from(stars).forEach(star => star.classList.remove('hover'));
                }}
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
                {formData.rating >= star ? '★' : '☆'}
            </button>
        ));
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

    const exportReviews = () => {
        const exportData = reviews.map(review => ({
            restaurant: review.restaurant_name,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            date: new Date(review.created_at).toLocaleDateString(),
            helpful_votes: review.helpful_count,
            tags: review.tags?.join(', ')
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-reviews-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Reviews exported successfully!');
    };

    const filteredReviews = useMemo(() => {
        let filtered = [...reviews];

        if (filter === 'high') filtered = filtered.filter(r => r.rating >= 4);
        else if (filter === 'medium') filtered = filtered.filter(r => r.rating === 3);
        else if (filter === 'low') filtered = filtered.filter(r => r.rating <= 2);

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.restaurant_name.toLowerCase().includes(term) ||
                r.title?.toLowerCase().includes(term) ||
                r.comment.toLowerCase().includes(term) ||
                r.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        if (selectedYear !== 'all') {
            filtered = filtered.filter(r => new Date(r.created_at).getFullYear().toString() === selectedYear);
        }

        switch (sortBy) {
            case 'newest':
                return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'oldest':
                return filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'highest':
                return filtered.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return filtered.sort((a, b) => a.rating - b.rating);
            case 'helpful':
                return filtered.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
            default:
                return filtered;
        }
    }, [reviews, filter, sortBy, searchTerm, selectedYear]);

    const years = useMemo(() => {
        const yearsSet = new Set();
        reviews.forEach(review => {
            yearsSet.add(new Date(review.created_at).getFullYear());
        });
        return ['all', ...Array.from(yearsSet).sort().reverse()];
    }, [reviews]);

    if (loading && page === 1) {
        return (
            <div className="reviews-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading your reviews...</p>
            </div>
        );
    }

    return (
        <div className="user-reviews">
            {/* Header */}
            <div className="reviews-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">⭐</span>
                        My Reviews
                        {totalReviews > 0 && <span className="review-count-badge">{totalReviews}</span>}
                    </h2>
                    <p className="header-subtitle">Share your dining experiences and help others discover great places</p>
                </div>
                <div className="header-actions">
                    {reviews.length > 0 && (
                        <button onClick={exportReviews} className="export-btn" title="Export reviews">
                            📥 Export
                        </button>
                    )}
                    {isEditable && (
                        <button onClick={() => setShowAddForm(true)} className="write-review-btn">
                            ✍️ Write a Review
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            {reviews.length > 0 && (
                <div className="reviews-stats">
                    <div className="stats-summary">
                        <div className="average-rating">
                            <div className="rating-number">{stats.average.toFixed(1)}</div>
                            <div className="rating-stars-display">{getStarRating(Math.round(stats.average))}</div>
                            <div className="rating-count">{stats.total} {stats.total === 1 ? 'review' : 'reviews'}</div>
                        </div>
                        <div className="stats-extra">
                            <div className="stat-badge">
                                <span className="stat-icon">👍</span>
                                <span>{stats.totalHelpful} helpful votes</span>
                            </div>
                            <div className="stat-badge">
                                <span className="stat-icon">📷</span>
                                <span>{stats.totalWithPhotos} with photos</span>
                            </div>
                            <div className="stat-badge">
                                <span className="stat-icon">💡</span>
                                <span>{stats.averageHelpful.toFixed(1)} avg helpful/review</span>
                            </div>
                        </div>
                        <div className="rating-breakdown">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = stats[`${star}Star`];
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                const colors = { 5: '#4CAF50', 4: '#8BC34A', 3: '#FFC107', 2: '#FF9800', 1: '#F44336' };

                                return (
                                    <div key={star} className="rating-bar-item">
                                        <span className="star-label">{star} ★</span>
                                        <div className="rating-bar">
                                            <div
                                                className="rating-bar-fill"
                                                style={{ width: `${percentage}%`, backgroundColor: colors[star] }}
                                            />
                                        </div>
                                        <span className="rating-count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            {reviews.length > 0 && (
                <div className="reviews-controls">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by restaurant, title, comment, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            aria-label="Search reviews"
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')} aria-label="Clear search">
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="year-select">
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year === 'all' ? 'All Years' : year}
                                </option>
                            ))}
                        </select>

                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                            <option value="helpful">Most Helpful</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            {reviews.length > 0 && (
                <div className="review-filters" role="tablist">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                        role="tab"
                    >
                        All ({stats.total})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
                        onClick={() => setFilter('high')}
                        role="tab"
                    >
                        High Rated ({stats.fiveStar + stats.fourStar})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
                        onClick={() => setFilter('medium')}
                        role="tab"
                    >
                        Medium ({stats.threeStar})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
                        onClick={() => setFilter('low')}
                        role="tab"
                    >
                        Low Rated ({stats.twoStar + stats.oneStar})
                    </button>
                </div>
            )}

            {/* Results Info */}
            {filteredReviews.length !== reviews.length && (
                <div className="results-info">
                    Showing {filteredReviews.length} of {reviews.length} reviews
                    <button className="clear-filters" onClick={() => {
                        setSearchTerm('');
                        setSelectedYear('all');
                        setFilter('all');
                        setSortBy('newest');
                    }}>
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="no-reviews">
                    <div className="empty-state-animation">
                        <div className="empty-icon">⭐</div>
                    </div>
                    <h3>No Reviews Yet</h3>
                    <p>
                        {searchTerm || selectedYear !== 'all' || filter !== 'all'
                            ? "No reviews match your filters. Try adjusting your search criteria."
                            : "You haven't written any reviews yet. Share your experience with restaurants and help others make informed choices!"}
                    </p>
                    {!searchTerm && selectedYear === 'all' && filter === 'all' && isEditable && (
                        <button onClick={() => setShowAddForm(true)} className="write-first-btn">
                            ✍️ Write Your First Review
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="reviews-list">
                        {filteredReviews.map(review => (
                            <div
                                key={review.id}
                                className={`review-card rating-${review.rating} ${expandedReview === review.id ? 'expanded' : ''}`}
                            >
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <h3 className="restaurant-name">
                                            {review.restaurant_name}
                                            {review.cuisine && <span className="cuisine-badge">{review.cuisine}</span>}
                                            {review.order_id && <span className="order-badge">Order #{review.order_id}</span>}
                                        </h3>
                                        <div className="rating-display">
                                            <span className="rating-stars">{getStarRating(review.rating)}</span>
                                            <span className="rating-value">{review.rating}/5</span>
                                        </div>
                                    </div>
                                    <div className="review-meta">
                                        <span className="review-date" title={new Date(review.created_at).toLocaleString()}>
                                            {getTimeAgo(review.created_at)}
                                        </span>
                                        <button
                                            className="expand-btn"
                                            onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                                            aria-label={expandedReview === review.id ? 'Show less' : 'Show more'}
                                        >
                                            {expandedReview === review.id ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {review.title && <h4 className="review-title">{review.title}</h4>}

                                <p className="review-comment">{review.comment}</p>

                                {/* Visit Date & Price Range */}
                                {(review.visit_date || review.price_range || review.wait_time) && (
                                    <div className="review-details">
                                        {review.visit_date && (
                                            <span className="detail-badge">
                                                📅 {new Date(review.visit_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {review.price_range && (
                                            <span className="detail-badge">
                                                💰 {review.price_range}
                                            </span>
                                        )}
                                        {review.wait_time && (
                                            <span className="detail-badge">
                                                ⏱️ Wait: {review.wait_time} min
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Tags */}
                                {review.tags && review.tags.length > 0 && (
                                    <div className="review-tags">
                                        {review.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="tag"
                                                onClick={() => setSearchTerm(tag)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="review-images">
                                        {review.images.map((img, idx) => (
                                            <div key={idx} className="image-wrapper">
                                                <img src={img} alt={`Review ${idx + 1}`} loading="lazy" />
                                                <button
                                                    className="image-view-btn"
                                                    onClick={() => window.open(img, '_blank')}
                                                    aria-label="View full size image"
                                                >
                                                    🔍
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Expanded Content */}
                                {expandedReview === review.id && (
                                    <div className="review-expanded">
                                        <div className="expanded-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Order ID:</span>
                                                <span>{review.order_id || 'N/A'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Posted on:</span>
                                                <span>{new Date(review.created_at).toLocaleString()}</span>
                                            </div>
                                            {review.updated_at !== review.created_at && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Last edited:</span>
                                                    <span>{new Date(review.updated_at).toLocaleString()}</span>
                                                </div>
                                            )}
                                            {review.visit_date && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Visit date:</span>
                                                    <span>{new Date(review.visit_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="review-footer">
                                    <button
                                        onClick={() => handleMarkHelpful(review.id)}
                                        className={`helpful-btn ${review.user_helpful ? 'active' : ''}`}
                                        disabled={review.user_helpful}
                                    >
                                        👍 Helpful ({review.helpful_count || 0})
                                    </button>
                                    <button
                                        onClick={() => shareReview(review)}
                                        className="share-btn"
                                        aria-label="Share review"
                                    >
                                        🔗 Share
                                    </button>
                                    {isEditable && (
                                        <div className="review-actions">
                                            <button onClick={() => editReview(review)} className="edit-review-btn">
                                                ✏️ Edit
                                            </button>
                                            <button onClick={() => setShowDeleteConfirm(review.id)} className="delete-review-btn">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {review.reply && (
                                    <div className="restaurant-reply">
                                        <div className="reply-header">
                                            <span className="reply-icon">🍕</span>
                                            <strong>Restaurant Response</strong>
                                        </div>
                                        <p>{review.reply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div id="reviews-sentinel" className="sentinel"></div>
                    {loading && page > 1 && (
                        <div className="loading-more">
                            <div className="loading-spinner small"></div>
                            <p>Loading more reviews...</p>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Review Modal */}
            {(showAddForm || editingReview) && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <span className="modal-icon">{editingReview ? '✏️' : '⭐'}</span>
                                {editingReview ? 'Edit Review' : 'Write a Review'}
                            </h3>
                            <button className="close-modal" onClick={resetForm} aria-label="Close">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="review-form">
                            <div className="form-group">
                                <label>Restaurant Name *</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🍕</span>
                                    <input
                                        type="text"
                                        value={formData.restaurant_name}
                                        onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                                        placeholder="Enter restaurant name"
                                        disabled={!!editingReview}
                                        className={formErrors.restaurant_name ? 'error' : ''}
                                        autoFocus
                                    />
                                </div>
                                {formErrors.restaurant_name && <span className="error-message">{formErrors.restaurant_name}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Visit Date</label>
                                    <input
                                        type="date"
                                        value={formData.visit_date}
                                        onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={formErrors.visit_date ? 'error' : ''}
                                    />
                                    {formErrors.visit_date && <span className="error-message">{formErrors.visit_date}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Price Range</label>
                                    <select
                                        value={formData.price_range}
                                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                                    >
                                        <option value="$">$ - Budget</option>
                                        <option value="$$">$$ - Moderate</option>
                                        <option value="$$$">$$$ - Expensive</option>
                                        <option value="$$$$">$$$$ - Very Expensive</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Wait Time (minutes)</label>
                                    <input
                                        type="number"
                                        value={formData.wait_time || ''}
                                        onChange={(e) => setFormData({ ...formData, wait_time: parseInt(e.target.value) || null })}
                                        placeholder="Optional"
                                        min="0"
                                        max="180"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Rating *</label>
                                <div className="star-rating-input">
                                    {getStarButtons()}
                                    <span className="rating-value-text">
                                        {formData.rating === 1 ? 'Poor' :
                                            formData.rating === 2 ? 'Fair' :
                                                formData.rating === 3 ? 'Good' :
                                                    formData.rating === 4 ? 'Very Good' :
                                                        'Excellent'}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Review Title (Optional)</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📝</span>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Summarize your experience"
                                        maxLength="200"
                                        className={formErrors.title ? 'error' : ''}
                                    />
                                </div>
                                {formErrors.title && <span className="error-message">{formErrors.title}</span>}
                                <small className="form-hint">{formData.title.length}/200 characters</small>
                            </div>

                            <div className="form-group">
                                <label>Your Review *</label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    rows="6"
                                    placeholder="What did you like or dislike? Share details about the food, service, ambiance, etc."
                                    maxLength="2000"
                                    className={formErrors.comment ? 'error' : ''}
                                />
                                {formErrors.comment && <span className="error-message">{formErrors.comment}</span>}
                                <small className="form-hint">{formData.comment.length}/2000 characters</small>
                            </div>

                            {/* Tags Input */}
                            <div className="form-group">
                                <label>Tags (Optional)</label>
                                <div className="tags-input">
                                    {formData.tags.map((tag, idx) => (
                                        <span key={idx} className="tag-pill">
                                            #{tag}
                                            <button type="button" onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    tags: prev.tags.filter((_, i) => i !== idx)
                                                }));
                                            }}>×</button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Add tags (e.g., Food, Service, Ambiance)"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ',') {
                                                e.preventDefault();
                                                const tag = e.target.value.trim().replace(/,/g, '');
                                                if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        tags: [...prev.tags, tag]
                                                    }));
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                        list="suggested-tags"
                                    />
                                    <datalist id="suggested-tags">
                                        {suggestedTags.map(tag => (
                                            <option key={tag} value={tag} />
                                        ))}
                                    </datalist>
                                </div>
                                <small className="form-hint">Press Enter or comma to add tags (max 5)</small>
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label>Photos (Optional)</label>
                                <div className="image-upload-area">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="uploaded-image">
                                            <img src={img} alt={`Upload ${idx + 1}`} />
                                            <button type="button" onClick={() => removeImage(idx)} className="remove-image">×</button>
                                        </div>
                                    ))}
                                    {formData.images.length < 5 && (
                                        <label className="upload-label">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                style={{ display: 'none' }}
                                            />
                                            <div className="upload-placeholder">
                                                <span>📷</span>
                                                <span>Add Photos</span>
                                                <small>Up to 5 images</small>
                                                {uploadingImage && <div className="uploading-spinner"></div>}
                                            </div>
                                        </label>
                                    )}
                                </div>
                                {Object.keys(imageUploadProgress).length > 0 && (
                                    <div className="upload-progress">
                                        {Object.entries(imageUploadProgress).map(([id, progress]) => (
                                            <div key={id} className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <small className="form-hint">Upload up to 5 images (JPEG, PNG, WebP, max 5MB each)</small>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn" disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="submitting-spinner"></span>
                                            {editingReview ? 'Updating...' : 'Submitting...'}
                                        </>
                                    ) : (
                                        editingReview ? 'Update Review' : 'Submit Review'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon">⚠️</div>
                        <h3>Delete Review?</h3>
                        <p>This action cannot be undone. Your review will be permanently removed from our system.</p>
                        <div className="confirm-modal-actions">
                            <button onClick={() => setShowDeleteConfirm(null)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="delete-confirm-btn">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserReviews;
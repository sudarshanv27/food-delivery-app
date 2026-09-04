// src/components/common/RatingStars.js
import React, { useState, useEffect } from 'react';
import './RatingStars.css';

const RatingStars = ({
    rating = 0,
    totalStars = 5,
    size = 'medium',
    variant = 'default',
    readonly = false,
    interactive = true,
    showValue = true,
    showCount = false,
    count = 0,
    precision = 0.5,
    onChange,
    onHover,
    className = '',
    emptyColor = '#e0e0e0',
    filledColor = '#ffc107',
    halfColor = '#ffc107',
    starGap = 4,
    icon: CustomIcon,
    animate = true,
    disabled = false,
    required = false,
    name = 'rating',
    ariaLabel = 'Rating',
    tooltip = false,
    tooltipMessages = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    },
    celebration = false,
    onCelebrationComplete,
    resetOnClick = false,
    clearable = false,
    clearIcon = '✕'
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(rating);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setCurrentRating(rating);
    }, [rating]);

    useEffect(() => {
        if (celebration && showCelebration) {
            const timer = setTimeout(() => {
                setShowCelebration(false);
                onCelebrationComplete?.();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showCelebration, celebration, onCelebrationComplete]);

    const handleMouseMove = (event, index) => {
        if (readonly || !interactive || disabled) return;

        const starElement = event.currentTarget;
        const rect = starElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const starWidth = rect.width;
        const isHalf = mouseX < starWidth / 2;

        let newRating = index + 1;
        if (precision === 0.5 && isHalf) {
            newRating = index + 0.5;
        }

        setHoverRating(newRating);
        onHover?.(newRating);
    };

    const handleMouseLeave = () => {
        if (readonly || !interactive || disabled) return;
        setHoverRating(0);
        onHover?.(0);
    };

    const handleClick = (event, index) => {
        if (readonly || !interactive || disabled) return;

        const starElement = event.currentTarget;
        const rect = starElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const starWidth = rect.width;
        const isHalf = mouseX < starWidth / 2;

        let newRating = index + 1;
        if (precision === 0.5 && isHalf) {
            newRating = index + 0.5;
        }

        // Handle clearable
        if (clearable && newRating === currentRating) {
            newRating = 0;
        }

        // Handle reset on click
        if (resetOnClick && newRating === currentRating) {
            newRating = 0;
        }

        setCurrentRating(newRating);
        setTouched(true);
        onChange?.(newRating);

        // Trigger celebration animation on perfect score
        if (celebration && newRating === totalStars) {
            setShowCelebration(true);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);
        } else if (animate) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setCurrentRating(0);
        onChange?.(0);
    };

    const displayRating = hoverRating || currentRating || rating;
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = precision === 0.5 && displayRating % 1 !== 0;
    const emptyStars = totalStars - Math.ceil(displayRating);

    const getTooltipText = (index) => {
        const ratingValue = index + 1;
        return tooltipMessages[ratingValue] || `${ratingValue} stars`;
    };

    const StarIcon = ({ filled, half, index, isHovered }) => {
        if (CustomIcon) {
            return (
                <CustomIcon
                    filled={filled}
                    half={half}
                    color={filled ? filledColor : emptyColor}
                    size={size}
                    isHovered={isHovered}
                />
            );
        }

        // Text-based stars (simple version)
        if (variant === 'text') {
            return (
                <span className={`star-text ${filled ? 'filled' : 'empty'} ${isAnimating ? 'animate' : ''}`}>
                    {filled ? '★' : '☆'}
                </span>
            );
        }

        // SVG stars (default)
        if (half) {
            return (
                <svg
                    className={`star-icon half-star ${isAnimating ? 'animate' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                >
                    <defs>
                        <linearGradient id={`halfGradient-${index}`}>
                            <stop offset="50%" stopColor={filledColor} />
                            <stop offset="50%" stopColor={emptyColor} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        fill={`url(#halfGradient-${index})`}
                        stroke="none"
                    />
                </svg>
            );
        }

        return (
            <svg
                className={`star-icon ${filled ? 'filled' : 'empty'} ${isAnimating ? 'animate' : ''} ${isHovered ? 'hovered' : ''}`}
                viewBox="0 0 24 24"
                fill={filled ? filledColor : emptyColor}
                stroke="none"
            >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        );
    };

    return (
        <div
            className={`rating-stars rating-stars-${size} rating-stars-${variant} ${disabled ? 'disabled' : ''} ${className}`}
            role="group"
            aria-label={ariaLabel}
        >
            <div
                className="stars-container"
                style={{ gap: `${starGap}px` }}
            >
                {/* Full Stars */}
                {[...Array(fullStars)].map((_, i) => (
                    <div
                        key={`full-${i}`}
                        className={`star-wrapper ${tooltip ? 'has-tooltip' : ''}`}
                        onMouseMove={(e) => handleMouseMove(e, i)}
                        onClick={(e) => handleClick(e, i)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <StarIcon filled={true} half={false} index={i} isHovered={hoverRating > i} />
                        {tooltip && (
                            <span className="star-tooltip">{getTooltipText(i)}</span>
                        )}
                    </div>
                ))}

                {/* Half Star */}
                {hasHalfStar && (
                    <div
                        key="half"
                        className={`star-wrapper ${tooltip ? 'has-tooltip' : ''}`}
                        onMouseMove={(e) => handleMouseMove(e, fullStars)}
                        onClick={(e) => handleClick(e, fullStars)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <StarIcon filled={false} half={true} index={fullStars} isHovered={hoverRating > fullStars} />
                        {tooltip && (
                            <span className="star-tooltip">{getTooltipText(fullStars)}</span>
                        )}
                    </div>
                )}

                {/* Empty Stars */}
                {[...Array(emptyStars)].map((_, i) => {
                    const starIndex = fullStars + (hasHalfStar ? 1 : 0) + i;
                    return (
                        <div
                            key={`empty-${i}`}
                            className={`star-wrapper ${tooltip ? 'has-tooltip' : ''}`}
                            onMouseMove={(e) => handleMouseMove(e, starIndex)}
                            onClick={(e) => handleClick(e, starIndex)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <StarIcon filled={false} half={false} index={starIndex} isHovered={hoverRating > starIndex} />
                            {tooltip && (
                                <span className="star-tooltip">{getTooltipText(starIndex)}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Clear Button */}
            {clearable && currentRating > 0 && !readonly && !disabled && (
                <button
                    className="rating-clear-btn"
                    onClick={handleClear}
                    aria-label="Clear rating"
                >
                    {clearIcon}
                </button>
            )}

            {/* Rating Info */}
            {(showValue || showCount) && (
                <div className="rating-info">
                    {showValue && (
                        <span className="rating-value">
                            {displayRating.toFixed(1)}
                            {totalStars === 5 && (
                                <span className="rating-max">/{totalStars}</span>
                            )}
                        </span>
                    )}
                    {showCount && count > 0 && (
                        <span className="rating-count">
                            ({count.toLocaleString()} {count === 1 ? 'review' : 'reviews'})
                        </span>
                    )}
                </div>
            )}

            {/* Required Indicator */}
            {required && !touched && !currentRating && !readonly && (
                <span className="rating-required">*</span>
            )}

            {/* Celebration Animation */}
            {celebration && showCelebration && (
                <div className="rating-celebration">
                    <div className="confetti">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="confetti-piece"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 1000}ms`,
                                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`
                                }}
                            />
                        ))}
                    </div>
                    <div className="celebration-message">
                        🎉 Perfect Rating! 🎉
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Rating Component (for backward compatibility)
export const SimpleRatingStars = ({ rating, size = 'medium', readonly = false, onRatingChange }) => {
    return (
        <RatingStars
            rating={rating}
            size={size}
            readonly={readonly}
            interactive={!readonly}
            showValue={false}
            variant="text"
            onChange={onRatingChange}
        />
    );
};

// Static Rating Component (no interaction)
export const StaticRating = ({
    rating,
    totalStars = 5,
    size = 'medium',
    showCount = false,
    count = 0,
    showTooltip = false
}) => {
    return (
        <RatingStars
            rating={rating}
            totalStars={totalStars}
            size={size}
            readonly={true}
            interactive={false}
            showValue={true}
            showCount={showCount}
            count={count}
            tooltip={showTooltip}
        />
    );
};

// Interactive Rating Component (for forms)
export const InteractiveRating = ({
    value = 0,
    onChange,
    totalStars = 5,
    size = 'large',
    label = 'Your Rating',
    required = false,
    error = '',
    helperText = '',
    clearable = true
}) => {
    return (
        <div className="interactive-rating">
            {label && (
                <label className="rating-label">
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}
            <RatingStars
                rating={value}
                totalStars={totalStars}
                size={size}
                readonly={false}
                interactive={true}
                precision={0.5}
                onChange={onChange}
                showValue={true}
                clearable={clearable}
                required={required}
                celebration={value === totalStars}
                tooltip={true}
            />
            {error && <div className="rating-error">{error}</div>}
            {helperText && !error && <div className="rating-helper">{helperText}</div>}
        </div>
    );
};

// Average Rating Component (for restaurant/product cards)
export const AverageRating = ({
    rating,
    totalReviews,
    size = 'medium',
    showDistribution = false,
    distribution = {}
}) => {
    const percentage = (rating / 5) * 100;

    return (
        <div className="average-rating">
            <div className="average-rating-main">
                <div className="average-score">
                    <span className="score-value">{rating.toFixed(1)}</span>
                    <span className="score-max">/5</span>
                </div>
                <RatingStars
                    rating={rating}
                    size={size}
                    readonly={true}
                    interactive={false}
                    showValue={false}
                    showCount={false}
                />
                <div className="total-reviews">
                    {totalReviews.toLocaleString()} reviews
                </div>
            </div>

            {showDistribution && totalReviews > 0 && (
                <div className="rating-distribution">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = distribution[star] || 0;
                        const percent = (count / totalReviews) * 100;
                        return (
                            <div key={star} className="distribution-row">
                                <span className="distribution-star">{star} ★</span>
                                <div className="distribution-bar">
                                    <div
                                        className="distribution-fill"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="distribution-count">{count}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Review Summary Component
export const ReviewSummary = ({
    rating,
    totalReviews,
    distribution,
    showPercentages = true
}) => {
    const getStarPercentage = (star) => {
        if (!distribution[star] || totalReviews === 0) return 0;
        return (distribution[star] / totalReviews) * 100;
    };

    return (
        <div className="review-summary">
            <div className="summary-header">
                <div className="summary-score">
                    <span className="summary-rating">{rating.toFixed(1)}</span>
                    <span className="summary-out-of">out of 5</span>
                </div>
                <RatingStars rating={rating} size="large" readonly showValue={false} />
                <div className="summary-total">
                    {totalReviews.toLocaleString()} customer reviews
                </div>
            </div>
            <div className="summary-distribution">
                {[5, 4, 3, 2, 1].map(star => {
                    const percent = getStarPercentage(star);
                    return (
                        <div key={star} className="summary-row">
                            <div className="summary-star-label">{star} star</div>
                            <div className="summary-bar-container">
                                <div
                                    className="summary-bar"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {showPercentages && (
                                <div className="summary-percentage">{percent.toFixed(0)}%</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Star Progress Component
export const StarProgress = ({ rating, maxRating = 5, showLabel = true }) => {
    const percentage = (rating / maxRating) * 100;

    return (
        <div className="star-progress">
            <div className="star-progress-label">
                {showLabel && <span>Rating</span>}
                <span className="star-progress-value">{rating.toFixed(1)}</span>
            </div>
            <div className="star-progress-bar">
                <div
                    className="star-progress-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// Default export for backward compatibility
export default RatingStars;
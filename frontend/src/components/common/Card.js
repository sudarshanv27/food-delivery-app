import React, { useState } from 'react';
import './Card.css';

const Card = ({
    children,
    title,
    subtitle,
    image,
    imagePosition = 'top',
    imageAlt = 'Card image',
    actions,
    footer,
    loading = false,
    hoverable = true,
    clickable = false,
    onClick,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    imageClassName = '',
    elevation = 'medium',
    bordered = false,
    selected = false,
    onSelect,
    selectable = false,
    closable = false,
    onClose,
    expandable = false,
    defaultExpanded = false,
    badge = null,
    badgeVariant = 'primary',
    badgePosition = 'top-right',
    headerAction = null,
    cover = null,
    coverHeight = '200px',
    coverOverlay = null,
    progress = null,
    progressVariant = 'primary',
    progressValue = 0,
    progressMax = 100,
    ...restProps
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isHovered, setIsHovered] = useState(false);

    const cardClasses = [
        'card',
        `card-elevation-${elevation}`,
        hoverable && 'card-hoverable',
        clickable && 'card-clickable',
        bordered && 'card-bordered',
        selected && 'card-selected',
        selectable && 'card-selectable',
        isExpanded && 'card-expanded',
        className
    ].filter(Boolean).join(' ');

    const handleClick = () => {
        if (clickable && onClick) {
            onClick();
        }
    };

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelect?.(!selected);
    };

    const handleClose = (e) => {
        e.stopPropagation();
        onClose?.();
    };

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const renderCover = () => {
        if (!cover) return null;

        return (
            <div
                className="card-cover"
                style={{ height: coverHeight }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img src={cover} alt={imageAlt} loading="lazy" />
                {coverOverlay && (
                    <div className={`card-cover-overlay ${isHovered ? 'visible' : ''}`}>
                        {coverOverlay}
                    </div>
                )}
            </div>
        );
    };

    const renderImage = () => {
        if (!image) return null;

        return (
            <div className={`card-image card-image-${imagePosition} ${imageClassName}`}>
                <img src={image} alt={imageAlt} loading="lazy" />
            </div>
        );
    };

    const renderBadge = () => {
        if (!badge) return null;

        return (
            <div className={`card-badge card-badge-${badgeVariant} card-badge-${badgePosition}`}>
                {badge}
            </div>
        );
    };

    const renderHeader = () => {
        if (!title && !subtitle && !headerAction) return null;

        return (
            <div className={`card-header ${headerClassName}`}>
                <div className="card-header-content">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
                {headerAction && (
                    <div className="card-header-action">
                        {headerAction}
                    </div>
                )}
            </div>
        );
    };

    const renderProgress = () => {
        if (!progress && progressValue === 0) return null;

        const percentage = (progressValue / progressMax) * 100;

        return (
            <div className={`card-progress card-progress-${progressVariant}`}>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {progress && <span className="progress-label">{progress}</span>}
            </div>
        );
    };

    const renderSelectCheckbox = () => {
        if (!selectable) return null;

        return (
            <div className="card-select-checkbox" onClick={handleSelect}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => { }}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        );
    };

    const renderCloseButton = () => {
        if (!closable) return null;

        return (
            <button className="card-close-btn" onClick={handleClose} aria-label="Close">
                ✕
            </button>
        );
    };

    const renderExpandButton = () => {
        if (!expandable) return null;

        return (
            <button className="card-expand-btn" onClick={handleExpand}>
                {isExpanded ? '▲' : '▼'}
            </button>
        );
    };

    const renderActions = () => {
        if (!actions) return null;

        return (
            <div className="card-actions">
                {actions}
            </div>
        );
    };

    const renderFooter = () => {
        if (!footer) return null;

        return (
            <div className={`card-footer ${footerClassName}`}>
                {footer}
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`card card-loading ${className}`} {...restProps}>
                <div className="card-skeleton">
                    {image && <div className="skeleton-image skeleton-shimmer"></div>}
                    <div className="skeleton-content">
                        <div className="skeleton-title skeleton-shimmer"></div>
                        <div className="skeleton-text skeleton-shimmer"></div>
                        <div className="skeleton-text short skeleton-shimmer"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cardClasses}
            onClick={handleClick}
            role={clickable ? 'button' : 'article'}
            tabIndex={clickable ? 0 : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...restProps}
        >
            {renderSelectCheckbox()}
            {renderCloseButton()}
            {renderExpandButton()}
            {renderBadge()}

            {cover && imagePosition === 'cover' && renderCover()}
            {image && imagePosition === 'top' && renderImage()}

            {renderHeader()}
            {renderProgress()}

            <div className={`card-body ${bodyClassName}`}>
                {children}
            </div>

            {image && imagePosition === 'bottom' && renderImage()}
            {cover && imagePosition === 'cover-bottom' && renderCover()}

            {renderActions()}
            {renderFooter()}

            {expandable && isExpanded && (
                <div className="card-expanded-content">
                    {expandable === true ? children : expandable}
                </div>
            )}
        </div>
    );
};

// Card Grid Component (Enhanced)
export const CardGrid = ({
    children,
    columns = 3,
    gap = 'medium',
    responsive = true,
    className = ''
}) => {
    const gridClasses = [
        'card-grid',
        `card-grid-columns-${columns}`,
        `card-grid-gap-${gap}`,
        responsive && 'card-grid-responsive',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={gridClasses}>
            {children}
        </div>
    );
};

// Card Stats Component (Enhanced)
export const CardStats = ({
    stats = [],
    className = '',
    columns = 3,
    showTrend = true
}) => {
    return (
        <div className={`card-stats-grid card-stats-grid-${columns} ${className}`}>
            {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                    <div className="stat-icon" style={{ background: stat.iconBg || '#f0f0f0' }}>
                        {stat.icon}
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {stat.prefix}{stat.value}{stat.suffix}
                        </div>
                        <div className="stat-label">{stat.label}</div>
                        {showTrend && stat.trend !== undefined && (
                            <div className={`stat-trend ${stat.trend > 0 ? 'positive' : 'negative'}`}>
                                <span className="trend-icon">{stat.trend > 0 ? '↑' : '↓'}</span>
                                <span className="trend-value">{Math.abs(stat.trend)}%</span>
                                <span className="trend-label">vs last period</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Card Media Component (Enhanced)
export const CardMedia = ({
    src,
    alt,
    height = '200px',
    overlay,
    overlayContent,
    playable = false,
    onPlay,
    className = ''
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
        onPlay?.();
    };

    return (
        <div className={`card-media ${className}`} style={{ height }}>
            <img src={src} alt={alt} loading="lazy" />
            {overlay && <div className="card-media-overlay">{overlay}</div>}
            {overlayContent && (
                <div className="card-media-content">{overlayContent}</div>
            )}
            {playable && !isPlaying && (
                <button className="card-media-play" onClick={handlePlay}>
                    ▶
                </button>
            )}
            {isPlaying && (
                <div className="card-media-playing">
                    <div className="playing-animation">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Card Badge Component (Enhanced)
export const CardBadge = ({
    text,
    variant = 'primary',
    position = 'top-right',
    icon = null,
    removable = false,
    onRemove,
    className = ''
}) => {
    const badgeClasses = [
        'card-badge',
        `card-badge-${variant}`,
        `card-badge-${position}`,
        removable && 'card-badge-removable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={badgeClasses}>
            {icon && <span className="badge-icon">{icon}</span>}
            <span className="badge-text">{text}</span>
            {removable && (
                <button className="badge-remove" onClick={onRemove}>×</button>
            )}
        </div>
    );
};

// Horizontal Card Component
export const HorizontalCard = ({
    image,
    title,
    subtitle,
    description,
    actions,
    imagePosition = 'left',
    ...props
}) => {
    return (
        <Card
            {...props}
            image={image}
            imagePosition={imagePosition}
            className="card-horizontal"
        >
            <div className="horizontal-card-content">
                <h3 className="card-title">{title}</h3>
                {subtitle && <p className="card-subtitle">{subtitle}</p>}
                {description && <p className="card-description">{description}</p>}
                {actions && <div className="card-actions">{actions}</div>}
            </div>
        </Card>
    );
};

// Product Card Component
export const ProductCard = ({
    image,
    title,
    price,
    originalPrice,
    rating,
    reviews,
    badge,
    onAddToCart,
    onWishlist,
    ...props
}) => {
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return (
        <Card image={image} imagePosition="top" hoverable {...props}>
            {badge && <CardBadge text={badge} variant="primary" position="top-left" />}
            {discount > 0 && (
                <CardBadge text={`${discount}% OFF`} variant="danger" position="top-right" />
            )}
            <div className="product-card-content">
                <h3 className="product-title">{title}</h3>
                <div className="product-rating">
                    <span className="rating-stars">⭐</span>
                    <span className="rating-value">{rating}</span>
                    {reviews && <span className="rating-reviews">({reviews})</span>}
                </div>
                <div className="product-price">
                    <span className="current-price">₹{price}</span>
                    {originalPrice && (
                        <span className="original-price">₹{originalPrice}</span>
                    )}
                </div>
                <div className="product-actions">
                    <button className="add-to-cart-btn" onClick={onAddToCart}>
                        Add to Cart
                    </button>
                    <button className="wishlist-btn" onClick={onWishlist}>
                        ♡
                    </button>
                </div>
            </div>
        </Card>
    );
};

// Profile Card Component
export const ProfileCard = ({
    avatar,
    name,
    role,
    location,
    stats,
    socialLinks,
    onFollow,
    isFollowing,
    ...props
}) => {
    return (
        <Card className="profile-card" textAlign="center" {...props}>
            <div className="profile-avatar">
                <img src={avatar} alt={name} />
                <div className="profile-status online"></div>
            </div>
            <h3 className="profile-name">{name}</h3>
            <p className="profile-role">{role}</p>
            {location && (
                <p className="profile-location">📍 {location}</p>
            )}
            {stats && (
                <div className="profile-stats">
                    {stats.map((stat, index) => (
                        <div key={index} className="profile-stat">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}
            <div className="profile-actions">
                <button
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={onFollow}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>
            {socialLinks && (
                <div className="profile-social">
                    {socialLinks.map((link, index) => (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.icon}
                        </a>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default Card;
import React from 'react';
import './Loader.css';

const Loader = ({
    size = 'medium',
    variant = 'spinner',
    text = '',
    fullScreen = false,
    overlay = false,
    color = 'primary',
    className = '',
    speed = 'normal',
    centered = true,
    backdrop = false,
    backdropOpacity = 0.5,
    progress = null,
    progressMax = 100,
    minHeight = '200px',
    id
}) => {
    const loaderClasses = [
        'loader',
        `loader-${variant}`,
        `loader-${size}`,
        `loader-color-${color}`,
        `loader-speed-${speed}`,
        fullScreen ? 'loader-fullscreen' : '',
        overlay ? 'loader-overlay' : '',
        centered ? 'loader-centered' : '',
        backdrop ? 'loader-backdrop' : '',
        className
    ].filter(Boolean).join(' ');

    const renderLoader = () => {
        switch (variant) {
            case 'spinner':
                return (
                    <div className="loader-spinner">
                        <svg className="spinner-svg" viewBox="0 0 50 50">
                            <circle
                                className="spinner-circle"
                                cx="25"
                                cy="25"
                                r="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                );

            case 'dots':
                return (
                    <div className="loader-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                );

            case 'pulse':
                return (
                    <div className="loader-pulse">
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring"></div>
                    </div>
                );

            case 'wave':
                return (
                    <div className="loader-wave">
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                        <div className="wave-bar"></div>
                    </div>
                );

            case 'skeleton':
                return (
                    <div className="loader-skeleton">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                );

            case 'bounce':
                return (
                    <div className="loader-bounce">
                        <div className="bounce-ball"></div>
                        <div className="bounce-ball"></div>
                        <div className="bounce-ball"></div>
                    </div>
                );

            case 'ripple':
                return (
                    <div className="loader-ripple">
                        <div className="ripple-circle"></div>
                        <div className="ripple-circle"></div>
                    </div>
                );

            case 'clock':
                return (
                    <div className="loader-clock">
                        <svg viewBox="0 0 50 50">
                            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
                            <line x1="25" y1="25" x2="25" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            <line x1="25" y1="25" x2="35" y2="25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                );

            case 'bars':
                return (
                    <div className="loader-bars">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                );

            case 'circular':
                return (
                    <div className="loader-circular">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="70 200" strokeLinecap="round" />
                        </svg>
                    </div>
                );

            default:
                return (
                    <div className="loader-spinner">
                        <div className="spinner-circle"></div>
                    </div>
                );
        }
    };

    return (
        <div
            className={loaderClasses}
            style={{
                '--loader-backdrop-opacity': backdropOpacity,
                '--loader-min-height': minHeight
            }}
            role="status"
            aria-live="polite"
            aria-busy="true"
            id={id}
        >
            <div className="loader-content">
                {renderLoader()}
                {text && <p className="loader-text">{text}</p>}
                {progress !== null && (
                    <div className="loader-progress-container">
                        <div className="loader-progress-bar">
                            <div
                                className="loader-progress-fill"
                                style={{ width: `${(progress / progressMax) * 100}%` }}
                            />
                        </div>
                        <span className="loader-progress-text">
                            {Math.round((progress / progressMax) * 100)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Button Loader Component (Enhanced)
export const ButtonLoader = ({ size = 'small', color = 'white', variant = 'spinner' }) => {
    return (
        <span className={`button-loader button-loader-${size} button-loader-${color} button-loader-${variant}`}>
            <span className="button-loader-spinner"></span>
        </span>
    );
};

// Page Loader Component (Enhanced)
export const PageLoader = ({ text = 'Loading...', logo = '🍔', variant = 'spinner' }) => {
    return (
        <div className="page-loader">
            <div className="page-loader-content">
                <div className="page-loader-logo">
                    <span className="logo-icon">{logo}</span>
                </div>
                <Loader size="large" variant={variant} />
                <p className="page-loader-text">{text}</p>
            </div>
        </div>
    );
};

// Skeleton Loader for Cards (Enhanced)
export const CardSkeleton = ({ count = 1, columns = 3, variant = 'default', hasImage = true, hasActions = false }) => {
    const skeletons = Array(count).fill(null);

    return (
        <div className={`skeleton-grid skeleton-grid-${columns} skeleton-card-${variant}`}>
            {skeletons.map((_, index) => (
                <div key={index} className="skeleton-card">
                    {hasImage && <div className="skeleton-card-image shimmer"></div>}
                    <div className="skeleton-card-content">
                        <div className="skeleton-card-title shimmer"></div>
                        <div className="skeleton-card-text shimmer"></div>
                        <div className="skeleton-card-text short shimmer"></div>
                        <div className="skeleton-card-price shimmer"></div>
                        {hasActions && (
                            <div className="skeleton-card-actions">
                                <div className="skeleton-button shimmer"></div>
                                <div className="skeleton-button shimmer"></div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Skeleton Loader for Table (Enhanced)
export const TableSkeleton = ({ rows = 5, columns = 4, hasHeader = true }) => {
    return (
        <div className="skeleton-table">
            {hasHeader && (
                <div className="skeleton-table-header">
                    {Array(columns).fill(null).map((_, index) => (
                        <div key={index} className="skeleton-table-cell shimmer"></div>
                    ))}
                </div>
            )}
            {Array(rows).fill(null).map((_, rowIndex) => (
                <div key={rowIndex} className="skeleton-table-row">
                    {Array(columns).fill(null).map((_, colIndex) => (
                        <div key={colIndex} className="skeleton-table-cell shimmer"></div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// Skeleton Loader for List Items
export const ListSkeleton = ({ count = 5, hasAvatar = true, hasActions = false }) => {
    return (
        <div className="skeleton-list">
            {Array(count).fill(null).map((_, index) => (
                <div key={index} className="skeleton-list-item">
                    {hasAvatar && <div className="skeleton-avatar shimmer"></div>}
                    <div className="skeleton-list-content">
                        <div className="skeleton-list-title shimmer"></div>
                        <div className="skeleton-list-subtitle shimmer"></div>
                    </div>
                    {hasActions && <div className="skeleton-list-action shimmer"></div>}
                </div>
            ))}
        </div>
    );
};

// Skeleton Loader for Profile
export const ProfileSkeleton = () => {
    return (
        <div className="skeleton-profile">
            <div className="skeleton-profile-avatar shimmer"></div>
            <div className="skeleton-profile-info">
                <div className="skeleton-profile-name shimmer"></div>
                <div className="skeleton-profile-email shimmer"></div>
            </div>
            <div className="skeleton-profile-stats">
                <div className="skeleton-stat shimmer"></div>
                <div className="skeleton-stat shimmer"></div>
                <div className="skeleton-stat shimmer"></div>
            </div>
        </div>
    );
};

// Skeleton Loader for Dashboard Widget
export const DashboardSkeleton = () => {
    return (
        <div className="skeleton-dashboard">
            <div className="skeleton-dashboard-header">
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-subtitle shimmer"></div>
            </div>
            <div className="skeleton-dashboard-stats">
                <div className="skeleton-stat-card shimmer"></div>
                <div className="skeleton-stat-card shimmer"></div>
                <div className="skeleton-stat-card shimmer"></div>
                <div className="skeleton-stat-card shimmer"></div>
            </div>
            <div className="skeleton-dashboard-chart">
                <div className="skeleton-chart shimmer"></div>
            </div>
        </div>
    );
};

// Progressive Image Loader
export const ProgressiveImageLoader = ({ src, alt, placeholder, className, onLoad }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    return (
        <div className={`progressive-image ${className}`}>
            {!isLoaded && (
                <div className="progressive-image-placeholder">
                    {placeholder || <Loader size="small" variant="pulse" />}
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`progressive-image-img ${isLoaded ? 'loaded' : ''}`}
                onLoad={() => {
                    setIsLoaded(true);
                    onLoad?.();
                }}
            />
        </div>
    );
};

// Lazy Load Component
export const LazyLoad = ({ children, height = '200px', loader }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ minHeight: height }}>
            {isVisible ? children : (loader || <Loader size="medium" variant="spinner" />)}
        </div>
    );
};

export default Loader;
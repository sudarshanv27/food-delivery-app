import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ImageSlider.css';

const ImageSlider = ({
    images = [],
    autoPlay = true,
    autoPlayInterval = 3000,
    showArrows = true,
    showDots = true,
    showThumbnails = false,
    infinite = true,
    pauseOnHover = true,
    swipeToSlide = true,
    zoomOnClick = false,
    effect = 'slide', // slide, fade, zoom, flip, rotate
    transitionSpeed = 500,
    height = '400px',
    width = '100%',
    onImageChange,
    onImageClick,
    className = '',
    prevIcon = '‹',
    nextIcon = '›',
    loadingComponent,
    fallbackImage = '/placeholder-image.jpg',
    showCaption = false,
    showCounter = true,
    showPlayPause = true,
    dragToSlide = true,
    keyboardNavigation = true,
    lazyLoad = true,
    preloadCount = 3,
    onSliderReady,
    customControls = null,
    effectTiming = 'ease-in-out'
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isHovered, setIsHovered] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [loadedImages, setLoadedImages] = useState({});
    const [zoom, setZoom] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [imageError, setImageError] = useState({});
    const [direction, setDirection] = useState('next');

    const sliderRef = useRef(null);
    const autoPlayTimerRef = useRef(null);
    const transitionTimerRef = useRef(null);

    // Auto play functionality
    useEffect(() => {
        if (!autoPlay || !isPlaying || isHovered || !images.length) return;

        autoPlayTimerRef.current = setInterval(() => {
            nextSlide();
        }, autoPlayInterval);

        return () => {
            if (autoPlayTimerRef.current) {
                clearInterval(autoPlayTimerRef.current);
            }
        };
    }, [autoPlay, isPlaying, isHovered, currentIndex, images.length]);

    // Keyboard navigation
    useEffect(() => {
        if (!keyboardNavigation || !images.length) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            } else if (e.key === ' ') {
                setIsPlaying(!isPlaying);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keyboardNavigation, images.length, isPlaying]);

    // Preload images
    useEffect(() => {
        if (!lazyLoad) return;

        const preloadImages = () => {
            const start = Math.max(0, currentIndex - preloadCount);
            const end = Math.min(images.length, currentIndex + preloadCount + 1);

            for (let i = start; i < end; i++) {
                if (!loadedImages[i]) {
                    const img = new Image();
                    img.src = getImageUrl(i);
                    img.onload = () => {
                        setLoadedImages(prev => ({ ...prev, [i]: true }));
                    };
                    img.onerror = () => {
                        setImageError(prev => ({ ...prev, [i]: true }));
                    };
                }
            }
        };

        preloadImages();
    }, [currentIndex, images, lazyLoad, preloadCount]);

    // Notify when slider is ready
    useEffect(() => {
        if (sliderRef.current && onSliderReady) {
            onSliderReady(sliderRef.current);
        }
    }, []);

    const getImageUrl = (index) => {
        const image = images[index];
        return image?.url || image;
    };

    const getImageCaption = (index) => {
        const image = images[index];
        return image?.caption || image?.alt || '';
    };

    const goToSlide = useCallback((index, direction = 'next') => {
        if (isTransitioning || !images.length) return;

        let newIndex = index;
        if (infinite) {
            if (newIndex < 0) newIndex = images.length - 1;
            if (newIndex >= images.length) newIndex = 0;
        } else {
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= images.length) newIndex = images.length - 1;
        }

        if (newIndex !== currentIndex) {
            setDirection(direction);
            setIsTransitioning(true);
            setCurrentIndex(newIndex);
            onImageChange?.(newIndex, images[newIndex]);

            if (transitionTimerRef.current) {
                clearTimeout(transitionTimerRef.current);
            }
            transitionTimerRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, transitionSpeed);
        }
    }, [currentIndex, images.length, infinite, isTransitioning, transitionSpeed, onImageChange]);

    const nextSlide = useCallback(() => {
        goToSlide(currentIndex + 1, 'next');
    }, [currentIndex, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide(currentIndex - 1, 'prev');
    }, [currentIndex, goToSlide]);

    const handleTouchStart = (e) => {
        if (!swipeToSlide) return;
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (!swipeToSlide) return;
        setTouchEnd(e.touches[0].clientX);
        setDragOffset(e.touches[0].clientX - touchStart);
    };

    const handleTouchEnd = () => {
        if (!swipeToSlide || !touchStart || !touchEnd) return;

        const difference = touchStart - touchEnd;
        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        setTouchStart(0);
        setTouchEnd(0);
        setDragOffset(0);
    };

    const handleMouseDown = (e) => {
        if (!dragToSlide) return;
        setIsDragging(true);
        setDragStart(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !dragToSlide) return;
        const dragDistance = e.clientX - dragStart;
        setDragOffset(dragDistance);
    };

    const handleMouseUp = () => {
        if (!isDragging || !dragToSlide) return;

        if (Math.abs(dragOffset) > 50) {
            if (dragOffset > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        setIsDragging(false);
        setDragOffset(0);
        setDragStart(0);
    };

    const handleImageClick = (e) => {
        if (zoomOnClick) {
            if (zoom) {
                setZoom(false);
            } else {
                const rect = e.target.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPosition({ x, y });
                setZoom(true);
            }
        }
        onImageClick?.(currentIndex, images[currentIndex]);
    };

    const getSlideStyle = () => {
        if (effect === 'slide') {
            return {
                transform: `translateX(${dragOffset - (isTransitioning ? 0 : currentIndex * 100)}%)`,
                transition: isTransitioning ? `transform ${transitionSpeed}ms ${effectTiming}` : 'none'
            };
        }
        return {};
    };

    const getImageStyle = () => {
        if (effect === 'zoom') {
            return {
                transform: `scale(${isTransitioning ? 1.1 : 1})`,
                transition: `transform ${transitionSpeed}ms ${effectTiming}`
            };
        }
        if (effect === 'flip') {
            return {
                transform: `rotateY(${direction === 'next' ? 180 : -180}deg)`,
                transition: `transform ${transitionSpeed}ms ${effectTiming}`
            };
        }
        if (effect === 'rotate') {
            return {
                transform: `rotate(${direction === 'next' ? 360 : -360}deg)`,
                transition: `transform ${transitionSpeed}ms ${effectTiming}`
            };
        }
        return {};
    };

    if (!images.length) {
        return (
            <div className="image-slider-empty">
                {loadingComponent || <div className="no-images">
                    <svg viewBox="0 0 24 24" width="48" height="48">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 8h-4v4h-4v-4H6V9h4V5h4v4h4v2z" fill="currentColor" />
                    </svg>
                    <p>No images to display</p>
                </div>}
            </div>
        );
    }

    const currentImageUrl = getImageUrl(currentIndex);
    const currentCaption = getImageCaption(currentIndex);
    const showNavigation = images.length > 1;

    return (
        <div
            ref={sliderRef}
            className={`image-slider image-slider-effect-${effect} ${className} ${isDragging ? 'dragging' : ''}`}
            style={{ width, height }}
            onMouseEnter={() => pauseOnHover && setIsHovered(true)}
            onMouseLeave={() => pauseOnHover && setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div className="slider-container" style={{ height }}>
                {/* Slide Wrapper */}
                <div className="slider-wrapper" style={getSlideStyle()}>
                    {effect === 'slide' && infinite && (
                        <div className="slide clone-slide">
                            <img src={getImageUrl(images.length - 1)} alt="Clone" />
                        </div>
                    )}

                    {images.map((_, index) => (
                        <div key={index} className={`slide ${index === currentIndex ? 'active' : ''}`}>
                            <div className="slide-image-container">
                                {(!loadedImages[index] && lazyLoad) && (
                                    <div className="image-loader">
                                        <div className="loading-spinner"></div>
                                    </div>
                                )}
                                <img
                                    src={getImageUrl(index)}
                                    alt={getImageCaption(index)}
                                    className={`slide-image ${zoom && index === currentIndex ? 'zoomed' : ''}`}
                                    style={index === currentIndex ? getImageStyle() : {}}
                                    onClick={handleImageClick}
                                    onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))}
                                    onError={(e) => {
                                        e.target.src = fallbackImage;
                                        setImageError(prev => ({ ...prev, [index]: true }));
                                    }}
                                    loading={lazyLoad && index !== currentIndex ? 'lazy' : 'eager'}
                                />
                            </div>
                            {showCaption && index === currentIndex && currentCaption && (
                                <div className="slide-caption">
                                    <p>{currentCaption}</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {effect === 'slide' && infinite && (
                        <div className="slide clone-slide">
                            <img src={getImageUrl(0)} alt="Clone" />
                        </div>
                    )}
                </div>

                {/* Zoom Overlay */}
                {zoom && (
                    <div className="zoom-overlay" onClick={() => setZoom(false)}>
                        <div
                            className="zoomed-image"
                            style={{
                                backgroundImage: `url(${currentImageUrl})`,
                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                backgroundSize: '200%'
                            }}
                        />
                        <button className="zoom-close">✕</button>
                    </div>
                )}

                {/* Navigation Arrows */}
                {showArrows && showNavigation && (
                    <>
                        <button
                            className={`slider-arrow prev-arrow ${(!infinite && currentIndex === 0) ? 'disabled' : ''}`}
                            onClick={prevSlide}
                            disabled={!infinite && currentIndex === 0}
                            aria-label="Previous slide"
                        >
                            {prevIcon}
                        </button>
                        <button
                            className={`slider-arrow next-arrow ${(!infinite && currentIndex === images.length - 1) ? 'disabled' : ''}`}
                            onClick={nextSlide}
                            disabled={!infinite && currentIndex === images.length - 1}
                            aria-label="Next slide"
                        >
                            {nextIcon}
                        </button>
                    </>
                )}

                {/* Dots Navigation */}
                {showDots && showNavigation && (
                    <div className="slider-dots">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                <span className="dot-inner"></span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {showThumbnails && showNavigation && (
                <div className="slider-thumbnails">
                    <button className="thumbnail-prev" onClick={prevSlide}>‹</button>
                    <div className="thumbnails-wrapper">
                        <div className="thumbnails-track" style={{ transform: `translateX(-${currentIndex * 80}px)` }}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                                    onClick={() => goToSlide(index)}
                                >
                                    <img
                                        src={image.thumbnail || getImageUrl(index)}
                                        alt={`Thumbnail ${index + 1}`}
                                        onError={(e) => { e.target.src = fallbackImage; }}
                                    />
                                    {index === currentIndex && <div className="thumbnail-active-indicator"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="thumbnail-next" onClick={nextSlide}>›</button>
                </div>
            )}

            {/* Image Counter */}
            {showCounter && showNavigation && (
                <div className="image-counter">
                    <span className="counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
                    <span className="counter-separator">/</span>
                    <span className="counter-total">{String(images.length).padStart(2, '0')}</span>
                </div>
            )}

            {/* Play/Pause Button */}
            {autoPlay && showPlayPause && showNavigation && (
                <button
                    className="play-pause-btn"
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
            )}

            {/* Custom Controls */}
            {customControls && (
                <div className="custom-controls">
                    {customControls}
                </div>
            )}

            {/* Progress Bar for AutoPlay */}
            {autoPlay && isPlaying && !isHovered && (
                <div className="autoplay-progress">
                    <div
                        className="progress-bar"
                        style={{
                            animation: `progress ${autoPlayInterval}ms linear forwards`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

// Image Gallery Component (Enhanced)
export const ImageGallery = ({
    images,
    columns = 3,
    gap = 16,
    onImageClick,
    lightbox = true,
    aspectRatio = '1/1',
    masonry = false
}) => {
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (index) => {
        if (lightbox) {
            setSelectedImage(index);
        }
        onImageClick?.(index);
    };

    const galleryStyle = masonry
        ? { columnCount: columns, columnGap: gap }
        : { display: 'grid', gap: `${gap}px`, gridTemplateColumns: `repeat(${columns}, 1fr)` };

    return (
        <>
            <div className={`image-gallery ${masonry ? 'masonry' : 'grid'}`} style={galleryStyle}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="gallery-item"
                        style={!masonry ? { aspectRatio } : {}}
                        onClick={() => handleImageClick(index)}
                    >
                        <img
                            src={image.url || image}
                            alt={image.alt || `Gallery ${index + 1}`}
                            loading="lazy"
                        />
                        {image.caption && (
                            <div className="gallery-caption">
                                <p>{image.caption}</p>
                            </div>
                        )}
                        {image.badge && (
                            <div className="gallery-badge">{image.badge}</div>
                        )}
                    </div>
                ))}
            </div>

            {lightbox && selectedImage !== null && (
                <div className="lightbox" onClick={() => setSelectedImage(null)}>
                    <button className="lightbox-close">✕</button>
                    <button
                        className="lightbox-prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1);
                        }}
                    >
                        ‹
                    </button>
                    <img
                        src={images[selectedImage]?.url || images[selectedImage]}
                        alt="Lightbox"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="lightbox-next"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0);
                        }}
                    >
                        ›
                    </button>
                    {images[selectedImage]?.caption && (
                        <div className="lightbox-caption">
                            {images[selectedImage].caption}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

// Hero Slider Component (Enhanced)
export const HeroSlider = ({
    slides,
    autoPlay = true,
    height = '500px',
    overlay = true,
    overlayOpacity = 0.5,
    ctaText = 'Learn More',
    onCtaClick
}) => {
    return (
        <div className="hero-slider" style={{ height }}>
            <ImageSlider
                images={slides}
                autoPlay={autoPlay}
                autoPlayInterval={5000}
                showArrows={true}
                showDots={true}
                showThumbnails={false}
                effect="fade"
                height="100%"
                zoomOnClick={false}
                showCaption={false}
            />
            {overlay && <div className="hero-overlay" style={{ opacity: overlayOpacity }} />}
            {slides[0]?.title && (
                <div className="hero-content">
                    <h1>{slides[0].title}</h1>
                    <p>{slides[0].description}</p>
                    {ctaText && (
                        <button className="hero-cta" onClick={onCtaClick}>
                            {ctaText}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Video Slider Component
export const VideoSlider = ({ videos, ...props }) => {
    return (
        <ImageSlider
            images={videos.map(video => ({ ...video, url: video.thumbnail }))}
            {...props}
            zoomOnClick={false}
            showCaption={true}
        />
    );
};

export default ImageSlider;
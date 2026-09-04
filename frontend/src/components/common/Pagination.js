import React, { useState, useEffect, useRef } from 'react';
import './Pagination.css';

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    showItemsPerPage = true,
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    maxVisiblePages = 5,
    variant = 'default',
    size = 'medium',
    className = '',
    disabled = false,
    autoHide = false,
    showTotal = true,
    showPageInfo = true,
    showJumpTo = false,
    rounded = false,
    outline = false,
    labels = {
        first: '«',
        last: '»',
        prev: '‹',
        next: '›',
        of: 'of',
        items: 'items',
        page: 'Page',
        perPage: 'per page',
        jumpTo: 'Go to page',
        pageInfo: 'Page {current} of {total}'
    }
}) => {
    const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
    const [jumpToPage, setJumpToPage] = useState('');
    const [isJumping, setIsJumping] = useState(false);
    const jumpToInputRef = useRef(null);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            onPageChange?.(totalPages, selectedItemsPerPage);
        }
    }, [currentPage, totalPages, onPageChange, selectedItemsPerPage]);

    useEffect(() => {
        if (showJumpTo && isJumping && jumpToInputRef.current) {
            jumpToInputRef.current.focus();
        }
    }, [isJumping, showJumpTo]);

    const handlePageChange = (page) => {
        if (disabled) return;
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange?.(page, selectedItemsPerPage);
        }
    };

    const getVisiblePages = () => {
        if (!showPageNumbers) return [];

        let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const handleItemsPerPageChange = (e) => {
        const newValue = parseInt(e.target.value, 10);
        setSelectedItemsPerPage(newValue);
        onPageChange?.(1, newValue);
    };

    const handleJumpToPage = (e) => {
        e.preventDefault();
        const page = parseInt(jumpToPage, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            handlePageChange(page);
            setJumpToPage('');
        }
        setIsJumping(false);
    };

    const visiblePages = getVisiblePages();
    const startItem = (currentPage - 1) * selectedItemsPerPage + 1;
    const endItem = Math.min(currentPage * selectedItemsPerPage, totalItems);

    // Auto hide when only one page
    if (autoHide && totalPages <= 1) return null;

    return (
        <div className={`pagination-container pagination-${variant} pagination-${size} ${rounded ? 'pagination-rounded' : ''} ${outline ? 'pagination-outline' : ''} ${className}`}>
            {/* Page Info */}
            {showTotal && totalItems > 0 && (
                <div className="pagination-info">
                    <span className="items-info">
                        Showing <strong>{startItem.toLocaleString()}</strong> to <strong>{endItem.toLocaleString()}</strong> of <strong>{totalItems.toLocaleString()}</strong> {labels.items}
                    </span>
                </div>
            )}

            {/* Page Info (Compact) */}
            {showPageInfo && !showTotal && (
                <div className="pagination-page-info">
                    {labels.pageInfo.replace('{current}', currentPage).replace('{total}', totalPages)}
                </div>
            )}

            <div className="pagination-controls">
                {/* First Page Button */}
                {showFirstLast && totalPages > 1 && (
                    <button
                        className="pagination-btn first-btn"
                        onClick={() => handlePageChange(1)}
                        disabled={disabled || currentPage === 1}
                        aria-label="First page"
                        title="First page"
                    >
                        {labels.first}
                    </button>
                )}

                {/* Previous Button */}
                {showPrevNext && totalPages > 1 && (
                    <button
                        className="pagination-btn prev-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={disabled || currentPage === 1}
                        aria-label="Previous page"
                        title="Previous page"
                    >
                        {labels.prev}
                    </button>
                )}

                {/* Page Numbers */}
                <div className="pagination-pages">
                    {showPageNumbers && visiblePages[0] > 1 && (
                        <>
                            <button
                                className="pagination-btn page-btn"
                                onClick={() => handlePageChange(1)}
                                disabled={disabled}
                                aria-label="Page 1"
                            >
                                1
                            </button>
                            {visiblePages[0] > 2 && <span className="ellipsis">⋯</span>}
                        </>
                    )}

                    {showPageNumbers &&
                        visiblePages.map((page) => (
                            <button
                                key={page}
                                className={`pagination-btn page-btn ${page === currentPage ? 'active' : ''}`}
                                onClick={() => handlePageChange(page)}
                                disabled={disabled}
                                aria-label={`Page ${page}`}
                                aria-current={page === currentPage ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ))}

                    {showPageNumbers && visiblePages[visiblePages.length - 1] < totalPages && (
                        <>
                            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                                <span className="ellipsis">⋯</span>
                            )}
                            <button
                                className="pagination-btn page-btn"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={disabled}
                                aria-label={`Page ${totalPages}`}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                {/* Next Button */}
                {showPrevNext && totalPages > 1 && (
                    <button
                        className="pagination-btn next-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={disabled || currentPage === totalPages}
                        aria-label="Next page"
                        title="Next page"
                    >
                        {labels.next}
                    </button>
                )}

                {/* Last Page Button */}
                {showFirstLast && totalPages > 1 && (
                    <button
                        className="pagination-btn last-btn"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={disabled || currentPage === totalPages}
                        aria-label="Last page"
                        title="Last page"
                    >
                        {labels.last}
                    </button>
                )}

                {/* Jump to Page */}
                {showJumpTo && totalPages > 1 && (
                    <div className="pagination-jump-to">
                        {isJumping ? (
                            <form onSubmit={handleJumpToPage} className="jump-to-form">
                                <input
                                    ref={jumpToInputRef}
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={jumpToPage}
                                    onChange={(e) => setJumpToPage(e.target.value)}
                                    placeholder={currentPage.toString()}
                                    className="jump-to-input"
                                />
                                <button type="submit" className="jump-to-submit">Go</button>
                                <button
                                    type="button"
                                    className="jump-to-cancel"
                                    onClick={() => setIsJumping(false)}
                                >
                                    ×
                                </button>
                            </form>
                        ) : (
                            <button
                                className="jump-to-btn"
                                onClick={() => setIsJumping(true)}
                                title={labels.jumpTo}
                            >
                                ⚡
                            </button>
                        )}
                    </div>
                )}

                {/* Items Per Page Selector */}
                {showItemsPerPage && totalItems > 0 && (
                    <div className="items-per-page">
                        <label>
                            <span className="per-page-label">{labels.perPage}:</span>
                            <select
                                value={selectedItemsPerPage}
                                onChange={handleItemsPerPageChange}
                                disabled={disabled}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

// Compact Pagination Component (Enhanced)
export const CompactPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    disabled = false,
    showTotal = true,
    totalItems = 0
}) => {
    const goToPage = (page) => {
        if (!disabled && page >= 1 && page <= totalPages) {
            onPageChange?.(page);
        }
    };

    return (
        <div className={`compact-pagination ${className}`}>
            <button
                className="compact-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={disabled || currentPage === 1}
                aria-label="Previous page"
            >
                ‹
            </button>
            <div className="compact-info">
                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value, 10))}
                    disabled={disabled}
                    className="compact-input"
                />
                <span>/ {totalPages}</span>
            </div>
            <button
                className="compact-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={disabled || currentPage === totalPages}
                aria-label="Next page"
            >
                ›
            </button>
            {showTotal && totalItems > 0 && (
                <span className="compact-total">({totalItems} items)</span>
            )}
        </div>
    );
};

// Simple Pagination Component
export const SimplePagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    disabled = false
}) => {
    return (
        <div className={`simple-pagination ${className}`}>
            <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={disabled || currentPage === 1}
                className="simple-btn"
            >
                Previous
            </button>
            <span className="simple-info">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={disabled || currentPage === totalPages}
                className="simple-btn"
            >
                Next
            </button>
        </div>
    );
};

// Load More Pagination Component (Enhanced)
export const LoadMorePagination = ({
    hasMore,
    isLoading,
    onLoadMore,
    loadingText = 'Loading...',
    loadMoreText = 'Load More',
    noMoreText = 'No more items to load',
    className = '',
    variant = 'primary',
    size = 'medium'
}) => {
    return (
        <div className={`load-more-pagination load-more-${variant} load-more-${size} ${className}`}>
            {hasMore ? (
                <button
                    className="load-more-btn"
                    onClick={onLoadMore}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="load-more-spinner"></span>
                            <span>{loadingText}</span>
                        </>
                    ) : (
                        <>
                            <span className="load-more-icon">↻</span>
                            <span>{loadMoreText}</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="no-more-content">
                    <span className="no-more-icon">✓</span>
                    <p className="no-more-text">{noMoreText}</p>
                </div>
            )}
        </div>
    );
};

// Progress Pagination Component
export const ProgressPagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
    showPercentage = true
}) => {
    const percentage = (currentPage / totalPages) * 100;
    const [isDragging, setIsDragging] = useState(false);

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const newPage = Math.ceil((percentage / 100) * totalPages);
        onPageChange?.(Math.min(Math.max(1, newPage), totalPages));
    };

    return (
        <div className={`progress-pagination ${className}`}>
            <div className="progress-bar-container" onClick={handleProgressClick}>
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
                <div
                    className="progress-bar-handle"
                    style={{ left: `${percentage}%` }}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                />
            </div>
            {showPercentage && (
                <div className="progress-info">
                    <span>Page {currentPage} of {totalPages}</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
        </div>
    );
};

// Infinite Scroll Component (Enhanced)
export const InfiniteScroll = ({
    children,
    hasMore,
    isLoading,
    onLoadMore,
    loader = <div className="infinite-scroll-loader">
        <div className="loader-spinner"></div>
        <span>Loading more...</span>
    </div>,
    endMessage = <div className="infinite-scroll-end">
        <span className="end-icon">🏁</span>
        <p>You've reached the end!</p>
    </div>,
    threshold = 200,
    className = '',
    rootMargin = '0px 0px 200px 0px',
    initialLoad = true,
    onScroll
}) {
    const [observer, setObserver] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(initialLoad);
    const loadingRef = useRef(null);

    useEffect(() => {
        if (initialLoad && isInitialLoad && hasMore && !isLoading) {
            onLoadMore();
            setIsInitialLoad(false);
        }
    }, [initialLoad, isInitialLoad, hasMore, isLoading, onLoadMore]);

    useEffect(() => {
        if (loadingRef.current && hasMore && !isLoading) {
            const observerInstance = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore && !isLoading) {
                        onLoadMore();
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: rootMargin
                }
            );

            observerInstance.observe(loadingRef.current);
            setObserver(observerInstance);

            return () => {
                if (observerInstance) {
                    observerInstance.disconnect();
                }
            };
        }
    }, [hasMore, isLoading, onLoadMore, rootMargin]);

    useEffect(() => {
        if (onScroll) {
            const handleScroll = () => onScroll();
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [onScroll]);

    useEffect(() => {
        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    }, [observer]);

    return (
        <div className={`infinite-scroll-container ${className}`}>
            {children}
            <div ref={loadingRef} className="infinite-scroll-trigger">
                {isLoading && loader}
                {!hasMore && !isLoading && endMessage}
            </div>
        </div>
    );
};

export default Pagination;
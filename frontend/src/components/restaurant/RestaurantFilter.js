// src/components/restaurant/RestaurantFilter.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './RestaurantFilter.css';

const RestaurantFilter = ({ onFilterChange, initialFilters = {}, onClose, isMobile = false }) => {
    const [filters, setFilters] = useState({
        cuisine: [],
        priceRange: [0, 1000],
        rating: 0,
        deliveryTime: 0,
        sortBy: 'rating',
        isOpen: false,
        isPureVeg: false,
        searchQuery: '',
        discount: 0,
        distance: 10,
        isFeatured: false,
        isNew: false
    });

    const [isExpanded, setIsExpanded] = useState({
        cuisine: true,
        price: true,
        rating: true,
        delivery: true,
        additional: true
    });
    const [tempPriceRange, setTempPriceRange] = useState([0, 1000]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (initialFilters) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
            if (initialFilters.priceRange) {
                setTempPriceRange(initialFilters.priceRange);
            }
        }
    }, [initialFilters]);

    const cuisines = [
        'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican',
        'Japanese', 'Thai', 'Mediterranean', 'American', 'Healthy',
        'Fast Food', 'Seafood', 'Desserts', 'Beverages', 'Vegan',
        'Gluten Free', 'Barbecue', 'Street Food', 'Bakery', 'Ice Cream'
    ];

    const sortOptions = [
        { value: 'rating', label: 'Highest Rating', icon: '⭐' },
        { value: 'popularity', label: 'Most Popular', icon: '🔥' },
        { value: 'price_low', label: 'Price: Low to High', icon: '💰' },
        { value: 'price_high', label: 'Price: High to Low', icon: '💵' },
        { value: 'delivery_time', label: 'Fastest Delivery', icon: '⏱️' },
        { value: 'distance', label: 'Nearest First', icon: '📍' },
        { value: 'relevance', label: 'Relevance', icon: '🎯' }
    ];

    const ratingOptions = [
        { value: 0, label: 'All Ratings', icon: '⭐' },
        { value: 4, label: '4.0 & above', icon: '⭐' },
        { value: 4.5, label: '4.5 & above', icon: '⭐⭐' },
        { value: 4.8, label: '4.8 & above', icon: '⭐⭐⭐' }
    ];

    const deliveryTimeOptions = [
        { value: 0, label: 'Any Time', icon: '⏱️' },
        { value: 30, label: 'Under 30 mins', icon: '🚀' },
        { value: 45, label: 'Under 45 mins', icon: '⚡' },
        { value: 60, label: 'Under 60 mins', icon: '🕐' }
    ];

    const discountOptions = [
        { value: 0, label: 'Any Discount' },
        { value: 20, label: '20% & above' },
        { value: 30, label: '30% & above' },
        { value: 40, label: '40% & above' },
        { value: 50, label: '50% & above' }
    ];

    const distanceOptions = [
        { value: 5, label: 'Within 5 km' },
        { value: 10, label: 'Within 10 km' },
        { value: 15, label: 'Within 15 km' },
        { value: 25, label: 'Within 25 km' },
        { value: 50, label: 'Any Distance' }
    ];

    const handleCuisineChange = useCallback((cuisine) => {
        setFilters(prev => ({
            ...prev,
            cuisine: prev.cuisine.includes(cuisine)
                ? prev.cuisine.filter(c => c !== cuisine)
                : [...prev.cuisine, cuisine]
        }));
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            return newFilters;
        });
    }, []);

    const handlePriceRangeChange = useCallback((values) => {
        setTempPriceRange(values);
    }, []);

    const handlePriceRangeApply = useCallback(() => {
        handleFilterChange('priceRange', tempPriceRange);
    }, [tempPriceRange, handleFilterChange]);

    const handleClearAll = useCallback(() => {
        const resetFilters = {
            cuisine: [],
            priceRange: [0, 1000],
            rating: 0,
            deliveryTime: 0,
            sortBy: 'rating',
            isOpen: false,
            isPureVeg: false,
            searchQuery: '',
            discount: 0,
            distance: 10,
            isFeatured: false,
            isNew: false
        };
        setFilters(resetFilters);
        setTempPriceRange([0, 1000]);
        setSearchTerm('');
        onFilterChange?.(resetFilters);
    }, [onFilterChange]);

    const toggleSection = (section) => {
        setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getActiveFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.cuisine.length > 0) count++;
        if (filters.rating > 0) count++;
        if (filters.deliveryTime > 0) count++;
        if (filters.isOpen) count++;
        if (filters.isPureVeg) count++;
        if (filters.discount > 0) count++;
        if (filters.distance !== 10) count++;
        if (filters.isFeatured) count++;
        if (filters.isNew) count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
        if (filters.sortBy !== 'rating') count++;
        return count;
    }, [filters]);

    const filteredCuisines = useMemo(() => {
        if (!searchTerm) return cuisines;
        return cuisines.filter(cuisine =>
            cuisine.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Apply filters to parent component
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            onFilterChange?.(filters);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [filters, onFilterChange]);

    return (
        <div className={`restaurant-filter ${isMobile ? 'mobile' : ''}`}>
            <div className="filter-header">
                <h3 className="filter-title">
                    <span className="title-icon">🔍</span>
                    Filters & Sorting
                </h3>
                <div className="filter-header-actions">
                    {getActiveFiltersCount > 0 && (
                        <button className="clear-all-btn" onClick={handleClearAll}>
                            <span className="btn-icon">🗑️</span>
                            Clear All ({getActiveFiltersCount})
                        </button>
                    )}
                    {onClose && (
                        <button className="close-filter-btn" onClick={onClose} aria-label="Close filters">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Sort By Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('sort')}>
                    <span className="section-icon">📊</span>
                    <h4 className="section-title">Sort By</h4>
                    <span className="expand-icon">{isExpanded.sort ? '−' : '+'}</span>
                </div>
                {isExpanded.sort !== false && (
                    <div className="sort-options">
                        {sortOptions.map(option => (
                            <label key={option.value} className={`sort-option ${filters.sortBy === option.value ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="sortBy"
                                    value={option.value}
                                    checked={filters.sortBy === option.value}
                                    onChange={() => handleFilterChange('sortBy', option.value)}
                                />
                                <span className="option-icon">{option.icon}</span>
                                <span className="option-label">{option.label}</span>
                                {filters.sortBy === option.value && <span className="check-icon">✓</span>}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Rating Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('rating')}>
                    <span className="section-icon">⭐</span>
                    <h4 className="section-title">Rating</h4>
                    <span className="expand-icon">{isExpanded.rating ? '−' : '+'}</span>
                </div>
                {isExpanded.rating !== false && (
                    <div className="rating-options">
                        {ratingOptions.map(option => (
                            <button
                                key={option.value}
                                className={`rating-btn ${filters.rating === option.value ? 'active' : ''}`}
                                onClick={() => handleFilterChange('rating', option.value)}
                            >
                                <span className="btn-icon">{option.icon}</span>
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delivery Time Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('delivery')}>
                    <span className="section-icon">⏱️</span>
                    <h4 className="section-title">Delivery Time</h4>
                    <span className="expand-icon">{isExpanded.delivery ? '−' : '+'}</span>
                </div>
                {isExpanded.delivery !== false && (
                    <div className="delivery-options">
                        {deliveryTimeOptions.map(option => (
                            <button
                                key={option.value}
                                className={`delivery-btn ${filters.deliveryTime === option.value ? 'active' : ''}`}
                                onClick={() => handleFilterChange('deliveryTime', option.value)}
                            >
                                <span className="btn-icon">{option.icon}</span>
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Price Range Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('price')}>
                    <span className="section-icon">💰</span>
                    <h4 className="section-title">Price Range</h4>
                    <span className="expand-icon">{isExpanded.price ? '−' : '+'}</span>
                </div>
                {isExpanded.price !== false && (
                    <div className="price-range-container">
                        <div className="price-values">
                            <span className="price-min">₹{tempPriceRange[0]}</span>
                            <span className="price-separator">—</span>
                            <span className="price-max">₹{tempPriceRange[1]}+</span>
                        </div>
                        <div className="price-slider">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="50"
                                value={tempPriceRange[1]}
                                onChange={(e) => handlePriceRangeChange([tempPriceRange[0], parseInt(e.target.value)])}
                                className="price-slider-input"
                                style={{
                                    background: `linear-gradient(90deg, #667eea 0%, #667eea ${(tempPriceRange[1] / 1000) * 100}%, #e0e0e0 ${(tempPriceRange[1] / 1000) * 100}%)`
                                }}
                            />
                        </div>
                        <button className="apply-price-btn" onClick={handlePriceRangeApply}>
                            Apply
                        </button>
                    </div>
                )}
            </div>

            {/* Discount Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('discount')}>
                    <span className="section-icon">🎉</span>
                    <h4 className="section-title">Discount Offers</h4>
                    <span className="expand-icon">{isExpanded.discount ? '−' : '+'}</span>
                </div>
                {isExpanded.discount !== false && (
                    <div className="discount-options">
                        {discountOptions.map(option => (
                            <button
                                key={option.value}
                                className={`discount-btn ${filters.discount === option.value ? 'active' : ''}`}
                                onClick={() => handleFilterChange('discount', option.value)}
                            >
                                {option.value > 0 ? `${option.value}% OFF` : option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Distance Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('distance')}>
                    <span className="section-icon">📍</span>
                    <h4 className="section-title">Distance</h4>
                    <span className="expand-icon">{isExpanded.distance ? '−' : '+'}</span>
                </div>
                {isExpanded.distance !== false && (
                    <div className="distance-options">
                        {distanceOptions.map(option => (
                            <button
                                key={option.value}
                                className={`distance-btn ${filters.distance === option.value ? 'active' : ''}`}
                                onClick={() => handleFilterChange('distance', option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Cuisine Section */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('cuisine')}>
                    <span className="section-icon">🍔</span>
                    <h4 className="section-title">Cuisines</h4>
                    <span className="expand-icon">{isExpanded.cuisine ? '−' : '+'}</span>
                </div>
                {isExpanded.cuisine !== false && (
                    <>
                        <div className="cuisine-search">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search cuisines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="cuisine-search-input"
                            />
                            {searchTerm && (
                                <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>
                        <div className="cuisine-options">
                            {filteredCuisines.map(cuisine => (
                                <label key={cuisine} className={`cuisine-option ${filters.cuisine.includes(cuisine) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={filters.cuisine.includes(cuisine)}
                                        onChange={() => handleCuisineChange(cuisine)}
                                    />
                                    <span className="cuisine-name">{cuisine}</span>
                                    {filters.cuisine.includes(cuisine) && <span className="check-mark">✓</span>}
                                </label>
                            ))}
                            {filteredCuisines.length === 0 && (
                                <div className="no-cuisines">No cuisines found</div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Additional Filters */}
            <div className="filter-section">
                <div className="section-header" onClick={() => toggleSection('additional')}>
                    <span className="section-icon">⚙️</span>
                    <h4 className="section-title">Additional Filters</h4>
                    <span className="expand-icon">{isExpanded.additional ? '−' : '+'}</span>
                </div>
                {isExpanded.additional !== false && (
                    <div className="additional-filters">
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.isOpen}
                                onChange={(e) => handleFilterChange('isOpen', e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">🟢 Open Now</span>
                        </label>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.isPureVeg}
                                onChange={(e) => handleFilterChange('isPureVeg', e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">🌱 Pure Vegetarian</span>
                        </label>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.isFeatured}
                                onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">⭐ Featured</span>
                        </label>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.isNew}
                                onChange={(e) => handleFilterChange('isNew', e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">🆕 Newly Added</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Active Filters */}
            {getActiveFiltersCount > 0 && (
                <div className="active-filters">
                    <div className="active-filters-header">
                        <span className="active-count">🎯 {getActiveFiltersCount} filter(s) applied</span>
                    </div>
                    <div className="active-filters-list">
                        {filters.cuisine.map(cuisine => (
                            <span key={cuisine} className="active-filter-tag">
                                {cuisine}
                                <button onClick={() => handleCuisineChange(cuisine)}>×</button>
                            </span>
                        ))}
                        {filters.rating > 0 && (
                            <span className="active-filter-tag">
                                {filters.rating}+ stars
                                <button onClick={() => handleFilterChange('rating', 0)}>×</button>
                            </span>
                        )}
                        {filters.deliveryTime > 0 && (
                            <span className="active-filter-tag">
                                Under {filters.deliveryTime} mins
                                <button onClick={() => handleFilterChange('deliveryTime', 0)}>×</button>
                            </span>
                        )}
                        {filters.discount > 0 && (
                            <span className="active-filter-tag">
                                {filters.discount}% OFF
                                <button onClick={() => handleFilterChange('discount', 0)}>×</button>
                            </span>
                        )}
                        {filters.distance !== 10 && (
                            <span className="active-filter-tag">
                                Within {filters.distance} km
                                <button onClick={() => handleFilterChange('distance', 10)}>×</button>
                            </span>
                        )}
                        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                            <span className="active-filter-tag">
                                ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                                <button onClick={() => {
                                    handleFilterChange('priceRange', [0, 1000]);
                                    setTempPriceRange([0, 1000]);
                                }}>×</button>
                            </span>
                        )}
                        {filters.isOpen && (
                            <span className="active-filter-tag">
                                Open Now
                                <button onClick={() => handleFilterChange('isOpen', false)}>×</button>
                            </span>
                        )}
                        {filters.isPureVeg && (
                            <span className="active-filter-tag">
                                Pure Veg
                                <button onClick={() => handleFilterChange('isPureVeg', false)}>×</button>
                            </span>
                        )}
                        {filters.isFeatured && (
                            <span className="active-filter-tag">
                                Featured
                                <button onClick={() => handleFilterChange('isFeatured', false)}>×</button>
                            </span>
                        )}
                        {filters.isNew && (
                            <span className="active-filter-tag">
                                New
                                <button onClick={() => handleFilterChange('isNew', false)}>×</button>
                            </span>
                        )}
                        {filters.sortBy !== 'rating' && (
                            <span className="active-filter-tag">
                                Sort: {sortOptions.find(s => s.value === filters.sortBy)?.label}
                                <button onClick={() => handleFilterChange('sortBy', 'rating')}>×</button>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Apply Button for Mobile */}
            {isMobile && (
                <div className="filter-apply-footer">
                    <button className="apply-filters-btn" onClick={onClose}>
                        Apply Filters ({getActiveFiltersCount})
                    </button>
                </div>
            )}
        </div>
    );
};

// Filter Drawer Component for Mobile
export const FilterDrawer = ({ isOpen, onClose, onFilterChange, initialFilters }) => {
    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <div className={`filter-drawer ${isOpen ? 'open' : ''}`}>
            <div className="filter-drawer-overlay" onClick={onClose} />
            <div className="filter-drawer-content">
                <RestaurantFilter
                    onFilterChange={onFilterChange}
                    initialFilters={initialFilters}
                    onClose={onClose}
                    isMobile={true}
                />
            </div>
        </div>
    );
};

// Filter Button Component for Mobile
export const FilterButton = ({ onClick, activeCount = 0 }) => {
    return (
        <button className="filter-button" onClick={onClick}>
            <span className="filter-icon">🔍</span>
            Filters
            {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
        </button>
    );
};

export default RestaurantFilter;
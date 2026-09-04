// src/components/profile/UserWishlist.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './UserWishlist.css';

const UserWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [movingToCart, setMovingToCart] = useState({});
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('date-desc');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
    const [showFilters, setShowFilters] = useState(false);
    const [wishlistName, setWishlistName] = useState('My Wishlist');
    const [isEditingName, setIsEditingName] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [stats, setStats] = useState({
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        averageRating: 0,
        categories: {},
        mostExpensive: null,
        mostPopular: null
    });
    const searchInputRef = useRef();

    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('/api/users/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const items = response.data.data || response.data.wishlist || [];
            setWishlistItems(items);
            calculateStats(items);
            fetchRecommendations(items);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            const mockItems = generateMockWishlist();
            setWishlistItems(mockItems);
            calculateStats(mockItems);
            fetchRecommendations(mockItems);
            toast.error('Using demo data. API not available.', { duration: 3000 });
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateStats = (items) => {
        const totalItems = items.length;
        const totalValue = items.reduce((sum, item) => sum + item.price, 0);
        const totalSavings = items.reduce((sum, item) =>
            sum + (item.original_price > item.price ? item.original_price - item.price : 0), 0);
        const averageRating = items.reduce((sum, item) => sum + (item.rating || 0), 0) / (items.length || 1);

        const categories = {};
        items.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });

        const mostExpensive = items.length > 0 ? items.reduce((max, item) =>
            item.price > max.price ? item : max, items[0]) : null;

        const mostPopular = items.length > 0 ? items.reduce((pop, item) =>
            (item.popularity || 0) > (pop.popularity || 0) ? item : pop, items[0]) : null;

        setStats({
            totalItems,
            totalValue,
            totalSavings,
            averageRating,
            categories,
            mostExpensive,
            mostPopular
        });
    };

    const fetchRecommendations = async (items) => {
        // Fetch personalized recommendations based on wishlist
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/recommendations',
                { items: items.map(i => ({ id: i.item_id, category: i.category })) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecommendations(response.data.recommendations || []);
        } catch (error) {
            // Mock recommendations
            setRecommendations([
                { id: 201, name: 'Garlic Bread', price: 99, restaurant: 'Pizza Hut', image: '/placeholder-food.jpg' },
                { id: 202, name: 'French Fries', price: 79, restaurant: "McDonald's", image: '/placeholder-food.jpg' },
                { id: 203, name: 'Popcorn Chicken', price: 149, restaurant: 'KFC', image: '/placeholder-food.jpg' }
            ]);
        }
    };

    const generateMockWishlist = () => {
        const categories = ['Pizza', 'Burger', 'Chicken', 'Dessert', 'Beverage', 'Sides'];
        const restaurants = [
            { name: 'Pizza Hut', id: 1, cuisine: 'Italian' },
            { name: "McDonald's", id: 2, cuisine: 'Fast Food' },
            { name: 'KFC', id: 3, cuisine: 'Chicken' },
            { name: 'Dominos', id: 4, cuisine: 'Italian' },
            { name: 'Starbucks', id: 5, cuisine: 'Cafe' },
            { name: 'Burger King', id: 6, cuisine: 'Burger' }
        ];

        const items = [];
        for (let i = 1; i <= 12; i++) {
            const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const price = Math.floor(Math.random() * 500) + 50;
            const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;
            const originalPrice = discount > 0 ? Math.floor(price / (1 - discount / 100)) : price;

            items.push({
                id: i,
                item_id: 100 + i,
                name: `${category} ${i}`,
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                restaurant_cuisine: restaurant.cuisine,
                price: price,
                original_price: originalPrice,
                discount: discount,
                image: `/api/placeholder/300/200?item=${i}`,
                description: `Delicious ${category.toLowerCase()} item with premium ingredients`,
                rating: (Math.random() * 2 + 3).toFixed(1),
                rating_count: Math.floor(Math.random() * 500) + 10,
                added_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                in_stock: Math.random() > 0.2,
                category: category,
                popularity: Math.floor(Math.random() * 1000),
                tags: ['popular', 'bestseller', 'spicy', 'veg', 'non-veg'].slice(0, Math.floor(Math.random() * 3) + 1)
            });
        }
        return items;
    };

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToCart = async (itemId, item, quantity = 1) => {
        setMovingToCart(prev => ({ ...prev, [itemId]: true }));

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/cart/add', {
                item_id: item.item_id,
                quantity: quantity,
                price: item.price,
                name: item.name,
                restaurant_id: item.restaurant_id,
                restaurant_name: item.restaurant_name,
                image: item.image,
                notes: ''
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${item.name} added to cart!`, {
                icon: '🛒',
                duration: 2000
            });

            // Track event for analytics
            trackEvent('add_to_cart', { item_id: item.item_id, source: 'wishlist' });
        } catch (error) {
            console.error('Error adding to cart:', error);
            const errorMsg = error.response?.data?.message || 'Failed to add item to cart';
            toast.error(errorMsg);
        } finally {
            setMovingToCart(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const addAllToCart = async () => {
        const itemsToAdd = selectedItems.length > 0
            ? wishlistItems.filter(item => selectedItems.includes(item.id) && item.in_stock)
            : wishlistItems.filter(item => item.in_stock);

        if (itemsToAdd.length === 0) {
            toast.error('No available items to add to cart');
            return;
        }

        const loadingToast = toast.loading(`Adding ${itemsToAdd.length} items to cart...`);

        try {
            const token = localStorage.getItem('token');
            const results = await Promise.allSettled(
                itemsToAdd.map(item =>
                    axios.post('/api/cart/add', {
                        item_id: item.item_id,
                        quantity: 1,
                        price: item.price,
                        name: item.name,
                        restaurant_id: item.restaurant_id,
                        restaurant_name: item.restaurant_name,
                        image: item.image
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );

            const successCount = results.filter(r => r.status === 'fulfilled').length;
            toast.dismiss(loadingToast);
            toast.success(`${successCount} of ${itemsToAdd.length} items added to cart!`);

            // Remove added items from wishlist if they were selected
            if (selectedItems.length > 0) {
                await removeMultipleFromWishlist(selectedItems);
            }

            trackEvent('add_all_to_cart', { count: successCount, source: 'wishlist' });
        } catch (error) {
            console.error('Error adding all to cart:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to add items to cart');
        }
    };

    const removeFromWishlist = async (itemId, itemName) => {
        if (!window.confirm(`Remove "${itemName}" from your wishlist?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/users/wishlist/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Item removed from wishlist');
            await fetchWishlist();
            setSelectedItems(prev => prev.filter(id => id !== itemId));

            trackEvent('remove_from_wishlist', { item_id: itemId });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error(error.response?.data?.message || 'Failed to remove item');
        }
    };

    const removeMultipleFromWishlist = async (itemIds) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/wishlist/remove-bulk', { item_ids: itemIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${itemIds.length} ${itemIds.length === 1 ? 'item' : 'items'} removed from wishlist`);
            await fetchWishlist();
            setSelectedItems([]);
            setShowBulkActions(false);

            trackEvent('bulk_remove', { count: itemIds.length });
        } catch (error) {
            console.error('Error removing items:', error);
            toast.error(error.response?.data?.message || 'Failed to remove items');
        }
    };

    const moveToWishlist = async (item) => {
        // For moving from recommendations to wishlist
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/wishlist/add', {
                item_id: item.id,
                name: item.name,
                price: item.price,
                restaurant_id: item.restaurant_id,
                restaurant_name: item.restaurant,
                image: item.image
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${item.name} added to wishlist!`);
            await fetchWishlist();
            trackEvent('add_to_wishlist', { item_id: item.id, source: 'recommendations' });
        } catch (error) {
            toast.error('Failed to add to wishlist');
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === wishlistItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(wishlistItems.map(item => item.id));
        }
    };

    const shareWishlist = async () => {
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const shareData = {
                title: `${wishlistName} - Food Delivery Wishlist`,
                text: `Check out my ${wishlistName} with ${wishlistItems.length} items!`,
                url: `${window.location.origin}/shared-wishlist/${user?.id || 'guest'}?name=${encodeURIComponent(wishlistName)}`
            };

            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Wishlist shared successfully!');
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.success('Wishlist link copied to clipboard!', { icon: '🔗' });
            }
            setShareModalOpen(false);
            trackEvent('share_wishlist', { method: navigator.share ? 'native' : 'clipboard' });
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error('Failed to share wishlist');
            }
        }
    };

    const exportWishlist = () => {
        const exportData = {
            name: wishlistName,
            exported_at: new Date().toISOString(),
            items: wishlistItems.map(item => ({
                name: item.name,
                restaurant: item.restaurant_name,
                price: item.price,
                category: item.category,
                added_at: item.added_at
            })),
            stats: stats
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wishlist-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Wishlist exported successfully!');
        trackEvent('export_wishlist');
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';

        const intervals = {
            minute: 60,
            hour: 3600,
            day: 86400,
            week: 604800,
            month: 2592000,
            year: 31536000
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1 && interval < (unit === 'minute' ? 60 : intervals[unit] || Infinity)) {
                return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
            }
        }
        return 'Long ago';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const trackEvent = (eventName, properties = {}) => {
        // Analytics tracking - implement your analytics provider here
        if (window.gtag) {
            window.gtag('event', eventName, properties);
        }
        console.log(`[Analytics] ${eventName}:`, properties);
    };

    const filteredAndSortedItems = useMemo(() => {
        let filtered = [...wishlistItems];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(term) ||
                item.restaurant_name.toLowerCase().includes(term) ||
                item.description?.toLowerCase().includes(term) ||
                item.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === filterCategory);
        }

        // Price range filter
        filtered = filtered.filter(item =>
            item.price >= priceRange.min &&
            (priceRange.max === Infinity || item.price <= priceRange.max)
        );

        // Stock filter
        // Add stock filter if needed

        // Sorting
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));
                break;
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        return filtered;
    }, [wishlistItems, searchTerm, filterCategory, sortBy, priceRange]);

    const categories = useMemo(() => {
        const cats = ['all', ...new Set(wishlistItems.map(item => item.category))];
        return cats;
    }, [wishlistItems]);

    const groupedByRestaurant = useMemo(() => {
        return filteredAndSortedItems.reduce((groups, item) => {
            const restaurant = item.restaurant_name;
            if (!groups[restaurant]) {
                groups[restaurant] = [];
            }
            groups[restaurant].push(item);
            return groups;
        }, {});
    }, [filteredAndSortedItems]);

    if (loading) {
        return (
            <div className="wishlist-loading">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="user-wishlist">
            {/* Header Section */}
            <div className="wishlist-header">
                <div className="header-content">
                    <div className="header-title">
                        <div className="title-wrapper">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={wishlistName}
                                    onChange={(e) => setWishlistName(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                    className="wishlist-name-input"
                                    autoFocus
                                    maxLength="50"
                                />
                            ) : (
                                <h2 onClick={() => setIsEditingName(true)} className="editable-title">
                                    <span className="header-icon">❤️</span>
                                    {wishlistName}
                                    <button className="edit-name-btn" aria-label="Edit wishlist name">✏️</button>
                                </h2>
                            )}
                            <p className="header-subtitle">
                                {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? 'item' : 'items'}
                                {stats.totalSavings > 0 && ` • Save ${formatCurrency(stats.totalSavings)}`}
                            </p>
                        </div>
                    </div>

                    <div className="header-stats">
                        <div className="stat-card">
                            <span className="stat-value">{stats.totalItems}</span>
                            <span className="stat-label">Total Items</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
                            <span className="stat-label">Total Value</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">⭐ {stats.averageRating.toFixed(1)}</span>
                            <span className="stat-label">Avg Rating</span>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button onClick={() => setShowFilters(!showFilters)} className="filter-toggle-btn">
                            🔍 Filters {Object.keys(priceRange).length > 0 && filterCategory !== 'all' && '•'}
                        </button>
                        <button onClick={exportWishlist} className="export-wishlist-btn" title="Export wishlist">
                            📥 Export
                        </button>
                        <button onClick={() => setShareModalOpen(true)} className="share-wishlist-btn" title="Share wishlist">
                            🔗 Share
                        </button>
                        <button onClick={() => setShowBulkActions(!showBulkActions)} className={`bulk-select-btn ${showBulkActions ? 'active' : ''}`}>
                            {showBulkActions ? 'Cancel' : '☑️ Select'}
                        </button>
                        <button onClick={addAllToCart} className="add-all-btn">
                            🛒 Add All to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="search-filters-bar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search by name, restaurant, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                    )}
                </div>

                <div className="view-options">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                    >
                        ⊞
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                    >
                        ≡
                    </button>
                </div>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="name-asc">Name A-Z</option>
                </select>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-section">
                        <h4>Categories</h4>
                        <div className="category-filters">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`category-filter-btn ${filterCategory === cat ? 'active' : ''}`}
                                    onClick={() => setFilterCategory(cat)}
                                >
                                    {cat === 'all' ? 'All Items' : cat}
                                    {cat !== 'all' && (
                                        <span className="category-count">
                                            {wishlistItems.filter(i => i.category === cat).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Price Range</h4>
                        <div className="price-range-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min || ''}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                                className="price-input"
                            />
                            <span>to</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max === Infinity ? '' : priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || Infinity }))}
                                className="price-input"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button onClick={() => {
                            setPriceRange({ min: 0, max: Infinity });
                            setFilterCategory('all');
                            setSearchTerm('');
                        }} className="clear-filters-btn">
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions Bar */}
            {showBulkActions && selectedItems.length > 0 && (
                <div className="bulk-actions-bar">
                    <div className="bulk-info">
                        <span className="bulk-count">{selectedItems.length} item(s) selected</span>
                        <button onClick={handleSelectAll} className="select-all-bulk-btn">
                            {selectedItems.length === wishlistItems.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="bulk-buttons">
                        <button onClick={addAllToCart} className="bulk-add-btn">
                            🛒 Add to Cart ({selectedItems.length})
                        </button>
                        <button onClick={() => removeMultipleFromWishlist(selectedItems)} className="bulk-remove-btn">
                            🗑️ Remove
                        </button>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            {filteredAndSortedItems.length !== wishlistItems.length && (
                <div className="results-summary">
                    Showing {filteredAndSortedItems.length} of {wishlistItems.length} items
                    <button onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('all');
                        setPriceRange({ min: 0, max: Infinity });
                    }} className="clear-filters-text">
                        Clear filters
                    </button>
                </div>
            )}

            {/* Main Content */}
            {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                    <div className="empty-state-icon">❤️</div>
                    <h3>Your Wishlist is Empty</h3>
                    <p>Save your favorite items here to order them later!</p>
                    <div className="empty-state-actions">
                        <Link to="/restaurants" className="browse-btn">
                            Browse Restaurants →
                        </Link>
                        <Link to="/deals" className="deals-btn">
                            🎉 Check Out Deals
                        </Link>
                    </div>
                </div>
            ) : filteredAndSortedItems.length === 0 ? (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No matching items</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('all');
                        setPriceRange({ min: 0, max: Infinity });
                    }} className="clear-filters-btn">
                        Clear all filters
                    </button>
                </div>
            ) : (
                <>
                    <div className={`wishlist-items ${viewMode}`}>
                        {Object.entries(groupedByRestaurant).map(([restaurantName, items]) => (
                            <div key={restaurantName} className="restaurant-group">
                                <div className="restaurant-group-header">
                                    <div className="group-header-info">
                                        <h3 className="restaurant-group-title">
                                            <span className="restaurant-icon">🍕</span>
                                            {restaurantName}
                                        </h3>
                                        <span className="item-count">{items.length} items</span>
                                    </div>
                                    <Link to={`/restaurant/${items[0].restaurant_id}`} className="visit-restaurant-link">
                                        Visit Restaurant →
                                    </Link>
                                </div>

                                <div className={`items-${viewMode}`}>
                                    {items.map(item => (
                                        <div key={item.id} className={`wishlist-item ${!item.in_stock ? 'out-of-stock' : ''}`}>
                                            {showBulkActions && (
                                                <div className="item-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.id)}
                                                        onChange={() => handleSelectItem(item.id)}
                                                        id={`select-${item.id}`}
                                                    />
                                                    <label htmlFor={`select-${item.id}`} className="checkbox-label"></label>
                                                </div>
                                            )}

                                            <div className="item-image">
                                                <img
                                                    src={item.image || '/placeholder-food.jpg'}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    onError={(e) => { e.target.src = '/placeholder-food.jpg'; }}
                                                />
                                                {item.discount > 0 && (
                                                    <span className="discount-badge">{item.discount}% OFF</span>
                                                )}
                                                {item.tags && item.tags.includes('bestseller') && (
                                                    <span className="bestseller-badge">⭐ Bestseller</span>
                                                )}
                                                {!item.in_stock && (
                                                    <div className="out-of-stock-overlay">
                                                        <span>Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="item-details">
                                                <Link to={`/restaurant/${item.restaurant_id}/item/${item.item_id}`} className="item-name-link">
                                                    <h4 className="item-name">{item.name}</h4>
                                                </Link>
                                                <p className="item-description">{item.description}</p>

                                                <div className="item-meta">
                                                    <div className="price-section">
                                                        <span className="current-price">{formatCurrency(item.price)}</span>
                                                        {item.original_price > item.price && (
                                                            <>
                                                                <span className="original-price">{formatCurrency(item.original_price)}</span>
                                                                <span className="savings">Save {formatCurrency(item.original_price - item.price)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="rating-info">
                                                        <span className="rating">⭐ {item.rating}</span>
                                                        <span className="rating-count">({item.rating_count || 0})</span>
                                                        <span className="category-badge">{item.category}</span>
                                                    </div>
                                                </div>

                                                <div className="item-footer">
                                                    <div className="added-date">
                                                        Added {getTimeAgo(item.added_at)}
                                                    </div>
                                                    {item.tags && item.tags.length > 0 && (
                                                        <div className="item-tags">
                                                            {item.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="tag">#{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="item-actions">
                                                <button
                                                    onClick={() => addToCart(item.id, item)}
                                                    className="add-to-cart-btn"
                                                    disabled={!item.in_stock || movingToCart[item.id]}
                                                >
                                                    {movingToCart[item.id] ? (
                                                        <span className="btn-spinner"></span>
                                                    ) : (
                                                        '🛒 Add to Cart'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => removeFromWishlist(item.id, item.name)}
                                                    className="remove-wishlist-btn"
                                                    title="Remove from wishlist"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && wishlistItems.length > 0 && (
                        <div className="recommendations-section">
                            <div className="section-header">
                                <h3>You Might Also Like</h3>
                                <p>Based on your wishlist</p>
                            </div>
                            <div className="recommendations-grid">
                                {recommendations.map(rec => (
                                    <div key={rec.id} className="recommendation-card">
                                        <img src={rec.image} alt={rec.name} />
                                        <div className="recommendation-info">
                                            <h4>{rec.name}</h4>
                                            <p className="rec-restaurant">{rec.restaurant}</p>
                                            <p className="rec-price">{formatCurrency(rec.price)}</p>
                                            <button onClick={() => moveToWishlist(rec)} className="add-to-wishlist-btn">
                                                ❤️ Add to Wishlist
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Share Modal */}
            {shareModalOpen && (
                <div className="modal-overlay" onClick={() => setShareModalOpen(false)}>
                    <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Share Wishlist</h3>
                            <button className="close-modal" onClick={() => setShareModalOpen(false)}>✕</button>
                        </div>
                        <div className="share-modal-content">
                            <div className="share-icon">🔗</div>
                            <p>Share your wishlist with friends and family</p>
                            <div className="share-options">
                                <button onClick={shareWishlist} className="copy-link-btn">
                                    📋 Copy Link
                                </button>
                                {navigator.share && (
                                    <button onClick={shareWishlist} className="native-share-btn">
                                        📱 Share
                                    </button>
                                )}
                            </div>
                            <div className="wishlist-preview">
                                <strong>{wishlistName}</strong>
                                <span>{wishlistItems.length} items • {formatCurrency(stats.totalValue)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserWishlist;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import RestaurantFilter, { FilterDrawer } from '../../components/restaurant/RestaurantFilter';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import './RestaurantListing.css';

const RestaurantListing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [filters, setFilters] = useState({
        cuisine: [],
        priceRange: [0, 1000],
        rating: 0,
        deliveryTime: 0,
        sortBy: 'rating',
        isOpen: false,
        isPureVeg: false,
        searchQuery: ''
    });
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    const [sortOption, setSortOption] = useState('rating');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        filterAndSortRestaurants();
    }, [restaurants, filters, sortOption]);

    const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockRestaurants = [
                {
                    id: 1,
                    name: 'Pizza Hut',
                    rating: 4.5,
                    reviewCount: 1250,
                    deliveryTime: 30,
                    priceRange: '₹300-600',
                    cuisine: ['Italian', 'Pizza'],
                    image: '/pizza-hut.jpg',
                    isOpen: true,
                    discount: 20,
                    distance: 2.5,
                    isPromoted: true,
                    address: '123 Main Street, Downtown'
                },
                {
                    id: 2,
                    name: "McDonald's",
                    rating: 4.3,
                    reviewCount: 980,
                    deliveryTime: 25,
                    priceRange: '₹200-400',
                    cuisine: ['American', 'Burger'],
                    image: '/mcdonalds.jpg',
                    isOpen: true,
                    discount: 15,
                    distance: 1.8,
                    address: '456 Park Avenue'
                },
                {
                    id: 3,
                    name: 'KFC',
                    rating: 4.4,
                    reviewCount: 1100,
                    deliveryTime: 35,
                    priceRange: '₹250-500',
                    cuisine: ['American', 'Fried Chicken'],
                    image: '/kfc.jpg',
                    isOpen: true,
                    distance: 3.2,
                    address: '789 Broadway'
                },
                {
                    id: 4,
                    name: 'Biryani House',
                    rating: 4.7,
                    reviewCount: 850,
                    deliveryTime: 40,
                    priceRange: '₹200-350',
                    cuisine: ['Indian', 'Biryani'],
                    image: '/biryani.jpg',
                    isOpen: true,
                    discount: 10,
                    distance: 4.1,
                    isPromoted: true,
                    address: '101 Food Street'
                },
                {
                    id: 5,
                    name: "Domino's",
                    rating: 4.6,
                    reviewCount: 2100,
                    deliveryTime: 30,
                    priceRange: '₹300-600',
                    cuisine: ['Pizza', 'Italian'],
                    image: '/dominos.jpg',
                    isOpen: false,
                    distance: 2.0,
                    address: '202 Pizza Lane'
                },
                {
                    id: 6,
                    name: 'Starbucks',
                    rating: 4.8,
                    reviewCount: 560,
                    deliveryTime: 20,
                    priceRange: '₹150-400',
                    cuisine: ['Cafe', 'Beverages'],
                    image: '/starbucks.jpg',
                    isOpen: true,
                    distance: 1.5,
                    address: '303 Coffee Avenue'
                }
            ];
            setRestaurants(mockRestaurants);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSortRestaurants = () => {
        let filtered = [...restaurants];

        // Search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(query) ||
                r.cuisine.some(c => c.toLowerCase().includes(query))
            );
        }

        // Cuisine filter
        if (filters.cuisine.length > 0) {
            filtered = filtered.filter(r =>
                r.cuisine.some(c => filters.cuisine.includes(c))
            );
        }

        // Rating filter
        if (filters.rating > 0) {
            filtered = filtered.filter(r => r.rating >= filters.rating);
        }

        // Delivery time filter
        if (filters.deliveryTime > 0) {
            filtered = filtered.filter(r => r.deliveryTime <= filters.deliveryTime);
        }

        // Price range filter
        const priceMap = { '₹200-400': 300, '₹250-500': 375, '₹300-600': 450, '₹150-400': 275, '₹200-350': 275 };
        filtered = filtered.filter(r => {
            const avgPrice = priceMap[r.priceRange] || 300;
            return avgPrice >= filters.priceRange[0] && avgPrice <= filters.priceRange[1];
        });

        // Open now filter
        if (filters.isOpen) {
            filtered = filtered.filter(r => r.isOpen);
        }

        // Pure veg filter (simplified)
        if (filters.isPureVeg) {
            filtered = filtered.filter(r => r.cuisine.includes('Vegetarian'));
        }

        // Sorting
        switch (sortOption) {
            case 'rating':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'price_low':
                filtered.sort((a, b) => (a.priceRange.localeCompare(b.priceRange)));
                break;
            case 'price_high':
                filtered.sort((a, b) => (b.priceRange.localeCompare(a.priceRange)));
                break;
            case 'delivery_time':
                filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
                break;
            case 'distance':
                filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                break;
            default:
                filtered.sort((a, b) => b.rating - a.rating);
        }

        setFilteredRestaurants(filtered);
    };

    const handleSearch = (query) => {
        setFilters(prev => ({ ...prev, searchQuery: query }));
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleQuickView = (restaurant) => {
        navigate(`/restaurant/${restaurant.id}`);
    };

    const handleFavorite = (id, isFavorite) => {
        console.log(`Restaurant ${id} favorite: ${isFavorite}`);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.cuisine.length > 0) count++;
        if (filters.rating > 0) count++;
        if (filters.deliveryTime > 0) count++;
        if (filters.isOpen) count++;
        if (filters.isPureVeg) count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
        return count;
    };

    if (isLoading) {
        return (
            <div className="restaurant-listing-loading">
                <div className="loading-spinner"></div>
                <p>Loading restaurants...</p>
            </div>
        );
    }

    return (
        <div className="restaurant-listing-page">
            <div className="listing-header">
                <h1>Restaurants Near You</h1>
                <p>Discover the best restaurants in your area</p>
            </div>

            <div className="listing-controls">
                <div className="search-section">
                    <SearchBar
                        placeholder="Search by restaurant or cuisine..."
                        onSearch={handleSearch}
                        size="medium"
                    />
                </div>

                <div className="filter-section">
                    <button
                        className="filter-toggle-btn"
                        onClick={() => setShowFilterDrawer(true)}
                    >
                        🔍 Filters
                        {getActiveFiltersCount() > 0 && (
                            <span className="filter-count">{getActiveFiltersCount()}</span>
                        )}
                    </button>

                    <div className="sort-section">
                        <label>Sort by:</label>
                        <select value={sortOption} onChange={handleSortChange}>
                            <option value="rating">Highest Rating</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="delivery_time">Fastest Delivery</option>
                            <option value="distance">Nearest First</option>
                        </select>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            ⊞ Grid
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            ≡ List
                        </button>
                    </div>
                </div>
            </div>

            <div className="active-filters-bar">
                {filters.cuisine.map(cuisine => (
                    <span key={cuisine} className="active-filter">
                        {cuisine}
                        <button onClick={() => {
                            setFilters(prev => ({
                                ...prev,
                                cuisine: prev.cuisine.filter(c => c !== cuisine)
                            }));
                        }}>×</button>
                    </span>
                ))}
                {filters.rating > 0 && (
                    <span className="active-filter">
                        {filters.rating}+ stars
                        <button onClick={() => setFilters(prev => ({ ...prev, rating: 0 }))}>×</button>
                    </span>
                )}
                {filters.deliveryTime > 0 && (
                    <span className="active-filter">
                        Under {filters.deliveryTime} mins
                        <button onClick={() => setFilters(prev => ({ ...prev, deliveryTime: 0 }))}>×</button>
                    </span>
                )}
                {filters.isOpen && (
                    <span className="active-filter">
                        Open Now
                        <button onClick={() => setFilters(prev => ({ ...prev, isOpen: false }))}>×</button>
                    </span>
                )}
            </div>

            <div className={`restaurants-container ${viewMode}`}>
                {filteredRestaurants.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>No restaurants found</h3>
                        <p>Try adjusting your filters or search query</p>
                        <Button variant="primary" onClick={() => {
                            setFilters({
                                cuisine: [],
                                priceRange: [0, 1000],
                                rating: 0,
                                deliveryTime: 0,
                                sortBy: 'rating',
                                isOpen: false,
                                isPureVeg: false,
                                searchQuery: ''
                            });
                            setSortOption('rating');
                        }}>
                            Clear All Filters
                        </Button>
                    </div>
                ) : (
                    filteredRestaurants.map(restaurant => (
                        <RestaurantCard
                            key={restaurant.id}
                            restaurant={restaurant}
                            variant={viewMode === 'list' ? 'compact' : 'default'}
                            onQuickView={handleQuickView}
                            onFavorite={handleFavorite}
                        />
                    ))
                )}
            </div>

            {/* Filter Drawer for Mobile */}
            <FilterDrawer
                isOpen={showFilterDrawer}
                onClose={() => setShowFilterDrawer(false)}
                onFilterChange={handleFilterChange}
                initialFilters={filters}
            />
        </div>
    );
};

export default RestaurantListing;
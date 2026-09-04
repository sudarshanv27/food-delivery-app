import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import RestaurantCard, { RestaurantHorizontalList } from '../components/restaurant/RestaurantCard';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const { itemCount } = useCart();
    const [loading, setLoading] = useState(true);
    const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
    const [popularRestaurants, setPopularRestaurants] = useState([]);
    const [newRestaurants, setNewRestaurants] = useState([]);
    const [offers, setOffers] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        setLoading(true);
        try {
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 1000));

            setHeroSlides([
                { id: 1, title: '50% OFF', subtitle: 'On your first order', image: '/hero1.jpg', cta: 'Order Now' },
                { id: 2, title: 'Free Delivery', subtitle: 'On orders above ₹500', image: '/hero2.jpg', cta: 'Explore' },
                { id: 3, title: 'New Restaurants', subtitle: 'Discover new flavors', image: '/hero3.jpg', cta: 'View All' }
            ]);

            setFeaturedRestaurants([
                { id: 1, name: 'Pizza Hut', rating: 4.5, reviewCount: 1250, deliveryTime: 30, priceRange: '₹300-600', cuisine: ['Italian', 'Pizza'], image: '/pizza-hut.jpg', isOpen: true, discount: 20 },
                { id: 2, name: "McDonald's", rating: 4.3, reviewCount: 980, deliveryTime: 25, priceRange: '₹200-400', cuisine: ['American', 'Burger'], image: '/mcdonalds.jpg', isOpen: true, discount: 15 },
                { id: 3, name: 'KFC', rating: 4.4, reviewCount: 1100, deliveryTime: 35, priceRange: '₹250-500', cuisine: ['American', 'Fried Chicken'], image: '/kfc.jpg', isOpen: true },
                { id: 4, name: 'Biryani House', rating: 4.7, reviewCount: 850, deliveryTime: 40, priceRange: '₹200-350', cuisine: ['Indian', 'Biryani'], image: '/biryani.jpg', isOpen: true, discount: 10 }
            ]);

            setPopularRestaurants([
                { id: 5, name: 'Domino\'s', rating: 4.6, reviewCount: 2100, deliveryTime: 30, priceRange: '₹300-600', cuisine: ['Pizza', 'Italian'], image: '/dominos.jpg', isOpen: true, isPromoted: true },
                { id: 6, name: 'Starbucks', rating: 4.8, reviewCount: 560, deliveryTime: 20, priceRange: '₹150-400', cuisine: ['Cafe', 'Beverages'], image: '/starbucks.jpg', isOpen: true },
                { id: 7, name: 'Subway', rating: 4.2, reviewCount: 720, deliveryTime: 25, priceRange: '₹150-350', cuisine: ['Healthy', 'Sandwiches'], image: '/subway.jpg', isOpen: true },
                { id: 8, name: 'Taco Bell', rating: 4.4, reviewCount: 430, deliveryTime: 35, priceRange: '₹200-450', cuisine: ['Mexican'], image: '/tacobell.jpg', isOpen: false }
            ]);

            setNewRestaurants([
                { id: 9, name: 'Sushi Master', rating: 4.9, reviewCount: 120, deliveryTime: 45, priceRange: '₹500-1000', cuisine: ['Japanese', 'Sushi'], image: '/sushi.jpg', isOpen: true, isPromoted: true },
                { id: 10, name: 'Thai Spice', rating: 4.7, reviewCount: 89, deliveryTime: 40, priceRange: '₹300-700', cuisine: ['Thai'], image: '/thai.jpg', isOpen: true }
            ]);

            setOffers([
                { id: 1, title: 'Flat 50% OFF', description: 'On first order', code: 'FIRST50', validTill: 'Dec 31, 2024', image: '/offer1.jpg' },
                { id: 2, title: 'Free Delivery', description: 'On orders above ₹500', code: 'FREEDEL', validTill: 'Dec 31, 2024', image: '/offer2.jpg' },
                { id: 3, title: '₹100 Cashback', description: 'On orders above ₹400', code: 'CASH100', validTill: 'Dec 31, 2024', image: '/offer3.jpg' }
            ]);
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        console.log('Search:', query);
        // Navigate to search results
    };

    if (loading) {
        return <Loader fullScreen text="Loading delicious food for you..." />;
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Order food from your favorite restaurants
                    </h1>
                    <p className="hero-subtitle">
                        Get delicious food delivered to your doorstep in minutes
                    </p>
                    <div className="hero-search">
                        <SearchBar
                            placeholder="Search for restaurants, dishes..."
                            onSearch={handleSearch}
                            size="large"
                        />
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat">
                        <span className="stat-value">500+</span>
                        <span className="stat-label">Restaurants</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">10k+</span>
                        <span className="stat-label">Happy Customers</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">30 min</span>
                        <span className="stat-label">Avg Delivery</span>
                    </div>
                </div>
            </section>

            {/* Offers Section */}
            <section className="offers-section">
                <div className="section-header">
                    <h2 className="section-title">Exclusive Offers</h2>
                    <Link to="/offers" className="view-all">View All →</Link>
                </div>
                <div className="offers-grid">
                    {offers.map(offer => (
                        <div key={offer.id} className="offer-card">
                            <div className="offer-content">
                                <h3 className="offer-title">{offer.title}</h3>
                                <p className="offer-description">{offer.description}</p>
                                <div className="offer-code">{offer.code}</div>
                                <small className="offer-valid">Valid till {offer.validTill}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Restaurants */}
            <RestaurantHorizontalList
                title="Featured Restaurants"
                restaurants={featuredRestaurants}
                onViewAll={() => console.log('View all featured')}
            />

            {/* Popular Restaurants */}
            <section className="restaurants-section">
                <div className="section-header">
                    <h2 className="section-title">Popular Near You</h2>
                    <Link to="/restaurants" className="view-all">View All →</Link>
                </div>
                <div className="restaurants-grid">
                    {popularRestaurants.map(restaurant => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            </section>

            {/* App Promotion Banner */}
            <section className="app-banner">
                <div className="banner-content">
                    <div className="banner-text">
                        <h2 className="banner-title">Get the App</h2>
                        <p className="banner-subtitle">Order faster with exclusive app-only offers</p>
                        <div className="app-buttons">
                            <button className="app-btn">📱 App Store</button>
                            <button className="app-btn">🤖 Google Play</button>
                        </div>
                    </div>
                    <div className="banner-image">
                        <span className="phone-mockup">📱</span>
                    </div>
                </div>
            </section>

            {/* New Restaurants */}
            <RestaurantHorizontalList
                title="New in Town"
                restaurants={newRestaurants}
                onViewAll={() => console.log('View all new')}
            />

            {/* How it Works */}
            <section className="how-it-works">
                <h2 className="section-title center">How it Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-icon">🔍</div>
                        <h3 className="step-title">Search</h3>
                        <p className="step-description">Find your favorite restaurant or dish</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <div className="step-icon">🛒</div>
                        <h3 className="step-title">Order</h3>
                        <p className="step-description">Add items to cart and checkout</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step">
                        <div className="step-icon">🚚</div>
                        <h3 className="step-title">Enjoy</h3>
                        <p className="step-description">Get your food delivered hot & fresh</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials">
                <h2 className="section-title center">What Our Customers Say</h2>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"Amazing food and super fast delivery! Highly recommend!"</p>
                        <div className="testimonial-author">- John Doe</div>
                    </div>
                    <div className="testimonial-card">
                        <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"Best food delivery app in town. Great offers and variety."</p>
                        <div className="testimonial-author">- Jane Smith</div>
                    </div>
                    <div className="testimonial-card">
                        <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">"Quick delivery and the food was still hot. Excellent service!"</p>
                        <div className="testimonial-author">- Mike Johnson</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
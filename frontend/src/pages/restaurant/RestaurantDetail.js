import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import RestaurantInfo from '../../components/restaurant/RestaurantInfo';
import MenuItem, { MenuSection } from '../../components/restaurant/MenuItem';
import RestaurantReviews from '../../components/restaurant/RestaurantReviews';
import Button from '../../components/common/Button';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('menu');
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);

    const fetchRestaurantDetails = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockRestaurant = {
                id: parseInt(id),
                name: 'Pizza Hut',
                rating: 4.5,
                reviewCount: 1250,
                deliveryTime: 30,
                priceRange: '₹300-600',
                cuisine: ['Italian', 'Pizza', 'Fast Food'],
                image: '/pizza-hut.jpg',
                coverImage: '/pizza-hut-cover.jpg',
                logo: '/pizza-hut-logo.png',
                isOpen: true,
                address: '123 Main Street, Downtown, New York, NY 10001',
                phone: '+1 234 567 890',
                description: 'Pizza Hut is an American restaurant chain and international franchise founded in 1958. Known for its delicious pizzas, pasta, and wings. We use fresh ingredients and authentic recipes to bring you the best pizza experience.',
                dineIn: true,
                delivery: true,
                takeout: true,
                cardPayment: true,
                vegOptions: true,
                averageCost: 450,
                minOrder: 200,
                location: { lat: 40.7128, lng: -74.0060 }
            };

            const mockMenu = {
                'Recommended': [
                    { id: 1, name: 'Margherita Pizza', price: 250, originalPrice: 300, description: 'Fresh mozzarella, tomato sauce, and basil on a crispy crust', image: '/margherita.jpg', category: 'Pizza', isPopular: true, isVeg: true, rating: 4.8, ratingCount: 234, preparationTime: 20, calories: 800 },
                    { id: 2, name: 'Pepperoni Pizza', price: 350, originalPrice: 420, description: 'Classic pepperoni with mozzarella and tomato sauce', image: '/pepperoni.jpg', category: 'Pizza', isRecommended: true, isNonVeg: true, rating: 4.9, ratingCount: 189, preparationTime: 20, calories: 950 }
                ],
                'Pizzas': [
                    { id: 3, name: 'Farmhouse Pizza', price: 320, originalPrice: 380, description: 'Loaded with fresh vegetables - capsicum, onion, tomato, and corn', image: '/farmhouse.jpg', category: 'Pizza', isVeg: true, rating: 4.7, ratingCount: 156, preparationTime: 20, calories: 750 },
                    { id: 4, name: 'Chicken Dominator', price: 450, originalPrice: 520, description: 'Grilled chicken, pepperoni, chicken sausage with extra cheese', image: '/chicken-dominator.jpg', category: 'Pizza', isNonVeg: true, rating: 4.8, ratingCount: 203, preparationTime: 25, calories: 1100 }
                ],
                'Sides': [
                    { id: 5, name: 'Garlic Bread', price: 100, originalPrice: 120, description: 'Fresh baked bread with garlic butter', image: '/garlic-bread.jpg', category: 'Sides', isVeg: true, rating: 4.5, ratingCount: 345, preparationTime: 10, calories: 300, customizable: true, addons: [{ id: 1, name: 'Extra Cheese', price: 30 }, { id: 2, name: 'Jalapenos', price: 20 }] }
                ],
                'Beverages': [
                    { id: 6, name: 'Pepsi', price: 50, description: 'Chilled 500ml bottle', image: '/pepsi.jpg', category: 'Beverages', isVeg: true, rating: 4.3, ratingCount: 234, preparationTime: 2, calories: 210 }
                ]
            };

            setRestaurant(mockRestaurant);
            setMenu(mockMenu);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async (item) => {
        const cartItem = {
            ...item,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name
        };
        await addToCart(cartItem, 1);
    };

    const handleCustomize = (item) => {
        console.log('Customize item:', item);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleViewMenu = () => {
        setActiveTab('menu');
        document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleWriteReview = () => {
        setActiveTab('reviews');
    };

    if (isLoading) {
        return (
            <div className="restaurant-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading restaurant details...</p>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="restaurant-detail-error">
                <div className="error-icon">⚠️</div>
                <h3>Restaurant Not Found</h3>
                <p>We couldn't find the restaurant you're looking for.</p>
                <Button variant="primary" onClick={() => navigate('/restaurants')}>
                    Browse Restaurants
                </Button>
            </div>
        );
    }

    return (
        <div className="restaurant-detail-page">
            <RestaurantInfo
                restaurant={restaurant}
                onBack={handleBack}
                onViewMenu={handleViewMenu}
                onWriteReview={handleWriteReview}
            />

            <div className="restaurant-tabs">
                <button
                    className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                    onClick={() => setActiveTab('menu')}
                >
                    📋 Menu
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    ⭐ Reviews ({restaurant.reviewCount})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    ℹ️ Info
                </button>
            </div>

            <div className="restaurant-tab-content">
                {activeTab === 'menu' && (
                    <div id="menu-section" className="menu-container">
                        {Object.entries(menu).map(([sectionName, items]) => (
                            <MenuSection
                                key={sectionName}
                                title={sectionName}
                                items={items}
                                restaurantId={restaurant.id}
                                onAddToCart={handleAddToCart}
                                onCustomize={handleCustomize}
                            />
                        ))}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <RestaurantReviews
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                    />
                )}

                {activeTab === 'info' && (
                    <div className="info-tab">
                        <div className="info-card">
                            <h3>About {restaurant.name}</h3>
                            <p>{restaurant.description}</p>
                        </div>

                        <div className="info-card">
                            <h3>Operating Hours</h3>
                            <div className="hours-list">
                                <div className="hour-row">
                                    <span>Monday - Thursday</span>
                                    <span>10:00 AM - 10:00 PM</span>
                                </div>
                                <div className="hour-row">
                                    <span>Friday - Saturday</span>
                                    <span>10:00 AM - 11:00 PM</span>
                                </div>
                                <div className="hour-row">
                                    <span>Sunday</span>
                                    <span>11:00 AM - 9:00 PM</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>Contact Information</h3>
                            <p>📞 {restaurant.phone}</p>
                            <p>📍 {restaurant.address}</p>
                        </div>

                        <div className="info-card">
                            <h3>More Info</h3>
                            <ul className="info-list">
                                <li>✨ Minimum Order: ₹{restaurant.minOrder}</li>
                                <li>✨ Average Cost: ₹{restaurant.averageCost} for two</li>
                                <li>✨ GST and delivery charges may apply</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;
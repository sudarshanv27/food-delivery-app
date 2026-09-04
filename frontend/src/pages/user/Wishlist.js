import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import './Wishlist.css';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removeConfirm, setRemoveConfirm] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockWishlist = [
                {
                    id: 1,
                    name: 'Margherita Pizza',
                    restaurant: 'Pizza Hut',
                    restaurantId: 1,
                    price: 250,
                    originalPrice: 300,
                    discount: 17,
                    image: '/pizza.jpg',
                    rating: 4.5,
                    reviewCount: 128,
                    category: 'Pizza',
                    inStock: true,
                    deliveryTime: 30
                },
                {
                    id: 2,
                    name: 'McChicken Burger',
                    restaurant: "McDonald's",
                    restaurantId: 2,
                    price: 160,
                    originalPrice: 180,
                    discount: 11,
                    image: '/burger.jpg',
                    rating: 4.3,
                    reviewCount: 256,
                    category: 'Burger',
                    inStock: true,
                    deliveryTime: 25
                },
                {
                    id: 3,
                    name: 'Chicken Biryani',
                    restaurant: 'Biryani House',
                    restaurantId: 3,
                    price: 280,
                    originalPrice: 320,
                    discount: 12,
                    image: '/biryani.jpg',
                    rating: 4.7,
                    reviewCount: 89,
                    category: 'Biryani',
                    inStock: false,
                    deliveryTime: 40
                },
                {
                    id: 4,
                    name: 'Sushi Roll',
                    restaurant: 'Sushi Master',
                    restaurantId: 4,
                    price: 520,
                    originalPrice: 650,
                    discount: 20,
                    image: '/sushi.jpg',
                    rating: 4.8,
                    reviewCount: 45,
                    category: 'Japanese',
                    inStock: true,
                    deliveryTime: 45
                }
            ];
            setWishlistItems(mockWishlist);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (itemId) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setWishlistItems(prev => prev.filter(item => item.id !== itemId));
            setRemoveConfirm(null);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async (item) => {
        if (!item.inStock) {
            alert('This item is currently out of stock');
            return;
        }

        setAddingToCart(item.id);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            alert(`${item.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    const handleMoveToCart = async (item) => {
        await handleAddToCart(item);
        setWishlistItems(prev => prev.filter(i => i.id !== item.id));
    };

    const handleClearAll = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setWishlistItems([]);
            setRemoveConfirm(null);
        } catch (error) {
            console.error('Error clearing wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="wishlist-loading">
                <div className="loading-spinner"></div>
                <p>Loading your wishlist...</p>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-empty">
                <div className="empty-icon">❤️</div>
                <h3>Your Wishlist is Empty</h3>
                <p>Save your favorite items here and order them later!</p>
                <Link to="/restaurants">
                    <Button variant="primary">Browse Restaurants</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <h2>My Wishlist</h2>
                <button
                    className="clear-all-btn"
                    onClick={() => setRemoveConfirm({ clearAll: true })}
                >
                    Clear All
                </button>
            </div>

            <div className="wishlist-stats">
                <span className="stats-count">{wishlistItems.length} items in wishlist</span>
            </div>

            <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                    <div key={item.id} className="wishlist-card">
                        <div className="card-image">
                            <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                            {item.discount > 0 && (
                                <span className="discount-badge">{item.discount}% OFF</span>
                            )}
                            {!item.inStock && (
                                <span className="out-of-stock-badge">Out of Stock</span>
                            )}
                            <button
                                className="remove-btn"
                                onClick={() => setRemoveConfirm({ itemId: item.id, itemName: item.name })}
                                aria-label="Remove from wishlist"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="card-content">
                            <Link to={`/restaurant/${item.restaurantId}`} className="restaurant-name">
                                {item.restaurant}
                            </Link>
                            <h3 className="item-name">{item.name}</h3>

                            <div className="item-rating">
                                <RatingStars rating={item.rating} size="small" readonly />
                                <span className="review-count">({item.reviewCount})</span>
                            </div>

                            <div className="item-meta">
                                <span className="category">{item.category}</span>
                                <span className="delivery-time">⏱️ {item.deliveryTime} min</span>
                            </div>

                            <div className="item-price">
                                <span className="current-price">₹{item.price}</span>
                                {item.originalPrice > item.price && (
                                    <>
                                        <span className="original-price">₹{item.originalPrice}</span>
                                        <span className="saved-amount">Save ₹{item.originalPrice - item.price}</span>
                                    </>
                                )}
                            </div>

                            <div className="card-actions">
                                <Button
                                    variant="primary"
                                    size="small"
                                    fullWidth
                                    onClick={() => handleAddToCart(item)}
                                    isLoading={addingToCart === item.id}
                                    disabled={!item.inStock}
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    size="small"
                                    fullWidth
                                    onClick={() => handleMoveToCart(item)}
                                    disabled={!item.inStock}
                                >
                                    Move to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Remove Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={!!removeConfirm}
                onClose={() => setRemoveConfirm(null)}
                onConfirm={() => {
                    if (removeConfirm?.clearAll) {
                        handleClearAll();
                    } else if (removeConfirm?.itemId) {
                        handleRemoveFromWishlist(removeConfirm.itemId);
                    }
                }}
                title={removeConfirm?.clearAll ? "Clear Wishlist" : "Remove Item"}
                message={removeConfirm?.clearAll
                    ? "Are you sure you want to clear your entire wishlist? This action cannot be undone."
                    : `Are you sure you want to remove "${removeConfirm?.itemName}" from your wishlist?`
                }
                confirmText={removeConfirm?.clearAll ? "Clear All" : "Remove"}
                variant="danger"
            />
        </div>
    );
};

export default Wishlist;
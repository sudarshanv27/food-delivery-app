import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import RatingStars from '../common/RatingStars';
import ConfirmationDialog from '../common/ConfirmationDialog';
import './UserWishlist.css';

const UserWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [removeConfirm, setRemoveConfirm] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        setIsLoading(true);
        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));

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
                    inStock: true
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
                    inStock: true
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
                    inStock: false
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
                    inStock: true
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
            // Simulate API call
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
            // Simulate API call to add to cart
            await new Promise(resolve => setTimeout(resolve, 800));
            // Navigate to cart or show success message
            alert(`${item.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    const handleMoveToCart = async (item) => {
        await handleAddToCart(item);
        // After adding to cart, remove from wishlist
        setWishlistItems(prev => prev.filter(i => i.id !== item.id));
    };

    const handleClearAll = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setWishlistItems([]);
        } catch (error) {
            console.error('Error clearing wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && wishlistItems.length === 0) {
        return (
            <div className="wishlist-loading">
                <div className="spinner"></div>
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
        <div className="user-wishlist">
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

            <div className="wishlist-items">
                {wishlistItems.map((item) => (
                    <div key={item.id} className="wishlist-item">
                        <div className="item-image">
                            <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                            {item.discount > 0 && (
                                <span className="discount-badge">{item.discount}% OFF</span>
                            )}
                            {!item.inStock && (
                                <span className="out-of-stock-badge">Out of Stock</span>
                            )}
                        </div>

                        <div className="item-details">
                            <div className="item-header">
                                <div>
                                    <Link to={`/restaurant/${item.restaurantId}`} className="restaurant-name">
                                        {item.restaurant}
                                    </Link>
                                    <h3 className="item-name">{item.name}</h3>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => setRemoveConfirm({ itemId: item.id, itemName: item.name })}
                                    aria-label="Remove from wishlist"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="item-rating">
                                <RatingStars rating={item.rating} size="small" readonly />
                                <span className="review-count">({item.reviewCount} reviews)</span>
                            </div>

                            <div className="item-category">
                                <span className="category-tag">{item.category}</span>
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

                            <div className="item-actions">
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={() => handleAddToCart(item)}
                                    isLoading={addingToCart === item.id}
                                    disabled={!item.inStock}
                                >
                                    Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    size="small"
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
                isLoading={isLoading}
            />
        </div>
    );
};

export default UserWishlist;
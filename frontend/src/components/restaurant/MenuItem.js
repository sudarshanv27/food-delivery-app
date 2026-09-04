// src/components/restaurant/MenuItem.js
import React, { useState, useCallback, useMemo } from 'react';
import RatingStars from '../common/RatingStars';  // Changed from './RatingStars'
import Button from '../common/Button';            // Changed from './Button'
import './MenuItem.css';

const MenuItem = ({ item, onAddToCart, onCustomize, restaurantId, variant = 'default' }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    const isVegetarian = item.category?.toLowerCase().includes('veg') || item.isVeg;
    const isNonVegetarian = item.category?.toLowerCase().includes('non-veg') || item.isNonVeg;

    const calculateTotalPrice = useCallback(() => {
        const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        return (item.price + addonsTotal) * quantity;
    }, [item.price, selectedAddons, quantity]);

    const totalPrice = useMemo(() => calculateTotalPrice(), [calculateTotalPrice]);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            const cartItem = {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: quantity,
                image: item.image,
                restaurantId: restaurantId,
                restaurantName: item.restaurantName,
                addons: selectedAddons,
                specialInstructions: specialInstructions,
                totalPrice: totalPrice,
                isVeg: isVegetarian,
                preparationTime: item.preparationTime
            };
            await onAddToCart?.(cartItem);

            // Show success animation
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 1000);

            // Reset form after successful add
            setQuantity(1);
            setSelectedAddons([]);
            setSpecialInstructions('');
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuantityChange = useCallback((delta) => {
        setQuantity(prev => {
            const newQuantity = prev + delta;
            if (newQuantity >= 1 && newQuantity <= 99) {
                return newQuantity;
            }
            return prev;
        });
    }, []);

    const handleAddonToggle = useCallback((addon) => {
        setSelectedAddons(prev =>
            prev.some(a => a.id === addon.id)
                ? prev.filter(a => a.id !== addon.id)
                : [...prev, addon]
        );
    }, []);

    const getSavingAmount = () => {
        if (item.originalPrice > item.price) {
            return item.originalPrice - item.price;
        }
        return 0;
    };

    // Compact variant for cart sidebar
    if (variant === 'compact') {
        return (
            <div className="menu-item-compact">
                <div className="compact-image">
                    <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                    {isVegetarian && <span className="veg-badge-small">🟢</span>}
                    {isNonVegetarian && <span className="non-veg-badge-small">🔴</span>}
                </div>
                <div className="compact-info">
                    <h4 className="compact-name">{item.name}</h4>
                    <div className="compact-price">₹{item.price}</div>
                </div>
                <div className="compact-quantity">
                    <button className="qty-control" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>−</button>
                    <span className="qty-number">{quantity}</span>
                    <button className="qty-control" onClick={() => handleQuantityChange(1)} disabled={quantity >= 99}>+</button>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`menu-item ${showDetails ? 'expanded' : ''} ${item.isPopular ? 'popular' : ''} ${item.isRecommended ? 'recommended' : ''}`}>
            {/* Success Animation Overlay */}
            {showSuccessAnimation && (
                <div className="success-animation">
                    <span className="success-icon">✅</span>
                    <span>Added to Cart!</span>
                </div>
            )}

            <div className="item-container">
                {/* Image Section */}
                <div className="item-image-section">
                    <div className="image-wrapper">
                        <img
                            src={item.image || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="item-image"
                            loading="lazy"
                            onError={(e) => { e.target.src = '/placeholder-food.jpg'; }}
                        />
                        {item.discount > 0 && (
                            <span className="discount-badge">{item.discount}% OFF</span>
                        )}
                        {item.isPopular && <span className="popular-badge">🔥 Popular</span>}
                        {item.isRecommended && <span className="recommended-badge">⭐ Recommended</span>}
                        {item.isBestseller && <span className="bestseller-badge">🏆 Bestseller</span>}
                        {item.isNew && <span className="new-badge">🆕 New</span>}
                    </div>
                    <button
                        className="quick-view-btn"
                        onClick={() => setShowDetails(!showDetails)}
                        aria-label="Quick view"
                    >
                        👁️
                    </button>
                </div>

                {/* Info Section */}
                <div className="item-info-section">
                    <div className="item-header">
                        <div className="item-title">
                            {isVegetarian && <span className="veg-icon" title="Vegetarian">🟢</span>}
                            {isNonVegetarian && <span className="non-veg-icon" title="Non-Vegetarian">🔴</span>}
                            <h3 className="item-name">{item.name}</h3>
                        </div>
                        {item.rating > 0 && (
                            <div className="item-rating">
                                <RatingStars rating={item.rating} size="small" readonly />
                                <span className="rating-count">({item.ratingCount || 0})</span>
                            </div>
                        )}
                    </div>

                    <p className="item-description">{item.description}</p>

                    {/* Meta Information */}
                    <div className="item-meta">
                        {item.preparationTime && (
                            <span className="meta-badge prep-time">
                                <span className="meta-icon">⏱️</span>
                                {item.preparationTime} mins
                            </span>
                        )}
                        {item.calories && (
                            <span className="meta-badge calories">
                                <span className="meta-icon">🔥</span>
                                {item.calories} cal
                            </span>
                        )}
                        {item.servingSize && (
                            <span className="meta-badge serving">
                                <span className="meta-icon">🍽️</span>
                                Serves {item.servingSize}
                            </span>
                        )}
                        {item.spiceLevel && (
                            <span className="meta-badge spice">
                                <span className="meta-icon">🌶️</span>
                                {item.spiceLevel === 1 && 'Mild'}
                                {item.spiceLevel === 2 && 'Medium'}
                                {item.spiceLevel === 3 && 'Hot'}
                                {item.spiceLevel === 4 && 'Very Hot'}
                                {item.spiceLevel === 5 && 'Extra Hot'}
                            </span>
                        )}
                    </div>

                    {/* Price Section */}
                    <div className="item-price-section">
                        <div className="price-container">
                            {item.originalPrice > item.price ? (
                                <>
                                    <span className="current-price">₹{item.price}</span>
                                    <span className="original-price">₹{item.originalPrice}</span>
                                    <span className="saved-amount">Save ₹{getSavingAmount()}</span>
                                </>
                            ) : (
                                <span className="current-price">₹{item.price}</span>
                            )}
                        </div>

                        <div className="item-actions">
                            {item.customizable && (
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => onCustomize?.(item)}
                                    className="customize-btn"
                                >
                                    🎨 Customize
                                </Button>
                            )}
                            <div className="quantity-controls">
                                <button
                                    className="qty-btn minus"
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className="qty-value">{quantity}</span>
                                <button
                                    className="qty-btn plus"
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= 99}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                            <Button
                                variant="primary"
                                size="small"
                                onClick={handleAddToCart}
                                isLoading={isAdding}
                                className="add-to-cart-btn"
                            >
                                🛒 Add to Cart
                            </Button>
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {showDetails && (
                        <div className="item-details-expanded">
                            {/* Add-ons Section */}
                            {item.addons && item.addons.length > 0 && (
                                <div className="addons-section">
                                    <h4 className="section-title">✨ Add-ons (Optional)</h4>
                                    <div className="addons-grid">
                                        {item.addons.map(addon => (
                                            <label key={addon.id} className="addon-item">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAddons.some(a => a.id === addon.id)}
                                                    onChange={() => handleAddonToggle(addon)}
                                                />
                                                <span className="addon-name">{addon.name}</span>
                                                <span className="addon-price">+₹{addon.price}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Nutritional Info */}
                            {item.nutritionalInfo && (
                                <div className="nutritional-section">
                                    <h4 className="section-title">📊 Nutritional Information</h4>
                                    <div className="nutritional-grid">
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">Protein</span>
                                            <span className="nutrition-value">{item.nutritionalInfo.protein}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">Carbs</span>
                                            <span className="nutrition-value">{item.nutritionalInfo.carbs}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">Fat</span>
                                            <span className="nutrition-value">{item.nutritionalInfo.fat}g</span>
                                        </div>
                                        <div className="nutrition-item">
                                            <span className="nutrition-label">Fiber</span>
                                            <span className="nutrition-value">{item.nutritionalInfo.fiber}g</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Allergen Info */}
                            {item.allergens && item.allergens.length > 0 && (
                                <div className="allergens-section">
                                    <h4 className="section-title">⚠️ Allergens</h4>
                                    <div className="allergens-list">
                                        {item.allergens.map(allergen => (
                                            <span key={allergen} className="allergen-tag">{allergen}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Special Instructions */}
                            <div className="instructions-section">
                                <h4 className="section-title">📝 Special Instructions</h4>
                                <textarea
                                    className="instructions-input"
                                    placeholder="e.g., Less spicy, no onions, extra cheese, make it gluten-free..."
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    rows={2}
                                />
                            </div>

                            {/* Total Price Preview */}
                            {selectedAddons.length > 0 && (
                                <div className="total-preview">
                                    <span className="total-label">Total Price:</span>
                                    <strong className="total-amount">₹{totalPrice}</strong>
                                    <span className="total-breakdown">
                                        (₹{item.price} × {quantity} + ₹{selectedAddons.reduce((s, a) => s + a.price, 0)} add-ons)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Toggle Details Button */}
                    <button className="toggle-details-btn" onClick={() => setShowDetails(!showDetails)}>
                        <span className="toggle-icon">{showDetails ? '▲' : '▼'}</span>
                        <span>{showDetails ? 'Show less' : 'Show more'} details</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Menu Section Component
const MenuSection = ({ title, icon, items, restaurantId, onAddToCart, onCustomize }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="menu-section">
            <div className="section-header">
                {icon && <span className="section-icon">{icon}</span>}
                <h2 className="section-title">{title}</h2>
                <span className="section-count">{items.length} items</span>
            </div>
            <div className="menu-items-list">
                {items.map(item => (
                    <MenuItem
                        key={item.id}
                        item={item}
                        restaurantId={restaurantId}
                        onAddToCart={onAddToCart}
                        onCustomize={onCustomize}
                    />
                ))}
            </div>
        </div>
    );
};

// Category Filter Component
export const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <div className="category-filter">
            <button
                className={`category-btn ${!activeCategory ? 'active' : ''}`}
                onClick={() => onCategoryChange(null)}
            >
                All Items
            </button>
            {categories.map(category => (
                <button
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(category.id)}
                >
                    {category.icon && <span className="category-icon">{category.icon}</span>}
                    {category.name}
                    {category.count > 0 && <span className="category-count">{category.count}</span>}
                </button>
            ))}
        </div>
    );
};

export { MenuItem, MenuSection };
export default MenuItem;
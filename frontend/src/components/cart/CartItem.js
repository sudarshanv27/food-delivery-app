import React, { useState, useEffect } from 'react';
import './CartItem.css';

const CartItem = ({
    item,
    onUpdateQuantity,
    onRemove,
    onSaveForLater,
    onMoveToCart,
    onAddNote,
    onRemoveNote,
    onAddGift,
    isLoading = false
}) => {
    const [quantity, setQuantity] = useState(item.quantity);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [specialNote, setSpecialNote] = useState(item.specialInstructions || '');
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [showGiftOptions, setShowGiftOptions] = useState(false);
    const [isGift, setIsGift] = useState(item.isGift || false);
    const [showNutrition, setShowNutrition] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 1 || newQuantity > 99) return;
        if (isUpdating || isLoading) return;

        setIsUpdating(true);
        setQuantity(newQuantity);
        try {
            await onUpdateQuantity?.(item.id, newQuantity);
        } catch (error) {
            setQuantity(item.quantity);
            console.error('Error updating quantity:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleIncrement = () => handleQuantityChange(quantity + 1);
    const handleDecrement = () => handleQuantityChange(quantity - 1);

    const handleRemove = async () => {
        if (window.confirm('Remove this item from cart?')) {
            await onRemove?.(item.id);
        }
    };

    const handleSaveForLater = async () => {
        await onSaveForLater?.(item.id);
    };

    const handleMoveToCart = async () => {
        await onMoveToCart?.(item.id);
    };

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            if (specialNote.trim()) {
                await onAddNote?.(item.id, specialNote);
            } else if (item.specialInstructions) {
                await onRemoveNote?.(item.id);
            }
            setShowNoteInput(false);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleGiftToggle = async () => {
        setIsGift(!isGift);
        await onAddGift?.(item.id, !isGift);
    };

    const calculateItemTotal = () => {
        const itemPrice = item.discountPrice || item.price;
        const addonsTotal = item.addons?.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0) || 0;
        const customizationTotal = item.customizations?.reduce((sum, custom) => sum + (custom.price || 0), 0) || 0;
        const giftWrapCharge = isGift ? 20 : 0;
        return ((itemPrice + addonsTotal + customizationTotal) * quantity) + giftWrapCharge;
    };

    const calculateSavings = () => {
        if (item.discountPrice) {
            const originalTotal = item.price * quantity;
            const discountTotal = item.discountPrice * quantity;
            return originalTotal - discountTotal;
        }
        return 0;
    };

    const getNutritionalInfo = () => {
        return {
            calories: item.calories || 450,
            protein: item.protein || '15g',
            carbs: item.carbs || '45g',
            fat: item.fat || '12g'
        };
    };

    const total = calculateItemTotal();
    const savings = calculateSavings();
    const nutrition = getNutritionalInfo();

    return (
        <div className={`cart-item ${isExpanded ? 'expanded' : ''}`}>
            {/* Loading Overlay */}
            {(isUpdating || isLoading) && (
                <div className="cart-item-loading">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div className="cart-item-main">
                {/* Image Section */}
                <div className="cart-item-image">
                    <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                    {item.isVeg ? (
                        <span className="veg-badge" title="Vegetarian">🟢</span>
                    ) : (
                        <span className="non-veg-badge" title="Non-Vegetarian">🔴</span>
                    )}
                    {isGift && <span className="gift-badge">🎁</span>}
                </div>

                {/* Details Section */}
                <div className="cart-item-details">
                    <div className="item-header">
                        <div className="item-info">
                            <h3 className="item-name">{item.name}</h3>
                            <div className="item-meta">
                                <span className="restaurant-name">{item.restaurantName}</span>
                                {item.rating && (
                                    <span className="item-rating">⭐ {item.rating}</span>
                                )}
                            </div>
                        </div>
                        <div className="item-actions-top">
                            <button
                                className="expand-btn"
                                onClick={() => setIsExpanded(!isExpanded)}
                                title={isExpanded ? "Show less" : "Show more"}
                            >
                                {isExpanded ? '▲' : '▼'}
                            </button>
                            <button
                                className="remove-btn"
                                onClick={handleRemove}
                                aria-label="Remove item"
                                disabled={isUpdating || isLoading}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Price Row */}
                    <div className="price-row">
                        <div className="price-details">
                            {item.discountPrice ? (
                                <>
                                    <span className="current-price">₹{item.discountPrice}</span>
                                    <span className="original-price">₹{item.price}</span>
                                    <span className="discount-badge">
                                        -{Math.round(((item.price - item.discountPrice) / item.price) * 100)}%
                                    </span>
                                </>
                            ) : (
                                <span className="current-price">₹{item.price}</span>
                            )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="quantity-controls">
                            <button
                                className="qty-btn"
                                onClick={handleDecrement}
                                disabled={isUpdating || isLoading || quantity <= 1}
                            >
                                −
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                className="qty-btn"
                                onClick={handleIncrement}
                                disabled={isUpdating || isLoading || quantity >= 99}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Item Total */}
                    <div className="item-total-row">
                        <span className="total-label">Item Total:</span>
                        <span className="item-total">₹{total.toFixed(2)}</span>
                    </div>

                    {/* Savings Indicator */}
                    {savings > 0 && (
                        <div className="savings-indicator">
                            <span className="savings-icon">💰</span>
                            <span className="savings-text">You save ₹{savings.toFixed(2)} on this item!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="cart-item-expanded">
                    {/* Customizations */}
                    {item.customizations && item.customizations.length > 0 && (
                        <div className="item-customizations">
                            <div className="section-header">
                                <span className="section-icon">⚙️</span>
                                <span className="section-title">Customizations</span>
                            </div>
                            <ul className="customization-list">
                                {item.customizations.map((custom, index) => (
                                    <li key={index}>
                                        <span className="custom-name">{custom.name}:</span>
                                        <span className="custom-choice">{custom.choice}</span>
                                        {custom.price > 0 && (
                                            <span className="custom-price">+₹{custom.price}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Add-ons */}
                    {item.addons && item.addons.length > 0 && (
                        <div className="item-addons">
                            <div className="section-header">
                                <span className="section-icon">➕</span>
                                <span className="section-title">Add-ons</span>
                            </div>
                            <div className="addons-list">
                                {item.addons.map((addon, index) => (
                                    <div key={index} className="addon-item">
                                        <span className="addon-name">{addon.name}</span>
                                        <span className="addon-quantity">x{addon.quantity || 1}</span>
                                        <span className="addon-price">+₹{(addon.price * (addon.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Special Instructions */}
                    <div className="item-notes">
                        <div className="section-header">
                            <span className="section-icon">📝</span>
                            <span className="section-title">Special Instructions</span>
                            <button
                                className="add-note-btn"
                                onClick={() => setShowNoteInput(!showNoteInput)}
                                disabled={isSavingNote}
                            >
                                {item.specialInstructions ? 'Edit Note' : 'Add Note'}
                            </button>
                        </div>

                        {showNoteInput ? (
                            <div className="note-input-container">
                                <textarea
                                    className="note-input"
                                    value={specialNote}
                                    onChange={(e) => setSpecialNote(e.target.value)}
                                    placeholder="E.g., Less spicy, No onions, Extra cheese..."
                                    rows="2"
                                    maxLength="200"
                                />
                                <div className="note-actions">
                                    <span className="note-char-count">{specialNote.length}/200</span>
                                    <div>
                                        <button
                                            className="note-cancel-btn"
                                            onClick={() => {
                                                setShowNoteInput(false);
                                                setSpecialNote(item.specialInstructions || '');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="note-save-btn"
                                            onClick={handleSaveNote}
                                            disabled={isSavingNote}
                                        >
                                            {isSavingNote ? 'Saving...' : 'Save Note'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : item.specialInstructions && (
                            <div className="special-instructions">
                                <p className="instructions-text">"{item.specialInstructions}"</p>
                                <button
                                    className="remove-note-btn"
                                    onClick={() => {
                                        setSpecialNote('');
                                        handleSaveNote();
                                    }}
                                    title="Remove note"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gift Options */}
                    <div className="item-gift">
                        <div className="section-header">
                            <span className="section-icon">🎁</span>
                            <span className="section-title">Gift Options</span>
                        </div>
                        <label className="gift-checkbox">
                            <input
                                type="checkbox"
                                checked={isGift}
                                onChange={handleGiftToggle}
                                disabled={isLoading}
                            />
                            <span>Wrap as gift (+₹20)</span>
                        </label>
                        {isGift && (
                            <div className="gift-message-input">
                                <input
                                    type="text"
                                    placeholder="Add a gift message (optional)"
                                    maxLength="100"
                                    defaultValue={item.giftMessage}
                                />
                            </div>
                        )}
                    </div>

                    {/* Nutritional Information */}
                    {item.showNutrition && (
                        <div className="item-nutrition">
                            <div className="section-header">
                                <span className="section-icon">🥗</span>
                                <span className="section-title">Nutritional Information</span>
                                <button
                                    className="nutrition-toggle"
                                    onClick={() => setShowNutrition(!showNutrition)}
                                >
                                    {showNutrition ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {showNutrition && (
                                <div className="nutrition-grid">
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Calories</span>
                                        <span className="nutrition-value">{nutrition.calories}</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Protein</span>
                                        <span className="nutrition-value">{nutrition.protein}</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Carbs</span>
                                        <span className="nutrition-value">{nutrition.carbs}</span>
                                    </div>
                                    <div className="nutrition-item">
                                        <span className="nutrition-label">Fat</span>
                                        <span className="nutrition-value">{nutrition.fat}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="item-footer-actions">
                        {onSaveForLater && (
                            <button
                                className="save-for-later-btn"
                                onClick={handleSaveForLater}
                                disabled={isLoading}
                            >
                                💾 Save for Later
                            </button>
                        )}
                        {onMoveToCart && (
                            <button
                                className="move-to-cart-btn"
                                onClick={handleMoveToCart}
                                disabled={isLoading}
                            >
                                🛒 Move to Cart
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Saved Item Component (Enhanced)
export const SavedItem = ({ item, onMoveToCart, onRemove, onAddNote }) => {
    const [showNote, setShowNote] = useState(false);
    const [note, setNote] = useState(item.note || '');

    const handleSaveNote = async () => {
        await onAddNote?.(item.id, note);
        setShowNote(false);
    };

    return (
        <div className="saved-item">
            <div className="saved-item-image">
                <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                {item.isVeg ? (
                    <span className="veg-badge-small">🟢</span>
                ) : (
                    <span className="non-veg-badge-small">🔴</span>
                )}
            </div>
            <div className="saved-item-details">
                <h4 className="saved-item-name">{item.name}</h4>
                <p className="saved-item-restaurant">{item.restaurantName}</p>
                <div className="saved-item-price">
                    <span className="current-price">₹{item.discountPrice || item.price}</span>
                    {item.discountPrice && (
                        <span className="original-price">₹{item.price}</span>
                    )}
                </div>
                {item.note && (
                    <div className="saved-item-note">
                        <span className="note-icon">📝</span>
                        <span className="note-text">{item.note}</span>
                    </div>
                )}
            </div>
            <div className="saved-item-actions">
                {onAddNote && (
                    <button
                        className="add-note-btn-small"
                        onClick={() => setShowNote(!showNote)}
                        title="Add note"
                    >
                        📝
                    </button>
                )}
                <button
                    className="move-to-cart-btn"
                    onClick={() => onMoveToCart?.(item.id)}
                >
                    Move to Cart
                </button>
                <button
                    className="remove-saved-btn"
                    onClick={() => onRemove?.(item.id)}
                    aria-label="Remove item"
                >
                    ✕
                </button>
            </div>

            {showNote && (
                <div className="saved-item-note-input">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note for this item..."
                        rows="2"
                    />
                    <div className="note-input-actions">
                        <button onClick={() => setShowNote(false)}>Cancel</button>
                        <button onClick={handleSaveNote}>Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Cart Summary Component
export const CartSummary = ({ items, deliveryFee, taxRate = 0.05, onCheckout }) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    return (
        <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-details">
                <div className="summary-row">
                    <span>Subtotal ({items.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                    <span>Tax ({taxRate * 100}%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </div>
            <button className="checkout-btn" onClick={onCheckout}>
                Proceed to Checkout
            </button>
        </div>
    );
};

export default CartItem;
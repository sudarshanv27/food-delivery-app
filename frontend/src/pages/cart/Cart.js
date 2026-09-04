import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem, { SavedItem } from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import Button from '../../components/common/Button';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, loading, removeItem, updateQuantity, clearCart, addToCart } = useCart();
    const [savedItems, setSavedItems] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Load saved items from localStorage
        const saved = localStorage.getItem('savedForLater');
        if (saved) {
            setSavedItems(JSON.parse(saved));
        }
    }, []);

    const handleUpdateQuantity = async (itemId, quantity) => {
        await updateQuantity(itemId, quantity);
    };

    const handleRemoveItem = async (itemId) => {
        await removeItem(itemId);
    };

    const handleSaveForLater = async (item) => {
        await removeItem(item.id);
        const updatedSaved = [...savedItems, item];
        setSavedItems(updatedSaved);
        localStorage.setItem('savedForLater', JSON.stringify(updatedSaved));
    };

    const handleMoveToCart = async (savedItem) => {
        await addToCart(savedItem, savedItem.quantity);
        const updatedSaved = savedItems.filter(item => item.id !== savedItem.id);
        setSavedItems(updatedSaved);
        localStorage.setItem('savedForLater', JSON.stringify(updatedSaved));
    };

    const handleRemoveSaved = async (savedItemId) => {
        const updatedSaved = savedItems.filter(item => item.id !== savedItemId);
        setSavedItems(updatedSaved);
        localStorage.setItem('savedForLater', JSON.stringify(updatedSaved));
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your entire cart?')) {
            await clearCart();
        }
    };

    const handleCheckout = () => {
        setIsProcessing(true);
        // Simulate checkout process
        setTimeout(() => {
            navigate('/checkout');
            setIsProcessing(false);
        }, 500);
    };

    const handleContinueShopping = () => {
        navigate('/restaurants');
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            const itemPrice = item.discountPrice || item.price;
            const addonsTotal = item.addons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
            return sum + (itemPrice + addonsTotal) * item.quantity;
        }, 0);
    };

    if (loading) {
        return (
            <div className="cart-loading">
                <div className="loading-spinner"></div>
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (cartItems.length === 0 && savedItems.length === 0) {
        return (
            <div className="cart-empty">
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <Button variant="primary" onClick={handleContinueShopping}>
                    Start Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Shopping Cart</h1>
                {cartItems.length > 0 && (
                    <button className="clear-cart-btn" onClick={handleClearCart}>
                        Clear Cart
                    </button>
                )}
            </div>

            <div className="cart-container">
                <div className="cart-items-section">
                    {cartItems.length > 0 ? (
                        <>
                            <div className="cart-items-list">
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemove={handleRemoveItem}
                                        onSaveForLater={handleSaveForLater}
                                    />
                                ))}
                            </div>

                            {/* Delivery Slot Selection */}
                            <div className="delivery-slot">
                                <h3>Delivery Slot</h3>
                                <div className="slot-options">
                                    <label className="slot-option">
                                        <input type="radio" name="slot" defaultChecked />
                                        <div>
                                            <span className="slot-time">ASAP</span>
                                            <span className="slot-estimate">Est. 25-35 min</span>
                                        </div>
                                    </label>
                                    <label className="slot-option">
                                        <input type="radio" name="slot" />
                                        <div>
                                            <span className="slot-time">6:00 PM - 6:30 PM</span>
                                            <span className="slot-estimate">Schedule for later</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="special-instructions-cart">
                                <h3>Special Instructions (Optional)</h3>
                                <textarea
                                    placeholder="Any special requests for the restaurant? (e.g., less spicy, no onions, extra sauce)"
                                    rows={3}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="empty-cart-message">
                            <p>Your cart is empty. Add some items to get started!</p>
                            <Button variant="primary" onClick={handleContinueShopping}>
                                Browse Restaurants
                            </Button>
                        </div>
                    )}

                    {/* Saved for Later Section */}
                    {savedItems.length > 0 && (
                        <div className="saved-items-section">
                            <h3>Saved for Later ({savedItems.length})</h3>
                            <div className="saved-items-list">
                                {savedItems.map((item) => (
                                    <SavedItem
                                        key={item.id}
                                        item={item}
                                        onMoveToCart={handleMoveToCart}
                                        onRemove={handleRemoveSaved}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="cart-summary-section">
                    <CartSummary
                        cart={{ items: cartItems }}
                        onCheckout={handleCheckout}
                    />
                </div>
            </div>

            {/* Continue Shopping Button */}
            <div className="continue-shopping">
                <Link to="/restaurants" className="continue-link">
                    ← Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default Cart;
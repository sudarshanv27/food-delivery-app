// web-app/src/context/CartContext.js

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
} from 'react';

import { cartAPI } from '../services/api';

// ================= CREATE CONTEXT =================
const CartContext = createContext();

// ================= CUSTOM HOOK =================
export const useCart = () => useContext(CartContext);

// ================= PROVIDER =================
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // ================= FETCH CART =================
    const fetchCart = async () => {
        try {
            const response = await cartAPI.getCart();

            setCartItems(response.data.cart || []);
            setSubtotal(response.data.subtotal || 0);
        } catch (error) {
            console.error(
                'Error fetching cart:',
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // ================= LOAD CART =================
    useEffect(() => {
        fetchCart();
    }, []);

    // ================= ADD TO CART =================
    const addToCart = async (item) => {
        try {
            await cartAPI.addToCart(item);

            await fetchCart();

            return {
                success: true,
                message: 'Item added to cart',
            };
        } catch (error) {
            console.error(
                'Add to cart error:',
                error.response?.data || error.message
            );

            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    'Failed to add item',
            };
        }
    };

    // ================= REMOVE ITEM =================
    const removeItem = async (cartId) => {
        try {
            await cartAPI.removeItem(cartId);

            await fetchCart();
        } catch (error) {
            console.error(
                'Remove item error:',
                error.response?.data || error.message
            );
        }
    };

    // ================= CLEAR CART =================
    const clearCart = async () => {
        try {
            await cartAPI.clearCart();

            setCartItems([]);
            setSubtotal(0);
        } catch (error) {
            console.error(
                'Clear cart error:',
                error.response?.data || error.message
            );
        }
    };

    // ================= GET ITEM COUNT =================
    const getItemCount = () => {
        return cartItems.reduce(
            (count, item) => count + Number(item.quantity || 0),
            0
        );
    };

    // ================= CONTEXT VALUE =================
    const value = {
        cartItems,
        subtotal,
        loading,
        fetchCart,
        addToCart,
        removeItem,
        clearCart,
        getItemCount,
    };

    // ================= RETURN =================
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
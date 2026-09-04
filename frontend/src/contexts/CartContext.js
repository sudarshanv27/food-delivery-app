// frontend/src/context/CartContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// ================= CREATE CONTEXT =================
const CartContext = createContext();

// ================= CUSTOM HOOK =================
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// ================= PROVIDER =================
export const CartProvider = ({ children }) => {
  // ================= STATES =================
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // ================= AUTH =================
  const { user, isAuthenticated } = useAuth();

  // ================= UPDATE TOTALS =================
  const updateTotals = useCallback((items) => {
    const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    setTotalAmount(total);
    setItemCount(count);
  }, []);

  // ================= LOAD CART =================
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCartItems([]);
      updateTotals([]);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');

      if (response.data.success) {
        const items = response.data.cart || response.data.data || [];
        setCartItems(items);
        updateTotals(items);
      } else {
        setCartItems([]);
        updateTotals([]);
      }
    } catch (error) {
      console.error('Fetch Cart Error:', error);

      // Try to load from localStorage as fallback
      const savedCart = localStorage.getItem('offlineCart');
      if (savedCart) {
        try {
          const offlineItems = JSON.parse(savedCart);
          setCartItems(offlineItems);
          updateTotals(offlineItems);
          toast.error('Using offline cart. Please check your connection.');
        } catch (e) {
          setCartItems([]);
          updateTotals([]);
        }
      } else {
        setCartItems([]);
        updateTotals([]);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [isAuthenticated, user, updateTotals]);

  // ================= SAVE TO LOCALSTORAGE (OFFLINE SUPPORT) =================
  const saveToLocalStorage = useCallback((items) => {
    localStorage.setItem('offlineCart', JSON.stringify(items));
  }, []);

  // ================= LOAD CART ON AUTH CHANGE =================
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ================= SAVE TO LOCALSTORAGE WHEN CART CHANGES =================
  useEffect(() => {
    if (!loading && initialized) {
      saveToLocalStorage(cartItems);
    }
  }, [cartItems, loading, initialized, saveToLocalStorage]);

  // ================= ADD TO CART =================
  const addToCart = async (item, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', { ...item, quantity });

      if (response.data.success) {
        await fetchCart();
        toast.success(`${item.name} added to cart!`);
        return { success: true, message: 'Item added to cart' };
      }

      const errorMsg = response.data.message || 'Failed to add item';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } catch (error) {
      console.error('Add To Cart Error:', error);

      // Offline support - add to local cart
      const existingItemIndex = cartItems.findIndex(i => i.id === item.id);
      let newCart;

      if (existingItemIndex >= 0) {
        newCart = [...cartItems];
        newCart[existingItemIndex].quantity += quantity;
      } else {
        newCart = [...cartItems, { ...item, quantity, cart_id: Date.now() }];
      }

      setCartItems(newCart);
      updateTotals(newCart);
      toast.warning('Added offline. Will sync when online.');
      return { success: true, message: 'Item added offline' };
    }
  };

  // ================= REMOVE ITEM =================
  const removeItem = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      setCartItems(prev => prev.filter(item => item.cart_id !== cartId && item.id !== cartId));
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      console.error('Remove Cart Item Error:', error);

      // Offline support
      setCartItems(prev => prev.filter(item => item.cart_id !== cartId && item.id !== cartId));
      toast.warning('Removed offline. Will sync when online.');
      return { success: true };
    }
  };

  // ================= UPDATE QUANTITY =================
  const updateQuantity = async (cartId, quantity) => {
    if (quantity <= 0) {
      return await removeItem(cartId);
    }

    setUpdatingItemId(cartId);

    try {
      await api.put(`/cart/${cartId}`, { quantity });

      setCartItems(prev => prev.map(item =>
        (item.cart_id === cartId || item.id === cartId)
          ? { ...item, quantity }
          : item
      ));

      return { success: true };
    } catch (error) {
      console.error('Update Quantity Error:', error);

      // Optimistic update even if API fails
      setCartItems(prev => prev.map(item =>
        (item.cart_id === cartId || item.id === cartId)
          ? { ...item, quantity }
          : item
      ));

      toast.warning('Quantity updated offline. Will sync when online.');
      return { success: true };
    } finally {
      setUpdatingItemId(null);
    }
  };

  // ================= CLEAR CART =================
  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
      updateTotals([]);
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      console.error('Clear Cart Error:', error);

      // Offline support
      setCartItems([]);
      updateTotals([]);
      toast.warning('Cart cleared offline. Will sync when online.');
      return { success: true };
    }
  };

  // ================= SYNC OFFLINE CART =================
  const syncOfflineCart = useCallback(async () => {
    const savedCart = localStorage.getItem('offlineCart');
    if (!savedCart || !isAuthenticated) return;

    try {
      const offlineItems = JSON.parse(savedCart);
      if (offlineItems.length > 0) {
        for (const item of offlineItems) {
          await api.post('/cart/add', item);
        }
        localStorage.removeItem('offlineCart');
        await fetchCart();
        toast.success('Offline cart synced successfully!');
      }
    } catch (error) {
      console.error('Sync offline cart error:', error);
    }
  }, [isAuthenticated, fetchCart]);

  // ================= SYNC WHEN COMING ONLINE =================
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated) {
        syncOfflineCart();
        fetchCart();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isAuthenticated, syncOfflineCart, fetchCart]);

  // ================= TOTAL PRICE =================
  const getCartTotal = useCallback(() => {
    return totalAmount;
  }, [totalAmount]);

  // ================= ITEM COUNT =================
  const getItemCount = useCallback(() => {
    return itemCount;
  }, [itemCount]);

  // ================= CHECK ITEM IN CART =================
  const isInCart = useCallback((itemId) => {
    return cartItems.some(item => item.id === itemId || item.item_id === itemId);
  }, [cartItems]);

  // ================= GET ITEM QUANTITY =================
  const getItemQuantity = useCallback((itemId) => {
    const item = cartItems.find(i => i.id === itemId || i.item_id === itemId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // ================= MERGE CARTS (for guest to logged-in) =================
  const mergeCarts = useCallback(async (guestCart) => {
    if (!guestCart || guestCart.length === 0) return;

    try {
      for (const item of guestCart) {
        await api.post('/cart/add', item);
      }
      await fetchCart();
      localStorage.removeItem('guestCart');
      toast.success('Cart merged successfully!');
    } catch (error) {
      console.error('Merge cart error:', error);
    }
  }, [fetchCart]);

  // ================= CONTEXT VALUE =================
  const value = {
    cartItems,
    loading,
    initialized,
    totalAmount,
    itemCount,
    updatingItemId,
    fetchCart,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    isInCart,
    getItemQuantity,
    mergeCarts,
    syncOfflineCart,
  };

  // ================= RETURN =================
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
// src/hooks/useRestaurantLive.js
import { useEffect, useState, useCallback } from 'react';
import useRestaurant from './useRestaurant';
import useSocket from './useSocket';
import useAuth from './useAuth';
import toast from 'react-hot-toast';

/**
 * Hook for real-time restaurant updates
 */
export const useRestaurantLive = (restaurantId) => {
    const {
        getRestaurantById,
        fetchMenu,
        fetchReviews,
        addReview: addReviewAPI
    } = useRestaurant();
    const { isConnected, subscribeToRestaurantUpdates, SOCKET_EVENTS } = useSocket();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [outOfStockItems, setOutOfStockItems] = useState(new Set());

    // Load initial data
    useEffect(() => {
        if (restaurantId) {
            const loadData = async () => {
                setLoading(true);
                const restaurantData = await getRestaurantById(restaurantId);
                const menuData = await fetchMenu(restaurantId);
                const reviewsData = await fetchReviews(restaurantId);

                setRestaurant(restaurantData);
                setMenu(menuData);
                setReviews(reviewsData?.reviews || []);
                setIsOpen(restaurantData?.status === 'open');
                setLoading(false);
            };
            loadData();
        }
    }, [restaurantId, getRestaurantById, fetchMenu, fetchReviews]);

    // Set up real-time subscriptions
    useEffect(() => {
        if (isConnected && restaurantId) {
            const unsubscribe = subscribeToRestaurantUpdates(restaurantId, {
                onMenuUpdate: (data) => {
                    console.log('Menu updated:', data);
                    fetchMenu(restaurantId).then(setMenu);
                    toast.info('Menu has been updated');
                },
                onStatusChange: (data) => {
                    setIsOpen(data.status === 'open');
                    toast.info(`Restaurant is now ${data.status}`);
                    getRestaurantById(restaurantId).then(setRestaurant);
                },
                onNewReview: (data) => {
                    setReviews(prev => [data.review, ...prev]);
                    toast.success(`New ${data.rating}-star review!`);
                    getRestaurantById(restaurantId).then(setRestaurant);
                }
            });

            return () => unsubscribe();
        }
    }, [restaurantId, isConnected, subscribeToRestaurantUpdates, fetchMenu, getRestaurantById]);

    const checkItemAvailability = useCallback((itemId) => {
        return !outOfStockItems.has(itemId);
    }, [outOfStockItems]);

    const addReview = useCallback(async (rating, comment, images = []) => {
        if (!user) {
            toast.error('Please login to leave a review');
            return null;
        }

        try {
            const review = await addReviewAPI(restaurantId, rating, comment, images);
            setReviews(prev => [review, ...prev]);
            return review;
        } catch (error) {
            console.error('Error adding review:', error);
            return null;
        }
    }, [restaurantId, user, addReviewAPI]);

    return {
        restaurant,
        menu,
        reviews,
        isOpen,
        loading,
        isConnected,
        outOfStockItems: Array.from(outOfStockItems),
        checkItemAvailability,
        addReview,
        refreshMenu: () => fetchMenu(restaurantId).then(setMenu),
        refreshRestaurant: () => getRestaurantById(restaurantId).then(setRestaurant)
    };
};
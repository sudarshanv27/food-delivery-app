import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const RestaurantContext = createContext();

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};

export const RestaurantProvider = ({ children }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [currentRestaurant, setCurrentRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRestaurants, setTotalRestaurants] = useState(0);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchRestaurants = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await api.get('/restaurants', { params });
            const newRestaurants = response.data.restaurants;
            setRestaurants(prev => params.page === 1 ? newRestaurants : [...prev, ...newRestaurants]);
            setTotalRestaurants(response.data.total);
            setHasMore(newRestaurants.length === 10);
            setPage(params.page || 1);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    }, []);

    const getRestaurantById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/restaurants/${id}`);
            setCurrentRestaurant(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            toast.error('Failed to load restaurant details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMenu = useCallback(async (restaurantId, category = null) => {
        setLoading(true);
        try {
            const params = category ? { category } : {};
            const response = await api.get(`/restaurants/${restaurantId}/menu`, { params });
            setMenu(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching menu:', error);
            toast.error('Failed to load menu');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const searchRestaurants = useCallback(async (query, filters = {}) => {
        setLoading(true);
        try {
            const response = await api.get('/restaurants/search', { params: { q: query, ...filters } });
            setRestaurants(response.data.restaurants);
            setTotalRestaurants(response.data.total);
            return response.data;
        } catch (error) {
            console.error('Error searching restaurants:', error);
            toast.error('Search failed');
            return { restaurants: [], total: 0 };
        } finally {
            setLoading(false);
        }
    }, []);

    const addToFavorites = useCallback(async (restaurantId) => {
        try {
            await api.post(`/restaurants/${restaurantId}/favorite`);
            setFavorites(prev => [...prev, restaurantId]);
            toast.success('Added to favorites');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            toast.error('Failed to add to favorites');
        }
    }, []);

    const removeFromFavorites = useCallback(async (restaurantId) => {
        try {
            await api.delete(`/restaurants/${restaurantId}/favorite`);
            setFavorites(prev => prev.filter(id => id !== restaurantId));
            toast.success('Removed from favorites');
        } catch (error) {
            console.error('Error removing from favorites:', error);
            toast.error('Failed to remove from favorites');
        }
    }, []);

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/restaurants/favorites');
            setFavorites(response.data.map(r => r.id));
            return response.data;
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReviews = useCallback(async (restaurantId, pageNum = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/restaurants/${restaurantId}/reviews`, { params: { page: pageNum } });
            setReviews(prev => pageNum === 1 ? response.data.reviews : [...prev, ...response.data.reviews]);
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return { reviews: [], total: 0 };
        } finally {
            setLoading(false);
        }
    }, []);

    const addReview = useCallback(async (restaurantId, rating, comment, images = []) => {
        setLoading(true);
        try {
            const response = await api.post(`/restaurants/${restaurantId}/reviews`, { rating, comment, images });
            toast.success('Review submitted successfully!');
            return response.data;
        } catch (error) {
            console.error('Error adding review:', error);
            toast.error('Failed to submit review');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        restaurants,
        currentRestaurant,
        menu,
        loading,
        totalRestaurants,
        favorites,
        reviews,
        page,
        hasMore,
        fetchRestaurants,
        getRestaurantById,
        fetchMenu,
        searchRestaurants,
        addToFavorites,
        removeFromFavorites,
        fetchFavorites,
        fetchReviews,
        addReview
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
};

export default RestaurantContext;
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchOrders = useCallback(async (pageNum = 1, status = 'all') => {
        setLoading(true);
        try {
            const response = await api.get('/orders', { params: { page: pageNum, status } });
            const newOrders = response.data.orders;
            setOrders(prev => pageNum === 1 ? newOrders : [...prev, ...newOrders]);
            setTotalOrders(response.data.total);
            setHasMore(newOrders.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrderById = useCallback(async (orderId) => {
        setLoading(true);
        try {
            const response = await api.get(`/orders/${orderId}`);
            setCurrentOrder(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = useCallback(async (orderData) => {
        setLoading(true);
        try {
            const response = await api.post('/orders', orderData);
            toast.success('Order placed successfully!');
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId, reason) => {
        setLoading(true);
        try {
            const response = await api.put(`/orders/${orderId}/cancel`, { reason });
            toast.success('Order cancelled successfully');
            return response.data;
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const reorder = useCallback(async (orderId) => {
        setLoading(true);
        try {
            const response = await api.post(`/orders/${orderId}/reorder`);
            toast.success('Items added to cart');
            return response.data;
        } catch (error) {
            console.error('Error reordering:', error);
            toast.error('Failed to reorder');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const trackOrder = useCallback(async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/track`);
            return response.data;
        } catch (error) {
            console.error('Error tracking order:', error);
            return null;
        }
    }, []);

    const rateOrder = useCallback(async (orderId, rating, review) => {
        setLoading(true);
        try {
            const response = await api.post(`/orders/${orderId}/rate`, { rating, review });
            toast.success('Thank you for your feedback!');
            return response.data;
        } catch (error) {
            console.error('Error rating order:', error);
            toast.error('Failed to submit rating');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = {
        orders,
        currentOrder,
        loading,
        totalOrders,
        page,
        hasMore,
        fetchOrders,
        getOrderById,
        createOrder,
        cancelOrder,
        reorder,
        trackOrder,
        rateOrder
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderContext;
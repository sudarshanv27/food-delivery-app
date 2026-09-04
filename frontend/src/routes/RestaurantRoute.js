import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';

/**
 * Restaurant Route Component - Protects routes that require restaurant owner privileges
 * Accessible by users with 'restaurant_owner' or 'admin' role
 */
const RestaurantRoute = () => {
    const { isAuthenticated, user, loading, isRestaurantOwner, isAdmin } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return <Loader fullScreen text="Checking restaurant access..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has restaurant owner privileges
    if (!isRestaurantOwner() && !isAdmin()) {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'delivery_partner') {
            return <Navigate to="/delivery-panel" replace />;
        }
        if (user?.role === 'user') {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// Sub-route protection for specific restaurant sections
export const RestaurantOrdersRoute = () => {
    const { isRestaurantOwner, isAdmin } = useAuth();
    const location = useLocation();

    if (!isRestaurantOwner() && !isAdmin()) {
        return <Navigate to="/restaurant-panel/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const RestaurantMenuRoute = () => {
    const { isRestaurantOwner, isAdmin } = useAuth();
    const location = useLocation();

    if (!isRestaurantOwner() && !isAdmin()) {
        return <Navigate to="/restaurant-panel/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const RestaurantAnalyticsRoute = () => {
    const { isRestaurantOwner, isAdmin } = useAuth();
    const location = useLocation();

    if (!isRestaurantOwner() && !isAdmin()) {
        return <Navigate to="/restaurant-panel/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const RestaurantSettingsRoute = () => {
    const { isRestaurantOwner, isAdmin } = useAuth();
    const location = useLocation();

    if (!isRestaurantOwner() && !isAdmin()) {
        return <Navigate to="/restaurant-panel/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RestaurantRoute;
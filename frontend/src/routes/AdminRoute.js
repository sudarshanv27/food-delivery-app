import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';

/**
 * Admin Route Component - Protects routes that require admin privileges
 * Only accessible by users with 'admin' role
 */
const AdminRoute = () => {
    const { isAuthenticated, user, loading, isAdmin } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return <Loader fullScreen text="Checking admin access..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to home if not admin
    if (!isAdmin()) {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'restaurant_owner') {
            return <Navigate to="/restaurant-panel" replace />;
        }
        if (user?.role === 'delivery_partner') {
            return <Navigate to="/delivery-panel" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

// Sub-route protection for specific admin sections
export const AdminUsersRoute = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin()) {
        return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const AdminRestaurantsRoute = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin()) {
        return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const AdminOrdersRoute = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin()) {
        return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export const AdminReportsRoute = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin()) {
        return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
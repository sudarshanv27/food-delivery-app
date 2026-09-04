import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';

/**
 * Private Route Component - Protects routes that require authentication
 * @param {Object} props - Component props
 * @param {Array} props.allowedRoles - Array of allowed roles for the route
 * @param {React.Component} props.fallback - Component to show while checking auth
 */
const PrivateRoute = ({ allowedRoles = [], fallback = null }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return fallback || <Loader fullScreen text="Checking authentication..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && user) {
        const hasAllowedRole = allowedRoles.includes(user.role);

        // For admin, allow all access
        if (user.role === 'admin') {
            return <Outlet />;
        }

        // Check if user has any of the allowed roles
        if (!hasAllowedRole) {
            // Redirect to appropriate dashboard based on role
            if (user.role === 'restaurant_owner') {
                return <Navigate to="/restaurant-panel" replace />;
            }
            if (user.role === 'delivery_partner') {
                return <Navigate to="/delivery-panel" replace />;
            }
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

// Specific role-based private routes
export const CustomerRoute = () => (
    <PrivateRoute allowedRoles={['user', 'admin']} />
);

export const RestaurantOwnerRoute = () => (
    <PrivateRoute allowedRoles={['restaurant_owner', 'admin']} />
);

export const DeliveryPartnerRoute = () => (
    <PrivateRoute allowedRoles={['delivery_partner', 'admin']} />
);

export const AdminOnlyRoute = () => (
    <PrivateRoute allowedRoles={['admin']} />
);

export default PrivateRoute;
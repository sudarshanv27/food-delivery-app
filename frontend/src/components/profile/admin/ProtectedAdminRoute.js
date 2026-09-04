// src/components/profile/admin/ProtectedAdminRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProtectedAdminRoute = ({ children, requiredPermissions = [], requireSuperAdmin = false }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const location = useLocation();

    useEffect(() => {
        verifyAdminAccess();
    }, [location.pathname]);

    const verifyAdminAccess = async () => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');

        // Basic token validation
        if (!token) {
            setIsAuthorized(false);
            setLoading(false);
            return;
        }

        try {
            // Verify token with backend
            const response = await axios.get('/api/auth/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = response.data.user;
            setUserData(user);

            // Check if user is admin
            if (user.role !== 'admin' && userRole !== 'admin') {
                setIsAuthorized(false);
                toast.error('Access denied. Admin privileges required.');
                return;
            }

            // Check super admin requirement
            if (requireSuperAdmin && user.admin_level !== 'super_admin') {
                setIsAuthorized(false);
                toast.error('Access denied. Super admin privileges required.');
                return;
            }

            // Check specific permissions
            if (requiredPermissions.length > 0) {
                const hasAllPermissions = requiredPermissions.every(permission =>
                    userPermissions.includes(permission) || user.permissions?.includes(permission)
                );

                if (!hasAllPermissions) {
                    setIsAuthorized(false);
                    toast.error(`Missing required permissions: ${requiredPermissions.join(', ')}`);
                    return;
                }
            }

            // Check if account is active
            if (!user.is_active) {
                setIsAuthorized(false);
                toast.error('Your admin account has been deactivated. Please contact support.');
                localStorage.clear();
                return;
            }

            // Check session expiry
            const lastActivity = localStorage.getItem('lastActivity');
            const sessionTimeout = 30 * 60 * 1000; // 30 minutes

            if (lastActivity && Date.now() - parseInt(lastActivity) > sessionTimeout) {
                setIsAuthorized(false);
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                return;
            }

            // Update last activity
            localStorage.setItem('lastActivity', Date.now().toString());
            setIsAuthorized(true);

        } catch (error) {
            console.error('Admin verification error:', error);

            // Fallback to localStorage validation if backend is unavailable
            const userRole = localStorage.getItem('userRole');
            const token = localStorage.getItem('token');

            if (token && userRole === 'admin') {
                // Basic validation for demo mode
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                toast.error('Authentication failed. Please login again.');
                localStorage.clear();
            }
        } finally {
            setLoading(false);
        }
    };

    // Track user activity
    useEffect(() => {
        const updateActivity = () => {
            if (isAuthorized) {
                localStorage.setItem('lastActivity', Date.now().toString());
            }
        };

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keypress', updateActivity);
        window.addEventListener('click', updateActivity);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keypress', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, [isAuthorized]);

    if (loading) {
        return (
            <div className="admin-route-loading">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        // Redirect to login with return URL
        return <Navigate to="/login" state={{ from: location.pathname, message: 'Admin access required' }} replace />;
    }

    // Wrap children with admin context provider
    return (
        <AdminContext.Provider value={{ userData, requiredPermissions, isSuperAdmin: userData?.admin_level === 'super_admin' }}>
            {children}
        </AdminContext.Provider>
    );
};

// Admin Context for sharing admin data across components
export const AdminContext = React.createContext(null);

// Custom hook to use admin context
export const useAdminContext = () => {
    const context = React.useContext(AdminContext);
    if (!context) {
        throw new Error('useAdminContext must be used within ProtectedAdminRoute');
    }
    return context;
};

// Higher-order component for protecting admin routes
export const withAdminProtection = (WrappedComponent, options = {}) => {
    return function AdminProtectedComponent(props) {
        return (
            <ProtectedAdminRoute {...options}>
                <WrappedComponent {...props} />
            </ProtectedAdminRoute>
        );
    };
};

// Permission check helper
export const hasPermission = (permission, userPermissions = []) => {
    const permissions = userPermissions.length > 0
        ? userPermissions
        : JSON.parse(localStorage.getItem('userPermissions') || '[]');
    return permissions.includes(permission) || permissions.includes('*');
};

// Role check helper
export const isAdmin = () => {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    return !!(token && userRole === 'admin');
};

// Super admin check helper
export const isSuperAdmin = () => {
    const adminLevel = localStorage.getItem('adminLevel');
    return adminLevel === 'super_admin';
};

// Logout helper
export const adminLogout = () => {
    const permissionsToClear = [
        'token', 'userRole', 'userPermissions', 'adminLevel',
        'lastActivity', 'adminData', 'sessionId'
    ];
    permissionsToClear.forEach(item => localStorage.removeItem(item));

    // Optional: Call logout API
    axios.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).catch(console.error);

    window.location.href = '/login';
};

export default ProtectedAdminRoute;
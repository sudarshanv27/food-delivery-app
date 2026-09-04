import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import RestaurantRoute from './RestaurantRoute';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPassword from '../components/auth/ResetPassword';

// User Pages
import Profile from '../pages/user/Profile';
import Orders from '../pages/user/Orders';
import OrderDetail from '../pages/user/OrderDetail';
import Wishlist from '../pages/user/Wishlist';
import Settings from '../pages/user/Settings';

// Restaurant Pages
import RestaurantListing from '../pages/restaurant/RestaurantListing';
import RestaurantDetail from '../pages/restaurant/RestaurantDetail';

// Cart Pages
import Cart from '../pages/cart/Cart';
import Checkout from '../pages/cart/Checkout';
import Payment from '../pages/cart/Payment';
import OrderConfirmation from '../pages/cart/OrderConfirmation';

// Delivery Pages
import Tracking from '../pages/delivery/Tracking';
import DeliveryPartnerPanel from '../pages/delivery/DeliveryPartnerPanel';

// Admin Pages
import AdminDashboard from '../pages/Adminn/AdminDashboard';
import AdminUsers from '../pages/Adminn/AdminUsers';
import AdminRestaurants from '../pages/Adminn/AdminRestaurants';
import AdminOrders from '../pages/Adminn/AdminOrders';
import AdminDeliveryManagement from '../pages/Adminn/AdminDeliveryManagement';
import AdminReports from '../pages/Adminn/AdminReports';
import AdminSettings from '../pages/Adminn/AdminSettings';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/restaurants" element={<RestaurantListing />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected User Routes */}
            <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/tracking/:id" element={<Tracking />} />
            </Route>

            {/* Restaurant Owner Routes */}
            <Route element={<RestaurantRoute />}>
                <Route path="/restaurant-panel/*" element={<AdminDashboard />} />
            </Route>

            {/* Delivery Partner Routes */}
            <Route element={<PrivateRoute allowedRoles={['delivery_partner']} />}>
                <Route path="/delivery-panel/*" element={<DeliveryPartnerPanel />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/restaurants" element={<AdminRestaurants />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/delivery" element={<AdminDeliveryManagement />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
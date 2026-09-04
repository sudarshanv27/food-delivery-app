// frontend/src/App.js (with Code Splitting)

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { RestaurantProvider } from './contexts/RestaurantContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout Components (not lazy loaded as they're needed immediately)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileFooter from './components/layout/MobileFooter';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Orders = lazy(() => import('./pages/user/Orders'));
const OrderDetail = lazy(() => import('./pages/user/OrderDetail'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const Settings = lazy(() => import('./pages/user/Settings'));
const RestaurantListing = lazy(() => import('./pages/restaurant/RestaurantListing'));
const RestaurantDetail = lazy(() => import('./pages/restaurant/RestaurantDetail'));
const Cart = lazy(() => import('./pages/cart/Cart'));
const Checkout = lazy(() => import('./pages/cart/Checkout'));
const Payment = lazy(() => import('./pages/cart/Payment'));
const OrderConfirmation = lazy(() => import('./pages/cart/OrderConfirmation'));
const Tracking = lazy(() => import('./pages/delivery/Tracking'));
const DeliveryPartnerPanel = lazy(() => import('./pages/delivery/DeliveryPartnerPanel'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Route Guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Hooks
import useAuth from './hooks/useAuth';
import useTheme from './hooks/useTheme';

// Styles
import './App.css';

// Loading Component
const PageLoader = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading page...</p>
            </div>
        </div>
    );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('App Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center p-8">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Scroll to top component
const ScrollToTop = () => {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// App content with route configuration
function AppContent() {
    const location = useLocation();
    const { isAuthenticated, user, loading } = useAuth();
    const { isDarkMode } = useTheme();

    // Determine if we should show navigation
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname);
    const isDeliveryRoute = location.pathname.startsWith('/delivery-panel');
    const shouldShowNav = !isAdminRoute && !isAuthRoute && !isDeliveryRoute;

    // Loading state while checking authentication
    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            {/* Toast Notifications Container */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName="toast-container"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                        border: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />

            {/* Navigation */}
            {shouldShowNav && <Navbar />}

            {/* Main Content with Suspense for lazy loading */}
            <main className={`main-content ${isAdminRoute ? 'admin-main' : ''}`}>
                <Suspense fallback={<PageLoader />}>
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
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
                            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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

                            {/* Delivery Partner Routes */}
                            <Route element={<PrivateRoute allowedRoles={['delivery_partner']} />}>
                                <Route path="/delivery-panel" element={<DeliveryPartnerPanel />} />
                            </Route>

                            {/* Admin Routes */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin/*" element={<AdminDashboard />} />
                            </Route>

                            {/* 404 Not Found Route */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </AnimatePresence>
                </Suspense>
            </main>

            {/* Footer */}
            {shouldShowNav && <Footer />}
            {shouldShowNav && <MobileFooter />}
        </div>
    );
}

// 404 Not Found Component
const NotFoundPage = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="text-center p-8">
                <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Page Not Found
                </h2>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Go Back Home
                </a>
            </div>
        </div>
    );
};

// Main App component with all providers in correct order
function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <OrderProvider>
                            <RestaurantProvider>
                                <SocketProvider>
                                    <BrowserRouter>
                                        <ScrollToTop />
                                        <AppContent />
                                    </BrowserRouter>
                                </SocketProvider>
                            </RestaurantProvider>
                        </OrderProvider>
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
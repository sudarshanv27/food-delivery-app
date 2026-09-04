// src/components/index.js
// Export user profile components
export {
    UserProfileInfo,
    UserAddressBook,
    UserOrderHistory,
    UserPaymentMethods,
    UserPreferences,
    UserWishlist,
    UserReviews,
    UserNotifications
} from './profile';

// Export admin components
export {
    AdminDashboard,
    AdminUserManagement,
    AdminRestaurantManagement,
    AdminOrderManagement,
    AdminDeliveryManagement,
    AdminAnalytics,
    AdminReports,
    AdminSettings,
    AdminOffersManagement
} from './profile/admin';

// Export common components
export { default as CartItem } from './cart/CartItem';
export { default as Footer } from './Footer';
export { default as Loader } from './Loader';
export { default as MenuCard } from './MenuCard';
export { default as Navbar } from './Navbar';
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as RestaurantCard } from './restaurant/RestaurantCard';
export { default as SearchBar } from './SearchBar';
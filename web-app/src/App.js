// web-app/src/App.js

import React from 'react';

import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom';

import Home from './pages/Home';
import TrackingPage from './pages/TrackingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantDetail from './pages/RestaurantDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

import { CartProvider } from './context/CartContext';

import './styles/App.css';

// ================= COMPONENT =================
const App = () => {
    return (
        <Router>
            <CartProvider>
                <div className="app">
                    <Routes>

                        {/* ================= HOME PAGE ================= */}
                        <Route
                            path="/"
                            element={<Home />}
                        />

                        {/* ================= RESTAURANT DETAIL PAGE ================= */}
                        <Route
                            path="/restaurant/:id"
                            element={<RestaurantDetail />}
                        />

                        {/* ================= CART PAGE ================= */}
                        <Route
                            path="/cart"
                            element={<CartPage />}
                        />

                        {/* ================= CHECKOUT PAGE ================= */}
                        <Route
                            path="/checkout"
                            element={<CheckoutPage />}
                        />

                        {/* ================= TRACKING PAGE ================= */}
                        <Route
                            path="/tracking/:orderId"
                            element={<TrackingPage />}
                        />

                        {/* ================= LOGIN PAGE ================= */}
                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        {/* ================= SIGNUP PAGE ================= */}
                        <Route
                            path="/signup"
                            element={<Signup />}
                        />

                    </Routes>
                </div>
            </CartProvider>
        </Router>
    );
};

export default App;
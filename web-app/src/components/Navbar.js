// web-app/src/components/Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext';

// ================= NAVBAR COMPONENT =================
const Navbar = () => {
    const { getItemCount } = useCart();

    const itemCount = getItemCount();

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* ================= LOGO ================= */}
                <Link
                    to="/"
                    className="logo"
                >
                    🍕 FoodieDash
                </Link>

                {/* ================= NAV LINKS ================= */}
                <div className="nav-links">
                    <Link to="/">Home</Link>

                    <Link to="/orders">
                        My Orders
                    </Link>

                    <Link
                        to="/cart"
                        className="cart-icon"
                    >
                        🛒 Cart

                        {itemCount > 0 && (
                            <span className="cart-count">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
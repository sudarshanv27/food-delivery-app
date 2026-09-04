// web-app/src/pages/RestaurantDetail.js

import React, {
    useState,
    useEffect,
} from 'react';

import {
    useParams,
    useLocation,
} from 'react-router-dom';

import { motion } from 'framer-motion';

import toast from 'react-hot-toast';

import Navbar from '../components/Navbar';

import { restaurantAPI } from '../services/api';

import { useCart } from '../context/CartContext';

// ================= COMPONENT =================
const RestaurantDetail = () => {
    const { id } = useParams();

    const location = useLocation();

    const { addToCart } =
        useCart();

    // ================= STATES =================
    const [restaurant, setRestaurant] =
        useState(null);

    const [menu, setMenu] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedCategory, setSelectedCategory] =
        useState('all');

    const [quantities, setQuantities] =
        useState({});

    // ================= FETCH DATA =================
    useEffect(() => {
        if (
            location.state?.restaurant
        ) {
            setRestaurant(
                location.state.restaurant
            );

            loadDemoMenu();
        } else {
            fetchRestaurantDetails();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ================= FETCH RESTAURANT =================
    const fetchRestaurantDetails =
        async () => {
            try {
                const response =
                    await restaurantAPI.getById(
                        id
                    );

                setRestaurant(
                    response.data.restaurant
                );

                setMenu(
                    response.data.menu || []
                );

            } catch (error) {
                console.error(
                    'Restaurant fetch error:',
                    error
                );

                toast.error(
                    'Using demo menu data'
                );

                loadDemoRestaurant();
                loadDemoMenu();

            } finally {
                setLoading(false);
            }
        };

    // ================= DEMO RESTAURANT =================
    const loadDemoRestaurant = () => {
        setRestaurant({
            restaurant_id: id,
            name: 'Pizza Paradise',
            description:
                'Best pizzas and fast food in town',
            avg_rating: 4.5,
            delivery_fee: 29,
            estimated_delivery_time: 30,
            min_order_amount: 200,
            logo_url:
                'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200',
        });
    };

    // ================= DEMO MENU =================
    const loadDemoMenu = () => {
        const demoMenu = [
            {
                id: '101',
                name: 'Margherita Pizza',
                price: 299,
                description:
                    'Fresh mozzarella, tomato sauce, basil',
                category: 'Pizza',
                isVeg: true,
            },
            {
                id: '102',
                name: 'Pepperoni Pizza',
                price: 399,
                description:
                    'Spicy pepperoni, mozzarella cheese',
                category: 'Pizza',
                isVeg: false,
            },
            {
                id: '103',
                name: 'Garlic Bread',
                price: 99,
                description:
                    'Toasted garlic bread',
                category: 'Sides',
                isVeg: true,
            },
            {
                id: '104',
                name: 'French Fries',
                price: 89,
                description:
                    'Crispy golden fries',
                category: 'Sides',
                isVeg: true,
            },
            {
                id: '105',
                name: 'Farmhouse Pizza',
                price: 449,
                description:
                    'Loaded with veggies and cheese',
                category: 'Pizza',
                isVeg: true,
            },
        ];

        setMenu(demoMenu);
    };

    // ================= UPDATE QUANTITY =================
    const updateQuantity = (
        itemId,
        delta
    ) => {
        setQuantities((prev) => ({
            ...prev,
            [itemId]: Math.max(
                0,
                (prev[itemId] || 0) + delta
            ),
        }));
    };

    // ================= ADD TO CART =================
    const handleAddToCart =
        async (item) => {
            const quantity =
                quantities[item.id] || 1;

            if (quantity <= 0) {
                toast.error(
                    'Select quantity first'
                );
                return;
            }

            const cartItem = {
                restaurant_id:
                    restaurant.restaurant_id,

                item_id: item.id,

                item_name: item.name,

                price: item.price,

                quantity,

                special_instructions: '',
            };

            try {
                const result =
                    await addToCart(
                        cartItem
                    );

                if (result.success) {
                    toast.success(
                        `${quantity} x ${item.name} added`
                    );

                    setQuantities(
                        (prev) => ({
                            ...prev,
                            [item.id]: 0,
                        })
                    );
                } else {
                    toast.error(
                        result.error ||
                        'Failed to add item'
                    );
                }

            } catch (error) {
                console.error(error);

                toast.error(
                    'Error adding item'
                );
            }
        };

    // ================= FILTERS =================
    const categories = [
        'all',
        ...new Set(
            menu.map(
                (item) =>
                    item.category
            )
        ),
    ];

    const filteredMenu =
        selectedCategory === 'all'
            ? menu
            : menu.filter(
                (item) =>
                    item.category ===
                    selectedCategory
            );

    // ================= LOADING =================
    if (loading) {
        return (
            <>
                <Navbar />

                <div className="loading">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    // ================= RETURN =================
    return (
        <>
            <Navbar />

            <div className="restaurant-detail">

                {/* ================= HEADER ================= */}
                <div className="restaurant-header">
                    <img
                        src={
                            restaurant?.logo_url
                        }
                        alt={
                            restaurant?.name
                        }
                        className="restaurant-cover"
                    />

                    <div className="restaurant-info-overlay">
                        <h1>
                            {restaurant?.name}
                        </h1>

                        <p>
                            {restaurant?.description}
                        </p>

                        <div className="restaurant-meta">
                            <span>
                                ⭐{' '}
                                {restaurant?.avg_rating ||
                                    'NEW'}
                            </span>

                            <span>
                                🚚 ₹
                                {restaurant?.delivery_fee}
                            </span>

                            <span>
                                ⏱️{' '}
                                {restaurant?.estimated_delivery_time}{' '}
                                min
                            </span>

                            <span>
                                💰 Min ₹
                                {restaurant?.min_order_amount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ================= CATEGORIES ================= */}
                <div className="categories-section">
                    {categories.map(
                        (cat) => (
                            <button
                                key={cat}
                                className={`category-chip ${selectedCategory === cat
                                    ? 'active'
                                    : ''
                                    }`}
                                onClick={() =>
                                    setSelectedCategory(
                                        cat
                                    )
                                }
                            >
                                {cat
                                    .charAt(0)
                                    .toUpperCase() +
                                    cat.slice(1)}
                            </button>
                        )
                    )}
                </div>

                {/* ================= MENU ================= */}
                <div className="menu-section">
                    <h2>Menu</h2>

                    <div className="menu-items">
                        {filteredMenu.map(
                            (
                                item,
                                idx
                            ) => (
                                <motion.div
                                    key={
                                        item.id
                                    }
                                    className="menu-item"
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        delay:
                                            idx *
                                            0.05,
                                    }}
                                >
                                    <div className="menu-item-info">
                                        <h3>
                                            {
                                                item.name
                                            }

                                            {item.isVeg && (
                                                <span className="veg-badge">
                                                    🌱
                                                    Veg
                                                </span>
                                            )}
                                        </h3>

                                        <p className="menu-item-desc">
                                            {
                                                item.description
                                            }
                                        </p>

                                        <p className="menu-item-price">
                                            ₹
                                            {
                                                item.price
                                            }
                                        </p>
                                    </div>

                                    <div className="menu-item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        -1
                                                    )
                                                }
                                            >
                                                -
                                            </button>

                                            <span>
                                                {quantities[
                                                    item.id
                                                ] ||
                                                    0}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id,
                                                        1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() =>
                                                handleAddToCart(
                                                    item
                                                )
                                            }
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* ================= STYLES ================= */}
            <style>{`
                .restaurant-detail {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .restaurant-header {
                    position: relative;
                    height: 320px;
                    overflow: hidden;
                }

                .restaurant-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .restaurant-info-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 2rem;
                    color: white;
                    background: linear-gradient(
                        transparent,
                        rgba(0,0,0,0.8)
                    );
                }

                .restaurant-meta {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-top: 1rem;
                }

                .categories-section {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    padding: 1.5rem 2rem;
                }

                .category-chip {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 30px;
                    background: #f1f2f6;
                    cursor: pointer;
                    font-weight: 600;
                }

                .category-chip.active {
                    background: #ff4757;
                    color: white;
                }

                .menu-section {
                    padding: 2rem;
                }

                .menu-items {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .menu-item {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    background: white;
                    padding: 1rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }

                .menu-item-info {
                    flex: 1;
                }

                .menu-item-desc {
                    color: #666;
                    margin: 0.5rem 0;
                }

                .menu-item-price {
                    color: #ff4757;
                    font-size: 1.2rem;
                    font-weight: bold;
                }

                .veg-badge {
                    margin-left: 10px;
                    font-size: 12px;
                    color: #2ed573;
                }

                .menu-item-actions {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 10px;
                }

                .quantity-control {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .quantity-control button {
                    width: 30px;
                    height: 30px;
                    border: none;
                    border-radius: 50%;
                    background: #ff4757;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }

                .add-to-cart-btn {
                    padding: 10px 18px;
                    border: none;
                    border-radius: 25px;
                    background: #ff4757;
                    color: white;
                    cursor: pointer;
                    font-weight: bold;
                }

                @media (max-width: 768px) {
                    .menu-item {
                        flex-direction: column;
                    }

                    .restaurant-header {
                        height: 250px;
                    }
                }
            `}</style>
        </>
    );
};

export default RestaurantDetail;
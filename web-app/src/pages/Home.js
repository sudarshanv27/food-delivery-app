// web-app/src/pages/Home.js

import React, {
    useState,
    useEffect,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import toast from 'react-hot-toast';

import { restaurantAPI } from '../services/api';

import RestaurantCard from '../components/RestaurantCard';
import Navbar from '../components/Navbar';

// ================= COMPONENT =================
const Home = () => {
    const navigate = useNavigate();

    // ================= STATES =================
    const [restaurants, setRestaurants] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [error, setError] =
        useState(null);

    // ================= DEMO DATA =================
    const loadDemoData = () => {
        const demoRestaurants = [
            {
                restaurant_id: '1',
                name: 'Pizza Paradise',
                cuisine_types:
                    'Italian, Pizza',
                avg_rating: 4.5,
                delivery_fee: 29,
                min_order_amount: 200,
                estimated_delivery_time: 30,
                is_open: true,
                logo_url:
                    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500',
                description:
                    'Authentic Italian pizza',
            },
            {
                restaurant_id: '2',
                name: 'Burger Hub',
                cuisine_types:
                    'American, Burgers',
                avg_rating: 4.3,
                delivery_fee: 19,
                min_order_amount: 150,
                estimated_delivery_time: 25,
                is_open: true,
                logo_url:
                    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
                description:
                    'Juicy burgers made fresh',
            },
            {
                restaurant_id: '3',
                name: 'Sushi Master',
                cuisine_types:
                    'Japanese, Sushi',
                avg_rating: 4.7,
                delivery_fee: 39,
                min_order_amount: 300,
                estimated_delivery_time: 40,
                is_open: true,
                logo_url:
                    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
                description:
                    'Fresh sushi and sashimi',
            },
            {
                restaurant_id: '4',
                name: 'South Indian Delight',
                cuisine_types:
                    'South Indian, Vegetarian',
                avg_rating: 4.6,
                delivery_fee: 25,
                min_order_amount: 120,
                estimated_delivery_time: 20,
                is_open: true,
                logo_url:
                    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
                description:
                    'Authentic South Indian meals',
            },
        ];

        setRestaurants(
            demoRestaurants
        );
    };

    // ================= FETCH RESTAURANTS =================
    const fetchRestaurants =
        async () => {
            setLoading(true);

            setError(null);

            try {
                const response =
                    await restaurantAPI.getAll();

                console.log(
                    'Restaurant API Response:',
                    response.data
                );

                if (
                    response.data.success &&
                    response.data.restaurants
                ) {
                    setRestaurants(
                        response.data
                            .restaurants
                    );
                } else {
                    loadDemoData();
                }
            } catch (error) {
                console.error(
                    'Error fetching restaurants:',
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                    error.message
                );

                toast.error(
                    'Failed to load restaurants. Using demo data.'
                );

                loadDemoData();
            } finally {
                setLoading(false);
            }
        };

    // ================= USE EFFECT =================
    useEffect(() => {
        fetchRestaurants();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ================= CLICK HANDLER =================
    const handleRestaurantClick = (
        restaurant
    ) => {
        navigate(
            `/restaurant/${restaurant.restaurant_id}`,
            {
                state: {
                    restaurant,
                },
            }
        );
    };

    // ================= FILTER =================
    const filteredRestaurants =
        restaurants.filter(
            (restaurant) => {
                const search =
                    searchTerm.toLowerCase();

                return (
                    restaurant.name
                        ?.toLowerCase()
                        .includes(search) ||
                    restaurant.cuisine_types
                        ?.toLowerCase()
                        .includes(search)
                );
            }
        );

    // ================= LOADING =================
    if (loading) {
        return (
            <>
                <Navbar />

                <div className="loading">
                    <div className="spinner"></div>

                    <p
                        style={{
                            marginTop:
                                '1rem',
                        }}
                    >
                        Loading delicious restaurants...
                    </p>
                </div>
            </>
        );
    }

    // ================= RETURN =================
    return (
        <>
            <Navbar />

            {/* ================= HERO ================= */}
            <section className="hero-section">
                <motion.h1
                    initial={{
                        opacity: 0,
                        y: -50,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                >
                    🍕 Delicious Food
                    Delivered to Your
                    Doorstep
                </motion.h1>

                <motion.p
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        delay: 0.3,
                    }}
                >
                    Order from the best
                    restaurants near you
                </motion.p>

                {/* ================= SEARCH ================= */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 40,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.5,
                    }}
                    style={{
                        marginTop: '2rem',
                    }}
                >
                    <input
                        type="text"
                        placeholder="🔍 Search restaurants..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        style={{
                            width: '400px',
                            maxWidth: '90%',
                            padding:
                                '14px 24px',
                            border: 'none',
                            borderRadius:
                                '50px',
                            fontSize:
                                '16px',
                            outline:
                                'none',
                            boxShadow:
                                '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                    />
                </motion.div>
            </section>

            {/* ================= ERROR ================= */}
            {error && (
                <div
                    style={{
                        textAlign:
                            'center',
                        padding: '1rem',
                        margin:
                            '1rem auto',
                        background:
                            '#fff3cd',
                        color:
                            '#856404',
                        borderRadius:
                            '8px',
                        maxWidth:
                            '600px',
                    }}
                >
                    ⚠️ {error} — Using
                    demo restaurant data
                </div>
            )}

            {/* ================= RESTAURANTS ================= */}
            <section className="restaurants-grid">
                {filteredRestaurants.map(
                    (
                        restaurant,
                        index
                    ) => (
                        <motion.div
                            key={
                                restaurant.restaurant_id
                            }
                            initial={{
                                opacity: 0,
                                y: 50,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay:
                                    index *
                                    0.08,
                            }}
                        >
                            <RestaurantCard
                                restaurant={
                                    restaurant
                                }
                                onClick={
                                    handleRestaurantClick
                                }
                            />
                        </motion.div>
                    )
                )}
            </section>

            {/* ================= EMPTY ================= */}
            {filteredRestaurants.length ===
                0 && (
                    <div
                        style={{
                            textAlign:
                                'center',
                            padding:
                                '4rem',
                        }}
                    >
                        <h2>
                            🍽️ No restaurants
                            found
                        </h2>

                        <p>
                            Try searching for
                            another cuisine
                        </p>

                        <button
                            onClick={() =>
                                setSearchTerm(
                                    ''
                                )
                            }
                            style={{
                                marginTop:
                                    '1rem',
                                padding:
                                    '10px 24px',
                                background:
                                    '#ff4757',
                                color:
                                    '#fff',
                                border:
                                    'none',
                                borderRadius:
                                    '30px',
                                cursor:
                                    'pointer',
                                fontWeight:
                                    '600',
                            }}
                        >
                            Clear Search
                        </button>
                    </div>
                )}
        </>
    );
};

export default Home;
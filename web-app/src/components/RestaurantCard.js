// web-app/src/components/RestaurantCard.js

import React from 'react';

import { motion } from 'framer-motion';

// ================= COMPONENT =================
const RestaurantCard = ({
    restaurant,
    onClick,
}) => {
    return (
        <motion.div
            className="restaurant-card"
            onClick={() =>
                onClick(restaurant)
            }
            whileHover={{
                scale: 1.03,
            }}
            whileTap={{
                scale: 0.98,
            }}
        >
            {/* ================= IMAGE ================= */}
            <img
                src={
                    restaurant.logo_url ||
                    'https://via.placeholder.com/300x200?text=Restaurant'
                }
                alt={restaurant.name}
                className="restaurant-image"
                onError={(e) => {
                    e.target.src =
                        'https://via.placeholder.com/300x200?text=Food+Delivery';
                }}
            />

            {/* ================= INFO ================= */}
            <div className="restaurant-info">
                <h3 className="restaurant-name">
                    {restaurant.name}
                </h3>

                <p className="restaurant-cuisine">
                    {restaurant.cuisine_types ||
                        'Multi Cuisine'}
                </p>

                {/* ================= DETAILS ================= */}
                <div className="restaurant-details">
                    <span className="rating">
                        ⭐{' '}
                        {restaurant.avg_rating ||
                            'NEW'}
                    </span>

                    <span className="delivery-time">
                        ⏱️{' '}
                        {restaurant.estimated_delivery_time ||
                            30}{' '}
                        min
                    </span>

                    <span className="delivery-fee">
                        🚚 ₹
                        {restaurant.delivery_fee ||
                            29}
                    </span>
                </div>

                {/* ================= FOOTER ================= */}
                <div
                    className="restaurant-footer"
                    style={{
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        alignItems:
                            'center',
                        marginTop: '1rem',
                    }}
                >
                    <span
                        className="min-order"
                        style={{
                            fontSize:
                                '14px',
                            color: '#666',
                        }}
                    >
                        Min ₹
                        {restaurant.min_order_amount ||
                            99}
                    </span>

                    {restaurant.is_open ? (
                        <span
                            className="open-badge"
                            style={{
                                background:
                                    '#2ed573',
                                color:
                                    '#fff',
                                padding:
                                    '4px 10px',
                                borderRadius:
                                    '20px',
                                fontSize:
                                    '12px',
                                fontWeight:
                                    '600',
                            }}
                        >
                            Open
                        </span>
                    ) : (
                        <span
                            className="closed-badge"
                            style={{
                                background:
                                    '#ff4757',
                                color:
                                    '#fff',
                                padding:
                                    '4px 10px',
                                borderRadius:
                                    '20px',
                                fontSize:
                                    '12px',
                                fontWeight:
                                    '600',
                            }}
                        >
                            Closed
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default RestaurantCard;
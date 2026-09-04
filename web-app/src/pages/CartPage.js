import React from 'react';

import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import { useCart } from '../context/CartContext';

// ================= COMPONENT =================
const CartPage = () => {
    const navigate = useNavigate();

    const {
        cartItems,
        subtotal,
        removeItem,
        clearCart,
    } = useCart();

    // ================= TOTALS =================
    const deliveryFee = 40;

    const tax = Math.round(
        subtotal * 0.05
    );

    const total =
        subtotal +
        deliveryFee +
        tax;

    // ================= EMPTY CART =================
    if (!cartItems.length) {
        return (
            <>
                <Navbar />

                <div
                    style={{
                        textAlign: 'center',
                        padding: '5rem',
                    }}
                >
                    <h1>
                        🛒 Your Cart is Empty
                    </h1>

                    <p
                        style={{
                            marginTop: '1rem',
                        }}
                    >
                        Add delicious food
                        to continue
                    </p>

                    <button
                        className="btn btn-primary"
                        style={{
                            marginTop: '2rem',
                        }}
                        onClick={() =>
                            navigate('/')
                        }
                    >
                        Browse Restaurants
                    </button>
                </div>
            </>
        );
    }

    // ================= RETURN =================
    return (
        <>
            <Navbar />

            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem',
                }}
            >
                <h1
                    style={{
                        marginBottom: '2rem',
                    }}
                >
                    🛒 Your Cart
                </h1>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '2fr 1fr',
                        gap: '2rem',
                    }}
                >
                    {/* ================= CART ITEMS ================= */}
                    <div>
                        {cartItems.map(
                            (item) => (
                                <div
                                    key={
                                        item.item_id
                                    }
                                    style={{
                                        background:
                                            '#fff',

                                        padding:
                                            '1rem',

                                        borderRadius:
                                            '12px',

                                        marginBottom:
                                            '1rem',

                                        boxShadow:
                                            '0 2px 8px rgba(0,0,0,0.08)',

                                        display:
                                            'flex',

                                        justifyContent:
                                            'space-between',

                                        alignItems:
                                            'center',
                                    }}
                                >
                                    <div>
                                        <h3>
                                            {
                                                item.item_name
                                            }
                                        </h3>

                                        <p>
                                            Quantity:{' '}
                                            {
                                                item.quantity
                                            }
                                        </p>

                                        <p>
                                            ₹
                                            {
                                                item.price
                                            }{' '}
                                            each
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            textAlign:
                                                'right',
                                        }}
                                    >
                                        <h3>
                                            ₹
                                            {item.total_price ||
                                                item.price *
                                                item.quantity}
                                        </h3>

                                        <button
                                            onClick={() =>
                                                removeItem(
                                                    item.cart_id
                                                )
                                            }
                                            style={{
                                                marginTop:
                                                    '10px',

                                                background:
                                                    '#ff4757',

                                                color:
                                                    '#fff',

                                                border:
                                                    'none',

                                                padding:
                                                    '8px 14px',

                                                borderRadius:
                                                    '20px',

                                                cursor:
                                                    'pointer',
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )
                        )}

                        <button
                            onClick={
                                clearCart
                            }
                            style={{
                                background:
                                    '#2f3542',

                                color: '#fff',

                                border: 'none',

                                padding:
                                    '12px 20px',

                                borderRadius:
                                    '25px',

                                cursor:
                                    'pointer',
                            }}
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* ================= SUMMARY ================= */}
                    <div
                        style={{
                            background:
                                '#fff',

                            padding:
                                '1.5rem',

                            borderRadius:
                                '12px',

                            height:
                                'fit-content',

                            boxShadow:
                                '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                    >
                        <h2>
                            Order Summary
                        </h2>

                        <div
                            style={{
                                marginTop:
                                    '1.5rem',
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    marginBottom:
                                        '1rem',
                                }}
                            >
                                <span>
                                    Subtotal
                                </span>

                                <span>
                                    ₹
                                    {
                                        subtotal
                                    }
                                </span>
                            </div>

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    marginBottom:
                                        '1rem',
                                }}
                            >
                                <span>
                                    Delivery
                                    Fee
                                </span>

                                <span>
                                    ₹
                                    {
                                        deliveryFee
                                    }
                                </span>
                            </div>

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    marginBottom:
                                        '1rem',
                                }}
                            >
                                <span>
                                    Tax
                                </span>

                                <span>
                                    ₹{tax}
                                </span>
                            </div>

                            <hr />

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    marginTop:
                                        '1rem',

                                    fontWeight:
                                        'bold',

                                    fontSize:
                                        '1.2rem',
                                }}
                            >
                                <span>
                                    Total
                                </span>

                                <span>
                                    ₹{total}
                                </span>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{
                                    width:
                                        '100%',

                                    marginTop:
                                        '2rem',
                                }}
                                onClick={() =>
                                    navigate(
                                        '/checkout'
                                    )
                                }
                            >
                                Proceed to
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPage;
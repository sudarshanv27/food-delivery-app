import React, {
    useState,
} from 'react';

import Navbar from '../components/Navbar';

import toast from 'react-hot-toast';

import { useCart } from '../context/CartContext';

import { orderAPI } from '../services/api';

// ================= COMPONENT =================
const CheckoutPage = () => {
    const {
        cartItems,
        subtotal,
        clearCart,
    } = useCart();

    // ================= STATES =================
    const [loading, setLoading] =
        useState(false);

    const [formData, setFormData] =
        useState({
            full_name: '',
            phone: '',
            address: '',
            payment_method:
                'cash',
        });

    // ================= TOTAL =================
    const deliveryFee = 40;

    const tax = Math.round(
        subtotal * 0.05
    );

    const total =
        subtotal +
        deliveryFee +
        tax;

    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value,
        });
    };

    // ================= PLACE ORDER =================
    const handlePlaceOrder =
        async () => {
            if (
                !formData.full_name ||
                !formData.phone ||
                !formData.address
            ) {
                toast.error(
                    'Please fill all fields'
                );

                return;
            }

            try {
                setLoading(true);

                const orderData = {
                    restaurant_id:
                        cartItems[0]
                            ?.restaurant_id,

                    restaurant_name:
                        'FoodieDash',

                    items:
                        cartItems,

                    subtotal,

                    delivery_fee:
                        deliveryFee,

                    tax,

                    total_amount:
                        total,

                    payment_method:
                        formData.payment_method,

                    delivery_address:
                        formData.address,

                    special_instructions:
                        '',
                };

                const response =
                    await orderAPI.createOrder(
                        orderData
                    );

                toast.success(
                    'Order placed successfully!'
                );

                console.log(
                    response.data
                );

                clearCart();

            } catch (error) {
                console.error(error);

                toast.error(
                    'Failed to place order'
                );
            } finally {
                setLoading(false);
            }
        };

    // ================= RETURN =================
    return (
        <>
            <Navbar />

            <div
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '2rem',
                }}
            >
                <h1
                    style={{
                        marginBottom: '2rem',
                    }}
                >
                    💳 Checkout
                </h1>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '2fr 1fr',
                        gap: '2rem',
                    }}
                >
                    {/* ================= FORM ================= */}
                    <div
                        style={{
                            background:
                                '#fff',

                            padding:
                                '2rem',

                            borderRadius:
                                '12px',

                            boxShadow:
                                '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                    >
                        <h2>
                            Delivery Details
                        </h2>

                        <input
                            type="text"
                            name="full_name"
                            placeholder="Full Name"
                            value={
                                formData.full_name
                            }
                            onChange={
                                handleChange
                            }
                            className="checkout-input"
                        />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={
                                formData.phone
                            }
                            onChange={
                                handleChange
                            }
                            className="checkout-input"
                        />

                        <textarea
                            name="address"
                            placeholder="Delivery Address"
                            value={
                                formData.address
                            }
                            onChange={
                                handleChange
                            }
                            className="checkout-input"
                            rows="4"
                        />

                        <select
                            name="payment_method"
                            value={
                                formData.payment_method
                            }
                            onChange={
                                handleChange
                            }
                            className="checkout-input"
                        >
                            <option value="cash">
                                Cash on
                                Delivery
                            </option>

                            <option value="online">
                                Online
                                Payment
                            </option>

                            <option value="wallet">
                                Wallet
                            </option>
                        </select>
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
                                    '1rem',
                            }}
                        >
                            <p>
                                Items:{' '}
                                {
                                    cartItems.length
                                }
                            </p>

                            <p>
                                Subtotal:
                                ₹
                                {
                                    subtotal
                                }
                            </p>

                            <p>
                                Delivery:
                                ₹
                                {
                                    deliveryFee
                                }
                            </p>

                            <p>
                                Tax: ₹
                                {tax}
                            </p>

                            <hr
                                style={{
                                    margin:
                                        '1rem 0',
                                }}
                            />

                            <h2>
                                Total:
                                ₹{total}
                            </h2>

                            <button
                                className="btn btn-primary"
                                style={{
                                    width:
                                        '100%',

                                    marginTop:
                                        '1.5rem',
                                }}
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? 'Processing...'
                                    : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= STYLES ================= */}
            <style>{`
                .checkout-input {
                    width: 100%;
                    padding: 14px;
                    margin-top: 1rem;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    font-size: 15px;
                }
            `}</style>
        </>
    );
};

export default CheckoutPage;
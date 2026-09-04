// web-app/src/pages/TrackingPage.js

import React, {
    useState,
    useEffect,
} from 'react';

import { useParams } from 'react-router-dom';

import {
    GoogleMap,
    Marker,
    useJsApiLoader,
} from '@react-google-maps/api';

import io from 'socket.io-client';

import toast from 'react-hot-toast';

import Navbar from '../components/Navbar';

// ================= MAP CONFIG =================
const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
};

const defaultCenter = {
    lat: 12.9716,
    lng: 77.5946,
};

// ================= COMPONENT =================
const TrackingPage = () => {
    const { orderId } = useParams();

    // ================= STATES =================
    const [order, setOrder] =
        useState(null);

    const [driverLocation, setDriverLocation] =
        useState(null);

    const [orderStatus, setOrderStatus] =
        useState('pending');

    const [loading, setLoading] =
        useState(true);

    // ================= GOOGLE MAP =================
    const { isLoaded } =
        useJsApiLoader({
            googleMapsApiKey:
                process.env
                    .REACT_APP_GOOGLE_MAPS_API_KEY || '',
        });

    // ================= FETCH ORDER =================
    const fetchOrderDetails =
        async () => {
            try {
                // DEMO DATA
                setOrder({
                    id: orderId,

                    status: 'preparing',

                    estimatedDelivery:
                        new Date(
                            Date.now() +
                            45 * 60000
                        ),

                    items: [
                        {
                            name:
                                'Margherita Pizza',

                            quantity: 1,

                            price: 299,
                        },
                        {
                            name:
                                'Garlic Bread',

                            quantity: 1,

                            price: 99,
                        },
                    ],

                    total: 398,
                });

                setOrderStatus(
                    'preparing'
                );
            } catch (error) {
                console.error(
                    'Error fetching order:',
                    error
                );

                toast.error(
                    'Failed to load order details'
                );
            } finally {
                setLoading(false);
            }
        };

    // ================= SOCKET + FETCH =================
    useEffect(() => {
        const socket = io(
            process.env
                .REACT_APP_SOCKET_URL ||
            'http://localhost:5000'
        );

        // ================= JOIN ROOM =================
        socket.emit(
            'track-delivery',
            orderId
        );

        // ================= DRIVER LOCATION =================
        socket.on(
            'driver-location',
            (location) => {
                setDriverLocation(
                    location
                );
            }
        );

        // ================= ORDER STATUS =================
        socket.on(
            'order-status',
            (data) => {
                setOrderStatus(
                    data.status
                );

                toast.success(
                    `Order status updated: ${data.status}`
                );
            }
        );

        fetchOrderDetails();

        // ================= CLEANUP =================
        return () => {
            socket.disconnect();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    // ================= STATUS STEP =================
    const getStatusStep = (
        step
    ) => {
        const steps = [
            'pending',
            'confirmed',
            'preparing',
            'out_for_delivery',
            'delivered',
        ];

        const currentIndex =
            steps.indexOf(orderStatus);

        const stepIndex =
            steps.indexOf(step);

        return {
            isActive:
                currentIndex >=
                stepIndex,

            isCompleted:
                currentIndex >
                stepIndex,
        };
    };

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

    // ================= UI =================
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
                {/* ================= TITLE ================= */}
                <h1
                    style={{
                        marginBottom:
                            '2rem',
                    }}
                >
                    Order Tracking - #
                    {orderId}
                </h1>

                {/* ================= STATUS TIMELINE ================= */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent:
                            'space-between',
                        gap: '10px',
                        marginBottom:
                            '3rem',
                        flexWrap: 'wrap',
                    }}
                >
                    {[
                        'pending',
                        'confirmed',
                        'preparing',
                        'out_for_delivery',
                        'delivered',
                    ].map(
                        (
                            step,
                            index
                        ) => {
                            const {
                                isActive,
                                isCompleted,
                            } =
                                getStatusStep(
                                    step
                                );

                            return (
                                <div
                                    key={
                                        step
                                    }
                                    style={{
                                        flex: 1,
                                        minWidth:
                                            '120px',
                                        textAlign:
                                            'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '42px',
                                            height:
                                                '42px',
                                            borderRadius:
                                                '50%',
                                            background:
                                                isCompleted
                                                    ? '#2ed573'
                                                    : isActive
                                                        ? '#ff4757'
                                                        : '#dfe4ea',
                                            color:
                                                '#fff',
                                            display:
                                                'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'center',
                                            margin:
                                                '0 auto 10px',
                                            fontWeight:
                                                'bold',
                                        }}
                                    >
                                        {isCompleted
                                            ? '✓'
                                            : index +
                                            1}
                                    </div>

                                    <p
                                        style={{
                                            fontSize:
                                                '13px',
                                            fontWeight:
                                                isActive
                                                    ? '700'
                                                    : '500',
                                            color:
                                                '#2c3e50',
                                        }}
                                    >
                                        {step
                                            .replaceAll(
                                                '_',
                                                ' '
                                            )
                                            .toUpperCase()}
                                    </p>
                                </div>
                            );
                        }
                    )}
                </div>

                {/* ================= GOOGLE MAP ================= */}
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={
                            mapContainerStyle
                        }
                        center={
                            driverLocation ||
                            defaultCenter
                        }
                        zoom={13}
                    >
                        {/* DRIVER MARKER */}
                        {driverLocation && (
                            <Marker
                                position={
                                    driverLocation
                                }
                            />
                        )}

                        {/* DEFAULT MARKER */}
                        {!driverLocation && (
                            <Marker
                                position={
                                    defaultCenter
                                }
                            />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="loading">
                        Loading Map...
                    </div>
                )}

                {/* ================= ORDER DETAILS ================= */}
                <div
                    style={{
                        background:
                            '#ffffff',
                        borderRadius:
                            '12px',
                        padding:
                            '1.5rem',
                        marginTop:
                            '2rem',
                        boxShadow:
                            '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                >
                    <h2>
                        Order Details
                    </h2>

                    {/* ITEMS */}
                    <div
                        style={{
                            marginTop:
                                '1rem',
                        }}
                    >
                        {order?.items?.map(
                            (
                                item,
                                idx
                            ) => (
                                <div
                                    key={idx}
                                    style={{
                                        display:
                                            'flex',
                                        justifyContent:
                                            'space-between',
                                        padding:
                                            '0.8rem 0',
                                        borderBottom:
                                            '1px solid #eee',
                                    }}
                                >
                                    <span>
                                        {
                                            item.quantity
                                        }{' '}
                                        ×{' '}
                                        {
                                            item.name
                                        }
                                    </span>

                                    <span>
                                        ₹
                                        {item.price *
                                            item.quantity}
                                    </span>
                                </div>
                            )
                        )}

                        {/* TOTAL */}
                        <div
                            style={{
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                marginTop:
                                    '1rem',
                                paddingTop:
                                    '1rem',
                                borderTop:
                                    '2px solid #eee',
                                fontWeight:
                                    '700',
                            }}
                        >
                            <span>
                                Total
                            </span>

                            <span>
                                ₹
                                {
                                    order?.total
                                }
                            </span>
                        </div>
                    </div>

                    {/* DELIVERY INFO */}
                    <div
                        style={{
                            marginTop:
                                '1.5rem',
                            padding:
                                '1rem',
                            borderRadius:
                                '10px',
                            background:
                                '#f8f9fa',
                        }}
                    >
                        <p>
                            <strong>
                                Estimated
                                Delivery:
                            </strong>{' '}
                            {order?.estimatedDelivery?.toLocaleTimeString()}
                        </p>

                        <p
                            style={{
                                marginTop:
                                    '8px',
                            }}
                        >
                            <strong>
                                Order
                                Status:
                            </strong>{' '}
                            <span
                                style={{
                                    color:
                                        '#ff4757',
                                    fontWeight:
                                        '700',
                                }}
                            >
                                {orderStatus
                                    .replaceAll(
                                        '_',
                                        ' '
                                    )
                                    .toUpperCase()}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TrackingPage;
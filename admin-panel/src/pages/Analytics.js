// admin-panel/src/pages/Analytics.js

import React, {
    useEffect,
    useState
} from 'react';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    ResponsiveContainer
} from 'recharts';

// Optional API import
// import api from '../services/api';

const Analytics = () => {

    // ================= STATES =================
    const [dailyOrders, setDailyOrders] =
        useState([]);

    const [topDishes, setTopDishes] =
        useState([]);

    const [userGrowth, setUserGrowth] =
        useState([]);

    const [revenueByDay, setRevenueByDay] =
        useState([]);

    const [deliveryPerformance,
        setDeliveryPerformance] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    // ================= FETCH DATA =================
    useEffect(() => {

        fetchAnalytics();

        const interval = setInterval(
            fetchAnalytics,
            60000
        );

        return () =>
            clearInterval(interval);

    }, []);

    // ================= FETCH ANALYTICS =================
    const fetchAnalytics = async () => {

        try {

            // ================= DEMO DATA =================

            setDailyOrders([
                { date: 'Mon', orders: 120 },
                { date: 'Tue', orders: 180 },
                { date: 'Wed', orders: 140 },
                { date: 'Thu', orders: 220 },
                { date: 'Fri', orders: 300 },
                { date: 'Sat', orders: 280 },
                { date: 'Sun', orders: 350 }
            ]);

            setTopDishes([
                {
                    name: 'Pizza',
                    quantity: 400
                },
                {
                    name: 'Burger',
                    quantity: 250
                },
                {
                    name: 'Biryani',
                    quantity: 320
                },
                {
                    name: 'Pasta',
                    quantity: 150
                }
            ]);

            setUserGrowth([
                { month: 'Jan', count: 200 },
                { month: 'Feb', count: 350 },
                { month: 'Mar', count: 500 },
                { month: 'Apr', count: 750 },
                { month: 'May', count: 1100 }
            ]);

            setRevenueByDay([
                { date: 'Mon', revenue: 12000 },
                { date: 'Tue', revenue: 18000 },
                { date: 'Wed', revenue: 16000 },
                { date: 'Thu', revenue: 25000 },
                { date: 'Fri', revenue: 32000 },
                { date: 'Sat', revenue: 29000 },
                { date: 'Sun', revenue: 38000 }
            ]);

            setDeliveryPerformance({
                totalRevenue: 456789,
                avgDeliveryTime: 28,
                avgRating: 4.6
            });

            setLoading(false);

        } catch (error) {

            console.error(
                'Analytics Error:',
                error
            );

            setLoading(false);

        }

    };

    // ================= COLORS =================
    const COLORS = [
        '#ff4757',
        '#2ed573',
        '#1e90ff',
        '#ffa502',
        '#a55de8'
    ];

    // ================= LOADING =================
    if (loading) {

        return (

            <div style={styles.loaderContainer}>

                <div style={styles.loader}></div>

            </div>

        );

    }

    // ================= UI =================
    return (

        <div style={styles.container}>

            {/* ================= TITLE ================= */}
            <h1 style={styles.heading}>
                Analytics Dashboard
            </h1>

            {/* ================= STATS ================= */}
            <div style={styles.statsGrid}>

                <div style={styles.statCard}>
                    <h3>Total Revenue</h3>

                    <p style={styles.statValue}>
                        ₹
                        {deliveryPerformance.totalRevenue?.toLocaleString()}
                    </p>

                    <span style={styles.trendUp}>
                        ↑ 23%
                    </span>
                </div>

                <div style={styles.statCard}>
                    <h3>Active Users</h3>

                    <p style={styles.statValue}>
                        {
                            userGrowth[
                                userGrowth.length - 1
                            ]?.count || 0
                        }
                    </p>

                    <span style={styles.trendUp}>
                        ↑ 12%
                    </span>
                </div>

                <div style={styles.statCard}>
                    <h3>Avg Delivery Time</h3>

                    <p style={styles.statValue}>
                        {
                            deliveryPerformance.avgDeliveryTime
                        }
                        {' '}
                        min
                    </p>

                    <span style={styles.trendDown}>
                        ↓ 5 min
                    </span>
                </div>

                <div style={styles.statCard}>
                    <h3>Customer Rating</h3>

                    <p style={styles.statValue}>
                        {
                            deliveryPerformance.avgRating
                        }
                        {' '}
                        ★
                    </p>

                    <span style={styles.trendUp}>
                        ↑ 0.2
                    </span>
                </div>

            </div>

            {/* ================= CHARTS ================= */}
            <div style={styles.chartsGrid}>

                {/* DAILY ORDERS */}
                <div style={styles.chartCard}>

                    <h3>Daily Orders</h3>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart data={dailyOrders}>

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis dataKey="date" />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#ff4757"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

                {/* REVENUE */}
                <div style={styles.chartCard}>

                    <h3>Revenue Trend</h3>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart
                            data={revenueByDay}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis dataKey="date" />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="revenue"
                                fill="#2ed573"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                {/* TOP DISHES */}
                <div style={styles.chartCard}>

                    <h3>Top Dishes</h3>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <PieChart>

                            <Pie
                                data={topDishes}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="quantity"
                                label={(entry) =>
                                    entry.name
                                }
                            >

                                {topDishes.map(
                                    (entry, index) => (

                                        <Cell
                                            key={index}
                                            fill={
                                                COLORS[
                                                index %
                                                COLORS.length
                                                ]
                                            }
                                        />

                                    )
                                )}

                            </Pie>

                            <Tooltip />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

                {/* USER GROWTH */}
                <div style={styles.chartCard}>

                    <h3>User Growth</h3>

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart
                            data={userGrowth}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis dataKey="month" />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#1e90ff"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>

    );

};

// ================= STYLES =================
const styles = {

    container: {
        padding: '24px',
        background: '#f5f6fa',
        minHeight: '100vh'
    },

    heading: {
        fontSize: '32px',
        marginBottom: '24px',
        color: '#2c3e50'
    },

    statsGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
    },

    statCard: {
        background: '#fff',
        padding: '24px',
        borderRadius: '16px',
        boxShadow:
            '0 4px 12px rgba(0,0,0,0.05)'
    },

    statValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '10px 0',
        color: '#2c3e50'
    },

    trendUp: {
        color: '#2ed573',
        fontWeight: '600'
    },

    trendDown: {
        color: '#ff4757',
        fontWeight: '600'
    },

    chartsGrid: {
        display: 'grid',
        gridTemplateColumns:
            'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
    },

    chartCard: {
        background: '#fff',
        padding: '24px',
        borderRadius: '16px',
        boxShadow:
            '0 4px 12px rgba(0,0,0,0.05)'
    },

    loaderContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
    },

    loader: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #ff4757',
        borderRadius: '50%',
        animation:
            'spin 1s linear infinite'
    }

};

export default Analytics;
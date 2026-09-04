// src/components/profile/admin/AdminAnalytics.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart, Scatter, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        revenueData: [],
        orderStatusData: [],
        popularItems: [],
        topRestaurants: [],
        userGrowthData: [],
        categoryDistribution: [],
        hourlyOrders: [],
        customerSegments: [],
        deliveryPerformance: [],
        refundReasons: [],
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0,
        avgRating: 4.5,
        conversionRate: 0,
        avgOrderValue: 0,
        refundRate: 0,
        onTimeDelivery: 0,
        customerSatisfaction: 0,
        loading: true
    });

    const [dateRange, setDateRange] = useState('last7days');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
    });
    const [chartType, setChartType] = useState('line');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [compareWithPrevious, setCompareWithPrevious] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState('all');
    const [restaurants, setRestaurants] = useState([]);
    const [dashboardLayout, setDashboardLayout] = useState('grid');
    const [selectedView, setSelectedView] = useState('overview');
    const [forecastData, setForecastData] = useState([]);
    const [exportFormat, setExportFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        lowStock: true,
        highDemand: true,
        anomalies: true
    });
    const [anomalies, setAnomalies] = useState([]);

    const chartRef = useRef();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

    // Fetch data on mount and when dependencies change
    useEffect(() => {
        fetchRestaurants();
        fetchAnalytics();
        fetchForecast();
        fetchAnomalies();

        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchAnalytics();
                fetchAnomalies();
            }, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [dateRange, selectedRestaurant, autoRefresh, customDateRange]);

    const fetchRestaurants = async () => {
        try {
            const response = await axios.get('/api/admin/restaurants', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRestaurants(response.data.data || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchAnalytics = async () => {
        setAnalytics(prev => ({ ...prev, loading: true }));
        setError(null);

        try {
            const params = new URLSearchParams({
                range: dateRange,
                restaurant_id: selectedRestaurant,
                compare: compareWithPrevious,
                start_date: dateRange === 'custom' ? customDateRange.startDate.toISOString() : '',
                end_date: dateRange === 'custom' ? customDateRange.endDate.toISOString() : ''
            });

            const response = await axios.get(`/api/admin/analytics?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setAnalytics({
                ...response.data,
                loading: false
            });
            setLastUpdated(new Date());

            // Trigger notification for anomalies
            checkForAnomalies(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error.response?.data?.message || 'Failed to load analytics data');
            setAnalytics(prev => ({ ...prev, loading: false }));

            if (process.env.NODE_ENV === 'development') {
                loadMockData();
            }
        }
    };

    const fetchForecast = async () => {
        try {
            const response = await axios.get('/api/admin/analytics/forecast', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { days: 30 }
            });
            setForecastData(response.data.forecast || generateMockForecast());
        } catch (error) {
            console.error('Error fetching forecast:', error);
            setForecastData(generateMockForecast());
        }
    };

    const fetchAnomalies = async () => {
        try {
            const response = await axios.get('/api/admin/analytics/anomalies', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAnomalies(response.data.anomalies || []);
        } catch (error) {
            console.error('Error fetching anomalies:', error);
            setAnomalies(generateMockAnomalies());
        }
    };

    const checkForAnomalies = (data) => {
        if (!notificationSettings.anomalies) return;

        const anomalies = [];
        const avgRevenue = data.revenueData?.reduce((sum, d) => sum + d.revenue, 0) / (data.revenueData?.length || 1);
        const lastDayRevenue = data.revenueData?.[data.revenueData.length - 1]?.revenue || 0;

        if (lastDayRevenue > avgRevenue * 1.5) {
            anomalies.push({ type: 'positive', message: 'Unusual revenue spike detected!', severity: 'high' });
        } else if (lastDayRevenue < avgRevenue * 0.5) {
            anomalies.push({ type: 'negative', message: 'Unusual revenue drop detected!', severity: 'critical' });
        }

        if (anomalies.length > 0) {
            showNotification(anomalies);
        }
    };

    const showNotification = (anomalies) => {
        // Implement toast or browser notification
        if (Notification.permission === 'granted') {
            anomalies.forEach(anomaly => {
                new Notification('Analytics Alert', { body: anomaly.message });
            });
        }
    };

    const generateMockForecast = () => {
        const data = [];
        for (let i = 1; i <= 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            data.push({
                date: date.toLocaleDateString(),
                predictedRevenue: Math.floor(Math.random() * 100000) + 60000,
                lowerBound: Math.floor(Math.random() * 20000) + 40000,
                upperBound: Math.floor(Math.random() * 20000) + 80000
            });
        }
        return data;
    };

    const generateMockAnomalies = () => {
        return [
            { id: 1, type: 'spike', message: 'Unusual order spike at 8 PM yesterday', severity: 'medium', timestamp: new Date() },
            { id: 2, type: 'drop', message: 'Revenue drop in Pizza category', severity: 'high', timestamp: new Date() }
        ];
    };

    const loadMockData = () => {
        const mockRevenueData = generateMockRevenueData();
        const mockOrderStatusData = [
            { status: 'Delivered', value: 1247 },
            { status: 'In Progress', value: 342 },
            { status: 'Cancelled', value: 89 },
            { status: 'Refunded', value: 45 }
        ];
        const mockPopularItems = [
            { name: 'Margherita Pizza', orders: 342, revenue: 102600, rating: 4.8, growth: 15 },
            { name: 'Chicken Burger', orders: 298, revenue: 44700, rating: 4.6, growth: 8 },
            { name: 'French Fries', orders: 256, revenue: 20480, rating: 4.5, growth: -2 },
            { name: 'Garlic Bread', orders: 223, revenue: 16725, rating: 4.7, growth: 12 },
            { name: 'Coke', orders: 198, revenue: 5940, rating: 4.4, growth: 5 }
        ];
        const mockUserGrowthData = generateMockUserGrowth();
        const mockCategoryDistribution = [
            { category: 'Pizza', value: 35, growth: 12 },
            { category: 'Burgers', value: 28, growth: 8 },
            { category: 'Chicken', value: 20, growth: -5 },
            { category: 'Desserts', value: 10, growth: 20 },
            { category: 'Beverages', value: 7, growth: 3 }
        ];
        const mockHourlyOrders = generateMockHourlyOrders();
        const mockCustomerSegments = [
            { segment: 'New Customers', percentage: 25, value: 450 },
            { segment: 'Regular', percentage: 45, value: 820 },
            { segment: 'VIP', percentage: 20, value: 360 },
            { segment: 'Inactive', percentage: 10, value: 180 }
        ];
        const mockDeliveryPerformance = [
            { time: '0-15 min', orders: 450, percentage: 25 },
            { time: '15-30 min', orders: 890, percentage: 48 },
            { time: '30-45 min', orders: 340, percentage: 18 },
            { time: '45-60 min', orders: 120, percentage: 6 },
            { time: '60+ min', orders: 42, percentage: 3 }
        ];
        const mockRefundReasons = [
            { reason: 'Late Delivery', count: 45, percentage: 38 },
            { reason: 'Wrong Item', count: 32, percentage: 27 },
            { reason: 'Quality Issue', count: 28, percentage: 24 },
            { reason: 'Missing Items', count: 14, percentage: 11 }
        ];

        setAnalytics({
            revenueData: mockRevenueData,
            orderStatusData: mockOrderStatusData,
            popularItems: mockPopularItems,
            topRestaurants: generateMockTopRestaurants(),
            userGrowthData: mockUserGrowthData,
            categoryDistribution: mockCategoryDistribution,
            hourlyOrders: mockHourlyOrders,
            customerSegments: mockCustomerSegments,
            deliveryPerformance: mockDeliveryPerformance,
            refundReasons: mockRefundReasons,
            totalRevenue: 2456789,
            totalOrders: 1842,
            activeUsers: 3421,
            avgRating: 4.6,
            conversionRate: 23.5,
            avgOrderValue: 1334,
            refundRate: 2.4,
            onTimeDelivery: 91.5,
            customerSatisfaction: 4.5,
            loading: false
        });
    };

    const generateMockRevenueData = () => {
        const data = [];
        const days = dateRange === 'last7days' ? 7 : dateRange === 'last30days' ? 30 : 90;
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            data.push({
                date: date.toLocaleDateString(),
                revenue: Math.floor(Math.random() * 100000) + (isWeekend ? 70000 : 50000),
                orders: Math.floor(Math.random() * 200) + (isWeekend ? 100 : 50),
                avgOrderValue: Math.floor(Math.random() * 500) + 1000,
                uniqueCustomers: Math.floor(Math.random() * 150) + 50
            });
        }
        return data;
    };

    const generateMockUserGrowth = () => {
        const data = [];
        const months = dateRange === 'last7days' ? 7 : dateRange === 'last30days' ? 30 : 12;
        for (let i = months; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            data.push({
                month: date.toLocaleDateString('default', { month: 'short' }),
                newUsers: Math.floor(Math.random() * 500) + 100,
                activeUsers: Math.floor(Math.random() * 3000) + 1000,
                retention: Math.floor(Math.random() * 30) + 60
            });
        }
        return data;
    };

    const generateMockTopRestaurants = () => {
        return [
            { name: 'Pizza Hut', revenue: 856000, orders: 642, rating: 4.7, growth: 12 },
            { name: "McDonald's", revenue: 724000, orders: 543, rating: 4.6, growth: 8 },
            { name: 'KFC', revenue: 689000, orders: 517, rating: 4.5, growth: -3 },
            { name: 'Dominos', revenue: 654000, orders: 491, rating: 4.8, growth: 15 },
            { name: 'Burger King', revenue: 589000, orders: 442, rating: 4.4, growth: 5 }
        ];
    };

    const generateMockHourlyOrders = () => {
        const data = [];
        for (let i = 0; i < 24; i++) {
            data.push({
                hour: i,
                orders: Math.floor(Math.random() * 100) + (i >= 11 && i <= 14 ? 50 : i >= 19 && i <= 22 ? 80 : 20),
                revenue: Math.floor(Math.random() * 50000) + (i >= 11 && i <= 14 ? 30000 : i >= 19 && i <= 22 ? 40000 : 10000)
            });
        }
        return data;
    };

    const handleDateRangeChange = (e) => {
        const range = e.target.value;
        setDateRange(range);
        if (range !== 'custom') {
            fetchAnalytics();
        }
    };

    const handleCustomDateChange = (dates) => {
        const [start, end] = dates;
        setCustomDateRange({ startDate: start, endDate: end });
        if (start && end) {
            fetchAnalytics();
        }
    };

    const handleRestaurantChange = (e) => {
        setSelectedRestaurant(e.target.value);
    };

    const exportData = async (format = 'csv') => {
        setIsExporting(true);
        try {
            const response = await axios.get(`/api/admin/analytics/export`, {
                params: {
                    format: format,
                    range: dateRange,
                    restaurant_id: selectedRestaurant,
                    start_date: dateRange === 'custom' ? customDateRange.startDate.toISOString() : '',
                    end_date: dateRange === 'custom' ? customDateRange.endDate.toISOString() : ''
                },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_report_${dateRange}_${new Date().toISOString()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Track export event
            trackEvent('export_analytics', { format, dateRange });
        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export data. Please try again.');
            exportAsJSON();
        } finally {
            setIsExporting(false);
        }
    };

    const exportAsJSON = () => {
        const exportData = {
            exported_at: new Date().toISOString(),
            date_range: dateRange,
            filters: { restaurant: selectedRestaurant },
            data: analytics
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics_export_${new Date().toISOString()}.json`);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const trackEvent = (eventName, properties = {}) => {
        if (window.gtag) {
            window.gtag('event', eventName, properties);
        }
        console.log(`[Analytics Event] ${eventName}:`, properties);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-IN').format(value);
    };

    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };

    const TrendIndicator = ({ current, previous }) => {
        if (!previous || previous === 0) return null;
        const change = ((current - previous) / previous) * 100;
        const isPositive = change > 0;

        return (
            <span className={`trend ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                            {entry.name}: {
                                entry.name.toLowerCase().includes('revenue') || entry.name === 'Revenue'
                                    ? formatCurrency(entry.value)
                                    : entry.name.toLowerCase().includes('rate') || entry.name === 'Conversion Rate'
                                        ? formatPercentage(entry.value)
                                        : formatNumber(entry.value)
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getChartComponent = () => {
        switch (chartType) {
            case 'area':
                return AreaChart;
            case 'bar':
                return BarChart;
            case 'composed':
                return ComposedChart;
            default:
                return LineChart;
        }
    };

    const renderOverview = () => (
        <>
            {/* Stats Overview Grid */}
            <div className="analytics-stats-grid">
                <div className="stat-card revenue">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p className="stat-value">{formatCurrency(analytics.totalRevenue)}</p>
                        <TrendIndicator current={analytics.totalRevenue} previous={analytics.previousRevenue} />
                    </div>
                    <div className="stat-trend-line">
                        <div className="sparkline">
                            {analytics.revenueData?.slice(-7).map((d, i) => (
                                <div key={i} className="sparkline-bar" style={{ height: `${(d.revenue / Math.max(...analytics.revenueData.slice(-7).map(r => r.revenue))) * 100}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="stat-card orders">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p className="stat-value">{formatNumber(analytics.totalOrders)}</p>
                        <TrendIndicator current={analytics.totalOrders} previous={analytics.previousOrders} />
                    </div>
                </div>

                <div className="stat-card users">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Active Users</h3>
                        <p className="stat-value">{formatNumber(analytics.activeUsers)}</p>
                        <TrendIndicator current={analytics.activeUsers} previous={analytics.previousActiveUsers} />
                    </div>
                </div>

                <div className="stat-card rating">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>Avg. Rating</h3>
                        <p className="stat-value">{analytics.avgRating?.toFixed(1)}</p>
                        <TrendIndicator current={analytics.avgRating} previous={analytics.previousAvgRating} />
                    </div>
                </div>

                <div className="stat-card conversion">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                        <h3>Conversion Rate</h3>
                        <p className="stat-value">{analytics.conversionRate?.toFixed(1)}%</p>
                        <TrendIndicator current={analytics.conversionRate} previous={analytics.previousConversionRate} />
                    </div>
                </div>

                <div className="stat-card aov">
                    <div className="stat-icon">💵</div>
                    <div className="stat-info">
                        <h3>Avg. Order Value</h3>
                        <p className="stat-value">{formatCurrency(analytics.avgOrderValue)}</p>
                        <TrendIndicator current={analytics.avgOrderValue} previous={analytics.previousAvgOrderValue} />
                    </div>
                </div>

                <div className="stat-card delivery">
                    <div className="stat-icon">🚚</div>
                    <div className="stat-info">
                        <h3>On-Time Delivery</h3>
                        <p className="stat-value">{analytics.onTimeDelivery?.toFixed(1)}%</p>
                        <TrendIndicator current={analytics.onTimeDelivery} previous={analytics.previousOnTimeDelivery} />
                    </div>
                </div>

                <div className="stat-card satisfaction">
                    <div className="stat-icon">😊</div>
                    <div className="stat-info">
                        <h3>Customer Satisfaction</h3>
                        <p className="stat-value">{analytics.customerSatisfaction?.toFixed(1)}/5</p>
                        <TrendIndicator current={analytics.customerSatisfaction} previous={analytics.previousSatisfaction} />
                    </div>
                </div>
            </div>

            {/* Main Charts */}
            <div className="analytics-charts">
                {/* Revenue & Orders Chart */}
                <div className="chart-card main-chart">
                    <div className="chart-header">
                        <h3>Revenue & Orders Overview</h3>
                        <div className="chart-controls">
                            <div className="chart-type-buttons">
                                <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>
                                    Line
                                </button>
                                <button className={chartType === 'area' ? 'active' : ''} onClick={() => setChartType('area')}>
                                    Area
                                </button>
                                <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>
                                    Bar
                                </button>
                            </div>
                            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="metric-select">
                                <option value="revenue">Revenue</option>
                                <option value="orders">Orders</option>
                                <option value="avgOrderValue">Avg Order Value</option>
                                <option value="uniqueCustomers">Unique Customers</option>
                            </select>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        {React.createElement(
                            getChartComponent(),
                            {
                                data: analytics.revenueData,
                                margin: { top: 10, right: 30, left: 0, bottom: 0 }
                            },
                            <>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                {selectedMetric !== 'revenue' && <YAxis yAxisId="right" orientation="right" />}
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                {selectedMetric === 'revenue' && (
                                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Revenue" />
                                )}
                                {selectedMetric === 'orders' && (
                                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="Orders" />
                                )}
                                {selectedMetric === 'avgOrderValue' && (
                                    <Line yAxisId="left" type="monotone" dataKey="avgOrderValue" stroke="#ffc658" strokeWidth={2} name="Avg Order Value" />
                                )}
                                {selectedMetric === 'uniqueCustomers' && (
                                    <Line yAxisId="right" type="monotone" dataKey="uniqueCustomers" stroke="#ff6b6b" strokeWidth={2} name="Unique Customers" />
                                )}
                            </>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Two Column Layout */}
                <div className="charts-two-column">
                    <div className="chart-card">
                        <h3>Order Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={analytics.orderStatusData} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}>
                                    {analytics.orderStatusData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Customer Segments</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={analytics.customerSegments}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="segment" />
                                <PolarRadiusAxis />
                                <Radar name="Customers" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Items with Growth Indicators */}
                <div className="chart-card">
                    <h3>Popular Items</h3>
                    <div className="popular-items-list">
                        {analytics.popularItems?.map((item, index) => (
                            <div key={index} className="popular-item">
                                <div className="item-header">
                                    <div className="item-info">
                                        <span className="item-rank">#{index + 1}</span>
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-rating">⭐ {item.rating}</span>
                                        {item.growth && (
                                            <span className={`growth-badge ${item.growth > 0 ? 'positive' : 'negative'}`}>
                                                {item.growth > 0 ? '↑' : '↓'} {Math.abs(item.growth)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="item-stats">
                                        <span className="item-orders">{formatNumber(item.orders)} orders</span>
                                        <span className="item-revenue">{formatCurrency(item.revenue)}</span>
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${(item.orders / analytics.popularItems[0]?.orders) * 100}%`, background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Performance */}
                <div className="chart-card">
                    <h3>Delivery Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.deliveryPerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="time" type="category" width={80} />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#82ca9d">
                                {analytics.deliveryPerformance?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Forecast Section */}
                <div className="chart-card forecast-card">
                    <h3>30-Day Revenue Forecast</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={forecastData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="upperBound" fill="#8884d8" fillOpacity={0.3} stroke="none" name="Upper Bound" />
                            <Area type="monotone" dataKey="lowerBound" fill="#8884d8" fillOpacity={0.1} stroke="none" name="Lower Bound" />
                            <Line type="monotone" dataKey="predictedRevenue" stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} name="Predicted Revenue" />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div className="forecast-insights">
                        <p>📈 Expected revenue growth: +12.5% over next 30 days</p>
                        <p>🎯 Peak days predicted: Weekends and holidays</p>
                    </div>
                </div>

                {/* Anomalies Alert */}
                {anomalies.length > 0 && (
                    <div className="anomalies-alert">
                        <div className="alert-header">
                            <span className="alert-icon">⚠️</span>
                            <h3>Anomalies Detected</h3>
                        </div>
                        <div className="anomalies-list">
                            {anomalies.map(anomaly => (
                                <div key={anomaly.id} className={`anomaly-item ${anomaly.severity}`}>
                                    <span className="anomaly-icon">{anomaly.type === 'spike' ? '📈' : '📉'}</span>
                                    <div className="anomaly-info">
                                        <p>{anomaly.message}</p>
                                        <small>{new Date(anomaly.timestamp).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    const renderCustomerInsights = () => (
        <div className="customer-insights">
            <div className="insights-header">
                <h3>Customer Behavior Insights</h3>
                <p>Analyze customer patterns and preferences</p>
            </div>

            <div className="insights-grid">
                <div className="insight-card">
                    <h4>Peak Ordering Times</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.hourlyOrders}>
                            <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="insight-card">
                    <h4>Customer Retention</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics.userGrowthData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="retention" stroke="#82ca9d" name="Retention Rate (%)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="insight-card">
                    <h4>Refund Reasons Analysis</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={analytics.refundReasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" innerRadius={40} outerRadius={80} label>
                                {analytics.refundReasons?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="notification-settings">
            <h3>Alert Settings</h3>
            <div className="settings-form">
                <label className="setting-item">
                    <input type="checkbox" checked={notificationSettings.lowStock} onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStock: e.target.checked }))} />
                    <span>Low Stock Alerts</span>
                </label>
                <label className="setting-item">
                    <input type="checkbox" checked={notificationSettings.highDemand} onChange={(e) => setNotificationSettings(prev => ({ ...prev, highDemand: e.target.checked }))} />
                    <span>High Demand Alerts</span>
                </label>
                <label className="setting-item">
                    <input type="checkbox" checked={notificationSettings.anomalies} onChange={(e) => setNotificationSettings(prev => ({ ...prev, anomalies: e.target.checked }))} />
                    <span>Anomaly Detection</span>
                </label>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <h3>Error Loading Analytics</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={() => fetchAnalytics()} className="retry-btn">🔄 Retry</button>
                        <button onClick={loadMockData} className="mock-btn">📊 Load Demo Data</button>
                    </div>
                </div>
            </div>
        );
    }

    if (analytics.loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="admin-analytics">
            {/* Header */}
            <div className="analytics-header">
                <div className="header-title">
                    <div>
                        <h2>
                            <span className="header-icon">📊</span>
                            Analytics Dashboard
                        </h2>
                        {lastUpdated && (
                            <span className="last-updated">Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </div>
                    <div className="view-tabs">
                        <button className={`view-tab ${selectedView === 'overview' ? 'active' : ''}`} onClick={() => setSelectedView('overview')}>
                            Overview
                        </button>
                        <button className={`view-tab ${selectedView === 'customers' ? 'active' : ''}`} onClick={() => setSelectedView('customers')}>
                            Customer Insights
                        </button>
                        <button className={`view-tab ${selectedView === 'alerts' ? 'active' : ''}`} onClick={() => setSelectedView('alerts')}>
                            Alerts & Settings
                        </button>
                    </div>
                </div>

                <div className="header-controls">
                    <div className="restaurant-filter">
                        <select value={selectedRestaurant} onChange={handleRestaurantChange}>
                            <option value="all">All Restaurants</option>
                            {restaurants.map(restaurant => (
                                <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="date-range-filter">
                        <select value={dateRange} onChange={handleDateRangeChange}>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last7days">Last 7 days</option>
                            <option value="last30days">Last 30 days</option>
                            <option value="last3months">Last 3 months</option>
                            <option value="thisyear">This year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        {dateRange === 'custom' && (
                            <DatePicker
                                selectsRange={true}
                                startDate={customDateRange.startDate}
                                endDate={customDateRange.endDate}
                                onChange={handleCustomDateChange}
                                className="custom-date-picker"
                                placeholderText="Select date range"
                            />
                        )}
                    </div>

                    <div className="dashboard-layout">
                        <button className={`layout-btn ${dashboardLayout === 'grid' ? 'active' : ''}`} onClick={() => setDashboardLayout('grid')}>⊞ Grid</button>
                        <button className={`layout-btn ${dashboardLayout === 'compact' ? 'active' : ''}`} onClick={() => setDashboardLayout('compact')}>≡ Compact</button>
                    </div>

                    <div className="auto-refresh-toggle">
                        <label className="toggle-switch">
                            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                            <span className="toggle-slider"></span>
                        </label>
                        <span>Auto-refresh</span>
                    </div>

                    <div className="export-buttons">
                        <button onClick={() => exportData('csv')} className="export-btn csv" disabled={isExporting}>
                            {isExporting ? '⏳' : '📄'} CSV
                        </button>
                        <button onClick={() => exportData('excel')} className="export-btn excel" disabled={isExporting}>
                            📊 Excel
                        </button>
                        <button onClick={() => exportData('pdf')} className="export-btn pdf" disabled={isExporting}>
                            📑 PDF
                        </button>
                        <button onClick={exportAsJSON} className="export-btn json">
                            📋 JSON
                        </button>
                    </div>
                </div>
            </div>

            {/* Comparison Toggle */}
            <div className="comparison-toggle">
                <label className="checkbox-label">
                    <input type="checkbox" checked={compareWithPrevious} onChange={(e) => setCompareWithPrevious(e.target.checked)} />
                    <span>Compare with previous period</span>
                </label>
            </div>

            {/* Main Content */}
            {selectedView === 'overview' && renderOverview()}
            {selectedView === 'customers' && renderCustomerInsights()}
            {selectedView === 'alerts' && renderNotifications()}
        </div>
    );
};

export default AdminAnalytics;
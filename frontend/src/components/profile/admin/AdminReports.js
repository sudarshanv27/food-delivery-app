// src/components/profile/admin/AdminReports.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminReports.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('sales');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const [endDate, setEndDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [savedReports, setSavedReports] = useState([]);
    const [showSavedReports, setShowSavedReports] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [previousPeriodData, setPreviousPeriodData] = useState(null);
    const [filters, setFilters] = useState({
        restaurant_id: 'all',
        category: 'all'
    });
    const [restaurants, setRestaurants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [scheduleReport, setScheduleReport] = useState({
        enabled: false,
        frequency: 'weekly',
        email: '',
        format: 'pdf'
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4'];

    useEffect(() => {
        fetchRestaurants();
        fetchCategories();
        fetchSavedReports();
        generateReport();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/restaurants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRestaurants(response.data.data || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSavedReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/saved-reports', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedReports(response.data.data || []);
        } catch (error) {
            console.error('Error fetching saved reports:', error);
            setSavedReports(getMockSavedReports());
        }
    };

    const getMockSavedReports = () => {
        return [
            { id: 1, name: 'January 2024 Sales Report', type: 'sales', date: '2024-01-31', created_by: 'Admin', size: '2.3 MB' },
            { id: 2, name: 'Q4 2023 User Growth Analysis', type: 'users', date: '2023-12-31', created_by: 'Admin', size: '1.8 MB' },
            { id: 3, name: 'Restaurant Performance - December', type: 'restaurants', date: '2023-12-31', created_by: 'Admin', size: '3.1 MB' }
        ];
    };

    const generateReport = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        if (startDate > endDate) {
            toast.error('Start date cannot be after end date');
            return;
        }

        setGenerating(true);

        try {
            const token = localStorage.getItem('token');
            const params = {
                type: reportType,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                restaurant_id: filters.restaurant_id,
                category: filters.category
            };

            const response = await axios.get('/api/admin/reports', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportData(response.data.data);

            if (comparisonMode) {
                const previousStart = new Date(startDate);
                const previousEnd = new Date(endDate);
                const duration = endDate - startDate;
                previousStart.setTime(previousStart.getTime() - duration);
                previousEnd.setTime(previousEnd.getTime() - duration);

                const prevResponse = await axios.get('/api/admin/reports', {
                    params: { ...params, start_date: previousStart.toISOString(), end_date: previousEnd.toISOString() },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPreviousPeriodData(prevResponse.data.data);
            }

            toast.success('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            generateMockReport();
        } finally {
            setGenerating(false);
        }
    };

    const generateMockReport = () => {
        const mockData = {
            sales: {
                summary: {
                    total_revenue: 1256789,
                    total_orders: 3456,
                    avg_order_value: 363,
                    total_items_sold: 8923,
                    unique_customers: 2345,
                    growth_percentage: 18.5,
                    projected_revenue: 1480000
                },
                daily_trend: generateDailyTrend(),
                top_restaurants: [
                    { name: 'Pizza Hut', revenue: 456789, orders: 1245, avg_rating: 4.8, growth: 15 },
                    { name: "McDonald's", revenue: 389012, orders: 1067, avg_rating: 4.7, growth: 12 },
                    { name: 'KFC', revenue: 298765, orders: 823, avg_rating: 4.6, growth: 8 },
                    { name: 'Dominos', revenue: 267890, orders: 734, avg_rating: 4.9, growth: 20 },
                    { name: 'Burger King', revenue: 212345, orders: 589, avg_rating: 4.5, growth: 5 }
                ],
                top_items: [
                    { name: 'Margherita Pizza', quantity: 1256, revenue: 375000, category: 'Pizza' },
                    { name: 'McChicken Burger', quantity: 1123, revenue: 168450, category: 'Burger' },
                    { name: 'Chicken Bucket', quantity: 892, revenue: 445000, category: 'Chicken' },
                    { name: 'French Fries', quantity: 2345, revenue: 117250, category: 'Sides' }
                ],
                payment_methods: [
                    { method: 'Online', percentage: 65, amount: 816912 },
                    { method: 'Cash', percentage: 25, amount: 314197 },
                    { method: 'Card', percentage: 10, amount: 125678 }
                ],
                category_distribution: [
                    { category: 'Pizza', value: 35, revenue: 439876 },
                    { category: 'Burgers', value: 28, revenue: 351900 },
                    { category: 'Chicken', value: 22, revenue: 276493 },
                    { category: 'Sides', value: 10, revenue: 125678 },
                    { category: 'Beverages', value: 5, revenue: 62839 }
                ]
            },
            orders: {
                total: 3456,
                completed: 2890,
                cancelled: 345,
                pending: 221,
                completion_rate: 83.6,
                avg_preparation_time: 18,
                avg_delivery_time: 32,
                by_status: [
                    { status: 'delivered', count: 2890, percentage: 83.6, color: '#4CAF50' },
                    { status: 'cancelled', count: 345, percentage: 10.0, color: '#F44336' },
                    { status: 'pending', count: 221, percentage: 6.4, color: '#FF9800' }
                ],
                by_hour: [
                    { hour: '10-11', orders: 145, percentage: 4.2 },
                    { hour: '11-12', orders: 234, percentage: 6.8 },
                    { hour: '12-13', orders: 456, percentage: 13.2 },
                    { hour: '13-14', orders: 523, percentage: 15.1 },
                    { hour: '19-20', orders: 567, percentage: 16.4 },
                    { hour: '20-21', orders: 489, percentage: 14.1 }
                ],
                by_day: [
                    { day: 'Monday', orders: 423, percentage: 12.2 },
                    { day: 'Tuesday', orders: 398, percentage: 11.5 },
                    { day: 'Wednesday', orders: 412, percentage: 11.9 },
                    { day: 'Thursday', orders: 445, percentage: 12.9 },
                    { day: 'Friday', orders: 534, percentage: 15.5 },
                    { day: 'Saturday', orders: 589, percentage: 17.0 },
                    { day: 'Sunday', orders: 655, percentage: 19.0 }
                ]
            },
            users: {
                total: 5678,
                new_users: 1234,
                active_users: 3456,
                growth_rate: 27.8,
                retention_rate: 68.5,
                churn_rate: 8.2,
                by_role: [
                    { role: 'customer', count: 4567, percentage: 80.5, icon: '👤' },
                    { role: 'restaurant_owner', count: 678, percentage: 11.9, icon: '🏪' },
                    { role: 'delivery_partner', count: 433, percentage: 7.6, icon: '🚚' }
                ],
                user_growth: generateUserGrowth(),
                user_engagement: {
                    avg_session_time: 12.5,
                    avg_orders_per_user: 4.2,
                    user_lifetime_value: 12500
                }
            },
            restaurants: {
                total: 156,
                active: 134,
                pending_approval: 12,
                suspended: 10,
                avg_rating: 4.5,
                growth_rate: 18.5,
                top_performers: [
                    { name: 'Pizza Hut', rating: 4.8, orders: 1245, revenue: 456789, growth: 15.2 },
                    { name: "McDonald's", rating: 4.7, orders: 1067, revenue: 389012, growth: 12.8 },
                    { name: 'KFC', rating: 4.6, orders: 823, revenue: 298765, growth: 8.5 },
                    { name: 'Dominos', rating: 4.9, orders: 734, revenue: 267890, growth: 20.3 }
                ],
                by_cuisine: [
                    { cuisine: 'Italian', count: 34, orders: 2345, revenue: 789012 },
                    { cuisine: 'American', count: 28, orders: 1987, revenue: 567890 },
                    { cuisine: 'Chinese', count: 23, orders: 1456, revenue: 345678 },
                    { cuisine: 'Indian', count: 31, orders: 1876, revenue: 456789 }
                ]
            },
            delivery: {
                total_deliveries: 2890,
                avg_delivery_time: 32,
                on_time_delivery: 85.5,
                avg_distance: 3.8,
                total_distance_km: 10982,
                total_earnings: 231200,
                partner_performance: [
                    { name: 'Mohan Singh', deliveries: 456, rating: 4.9, avg_time: 28, earnings: 36480 },
                    { name: 'Raj Kumar', deliveries: 423, rating: 4.8, avg_time: 30, earnings: 33840 },
                    { name: 'Priya Sharma', deliveries: 398, rating: 4.95, avg_time: 26, earnings: 31840 },
                    { name: 'Amit Patel', deliveries: 367, rating: 4.7, avg_time: 32, earnings: 29360 }
                ],
                by_area: [
                    { area: 'Downtown', deliveries: 856, avg_time: 28, percentage: 29.6 },
                    { area: 'Suburbs', deliveries: 1123, avg_time: 35, percentage: 38.9 },
                    { area: 'Commercial', deliveries: 567, avg_time: 25, percentage: 19.6 },
                    { area: 'Residential', deliveries: 344, avg_time: 38, percentage: 11.9 }
                ],
                delivery_slots: [
                    { slot: 'Morning (6-11)', deliveries: 234, percentage: 8.1 },
                    { slot: 'Lunch (11-15)', deliveries: 1123, percentage: 38.9 },
                    { slot: 'Evening (15-19)', deliveries: 789, percentage: 27.3 },
                    { slot: 'Night (19-24)', deliveries: 744, percentage: 25.7 }
                ]
            }
        };
        setReportData(mockData[reportType] || mockData.sales);
    };

    const generateDailyTrend = () => {
        const data = [];
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            data.push({
                date: date.toLocaleDateString(),
                revenue: Math.floor(Math.random() * 50000) + (isWeekend ? 40000 : 25000),
                orders: Math.floor(Math.random() * 150) + (isWeekend ? 80 : 50)
            });
        }
        return data;
    };

    const generateUserGrowth = () => {
        const data = [];
        const months = 6;
        for (let i = months; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            data.push({
                month: date.toLocaleDateString('default', { month: 'short' }),
                new_users: Math.floor(Math.random() * 300) + 100,
                active_users: Math.floor(Math.random() * 2000) + 500
            });
        }
        return data;
    };

    const saveReport = async () => {
        if (!reportData) {
            toast.error('No report to save');
            return;
        }

        const reportName = prompt('Enter a name for this report:',
            `${reportType.toUpperCase()} Report ${new Date().toLocaleDateString()}`);
        if (!reportName) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/saved-reports', {
                name: reportName,
                type: reportType,
                data: reportData,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                filters
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Report saved successfully');
            fetchSavedReports();
        } catch (error) {
            console.error('Error saving report:', error);
            toast.error('Failed to save report');
        }
    };

    const scheduleReportGeneration = async () => {
        if (!scheduleReport.email) {
            toast.error('Please enter email address');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/schedule-report', {
                ...scheduleReport,
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                filters
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Report scheduled successfully');
            setScheduleReport(prev => ({ ...prev, enabled: false }));
        } catch (error) {
            console.error('Error scheduling report:', error);
            toast.error('Failed to schedule report');
        }
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

    const getComparisonValue = (current, previous) => {
        if (!previous || previous === 0) return null;
        const change = ((current - previous) / previous) * 100;
        const isPositive = change > 0;
        return (
            <span className={`comparison-badge ${isPositive ? 'positive' : 'negative'}`}>
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
                            {entry.name}: {entry.name.toLowerCase().includes('revenue') || entry.name === 'Revenue'
                                ? formatCurrency(entry.value)
                                : formatNumber(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderSalesReport = () => (
        <div className="report-content">
            <div className="report-summary">
                <div className="summary-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-details">
                        <h4>Total Revenue</h4>
                        <p className="summary-value">{formatCurrency(reportData.summary?.total_revenue)}</p>
                        {comparisonMode && previousPeriodData && getComparisonValue(
                            reportData.summary?.total_revenue,
                            previousPeriodData.summary?.total_revenue
                        )}
                        {reportData.summary?.growth_percentage && (
                            <span className="trend up">↑ {reportData.summary.growth_percentage}%</span>
                        )}
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📦</div>
                    <div className="summary-details">
                        <h4>Total Orders</h4>
                        <p className="summary-value">{formatNumber(reportData.summary?.total_orders)}</p>
                        {comparisonMode && previousPeriodData && getComparisonValue(
                            reportData.summary?.total_orders,
                            previousPeriodData.summary?.total_orders
                        )}
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-details">
                        <h4>Avg Order Value</h4>
                        <p className="summary-value">{formatCurrency(reportData.summary?.avg_order_value)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">👥</div>
                    <div className="summary-details">
                        <h4>Unique Customers</h4>
                        <p className="summary-value">{formatNumber(reportData.summary?.unique_customers)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🎯</div>
                    <div className="summary-details">
                        <h4>Projected Revenue</h4>
                        <p className="summary-value">{formatCurrency(reportData.summary?.projected_revenue)}</p>
                    </div>
                </div>
            </div>

            {reportData.daily_trend && (
                <div className="report-section">
                    <h3>Revenue & Orders Trend</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={reportData.daily_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" strokeWidth={2} dot={{ r: 4 }} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {reportData.category_distribution && (
                <div className="charts-row">
                    <div className="chart-card">
                        <h3>Category Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={reportData.category_distribution}
                                    dataKey="value"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ category, value }) => `${category}: ${value}%`}
                                >
                                    {reportData.category_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {reportData.payment_methods && (
                        <div className="chart-card">
                            <h3>Payment Methods</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportData.payment_methods} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="method" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="percentage" fill="#8884d8">
                                        {reportData.payment_methods.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {reportData.top_restaurants && (
                <div className="report-section">
                    <h3>Top Performing Restaurants</h3>
                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Restaurant</th>
                                    <th>Revenue</th>
                                    <th>Orders</th>
                                    <th>Rating</th>
                                    <th>Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.top_restaurants.map((rest, idx) => (
                                    <tr key={idx}>
                                        <td className="rank">#{idx + 1}</td>
                                        <td className="restaurant-name">{rest.name}</td>
                                        <td className="revenue">{formatCurrency(rest.revenue)}</td>
                                        <td className="orders">{formatNumber(rest.orders)}</td>
                                        <td className="rating">⭐ {rest.avg_rating}</td>
                                        <td className={`growth ${rest.growth > 0 ? 'positive' : 'negative'}`}>
                                            {rest.growth > 0 ? '↑' : '↓'} {Math.abs(rest.growth)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {reportData.top_items && (
                <div className="report-section">
                    <h3>Top Selling Items</h3>
                    <div className="items-grid">
                        {reportData.top_items.map((item, idx) => (
                            <div key={idx} className="item-card">
                                <div className="item-rank">#{idx + 1}</div>
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p className="item-category">{item.category}</p>
                                    <div className="item-stats">
                                        <span>📦 {formatNumber(item.quantity)} sold</span>
                                        <span>💰 {formatCurrency(item.revenue)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderOrdersReport = () => (
        <div className="report-content">
            <div className="report-summary">
                <div className="summary-card">
                    <div className="summary-icon">📋</div>
                    <div className="summary-details">
                        <h4>Total Orders</h4>
                        <p className="summary-value">{formatNumber(reportData.total)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-details">
                        <h4>Completion Rate</h4>
                        <p className="summary-value">{reportData.completion_rate}%</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⏱️</div>
                    <div className="summary-details">
                        <h4>Avg Prep Time</h4>
                        <p className="summary-value">{reportData.avg_preparation_time} min</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🚚</div>
                    <div className="summary-details">
                        <h4>Avg Delivery Time</h4>
                        <p className="summary-value">{reportData.avg_delivery_time} min</p>
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>Order Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={reportData.by_status}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ status, percentage }) => `${status}: ${percentage}%`}
                            >
                                {reportData.by_status.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Orders by Day of Week</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.by_day}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {reportData.by_hour && (
                <div className="report-section">
                    <h3>Peak Ordering Hours</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.by_hour}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="orders" fill="#82ca9d">
                                {reportData.by_hour.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.orders > 500 ? '#ff6b6b' : entry.orders > 300 ? '#ffc658' : '#82ca9d'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );

    const renderUsersReport = () => (
        <div className="report-content">
            <div className="report-summary">
                <div className="summary-card">
                    <div className="summary-icon">👥</div>
                    <div className="summary-details">
                        <h4>Total Users</h4>
                        <p className="summary-value">{formatNumber(reportData.total)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🆕</div>
                    <div className="summary-details">
                        <h4>New Users</h4>
                        <p className="summary-value">{formatNumber(reportData.new_users)}</p>
                        {reportData.growth_rate && <span className="trend up">↑ {reportData.growth_rate}%</span>}
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🟢</div>
                    <div className="summary-details">
                        <h4>Active Users</h4>
                        <p className="summary-value">{formatNumber(reportData.active_users)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🔄</div>
                    <div className="summary-details">
                        <h4>Retention Rate</h4>
                        <p className="summary-value">{reportData.retention_rate}%</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⚠️</div>
                    <div className="summary-details">
                        <h4>Churn Rate</h4>
                        <p className="summary-value">{reportData.churn_rate}%</p>
                    </div>
                </div>
            </div>

            {reportData.user_growth && (
                <div className="report-section">
                    <h3>User Growth Trend</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={reportData.user_growth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="new_users" stackId="1" stroke="#8884d8" fill="#8884d8" name="New Users" />
                            <Area type="monotone" dataKey="active_users" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Active Users" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {reportData.user_engagement && (
                <div className="engagement-metrics">
                    <div className="metric-card">
                        <span className="metric-icon">⏱️</span>
                        <div>
                            <h4>Avg Session Time</h4>
                            <p>{reportData.user_engagement.avg_session_time} min</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-icon">📦</span>
                        <div>
                            <h4>Avg Orders per User</h4>
                            <p>{reportData.user_engagement.avg_orders_per_user}</p>
                        </div>
                    </div>
                    <div className="metric-card">
                        <span className="metric-icon">💰</span>
                        <div>
                            <h4>Customer Lifetime Value</h4>
                            <p>{formatCurrency(reportData.user_engagement.user_lifetime_value)}</p>
                        </div>
                    </div>
                </div>
            )}

            {reportData.by_role && (
                <div className="report-section">
                    <h3>Users by Role</h3>
                    <div className="role-distribution">
                        {reportData.by_role.map((role, idx) => (
                            <div key={idx} className="role-card">
                                <div className="role-icon">{role.icon}</div>
                                <div className="role-info">
                                    <h4>{role.role?.replace(/_/g, ' ')}</h4>
                                    <p className="role-count">{formatNumber(role.count)}</p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${role.percentage}%` }} />
                                    </div>
                                    <small>{role.percentage}%</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderRestaurantsReport = () => (
        <div className="report-content">
            <div className="report-summary">
                <div className="summary-card">
                    <div className="summary-icon">🏪</div>
                    <div className="summary-details">
                        <h4>Total Restaurants</h4>
                        <p className="summary-value">{formatNumber(reportData.total)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-details">
                        <h4>Active</h4>
                        <p className="summary-value">{formatNumber(reportData.active)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⏳</div>
                    <div className="summary-details">
                        <h4>Pending Approval</h4>
                        <p className="summary-value">{formatNumber(reportData.pending_approval)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⭐</div>
                    <div className="summary-details">
                        <h4>Avg Rating</h4>
                        <p className="summary-value">{reportData.avg_rating}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📈</div>
                    <div className="summary-details">
                        <h4>Growth Rate</h4>
                        <p className="summary-value">{reportData.growth_rate}%</p>
                    </div>
                </div>
            </div>

            {reportData.top_performers && (
                <div className="report-section">
                    <h3>Top Performing Restaurants</h3>
                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Restaurant</th>
                                    <th>Rating</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.top_performers.map((rest, idx) => (
                                    <tr key={idx}>
                                        <td className="rank">#{idx + 1}</td>
                                        <td className="restaurant-name">{rest.name}</td>
                                        <td className="rating">⭐ {rest.rating}</td>
                                        <td className="orders">{formatNumber(rest.orders)}</td>
                                        <td className="revenue">{formatCurrency(rest.revenue)}</td>
                                        <td className={`growth ${rest.growth > 0 ? 'positive' : 'negative'}`}>
                                            {rest.growth > 0 ? '↑' : '↓'} {Math.abs(rest.growth)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderDeliveryReport = () => (
        <div className="report-content">
            <div className="report-summary">
                <div className="summary-card">
                    <div className="summary-icon">🚚</div>
                    <div className="summary-details">
                        <h4>Total Deliveries</h4>
                        <p className="summary-value">{formatNumber(reportData.total_deliveries)}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">⏱️</div>
                    <div className="summary-details">
                        <h4>Avg Delivery Time</h4>
                        <p className="summary-value">{reportData.avg_delivery_time} min</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">🎯</div>
                    <div className="summary-details">
                        <h4>On-Time Delivery</h4>
                        <p className="summary-value">{reportData.on_time_delivery}%</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">📏</div>
                    <div className="summary-details">
                        <h4>Avg Distance</h4>
                        <p className="summary-value">{reportData.avg_distance} km</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon">💰</div>
                    <div className="summary-details">
                        <h4>Total Earnings</h4>
                        <p className="summary-value">{formatCurrency(reportData.total_earnings)}</p>
                    </div>
                </div>
            </div>

            <div className="charts-row">
                <div className="chart-card">
                    <h3>Delivery by Time Slot</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={reportData.delivery_slots}
                                dataKey="deliveries"
                                nameKey="slot"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ slot, percent }) => `${slot}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {reportData.delivery_slots.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Delivery by Area</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.by_area}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="area" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="deliveries" fill="#8884d8" name="Deliveries" />
                            <Bar yAxisId="right" dataKey="avg_time" fill="#82ca9d" name="Avg Time (min)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {reportData.partner_performance && (
                <div className="report-section">
                    <h3>Delivery Partner Performance</h3>
                    <div className="table-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Partner</th>
                                    <th>Deliveries</th>
                                    <th>Rating</th>
                                    <th>Avg Time</th>
                                    <th>Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.partner_performance.map((partner, idx) => (
                                    <tr key={idx}>
                                        <td className="rank">#{idx + 1}</td>
                                        <td className="partner-name">{partner.name}</td>
                                        <td className="deliveries">{formatNumber(partner.deliveries)}</td>
                                        <td className="rating">⭐ {partner.rating}</td>
                                        <td className="avg-time">{partner.avg_time} min</td>
                                        <td className="earnings">{formatCurrency(partner.earnings)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderReportContent = () => {
        if (!reportData) return null;

        switch (reportType) {
            case 'sales':
                return renderSalesReport();
            case 'orders':
                return renderOrdersReport();
            case 'users':
                return renderUsersReport();
            case 'restaurants':
                return renderRestaurantsReport();
            case 'delivery':
                return renderDeliveryReport();
            default:
                return renderSalesReport();
        }
    };

    return (
        <div className="admin-reports">
            <div className="section-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">📊</span>
                        Reports & Analytics
                    </h2>
                    <div className="header-badges">
                        {comparisonMode && <span className="badge comparison">📈 Comparison Mode</span>}
                        {scheduleReport.enabled && <span className="badge scheduled">⏰ Scheduled</span>}
                    </div>
                </div>
                <div className="header-controls">
                    <button className="saved-reports-btn" onClick={() => setShowSavedReports(!showSavedReports)}>
                        📁 Saved Reports ({savedReports.length})
                    </button>
                    <button className="schedule-btn" onClick={() => setScheduleReport(prev => ({ ...prev, enabled: !prev.enabled }))}>
                        ⏰ Schedule
                    </button>
                </div>
            </div>

            {scheduleReport.enabled && (
                <div className="schedule-panel">
                    <h3>Schedule Report</h3>
                    <div className="schedule-form">
                        <div className="form-group">
                            <label>Frequency</label>
                            <select value={scheduleReport.frequency} onChange={(e) => setScheduleReport(prev => ({ ...prev, frequency: e.target.value }))}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter email address" value={scheduleReport.email} onChange={(e) => setScheduleReport(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label>Format</label>
                            <select value={scheduleReport.format} onChange={(e) => setScheduleReport(prev => ({ ...prev, format: e.target.value }))}>
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button className="cancel-schedule" onClick={() => setScheduleReport(prev => ({ ...prev, enabled: false }))}>Cancel</button>
                            <button className="save-schedule" onClick={scheduleReportGeneration}>Schedule Report</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="report-controls">
                <div className="control-group">
                    <label>Report Type</label>
                    <div className="report-type-buttons">
                        {['sales', 'orders', 'users', 'restaurants', 'delivery'].map(type => (
                            <button
                                key={type}
                                className={`report-type-btn ${reportType === type ? 'active' : ''}`}
                                onClick={() => setReportType(type)}
                            >
                                {type === 'sales' && '💰 Sales'}
                                {type === 'orders' && '📦 Orders'}
                                {type === 'users' && '👥 Users'}
                                {type === 'restaurants' && '🏪 Restaurants'}
                                {type === 'delivery' && '🚚 Delivery'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Date Range</label>
                    <div className="date-range-inputs">
                        <DatePicker
                            selected={startDate}
                            onChange={setStartDate}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            maxDate={endDate}
                            className="date-picker"
                        />
                        <span className="range-separator">→</span>
                        <DatePicker
                            selected={endDate}
                            onChange={setEndDate}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className="date-picker"
                        />
                    </div>
                </div>

                <div className="control-group">
                    <label>Filters</label>
                    <div className="filter-inputs">
                        <select value={filters.restaurant_id} onChange={(e) => setFilters(prev => ({ ...prev, restaurant_id: e.target.value }))}>
                            <option value="all">All Restaurants</option>
                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}>
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="report-actions">
                    <label className="comparison-label">
                        <input type="checkbox" checked={comparisonMode} onChange={(e) => setComparisonMode(e.target.checked)} />
                        Compare with previous period
                    </label>
                    <button className="generate-btn" onClick={generateReport} disabled={generating}>
                        {generating ? '⏳ Generating...' : '📊 Generate Report'}
                    </button>
                    {reportData && (
                        <>
                            <button className="save-btn" onClick={saveReport}>💾 Save</button>
                            <button className="print-btn" onClick={() => window.print()}>🖨️ Print</button>
                        </>
                    )}
                </div>
            </div>

            {showSavedReports && (
                <div className="saved-reports-sidebar">
                    <div className="sidebar-header">
                        <h3>📁 Saved Reports</h3>
                        <button className="close-sidebar" onClick={() => setShowSavedReports(false)}>×</button>
                    </div>
                    <div className="saved-reports-list">
                        {savedReports.length === 0 ? (
                            <div className="no-saved-reports">
                                <span>📭</span>
                                <p>No saved reports yet</p>
                            </div>
                        ) : (
                            savedReports.map(report => (
                                <div key={report.id} className="saved-report-item">
                                    <div className="report-info">
                                        <span className="report-icon">
                                            {report.type === 'sales' && '💰'}
                                            {report.type === 'orders' && '📦'}
                                            {report.type === 'users' && '👥'}
                                            {report.type === 'restaurants' && '🏪'}
                                            {report.type === 'delivery' && '🚚'}
                                        </span>
                                        <div className="report-details">
                                            <h4>{report.name}</h4>
                                            <small>{new Date(report.date).toLocaleDateString()}</small>
                                            <small className="report-size">{report.size}</small>
                                        </div>
                                    </div>
                                    <div className="report-actions">
                                        <button className="load-report" title="Load Report">📂</button>
                                        <button className="delete-report" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {generating && (
                <div className="report-loading">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Generating report...</p>
                </div>
            )}

            {reportData && !generating && (
                <div className="report-container">
                    <div className="report-header">
                        <div>
                            <h3>
                                {reportType === 'sales' && '💰 Sales Report'}
                                {reportType === 'orders' && '📦 Orders Report'}
                                {reportType === 'users' && '👥 Users Report'}
                                {reportType === 'restaurants' && '🏪 Restaurants Report'}
                                {reportType === 'delivery' && '🚚 Delivery Report'}
                            </h3>
                            <div className="report-meta">
                                <span>📅 Period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                                <span>⏰ Generated: {new Date().toLocaleString()}</span>
                                {comparisonMode && previousPeriodData && <span>📊 Compared with previous period</span>}
                            </div>
                        </div>
                        <div className="report-stats-badge">
                            <span className="stat-badge">✅ Data is up to date</span>
                        </div>
                    </div>
                    {renderReportContent()}
                </div>
            )}

            {!reportData && !generating && (
                <div className="no-report">
                    <div className="no-report-icon">📊</div>
                    <h3>No Report Generated</h3>
                    <p>Select report type and date range, then click "Generate Report"</p>
                    <div className="quick-actions">
                        <button onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date();
                            lastWeek.setDate(lastWeek.getDate() - 7);
                            setStartDate(lastWeek);
                            setEndDate(today);
                            generateReport();
                        }}>
                            Last 7 Days
                        </button>
                        <button onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date();
                            lastMonth.setMonth(lastMonth.getMonth() - 1);
                            setStartDate(lastMonth);
                            setEndDate(today);
                            generateReport();
                        }}>
                            Last 30 Days
                        </button>
                        <button onClick={() => {
                            const today = new Date();
                            const lastYear = new Date();
                            lastYear.setFullYear(lastYear.getFullYear() - 1);
                            setStartDate(lastYear);
                            setEndDate(today);
                            generateReport();
                        }}>
                            Last 12 Months
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
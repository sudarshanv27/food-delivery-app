// src/components/profile/admin/AdminAnalytics.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        revenueData: [],
        orderStatusData: [],
        popularItems: [],
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0,
        avgRating: 4.5,
        loading: true
    });
    const [dateRange, setDateRange] = useState('last7days');
    const [error, setError] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    useEffect(() => {
        fetchAnalytics();

        // Set up polling for real-time updates (every 30 seconds)
        const interval = setInterval(() => {
            fetchAnalytics();
        }, 30000);

        return () => clearInterval(interval);
    }, [dateRange]);

    const fetchAnalytics = async (range = dateRange) => {
        setAnalytics(prev => ({ ...prev, loading: true }));
        setError(null);

        try {
            const response = await axios.get(`/api/admin/analytics?range=${range}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAnalytics({
                ...response.data,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to load analytics data. Please try again.');
            setAnalytics(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDateRangeChange = (e) => {
        const range = e.target.value;
        setDateRange(range);
        fetchAnalytics(range);
    };

    const exportData = async (format = 'csv') => {
        try {
            const response = await axios.get(`/api/admin/analytics/export?format=${format}&range=${dateRange}`, {
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
        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export data. Please try again.');
        }
    };

    const TrendIndicator = ({ value }) => {
        const isPositive = value > 0;
        return (
            <span className={`trend ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(value)}%
            </span>
        );
    };

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={() => fetchAnalytics()} className="retry-btn">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (analytics.loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading analytics data...</p>
            </div>
        );
    }

    return (
        <div className="admin-analytics">
            <div className="section-header">
                <h2>Analytics Dashboard</h2>
                <div className="header-controls">
                    <div className="date-range-filter">
                        <select value={dateRange} onChange={handleDateRangeChange}>
                            <option value="last7days">Last 7 days</option>
                            <option value="last30days">Last 30 days</option>
                            <option value="last3months">Last 3 months</option>
                            <option value="thisyear">This year</option>
                        </select>
                    </div>
                    <div className="export-buttons">
                        <button onClick={() => exportData('csv')} className="export-btn csv">
                            📄 Export CSV
                        </button>
                        <button onClick={() => exportData('pdf')} className="export-btn pdf">
                            📑 Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="analytics-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p className="stat-value">₹{(analytics.totalRevenue || 0).toLocaleString()}</p>
                        <TrendIndicator value={12.5} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p className="stat-value">{analytics.totalOrders || 0}</p>
                        <TrendIndicator value={8.3} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Active Users</h3>
                        <p className="stat-value">{analytics.activeUsers || 0}</p>
                        <TrendIndicator value={15.2} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>Avg. Rating</h3>
                        <p className="stat-value">{analytics.avgRating || 4.5}</p>
                        <TrendIndicator value={0.3} />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="analytics-charts">
                <div className="chart-card">
                    <h3>Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Order Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics.orderStatusData}
                                dataKey="value"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {analytics.orderStatusData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card full-width">
                    <h3>Popular Items</h3>
                    <div className="popular-items-list">
                        {analytics.popularItems?.map((item, index) => (
                            <div key={index} className="popular-item">
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-count">{item.orders} orders</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress"
                                        style={{ width: `${(item.orders / analytics.popularItems[0]?.orders) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!analytics.popularItems || analytics.popularItems.length === 0) && (
                            <div className="no-data">No popular items data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
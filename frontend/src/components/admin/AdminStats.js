import React, { useState, useEffect } from 'react';
import './AdminStats.css';

const AdminStats = ({ stats, loading, onRefresh }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [animatedValues, setAnimatedValues] = useState({});
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        if (stats && !loading) {
            animateValues();
        }
    }, [stats, loading]);

    const animateValues = () => {
        const initial = {};
        Object.keys(stats).forEach(key => {
            initial[key] = 0;
        });
        setAnimatedValues(initial);

        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;

        Object.keys(stats).forEach(key => {
            const target = stats[key];
            const increment = target / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current += increment;
                if (step >= steps) {
                    current = target;
                    clearInterval(timer);
                }
                setAnimatedValues(prev => ({
                    ...prev,
                    [key]: Math.floor(current)
                }));
            }, stepTime);
        });
    };

    const statCards = [
        {
            id: 'totalRevenue',
            title: 'Total Revenue',
            valueKey: 'totalRevenue',
            icon: '💰',
            color: '#4caf50',
            gradient: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            trend: '+12.5%',
            trendUp: true,
            prefix: '₹',
            format: 'currency',
            description: 'Total revenue generated'
        },
        {
            id: 'totalOrders',
            title: 'Total Orders',
            valueKey: 'totalOrders',
            icon: '📦',
            color: '#2196f3',
            gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            trend: '+8.2%',
            trendUp: true,
            format: 'number',
            description: 'Orders placed'
        },
        {
            id: 'totalUsers',
            title: 'Total Users',
            valueKey: 'totalUsers',
            icon: '👥',
            color: '#ff9800',
            gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            trend: '+15.3%',
            trendUp: true,
            format: 'number',
            description: 'Registered users'
        },
        {
            id: 'totalRestaurants',
            title: 'Restaurants',
            valueKey: 'totalRestaurants',
            icon: '🏪',
            color: '#9c27b0',
            gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            trend: '+5.7%',
            trendUp: true,
            format: 'number',
            description: 'Active restaurants'
        },
        {
            id: 'pendingOrders',
            title: 'Pending Orders',
            valueKey: 'pendingOrders',
            icon: '⏳',
            color: '#ff4757',
            gradient: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
            trend: '-3.2%',
            trendUp: false,
            format: 'number',
            description: 'Orders pending fulfillment'
        },
        {
            id: 'activeDeliveries',
            title: 'Active Deliveries',
            valueKey: 'activeDeliveries',
            icon: '🚚',
            color: '#00bcd4',
            gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            trend: '+22.1%',
            trendUp: true,
            format: 'number',
            description: 'Ongoing deliveries'
        },
        {
            id: 'activeOffers',
            title: 'Active Offers',
            valueKey: 'activeOffers',
            icon: '🎫',
            color: '#e91e63',
            gradient: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
            trend: '+2',
            trendUp: true,
            format: 'number',
            description: 'Currently active promotions'
        },
        {
            id: 'avgRating',
            title: 'Avg Rating',
            valueKey: 'avgRating',
            icon: '⭐',
            color: '#ffc107',
            gradient: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
            trend: '+0.2',
            trendUp: true,
            decimal: 1,
            format: 'rating',
            description: 'Average customer rating'
        }
    ];

    const getFormattedValue = (card, value) => {
        if (card.format === 'currency') {
            return `${card.prefix}${value.toLocaleString()}`;
        }
        if (card.format === 'rating') {
            return value.toFixed(card.decimal || 1);
        }
        return value.toLocaleString();
    };

    const getTrendIcon = (trendUp) => {
        return trendUp ? '📈' : '📉';
    };

    if (loading) {
        return (
            <div className="admin-stats-container">
                <div className="stats-header">
                    <h2>Dashboard Overview</h2>
                    <div className="stats-controls">
                        <div className="skeleton-control"></div>
                        <div className="skeleton-control"></div>
                    </div>
                </div>
                <div className="admin-stats-grid">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="stat-card skeleton">
                            <div className="stat-icon skeleton-icon"></div>
                            <div className="stat-content">
                                <div className="stat-title skeleton-text"></div>
                                <div className="stat-value skeleton-value"></div>
                                <div className="stat-trend skeleton-trend"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-stats-container">
            <div className="stats-header">
                <div className="header-left">
                    <h2>Dashboard Overview</h2>
                    <p className="stats-subtitle">Real-time analytics and insights</p>
                </div>
                <div className="stats-controls">
                    <div className="period-selector">
                        <button
                            className={`period-btn ${selectedPeriod === 'day' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('day')}
                        >
                            Day
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('year')}
                        >
                            Year
                        </button>
                    </div>
                    <button className="refresh-btn" onClick={onRefresh}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div className="admin-stats-grid">
                {statCards.map((card) => (
                    <div
                        key={card.id}
                        className="stat-card"
                        style={{
                            background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                            borderTop: `3px solid ${card.color}`
                        }}
                        onMouseEnter={() => setHoveredCard(card.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div className="stat-card-inner">
                            <div className="stat-header">
                                <div className="stat-icon-wrapper">
                                    <div className="stat-icon" style={{ background: card.gradient }}>
                                        {card.icon}
                                    </div>
                                    {hoveredCard === card.id && (
                                        <div className="stat-tooltip">{card.description}</div>
                                    )}
                                </div>
                                <div className="stat-title">{card.title}</div>
                            </div>

                            <div className="stat-value">
                                {getFormattedValue(card, animatedValues[card.valueKey] || stats[card.valueKey] || 0)}
                            </div>

                            <div className="stat-footer">
                                <div className={`stat-trend ${card.trendUp ? 'up' : 'down'}`}>
                                    <span className="trend-icon">{getTrendIcon(card.trendUp)}</span>
                                    <span className="trend-value">{card.trend}</span>
                                </div>
                                <div className="stat-period">vs last {selectedPeriod}</div>
                            </div>

                            <div className="stat-progress">
                                <div
                                    className="stat-progress-bar"
                                    style={{
                                        width: `${Math.min(100, (stats[card.valueKey] / (stats.totalOrders || 1)) * 100)}%`,
                                        background: card.gradient
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Revenue Chart Component
export const RevenueChart = ({ data, loading, onPeriodChange }) => {
    const [hoveredBar, setHoveredBar] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('week');

    const handlePeriodChange = (period) => {
        setChartPeriod(period);
        onPeriodChange?.(period);
    };

    if (loading) {
        return (
            <div className="chart-card skeleton">
                <div className="chart-header">
                    <div className="skeleton-text"></div>
                    <div className="skeleton-control"></div>
                </div>
                <div className="chart-body skeleton-chart"></div>
            </div>
        );
    }

    const maxValue = Math.max(...(data?.map(d => d.revenue) || [0]));
    const totalRevenue = data?.reduce((sum, item) => sum + item.revenue, 0) || 0;

    return (
        <div className="chart-card">
            <div className="chart-header">
                <div className="chart-title-section">
                    <h3 className="chart-title">Revenue Overview</h3>
                    <div className="chart-total">Total: ₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="chart-controls">
                    <div className="period-buttons">
                        <button
                            className={`period-btn ${chartPeriod === 'day' ? 'active' : ''}`}
                            onClick={() => handlePeriodChange('day')}
                        >
                            Day
                        </button>
                        <button
                            className={`period-btn ${chartPeriod === 'week' ? 'active' : ''}`}
                            onClick={() => handlePeriodChange('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`period-btn ${chartPeriod === 'month' ? 'active' : ''}`}
                            onClick={() => handlePeriodChange('month')}
                        >
                            Month
                        </button>
                    </div>
                    <div className="chart-actions">
                        <button className="chart-action-btn" title="Download Report">📥</button>
                        <button className="chart-action-btn" title="Full Screen">🖥️</button>
                    </div>
                </div>
            </div>

            <div className="revenue-chart-container">
                <div className="revenue-chart">
                    {data?.map((item, index) => (
                        <div key={index} className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                onMouseEnter={() => setHoveredBar(index)}
                                onMouseLeave={() => setHoveredBar(null)}
                            >
                                <div
                                    className="bar"
                                    style={{
                                        height: `${(item.revenue / maxValue) * 100}%`,
                                        background: 'linear-gradient(180deg, #ff4757 0%, #ff6b81 100%)'
                                    }}
                                >
                                    {hoveredBar === index && (
                                        <div className="bar-tooltip">
                                            <div className="tooltip-value">₹{item.revenue.toLocaleString()}</div>
                                            <div className="tooltip-label">{item.day}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="chart-bar-label">{item.day}</div>
                        </div>
                    ))}
                </div>
                <div className="chart-stats">
                    <div className="stat-item">
                        <span className="stat-label">Average Daily Revenue</span>
                        <span className="stat-value">₹{(totalRevenue / (data?.length || 1)).toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Highest Revenue</span>
                        <span className="stat-value">₹{maxValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Order Status Distribution
export const OrderStatusChart = ({ data, loading, onStatusClick }) => {
    const [selectedStatus, setSelectedStatus] = useState(null);

    const statuses = [
        { label: 'Delivered', color: '#4caf50', icon: '✅', gradient: 'linear-gradient(135deg, #4caf50, #45a049)' },
        { label: 'Processing', color: '#2196f3', icon: '🔄', gradient: 'linear-gradient(135deg, #2196f3, #1976d2)' },
        { label: 'Pending', color: '#ff9800', icon: '⏳', gradient: 'linear-gradient(135deg, #ff9800, #f57c00)' },
        { label: 'Cancelled', color: '#f44336', icon: '❌', gradient: 'linear-gradient(135deg, #f44336, #d32f2f)' }
    ];

    const handleStatusClick = (status) => {
        setSelectedStatus(selectedStatus === status.label ? null : status.label);
        onStatusClick?.(status.label.toLowerCase());
    };

    if (loading) {
        return (
            <div className="chart-card skeleton">
                <div className="chart-header skeleton-text"></div>
                <div className="chart-body skeleton-donut"></div>
            </div>
        );
    }

    const total = statuses.reduce((sum, status) => sum + (data?.[status.label.toLowerCase()] || 0), 0);

    return (
        <div className="chart-card">
            <h3 className="chart-title">Order Status Distribution</h3>
            <div className="status-distribution-container">
                <div className="status-donut">
                    <svg viewBox="0 0 200 200" className="donut-chart">
                        {statuses.reduce((acc, status, index) => {
                            const value = data?.[status.label.toLowerCase()] || 0;
                            const percentage = (value / total) * 100;
                            const previousPercentage = acc.slice(-1)[0] || 0;
                            const startAngle = (previousPercentage / 100) * 360;
                            const endAngle = startAngle + (percentage / 100) * 360;

                            const startRad = (startAngle - 90) * Math.PI / 180;
                            const endRad = (endAngle - 90) * Math.PI / 180;

                            const x1 = 100 + 80 * Math.cos(startRad);
                            const y1 = 100 + 80 * Math.sin(startRad);
                            const x2 = 100 + 80 * Math.cos(endRad);
                            const y2 = 100 + 80 * Math.sin(endRad);

                            const largeArc = percentage > 50 ? 1 : 0;

                            const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

                            acc.push({
                                path: pathData,
                                color: status.color,
                                label: status.label,
                                value: value,
                                percentage: percentage
                            });

                            return acc;
                        }, []).map((segment, idx) => (
                            <path
                                key={idx}
                                d={segment.path}
                                fill={segment.color}
                                className="donut-segment"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                                onClick={() => handleStatusClick({ label: segment.label })}
                            />
                        ))}
                        <circle cx="100" cy="100" r="50" fill="white" />
                        <text x="100" y="105" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">
                            {total}
                        </text>
                        <text x="100" y="120" textAnchor="middle" fontSize="10" fill="#666">
                            Total Orders
                        </text>
                    </svg>
                </div>

                <div className="status-list">
                    {statuses.map((status) => {
                        const count = data?.[status.label.toLowerCase()] || 0;
                        const percentage = ((count / total) * 100).toFixed(1);
                        const isSelected = selectedStatus === status.label;

                        return (
                            <div
                                key={status.label}
                                className={`status-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleStatusClick(status)}
                            >
                                <div className="status-header">
                                    <div className="status-info">
                                        <span className="status-icon">{status.icon}</span>
                                        <span className="status-label">{status.label}</span>
                                    </div>
                                    <div className="status-numbers">
                                        <span className="status-count">{count.toLocaleString()}</span>
                                        <span className="status-percentage">({percentage}%)</span>
                                    </div>
                                </div>
                                <div className="status-bar-container">
                                    <div
                                        className="status-bar"
                                        style={{
                                            width: `${percentage}%`,
                                            background: status.gradient
                                        }}
                                    >
                                        <div className="status-bar-glow" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Enhanced Top Restaurants Component
export const TopRestaurants = ({ restaurants, loading, onViewAll }) => {
    const [expanded, setExpanded] = useState(false);
    const displayRestaurants = expanded ? restaurants : restaurants?.slice(0, 5);

    if (loading) {
        return (
            <div className="chart-card skeleton">
                <div className="top-list-header skeleton-text"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="top-item skeleton">
                        <div className="skeleton-rank"></div>
                        <div className="skeleton-info"></div>
                        <div className="skeleton-value"></div>
                    </div>
                ))}
            </div>
        );
    }

    const maxRevenue = Math.max(...(restaurants?.map(r => r.revenue) || [0]));

    return (
        <div className="chart-card">
            <div className="top-list-header">
                <h3 className="chart-title">Top Performing Restaurants</h3>
                {restaurants?.length > 5 && (
                    <button className="view-all-btn" onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'View Less' : 'View All'}
                        <span className="btn-icon">{expanded ? '▲' : '▼'}</span>
                    </button>
                )}
            </div>

            <div className="top-restaurants-list">
                {displayRestaurants?.map((restaurant, index) => {
                    const revenuePercentage = (restaurant.revenue / maxRevenue) * 100;
                    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

                    return (
                        <div key={restaurant.id} className="top-restaurant-item">
                            <div className="restaurant-rank">
                                {index < 3 ? (
                                    <span className="medal" style={{ color: medalColors[index] }}>🏆</span>
                                ) : (
                                    <span className="rank-number">#{index + 1}</span>
                                )}
                            </div>

                            <div className="restaurant-avatar">
                                <img
                                    src={restaurant.logo || `https://ui-avatars.com/api/?name=${restaurant.name}&background=${restaurant.color || 'ff4757'}&color=fff`}
                                    alt={restaurant.name}
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${restaurant.name}&background=ff4757&color=fff`;
                                    }}
                                />
                            </div>

                            <div className="restaurant-info">
                                <div className="restaurant-name">{restaurant.name}</div>
                                <div className="restaurant-meta">
                                    <span className="meta-rating">
                                        <span className="star">⭐</span> {restaurant.rating}
                                    </span>
                                    <span className="meta-orders">
                                        <span className="orders-icon">📦</span> {restaurant.orders.toLocaleString()} orders
                                    </span>
                                </div>
                                <div className="restaurant-progress">
                                    <div
                                        className="progress-bar"
                                        style={{
                                            width: `${revenuePercentage}%`,
                                            background: 'linear-gradient(90deg, #ff4757, #ff6b81)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="restaurant-revenue">
                                <div className="revenue-amount">₹{restaurant.revenue.toLocaleString()}</div>
                                <div className="revenue-growth">
                                    {restaurant.growth > 0 ? '↑' : '↓'} {Math.abs(restaurant.growth)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="top-list-footer">
                <button className="download-report-btn" onClick={onViewAll}>
                    📊 Download Full Report
                </button>
            </div>
        </div>
    );
};

// Additional Component: Recent Activity
export const RecentActivity = ({ activities, loading }) => {
    const getActivityIcon = (type) => {
        const icons = {
            order: '📦',
            user: '👤',
            restaurant: '🏪',
            payment: '💳',
            delivery: '🚚',
            system: '⚙️'
        };
        return icons[type] || '📋';
    };

    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

    if (loading) {
        return (
            <div className="chart-card skeleton">
                <div className="chart-header skeleton-text"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="activity-item skeleton">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-content"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="chart-card">
            <div className="chart-header">
                <h3 className="chart-title">Recent Activity</h3>
                <button className="view-all-btn">View All</button>
            </div>
            <div className="activity-timeline">
                {activities?.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-icon" style={{ background: activity.color || '#f0f0f0' }}>
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                            <div className="activity-message">{activity.message}</div>
                            <div className="activity-time">{getTimeAgo(activity.timestamp)}</div>
                        </div>
                        {activity.status && (
                            <div className={`activity-status ${activity.status}`}>
                                {activity.status}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminStats;
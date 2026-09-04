import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import RatingStars from '../../components/common/RatingStars';
import './DeliveryPartnerPanel.css';

const DeliveryPartnerPanel = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        todayDeliveries: 0,
        todayEarnings: 0,
        totalDeliveries: 0,
        totalEarnings: 0,
        rating: 0,
        completionRate: 0
    });
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [earnings, setEarnings] = useState([]);

    useEffect(() => {
        fetchPartnerData();
    }, []);

    const fetchPartnerData = async () => {
        setIsLoading(true);
        try {
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                todayDeliveries: 8,
                todayEarnings: 640,
                totalDeliveries: 156,
                totalEarnings: 12480,
                rating: 4.8,
                completionRate: 98
            });

            setActiveDeliveries([
                {
                    id: 'ORD-001',
                    restaurant: 'Pizza Hut',
                    customer: 'John Doe',
                    pickupAddress: '123 Main St, Downtown',
                    deliveryAddress: '456 Park Ave, Uptown',
                    distance: 3.2,
                    estimatedTime: 25,
                    pickupTime: '10:30 AM',
                    status: 'pickup',
                    items: 3,
                    earnings: 80
                },
                {
                    id: 'ORD-002',
                    restaurant: "McDonald's",
                    customer: 'Jane Smith',
                    pickupAddress: '789 Broadway',
                    deliveryAddress: '321 5th Ave',
                    distance: 2.5,
                    estimatedTime: 20,
                    pickupTime: '11:00 AM',
                    status: 'assigned',
                    items: 2,
                    earnings: 65
                }
            ]);

            setDeliveryHistory([
                { id: 'ORD-099', date: '2024-01-15', restaurant: 'KFC', earnings: 75, rating: 5, distance: 3.0 },
                { id: 'ORD-098', date: '2024-01-15', restaurant: 'Biryani House', earnings: 80, rating: 4.8, distance: 2.8 },
                { id: 'ORD-097', date: '2024-01-14', restaurant: 'Domino\'s', earnings: 70, rating: 5, distance: 3.5 },
                { id: 'ORD-096', date: '2024-01-14', restaurant: 'Starbucks', earnings: 60, rating: 4.5, distance: 2.0 }
            ]);

            setEarnings([
                { date: '2024-01-15', deliveries: 8, amount: 640, tips: 45 },
                { date: '2024-01-14', deliveries: 7, amount: 560, tips: 30 },
                { date: '2024-01-13', deliveries: 6, amount: 480, tips: 25 },
                { date: '2024-01-12', deliveries: 8, amount: 640, tips: 50 }
            ]);
        } catch (error) {
            console.error('Error fetching partner data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptDelivery = (deliveryId) => {
        console.log('Accept delivery:', deliveryId);
    };

    const handlePickupOrder = (deliveryId) => {
        console.log('Pickup order:', deliveryId);
    };

    const handleCompleteDelivery = (deliveryId) => {
        console.log('Complete delivery:', deliveryId);
    };

    const handleMarkAsDelivered = (deliveryId) => {
        console.log('Mark as delivered:', deliveryId);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const configs = {
            assigned: { class: 'assigned', text: 'Assigned', icon: '📋' },
            pickup: { class: 'pickup', text: 'Ready for Pickup', icon: '🏪' },
            picked_up: { class: 'picked', text: 'Picked Up', icon: '🛵' },
            delivered: { class: 'delivered', text: 'Delivered', icon: '✅' }
        };
        const config = configs[status] || configs.assigned;
        return (
            <span className={`status-badge ${config.class}`}>
                <span className="status-icon">{config.icon}</span>
                <span className="status-text">{config.text}</span>
            </span>
        );
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'active', label: 'Active Deliveries', icon: '🚚' },
        { id: 'history', label: 'Delivery History', icon: '📜' },
        { id: 'earnings', label: 'Earnings', icon: '💰' },
        { id: 'profile', label: 'Profile', icon: '👤' }
    ];

    if (isLoading) {
        return (
            <div className="delivery-panel-loading">
                <div className="loading-spinner"></div>
                <p>Loading delivery panel...</p>
            </div>
        );
    }

    return (
        <div className="delivery-partner-panel">
            <div className="panel-container">
                {/* Sidebar */}
                <div className="panel-sidebar">
                    <div className="partner-profile">
                        <img
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.full_name}&background=ff4757&color=fff`}
                            alt="Profile"
                            className="profile-avatar"
                        />
                        <div className="profile-info">
                            <h3>{user?.full_name}</h3>
                            <div className="profile-rating">
                                <RatingStars rating={stats.rating} size="small" readonly />
                                <span>({stats.rating})</span>
                            </div>
                        </div>
                    </div>

                    <nav className="panel-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="nav-icon">{tab.icon}</span>
                                <span className="nav-label">{tab.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="online-status">
                        <div className="status-toggle">
                            <span className="status-dot online"></span>
                            <span>Online</span>
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="panel-content">
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-tab">
                            <h2>Dashboard</h2>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">📦</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.todayDeliveries}</div>
                                        <div className="stat-label">Today's Deliveries</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-info">
                                        <div className="stat-value">₹{stats.todayEarnings}</div>
                                        <div className="stat-label">Today's Earnings</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">⭐</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.rating}</div>
                                        <div className="stat-label">Rating</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.completionRate}%</div>
                                        <div className="stat-label">Completion Rate</div>
                                    </div>
                                </div>
                            </div>

                            <div className="recent-deliveries">
                                <h3>Recent Deliveries</h3>
                                <div className="deliveries-list">
                                    {deliveryHistory.slice(0, 3).map(delivery => (
                                        <div key={delivery.id} className="delivery-item">
                                            <div className="delivery-info">
                                                <div className="delivery-id">Order #{delivery.id}</div>
                                                <div className="delivery-restaurant">{delivery.restaurant}</div>
                                            </div>
                                            <div className="delivery-earnings">₹{delivery.earnings}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="performance-tips">
                                <h3>Performance Tips</h3>
                                <ul>
                                    <li>✅ Maintain high rating for bonus incentives</li>
                                    <li>✅ Complete deliveries on time</li>
                                    <li>✅ Communicate with customers</li>
                                    <li>✅ Keep your vehicle clean</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Active Deliveries Tab */}
                    {activeTab === 'active' && (
                        <div className="active-tab">
                            <h2>Active Deliveries</h2>
                            {activeDeliveries.length === 0 ? (
                                <div className="no-deliveries">
                                    <div className="empty-icon">🚚</div>
                                    <p>No active deliveries at the moment</p>
                                    <Button variant="primary">Go Online</Button>
                                </div>
                            ) : (
                                <div className="deliveries-list">
                                    {activeDeliveries.map(delivery => (
                                        <div key={delivery.id} className="delivery-card">
                                            <div className="delivery-header">
                                                <div className="delivery-id">Order #{delivery.id}</div>
                                                {getStatusBadge(delivery.status)}
                                            </div>

                                            <div className="delivery-body">
                                                <div className="delivery-location">
                                                    <div className="location-item">
                                                        <span className="location-icon">🏪</span>
                                                        <div>
                                                            <div className="location-label">Pickup from</div>
                                                            <div className="location-name">{delivery.restaurant}</div>
                                                            <div className="location-address">{delivery.pickupAddress}</div>
                                                        </div>
                                                    </div>
                                                    <div className="location-arrow">↓</div>
                                                    <div className="location-item">
                                                        <span className="location-icon">🏠</span>
                                                        <div>
                                                            <div className="location-label">Deliver to</div>
                                                            <div className="location-name">{delivery.customer}</div>
                                                            <div className="location-address">{delivery.deliveryAddress}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="delivery-details">
                                                    <div className="detail">
                                                        <span className="detail-icon">📏</span>
                                                        <span>{delivery.distance} km</span>
                                                    </div>
                                                    <div className="detail">
                                                        <span className="detail-icon">⏱️</span>
                                                        <span>{delivery.estimatedTime} min</span>
                                                    </div>
                                                    <div className="detail">
                                                        <span className="detail-icon">💰</span>
                                                        <span>₹{delivery.earnings}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="delivery-actions">
                                                {delivery.status === 'assigned' && (
                                                    <Button variant="primary" onClick={() => handleAcceptDelivery(delivery.id)}>
                                                        Accept Delivery
                                                    </Button>
                                                )}
                                                {delivery.status === 'pickup' && (
                                                    <Button variant="primary" onClick={() => handlePickupOrder(delivery.id)}>
                                                        Confirm Pickup
                                                    </Button>
                                                )}
                                                {delivery.status === 'picked_up' && (
                                                    <Button variant="primary" onClick={() => handleCompleteDelivery(delivery.id)}>
                                                        Mark as Delivered
                                                    </Button>
                                                )}
                                                <Button variant="outline">Contact Customer</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delivery History Tab */}
                    {activeTab === 'history' && (
                        <div className="history-tab">
                            <h2>Delivery History</h2>
                            <div className="history-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Restaurant</th>
                                            <th>Distance</th>
                                            <th>Earnings</th>
                                            <th>Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryHistory.map(delivery => (
                                            <tr key={delivery.id}>
                                                <td>{delivery.id}</td>
                                                <td>{formatDate(delivery.date)}</td>
                                                <td>{delivery.restaurant}</td>
                                                <td>{delivery.distance} km</td>
                                                <td>₹{delivery.earnings}</td>
                                                <td>
                                                    <RatingStars rating={delivery.rating} size="small" readonly />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Earnings Tab */}
                    {activeTab === 'earnings' && (
                        <div className="earnings-tab">
                            <h2>Earnings Overview</h2>

                            <div className="earnings-summary">
                                <div className="summary-card">
                                    <div className="summary-label">Total Deliveries</div>
                                    <div className="summary-value">{stats.totalDeliveries}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Total Earnings</div>
                                    <div className="summary-value">₹{stats.totalEarnings}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Average per Delivery</div>
                                    <div className="summary-value">₹{(stats.totalEarnings / stats.totalDeliveries).toFixed(0)}</div>
                                </div>
                            </div>

                            <div className="earnings-table">
                                <h3>Daily Breakdown</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Deliveries</th>
                                            <th>Base Earnings</th>
                                            <th>Tips</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {earnings.map((day, index) => (
                                            <tr key={index}>
                                                <td>{formatDate(day.date)}</td>
                                                <td>{day.deliveries}</td>
                                                <td>₹{day.amount - day.tips}</td>
                                                <td>₹{day.tips}</td>
                                                <td>₹{day.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="withdraw-section">
                                <h3>Withdraw Earnings</h3>
                                <div className="withdraw-amount">
                                    <span>Available Balance: </span>
                                    <strong>₹{stats.totalEarnings}</strong>
                                </div>
                                <Button variant="primary">Withdraw Funds</Button>
                            </div>
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="profile-tab">
                            <h2>Partner Profile</h2>
                            <div className="profile-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={user?.full_name || ''} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={user?.email || ''} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" value={user?.phone || ''} />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Number</label>
                                    <input type="text" placeholder="Enter vehicle number" />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Type</label>
                                    <select>
                                        <option>Bike</option>
                                        <option>Scooter</option>
                                        <option>Car</option>
                                    </select>
                                </div>
                                <Button variant="primary">Update Profile</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryPartnerPanel;
// src/pages/Dashboard.js

import React, { useState } from 'react';

import {
  Users,
  ShoppingBag,
  Store,
  DollarSign,
  Eye,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';

import './Dashboard.css';

const Dashboard = () => {

  // ================= STATS =================
  const [stats] = useState({
    totalOrders: 1248,
    totalUsers: 3456,
    totalRestaurants: 128,
    totalRevenue: 456789,
    pendingOrders: 42,
    completedOrders: 1156,
    cancelledOrders: 50,
    avgOrderValue: 366
  });

  // ================= ORDERS =================
  const [recentOrders] = useState([
    {
      id: 'ORD001',
      customer: 'John Doe',
      restaurant: 'Pizza Paradise',
      amount: 450,
      status: 'delivered',
      date: '2024-01-15',
      items: 3
    },
    {
      id: 'ORD002',
      customer: 'Jane Smith',
      restaurant: 'Burger Hub',
      amount: 320,
      status: 'pending',
      date: '2024-01-15',
      items: 2
    },
    {
      id: 'ORD003',
      customer: 'Mike Johnson',
      restaurant: 'Sushi Master',
      amount: 680,
      status: 'preparing',
      date: '2024-01-14',
      items: 4
    }
  ]);

  // ================= STATES =================
  const [searchTerm, setSearchTerm] =
    useState('');

  const [filterStatus, setFilterStatus] =
    useState('all');

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [showOrderModal, setShowOrderModal] =
    useState(false);

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {

    const colors = {
      pending: '#ffa502',
      preparing: '#ff6348',
      out_for_delivery: '#1e90ff',
      delivered: '#2ed573',
      cancelled: '#ff4757'
    };

    return (

      <span
        className={`status-badge status-${status}`}
        style={{
          background:
            `${colors[status]}20`,
          color: colors[status]
        }}
      >

        {status.replaceAll('_', ' ').toUpperCase()}

      </span>

    );

  };

  // ================= FILTERED ORDERS =================
  const filteredOrders = recentOrders.filter(
    (order) => {

      const matchesStatus =
        filterStatus === 'all' ||
        order.status === filterStatus;

      const matchesSearch =
        order.id
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        order.customer
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      return matchesStatus && matchesSearch;

    }
  );

  // ================= UI =================
  return (

    <div className="dashboard-container">

      {/* ================= HEADER ================= */}
      <div className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back! Here's what's happening today.
          </p>

        </div>

        <div className="header-actions">

          <button
            className="btn-refresh"
            onClick={() =>
              window.location.reload()
            }
          >

            <RefreshCw size={18} />

            Refresh

          </button>

          <button className="btn-export">

            <Download size={18} />

            Export Report

          </button>

        </div>

      </div>

      {/* ================= STATS ================= */}
      <div className="stats-grid">

        {/* ORDERS */}
        <div className="stat-card">

          <div
            className="stat-icon"
            style={{
              background: '#ffe8e8',
              color: '#ff4757'
            }}
          >

            <ShoppingBag size={24} />

          </div>

          <div className="stat-info">

            <h3>Total Orders</h3>

            <p className="stat-value">
              {stats.totalOrders.toLocaleString()}
            </p>

            <span className="stat-change positive">
              +12% this month
            </span>

          </div>

        </div>

        {/* USERS */}
        <div className="stat-card">

          <div
            className="stat-icon"
            style={{
              background: '#e8f5e8',
              color: '#2ed573'
            }}
          >

            <Users size={24} />

          </div>

          <div className="stat-info">

            <h3>Total Users</h3>

            <p className="stat-value">
              {stats.totalUsers.toLocaleString()}
            </p>

            <span className="stat-change positive">
              +8% this month
            </span>

          </div>

        </div>

        {/* RESTAURANTS */}
        <div className="stat-card">

          <div
            className="stat-icon"
            style={{
              background: '#e8e8ff',
              color: '#1e90ff'
            }}
          >

            <Store size={24} />

          </div>

          <div className="stat-info">

            <h3>Restaurants</h3>

            <p className="stat-value">
              {stats.totalRestaurants}
            </p>

            <span className="stat-change positive">
              +5 new
            </span>

          </div>

        </div>

        {/* REVENUE */}
        <div className="stat-card">

          <div
            className="stat-icon"
            style={{
              background: '#fff5e8',
              color: '#ffa502'
            }}
          >

            <DollarSign size={24} />

          </div>

          <div className="stat-info">

            <h3>Total Revenue</h3>

            <p className="stat-value">
              ₹
              {stats.totalRevenue.toLocaleString()}
            </p>

            <span className="stat-change positive">
              +18% this month
            </span>

          </div>

        </div>

      </div>

      {/* ================= ORDERS SECTION ================= */}
      <div className="dashboard-card">

        <div className="card-header">

          <h2>
            Recent Orders
          </h2>

          <div className="card-filters">

            {/* SEARCH */}
            <div className="search-box">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            {/* FILTER */}
            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="preparing">
                Preparing
              </option>

              <option value="out_for_delivery">
                Out for Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>

            </select>

          </div>

        </div>

        {/* ================= TABLE ================= */}
        <div className="orders-table">

          <table>

            <thead>

              <tr>

                <th>Order ID</th>

                <th>Customer</th>

                <th>Restaurant</th>

                <th>Amount</th>

                <th>Status</th>

                <th>Date</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.map((order) => (

                <tr key={order.id}>

                  <td className="order-id">
                    {order.id}
                  </td>

                  <td>
                    {order.customer}
                  </td>

                  <td>
                    {order.restaurant}
                  </td>

                  <td className="amount">
                    ₹{order.amount}
                  </td>

                  <td>
                    {getStatusBadge(
                      order.status
                    )}
                  </td>

                  <td>
                    {new Date(
                      order.date
                    ).toLocaleDateString()}
                  </td>

                  <td>

                    <button
                      className="view-btn"
                      onClick={() => {

                        setSelectedOrder(order);

                        setShowOrderModal(true);

                      }}
                    >

                      <Eye size={16} />

                      View

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= ORDER MODAL ================= */}
      {showOrderModal && selectedOrder && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h2>
              Order Details
            </h2>

            <p>
              <strong>ID:</strong>
              {' '}
              {selectedOrder.id}
            </p>

            <p>
              <strong>Customer:</strong>
              {' '}
              {selectedOrder.customer}
            </p>

            <p>
              <strong>Restaurant:</strong>
              {' '}
              {selectedOrder.restaurant}
            </p>

            <p>
              <strong>Amount:</strong>
              {' '}
              ₹{selectedOrder.amount}
            </p>

            <p>
              <strong>Status:</strong>
              {' '}
              {selectedOrder.status}
            </p>

            <button
              className="close-btn"
              onClick={() =>
                setShowOrderModal(false)
              }
            >

              Close

            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default Dashboard;
// admin-panel/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRestaurants: 0,
        todayOrders: 0,
        todayRevenue: 0,
        totalDeliveryPartners: 0
    });
    const [analytics, setAnalytics] = useState({ ordersByDay: [], topRestaurants: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        fetchAnalytics();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch stats');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        navigate('/login');
        toast.success('Logged out');
    };

    if (loading) {
        return <div style={styles.loading}>Loading dashboard...</div>;
    }

    const COLORS = ['#ff6b35', '#28a745', '#17a2b8', '#fd7e14', '#6f42c1'];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🛡️ Admin Dashboard</h1>
                    <p style={styles.subtitle}>Manage your food delivery platform</p>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>👥</div>
                    <div>
                        <h3>Total Users</h3>
                        <p style={styles.statNumber}>{stats.totalUsers}</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>🏪</div>
                    <div>
                        <h3>Restaurants</h3>
                        <p style={styles.statNumber}>{stats.totalRestaurants}</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>🛵</div>
                    <div>
                        <h3>Delivery Partners</h3>
                        <p style={styles.statNumber}>{stats.totalDeliveryPartners}</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📦</div>
                    <div>
                        <h3>Today's Orders</h3>
                        <p style={styles.statNumber}>{stats.todayOrders}</p>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>💰</div>
                    <div>
                        <h3>Today's Revenue</h3>
                        <p style={styles.statNumber}>₹{stats.todayRevenue}</p>
                    </div>
                </div>
            </div>

            <div style={styles.chartsRow}>
                <div style={styles.chartCard}>
                    <h3>Orders Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.ordersByDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#ff6b35" name="Orders" />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#28a745" name="Revenue (₹)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={styles.chartCard}>
                    <h3>Top Restaurants</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.topRestaurants}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="order_count" fill="#ff6b35" name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={styles.quickActions}>
                <h3>Quick Actions</h3>
                <div style={styles.actionButtons}>
                    <button onClick={() => navigate('/users')} style={styles.actionBtn}>👥 Manage Users</button>
                    <button onClick={() => navigate('/restaurants')} style={styles.actionBtn}>🏪 Manage Restaurants</button>
                    <button onClick={() => navigate('/orders')} style={styles.actionBtn}>📦 View All Orders</button>
                    <button onClick={() => navigate('/delivery-partners')} style={styles.actionBtn}>🛵 Delivery Partners</button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
    title: { fontSize: '28px', color: '#333', margin: 0 },
    subtitle: { color: '#666', marginTop: '5px' },
    logoutBtn: { padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' },
    statIcon: { fontSize: '40px' },
    statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#ff6b35', margin: '5px 0 0' },
    chartsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '30px' },
    chartCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    quickActions: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    actionButtons: { display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' },
    actionBtn: { padding: '12px 24px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }
};
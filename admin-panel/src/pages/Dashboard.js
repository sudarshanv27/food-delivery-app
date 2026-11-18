// admin-panel/src/pages/Dashboard.js

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

import API from '../services/api';
import './Dashboard.css';

const DEFAULT_STATS = {
  totalOrders: 0,
  totalUsers: 0,
  totalRestaurants: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  avgOrderValue: 0
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        API.get('/admin/stats'),
        API.get('/admin/orders/recent'),
        API.get('/admin/users/recent')
      ]);

      const [statsResult, ordersResult, usersResult] = results;

      let successfulRequests = 0;
      const failedRequests = [];

      // ================= STATS =================

      if (statsResult.status === 'fulfilled') {
        successfulRequests += 1;

        const responseData = statsResult.value?.data;

        if (responseData?.success) {
          const serverStats =
            responseData.stats ||
            responseData.data ||
            {};

          setStats({
            ...DEFAULT_STATS,
            ...serverStats
          });
        } else {
          failedRequests.push(
            responseData?.message || 'Dashboard statistics failed'
          );
        }
      } else {
        failedRequests.push(
          statsResult.reason?.response?.data?.message ||
          statsResult.reason?.message ||
          'Unable to load dashboard statistics'
        );
      }

      // ================= RECENT ORDERS =================

      if (ordersResult.status === 'fulfilled') {
        successfulRequests += 1;

        const responseData = ordersResult.value?.data;

        if (responseData?.success) {
          setRecentOrders(
            Array.isArray(responseData.orders)
              ? responseData.orders
              : Array.isArray(responseData.data)
                ? responseData.data
                : []
          );
        } else {
          failedRequests.push(
            responseData?.message || 'Recent orders failed'
          );
        }
      } else {
        failedRequests.push(
          ordersResult.reason?.response?.data?.message ||
          ordersResult.reason?.message ||
          'Unable to load recent orders'
        );
      }

      // ================= RECENT USERS =================

      if (usersResult.status === 'fulfilled') {
        successfulRequests += 1;

        const responseData = usersResult.value?.data;

        if (responseData?.success) {
          setRecentUsers(
            Array.isArray(responseData.users)
              ? responseData.users
              : Array.isArray(responseData.data)
                ? responseData.data
                : []
          );
        } else {
          failedRequests.push(
            responseData?.message || 'Recent users failed'
          );
        }
      } else {
        failedRequests.push(
          usersResult.reason?.response?.data?.message ||
          usersResult.reason?.message ||
          'Unable to load recent users'
        );
      }

      // ================= ERROR HANDLING =================

      if (successfulRequests === 0) {
        const message =
          failedRequests[0] ||
          'Unable to connect to the FoodieDash backend.';

        setError(message);

        toast.error(message);
      } else if (failedRequests.length > 0) {
        setError(
          'Some dashboard information could not be loaded. Please check the backend connection.'
        );

        if (isRefresh) {
          toast.error('Some dashboard data could not be refreshed.');
        }
      } else if (isRefresh) {
        toast.success('Dashboard refreshed successfully.');
      }
    } catch (err) {
      console.error('FoodieDash dashboard error:', err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load dashboard data.';

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ================= HELPERS =================

  const formatNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString('en-IN')
      : '0';
  };

  const formatCurrency = (value) => {
    const number = Number(value);

    return `₹${(
      Number.isFinite(number) ? number : 0
    ).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrderId = (order) => {
    return (
      order?.order_number ||
      order?.order_id ||
      order?.id ||
      '-'
    );
  };

  const getCustomerName = (order) => {
    return (
      order?.customer ||
      order?.customer_name ||
      order?.full_name ||
      order?.name ||
      '-'
    );
  };

  const getRestaurantName = (order) => {
    return (
      order?.restaurant ||
      order?.restaurant_name ||
      '-'
    );
  };

  const getOrderAmount = (order) => {
    return (
      order?.amount ??
      order?.total_amount ??
      order?.total ??
      0
    );
  };

  const getOrderStatus = (order) => {
    return (
      order?.status ||
      order?.order_status ||
      'unknown'
    );
  };

  const getStatusText = (status) => {
    if (!status) {
      return 'Unknown';
    }

    return String(status)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    if (!status) {
      return 'status-default';
    }

    return `status-${String(status)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')}`;
  };

  const getUserName = (user) => {
    return (
      user?.name ||
      user?.full_name ||
      user?.username ||
      'Unknown User'
    );
  };

  const getUserInitial = (user) => {
    const name = getUserName(user);

    return name.charAt(0).toUpperCase();
  };

  const getUserType = (user) => {
    return (
      user?.user_type ||
      user?.userType ||
      user?.role ||
      'customer'
    );
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-icon">
          <RefreshCw
            size={30}
            className="loading-spinner"
          />
        </div>

        <h2>Loading Dashboard</h2>

        <p>
          Connecting to your FoodieDash platform...
        </p>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="dashboard-container">

      {/* ================= PAGE HEADER ================= */}

      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Monitor your FoodieDash platform from one place.
          </p>
        </div>

        <button
          type="button"
          className="btn-refresh"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'loading-spinner' : ''}
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ================= CONNECTION ERROR ================= */}

      {error && (
        <div
          className="dashboard-error"
          role="alert"
        >
          <div className="dashboard-error-content">
            <strong>Dashboard connection problem</strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            className="dashboard-error-retry"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================= MAIN STATISTICS ================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon orders-icon">
            <ShoppingBag size={24} />
          </div>

          <div className="stat-info">
            <h3>Total Orders</h3>

            <p className="stat-value">
              {formatNumber(stats.totalOrders)}
            </p>

            <span className="stat-label">
              All platform orders
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users-icon">
            <Users size={24} />
          </div>

          <div className="stat-info">
            <h3>Total Users</h3>

            <p className="stat-value">
              {formatNumber(stats.totalUsers)}
            </p>

            <span className="stat-label">
              Registered customers
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon restaurants-icon">
            <Store size={24} />
          </div>

          <div className="stat-info">
            <h3>Restaurants</h3>

            <p className="stat-value">
              {formatNumber(stats.totalRestaurants)}
            </p>

            <span className="stat-label">
              Platform restaurants
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">
            <DollarSign size={24} />
          </div>

          <div className="stat-info">
            <h3>Total Revenue</h3>

            <p className="stat-value">
              {formatCurrency(stats.totalRevenue)}
            </p>

            <span className="stat-label">
              Delivered order revenue
            </span>
          </div>
        </div>

      </div>

      {/* ================= SECONDARY STATISTICS ================= */}

      <div className="secondary-stats">

        <div className="secondary-card">
          <span>Pending Orders</span>

          <strong>
            {formatNumber(stats.pendingOrders)}
          </strong>
        </div>

        <div className="secondary-card">
          <span>Completed Orders</span>

          <strong>
            {formatNumber(stats.completedOrders)}
          </strong>
        </div>

        <div className="secondary-card">
          <span>Cancelled Orders</span>

          <strong>
            {formatNumber(stats.cancelledOrders)}
          </strong>
        </div>

        <div className="secondary-card">
          <span>Average Order Value</span>

          <strong>
            {formatCurrency(stats.avgOrderValue)}
          </strong>
        </div>

      </div>

      {/* ================= RECENT ORDERS ================= */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Recent Orders</h2>

            <p>
              Latest orders placed on the platform
            </p>
          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={() => navigate('/orders')}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="orders-table">

          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => {
                  const status = getOrderStatus(order);

                  return (
                    <tr
                      key={
                        order?.order_id ||
                        order?.id ||
                        index
                      }
                    >
                      <td className="order-id">
                        {getOrderId(order)}
                      </td>

                      <td>
                        {getCustomerName(order)}
                      </td>

                      <td>
                        {getRestaurantName(order)}
                      </td>

                      <td className="amount">
                        {formatCurrency(
                          getOrderAmount(order)
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          order?.date ||
                          order?.created_at
                        )}
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>

        </div>
      </section>

      {/* ================= QUICK ACTIONS ================= */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Quick Actions</h2>

            <p>
              Manage important areas of your platform
            </p>
          </div>
        </div>

        <div className="quick-actions">

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/users')}
          >
            <span className="quick-action-icon">
              <Users size={20} />
            </span>

            <span className="quick-action-text">
              Manage Users
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/restaurants')}
          >
            <span className="quick-action-icon">
              <Store size={20} />
            </span>

            <span className="quick-action-text">
              Manage Restaurants
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/orders')}
          >
            <span className="quick-action-icon">
              <ShoppingBag size={20} />
            </span>

            <span className="quick-action-text">
              Manage Orders
            </span>

            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/delivery-partners')}
          >
            <span className="quick-action-icon">
              <Truck size={20} />
            </span>

            <span className="quick-action-text">
              Delivery Partners
            </span>

            <ArrowRight size={17} />
          </button>

        </div>
      </section>

      {/* ================= RECENT USERS ================= */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Recent Users</h2>

            <p>
              Recently registered platform users
            </p>
          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={() => navigate('/users')}
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="users-list">

          {recentUsers.length === 0 ? (
            <div className="empty-state">
              No recent users found.
            </div>
          ) : (
            recentUsers.map((user, index) => (
              <div
                className="user-row"
                key={
                  user?.user_id ||
                  user?.id ||
                  index
                }
              >
                <div className="user-avatar">
                  {getUserInitial(user)}
                </div>

                <div className="user-info">
                  <strong>
                    {getUserName(user)}
                  </strong>

                  <span>
                    {user?.email || '-'}
                  </span>
                </div>

                <span className="user-type">
                  {getUserType(user)}
                </span>
              </div>
            ))
          )}

        </div>
      </section>

    </div>
  );
};

export default Dashboard;
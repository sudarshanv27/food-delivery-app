// src/pages/Orders.js

import React, { useState, useEffect } from 'react';

import {
  Eye,
  Search
} from 'lucide-react';

const Orders = () => {

  // ================= STATES =================
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [filterStatus, setFilterStatus] =
    useState('all');

  // ================= LOAD ORDERS =================
  useEffect(() => {

    // Demo Orders
    setOrders([
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
      },
      {
        id: 'ORD004',
        customer: 'Sarah Williams',
        restaurant: 'Taco Fiesta',
        amount: 250,
        status: 'delivered',
        date: '2024-01-14',
        items: 2
      },
      {
        id: 'ORD005',
        customer: 'David Brown',
        restaurant: 'Chinese Wok',
        amount: 520,
        status: 'out_for_delivery',
        date: '2024-01-13',
        items: 3
      }
    ]);

    setLoading(false);

  }, []);

  // ================= STATUS COLORS =================
  const getStatusColor = (status) => {

    const colors = {
      pending: '#ffa502',
      confirmed: '#1e90ff',
      preparing: '#ff6348',
      out_for_delivery: '#2ed573',
      delivered: '#2ed573',
      cancelled: '#ff4757'
    };

    return colors[status] || '#666';

  };

  // ================= FILTER ORDERS =================
  const filteredOrders = orders.filter(
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

      return (
        matchesStatus &&
        matchesSearch
      );

    }
  );

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

      {/* ================= HEADER ================= */}
      <div style={styles.header}>

        <h1 style={styles.heading}>
          Orders Management
        </h1>

        <p style={styles.subHeading}>
          View and manage all customer orders
        </p>

      </div>

      {/* ================= CARD ================= */}
      <div style={styles.card}>

        {/* CARD HEADER */}
        <div style={styles.cardHeader}>

          <h2 style={styles.cardTitle}>
            All Orders
          </h2>

          <div style={styles.filters}>

            {/* SEARCH */}
            <div style={styles.searchBox}>

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
                style={styles.searchInput}
              />

            </div>

            {/* FILTER */}
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value
                )
              }
              style={styles.select}
            >

              <option value="all">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
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
        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>

              <tr style={styles.tableHeaderRow}>

                <th style={styles.tableHeader}>
                  Order ID
                </th>

                <th style={styles.tableHeader}>
                  Customer
                </th>

                <th style={styles.tableHeader}>
                  Restaurant
                </th>

                <th style={styles.tableHeader}>
                  Amount
                </th>

                <th style={styles.tableHeader}>
                  Status
                </th>

                <th style={styles.tableHeader}>
                  Date
                </th>

                <th style={styles.tableHeader}>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredOrders.map(
                (order) => (

                  <tr
                    key={order.id}
                    style={styles.tableRow}
                  >

                    <td
                      style={{
                        ...styles.tableCell,
                        color: '#ff4757',
                        fontWeight: '600'
                      }}
                    >

                      {order.id}

                    </td>

                    <td style={styles.tableCell}>
                      {order.customer}
                    </td>

                    <td style={styles.tableCell}>
                      {order.restaurant}
                    </td>

                    <td
                      style={{
                        ...styles.tableCell,
                        fontWeight: '600'
                      }}
                    >

                      ₹{order.amount}

                    </td>

                    <td style={styles.tableCell}>

                      <span
                        style={{
                          ...styles.statusBadge,

                          background:
                            `${getStatusColor(
                              order.status
                            )}20`,

                          color:
                            getStatusColor(
                              order.status
                            )
                        }}
                      >

                        {order.status
                          .replaceAll('_', ' ')
                          .toUpperCase()}

                      </span>

                    </td>

                    <td style={styles.tableCell}>

                      {new Date(
                        order.date
                      ).toLocaleDateString()}

                    </td>

                    <td style={styles.tableCell}>

                      <button
                        style={styles.viewButton}
                      >

                        <Eye size={16} />

                        View

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

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

  header: {
    marginBottom: '24px'
  },

  heading: {
    fontSize: '30px',
    color: '#2c3e50',
    marginBottom: '8px'
  },

  subHeading: {
    color: '#7f8c8d',
    fontSize: '14px'
  },

  card: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow:
      '0 4px 10px rgba(0,0,0,0.05)'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap',
    gap: '16px'
  },

  cardTitle: {
    fontSize: '20px',
    color: '#2c3e50'
  },

  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff'
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '200px'
  },

  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer'
  },

  tableContainer: {
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  tableHeaderRow: {
    background: '#f8f9fa'
  },

  tableHeader: {
    textAlign: 'left',
    padding: '16px 24px',
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: '14px'
  },

  tableRow: {
    borderBottom: '1px solid #eee'
  },

  tableCell: {
    padding: '16px 24px',
    color: '#2c3e50',
    fontSize: '14px'
  },

  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },

  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#f1f2f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
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
    animation: 'spin 1s linear infinite'
  }

};

export default Orders;
// admin-panel/src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setOrders(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.order_status === filter);

    if (loading) return <div style={styles.loading}>Loading orders...</div>;

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#ffc107';
            case 'confirmed': return '#17a2b8';
            case 'preparing': return '#fd7e14';
            case 'out_for_delivery': return '#6f42c1';
            case 'delivered': return '#28a745';
            default: return '#6c757d';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>📦 Order Management</h1>
            </div>

            <div style={styles.filters}>
                <button onClick={() => setFilter('all')} style={{...styles.filterBtn, ...(filter === 'all' ? styles.activeFilter : {})}}>All</button>
                <button onClick={() => setFilter('pending')} style={{...styles.filterBtn, ...(filter === 'pending' ? styles.activeFilter : {})}}>Pending</button>
                <button onClick={() => setFilter('confirmed')} style={{...styles.filterBtn, ...(filter === 'confirmed' ? styles.activeFilter : {})}}>Confirmed</button>
                <button onClick={() => setFilter('preparing')} style={{...styles.filterBtn, ...(filter === 'preparing' ? styles.activeFilter : {})}}>Preparing</button>
                <button onClick={() => setFilter('out_for_delivery')} style={{...styles.filterBtn, ...(filter === 'out_for_delivery' ? styles.activeFilter : {})}}>Out for Delivery</button>
                <button onClick={() => setFilter('delivered')} style={{...styles.filterBtn, ...(filter === 'delivered' ? styles.activeFilter : {})}}>Delivered</button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Restaurant</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.order_id}>
                                <td>{order.order_number}</td>
                                <td>{order.customer_name || 'Guest'}</td>
                                <td>{order.restaurant_name}</td>
                                <td>₹{order.total_amount}</td>
                                <td>
                                    <span style={{...styles.badge, backgroundColor: getStatusColor(order.order_status)}}>
                                        {order.order_status}
                                    </span>
                                </td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button style={styles.viewBtn}>View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    loading: { textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' },
    header: { marginBottom: '30px' },
    backBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '15px' },
    title: { fontSize: '28px', color: '#333' },
    filters: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn: { padding: '8px 16px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '20px', cursor: 'pointer' },
    activeFilter: { backgroundColor: '#1a1a2e', color: 'white' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    badge: { padding: '4px 8px', borderRadius: '20px', fontSize: '12px', color: 'white' },
    viewBtn: { padding: '6px 12px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};
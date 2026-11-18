// src/pages/Orders.js

import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Search,
  RefreshCw,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);

  // ================= FETCH ORDERS =================

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await API.get('/admin/orders');

      if (response.data?.success) {
        setOrders(
          response.data.data ||
          response.data.orders ||
          []
        );
      } else {
        throw new Error(
          response.data?.message ||
          'Failed to fetch orders'
        );
      }

    } catch (error) {
      console.error('Orders error:', error);

      toast.error(
        error.response?.data?.message ||
        'Failed to fetch orders'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= HELPERS =================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return '-';

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

  const formatDateTime = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    return `status-${String(status || 'unknown')
      .toLowerCase()
      .replace(/_/g, '-')}`;
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';

    return String(status)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ================= FILTER =================

  const filteredOrders = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const status =
        order.order_status ||
        order.status ||
        '';

      const orderNumber =
        order.order_number ||
        order.order_id ||
        order.id ||
        '';

      const customer =
        order.customer_name ||
        order.full_name ||
        order.customer ||
        '';

      const restaurant =
        order.restaurant_name ||
        order.restaurant ||
        '';

      const matchesStatus =
        filterStatus === 'all' ||
        status === filterStatus;

      const matchesSearch =
        !search ||
        String(orderNumber)
          .toLowerCase()
          .includes(search) ||
        String(customer)
          .toLowerCase()
          .includes(search) ||
        String(restaurant)
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [
    orders,
    searchTerm,
    filterStatus
  ]);

  // ================= LOADING =================

  if (loading) {
    return (
      <div style={styles.loading}>
        <RefreshCw
          size={28}
          style={styles.loadingIcon}
        />
        <p>Loading orders...</p>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div style={styles.container}>

      {/* ================= HEADER ================= */}

      <div style={styles.header}>

        <div>
          <h1 style={styles.heading}>
            Orders Management
          </h1>

          <p style={styles.subHeading}>
            View and manage all customer orders
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          style={styles.refreshButton}
        >
          <RefreshCw
            size={17}
            style={
              refreshing
                ? styles.spinning
                : undefined
            }
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>

      </div>

      {/* ================= CARD ================= */}

      <div style={styles.card}>

        <div style={styles.cardHeader}>

          <div>
            <h2 style={styles.cardTitle}>
              All Orders
            </h2>

            <p style={styles.countText}>
              {filteredOrders.length} order
              {filteredOrders.length !== 1
                ? 's'
                : ''}
            </p>
          </div>

          <div style={styles.filters}>

            {/* SEARCH */}

            <div style={styles.searchBox}>

              <Search
                size={18}
                color="#777"
              />

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

            {/* STATUS FILTER */}

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

              <option value="ready_for_delivery">
                Ready for Delivery
              </option>

              <option value="out_for_delivery">
                Out for Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>

              <option value="refunded">
                Refunded
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
                  Payment
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

              {filteredOrders.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    style={styles.emptyState}
                  >
                    No orders found.
                  </td>

                </tr>

              ) : (

                filteredOrders.map(
                  (order, index) => {

                    const orderId =
                      order.order_number ||
                      order.order_id ||
                      order.id ||
                      `ORDER-${index + 1}`;

                    const customer =
                      order.customer_name ||
                      order.full_name ||
                      order.customer ||
                      '-';

                    const restaurant =
                      order.restaurant_name ||
                      order.restaurant ||
                      '-';

                    const amount =
                      order.total_amount ??
                      order.total ??
                      order.amount ??
                      0;

                    const status =
                      order.order_status ||
                      order.status ||
                      'unknown';

                    const paymentStatus =
                      order.payment_status ||
                      '-';

                    const date =
                      order.created_at ||
                      order.date;

                    return (
                      <tr
                        key={
                          order.order_id ||
                          order.id ||
                          index
                        }
                        style={styles.tableRow}
                      >

                        <td
                          style={{
                            ...styles.tableCell,
                            color: '#ff4757',
                            fontWeight: '600'
                          }}
                        >
                          {orderId}
                        </td>

                        <td
                          style={styles.tableCell}
                        >
                          {customer}
                        </td>

                        <td
                          style={styles.tableCell}
                        >
                          {restaurant}
                        </td>

                        <td
                          style={{
                            ...styles.tableCell,
                            fontWeight: '600'
                          }}
                        >
                          {formatCurrency(amount)}
                        </td>

                        <td
                          style={styles.tableCell}
                        >
                          <span
                            style={{
                              ...styles.paymentBadge,
                              ...(paymentStatus ===
                              'paid'
                                ? styles.paidBadge
                                : {})
                            }}
                          >
                            {String(
                              paymentStatus
                            )
                              .replace(
                                /_/g,
                                ' '
                              )
                              .toUpperCase()}
                          </span>
                        </td>

                        <td
                          style={styles.tableCell}
                        >
                          <span
                            className={getStatusClass(
                              status
                            )}
                            style={{
                              ...styles.statusBadge,
                              ...getStatusStyle(
                                status
                              )
                            }}
                          >
                            {getStatusText(
                              status
                            )}
                          </span>
                        </td>

                        <td
                          style={styles.tableCell}
                        >
                          {formatDate(date)}
                        </td>

                        <td
                          style={styles.tableCell}
                        >
                          <button
                            style={
                              styles.viewButton
                            }
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= ORDER MODAL ================= */}

      {selectedOrder && (

        <div
          style={styles.modalOverlay}
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            style={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div style={styles.modalHeader}>

              <div>
                <h2>
                  Order Details
                </h2>

                <p style={styles.modalSubtitle}>
                  {selectedOrder.order_number ||
                    selectedOrder.order_id ||
                    selectedOrder.id ||
                    '-'}
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div style={styles.detailsGrid}>

              <div>
                <span style={styles.detailLabel}>
                  Customer
                </span>

                <strong>
                  {selectedOrder.customer_name ||
                    selectedOrder.full_name ||
                    selectedOrder.customer ||
                    '-'}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Restaurant
                </span>

                <strong>
                  {selectedOrder.restaurant_name ||
                    selectedOrder.restaurant ||
                    '-'}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Amount
                </span>

                <strong>
                  {formatCurrency(
                    selectedOrder.total_amount ??
                    selectedOrder.total ??
                    selectedOrder.amount
                  )}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Payment Method
                </span>

                <strong>
                  {selectedOrder.payment_method ||
                    '-'}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Payment Status
                </span>

                <strong>
                  {selectedOrder.payment_status ||
                    '-'}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Order Status
                </span>

                <strong>
                  {getStatusText(
                    selectedOrder.order_status ||
                    selectedOrder.status
                  )}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Created
                </span>

                <strong>
                  {formatDateTime(
                    selectedOrder.created_at
                  )}
                </strong>
              </div>

              <div>
                <span style={styles.detailLabel}>
                  Delivery Time
                </span>

                <strong>
                  {formatDateTime(
                    selectedOrder.estimated_delivery_time
                  )}
                </strong>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

// ================= STATUS STYLES =================

const getStatusStyle = (status) => {
  const stylesMap = {
    pending: {
      background: '#fff3cd',
      color: '#856404'
    },

    confirmed: {
      background: '#d1ecf1',
      color: '#0c5460'
    },

    preparing: {
      background: '#ffe5d0',
      color: '#c44d00'
    },

    ready_for_delivery: {
      background: '#e2d9f3',
      color: '#563d7c'
    },

    out_for_delivery: {
      background: '#d6e9ff',
      color: '#1557a6'
    },

    delivered: {
      background: '#d4edda',
      color: '#155724'
    },

    cancelled: {
      background: '#f8d7da',
      color: '#721c24'
    },

    refunded: {
      background: '#e2e3e5',
      color: '#383d41'
    }
  };

  return (
    stylesMap[status] || {
      background: '#e2e3e5',
      color: '#383d41'
    }
  );
};

// ================= PAGE STYLES =================

const styles = {

  container: {
    padding: '24px',
    background: '#f5f6fa',
    minHeight: '100vh'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },

  heading: {
    fontSize: '30px',
    color: '#2c3e50',
    margin: 0
  },

  subHeading: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginTop: '8px'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#1a1a2e',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600'
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
    gap: '16px',
    flexWrap: 'wrap'
  },

  cardTitle: {
    margin: 0,
    fontSize: '20px',
    color: '#2c3e50'
  },

  countText: {
    margin: '5px 0 0',
    fontSize: '13px',
    color: '#888'
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
    padding: '9px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff'
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '210px'
  },

  select: {
    padding: '9px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px'
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
    padding: '15px 18px',
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },

  tableRow: {
    borderBottom: '1px solid #eee'
  },

  tableCell: {
    padding: '15px 18px',
    color: '#2c3e50',
    fontSize: '14px',
    whiteSpace: 'nowrap'
  },

  statusBadge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },

  paymentBadge: {
    display: 'inline-block',
    padding: '5px 9px',
    borderRadius: '15px',
    background: '#f1f2f6',
    color: '#666',
    fontSize: '10px',
    fontWeight: '700'
  },

  paidBadge: {
    background: '#d4edda',
    color: '#155724'
  },

  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 11px',
    background: '#f1f2f6',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  },

  emptyState: {
    padding: '50px',
    textAlign: 'center',
    color: '#777'
  },

  loading: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#666'
  },

  loadingIcon: {
    animation: 'spin 1s linear infinite'
  },

  spinning: {
    animation: 'spin 1s linear infinite'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 1000
  },

  modal: {
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.25)'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #eee',
    paddingBottom: '18px',
    marginBottom: '20px'
  },

  modalSubtitle: {
    margin: '5px 0 0',
    color: '#ff4757',
    fontWeight: '600'
  },

  closeButton: {
    border: 'none',
    background: '#f1f2f6',
    borderRadius: '8px',
    padding: '7px',
    cursor: 'pointer'
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },

  detailLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '5px'
  }

};

export default Orders;
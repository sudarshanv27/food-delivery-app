// admin-panel/src/pages/Notifications.js

import React, { useMemo, useState } from 'react';

import {
  AlertCircle,
  Bell,
  CheckCircle,
  CheckCheck,
  Info,
  Search,
  Trash2,
  X,
  XCircle
} from 'lucide-react';

import toast from 'react-hot-toast';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New Order Received',
    message:
      'Order #ORD008 has been placed successfully.',
    time: '5 minutes ago',
    type: 'success',
    read: false
  },
  {
    id: 2,
    title: 'Restaurant Request',
    message:
      'New restaurant "Thai Garden" wants to join.',
    time: '1 hour ago',
    type: 'info',
    read: false
  },
  {
    id: 3,
    title: 'Payment Verified',
    message:
      'Payment for Order #ORD005 verified.',
    time: '3 hours ago',
    type: 'success',
    read: true
  },
  {
    id: 4,
    title: 'Delivery Delay',
    message:
      'Order #ORD003 delayed by 15 minutes.',
    time: '5 hours ago',
    type: 'warning',
    read: true
  },
  {
    id: 5,
    title: 'System Update',
    message:
      'New features available in admin panel.',
    time: '1 day ago',
    type: 'info',
    read: true
  }
];

const getNotificationIcon = (type) => {
  switch (String(type).toLowerCase()) {
    case 'success':
      return (
        <CheckCircle
          size={21}
          color="#2ed573"
          aria-hidden="true"
        />
      );

    case 'warning':
      return (
        <AlertCircle
          size={21}
          color="#ffa502"
          aria-hidden="true"
        />
      );

    case 'error':
      return (
        <XCircle
          size={21}
          color="#ff4757"
          aria-hidden="true"
        />
      );

    default:
      return (
        <Info
          size={21}
          color="#1e90ff"
          aria-hidden="true"
        />
      );
  }
};

const getNotificationIconBackground = (type) => {
  switch (String(type).toLowerCase()) {
    case 'success':
      return '#eaf8ef';

    case 'warning':
      return '#fff6e6';

    case 'error':
      return '#fdecec';

    default:
      return '#edf5ff';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] =
    useState(INITIAL_NOTIFICATIONS);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [filter, setFilter] =
    useState('all');

  const [showClearConfirmation, setShowClearConfirmation] =
    useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.read
    ).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return notifications.filter((notification) => {
      const title = String(
        notification?.title || ''
      ).toLowerCase();

      const message = String(
        notification?.message || ''
      ).toLowerCase();

      const type = String(
        notification?.type || ''
      ).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        message.includes(query) ||
        type.includes(query);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' &&
          !notification.read) ||
        (filter === 'read' &&
          notification.read);

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    notifications,
    searchQuery,
    filter
  ]);

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    if (unreadCount === 0) {
      toast('All notifications are already read.');
      return;
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true
      }))
    );

    toast.success(
      'All notifications marked as read.'
    );
  };

  const deleteNotification = (
    id,
    event = null
  ) => {
    if (event) {
      event.stopPropagation();
    }

    setNotifications((previous) =>
      previous.filter(
        (notification) =>
          notification.id !== id
      )
    );

    toast.success(
      'Notification deleted.'
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowClearConfirmation(false);

    toast.success(
      'All notifications cleared.'
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  return (
    <div style={styles.container}>
      {/* ================= HEADER ================= */}

      <div style={styles.pageHeader}>
        <div style={styles.headingRow}>
          <div style={styles.headingIcon}>
            <Bell size={27} />
          </div>

          <div>
            <h1 style={styles.heading}>
              Notifications
            </h1>

            <p style={styles.subheading}>
              Stay updated with the latest
              FoodieDash activities.
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            style={{
              ...styles.markAllButton,
              ...(unreadCount === 0
                ? styles.disabledButton
                : {})
            }}
          >
            <CheckCheck size={17} />

            Mark All as Read
          </button>
        )}
      </div>

      {/* ================= SUMMARY ================= */}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#fff0f1',
              color: '#ff4757'
            }}
          >
            <Bell size={22} />
          </div>

          <div>
            <span style={styles.summaryLabel}>
              Total
            </span>

            <strong style={styles.summaryValue}>
              {notifications.length}
            </strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#fff6e6',
              color: '#ffa502'
            }}
          >
            <AlertCircle size={22} />
          </div>

          <div>
            <span style={styles.summaryLabel}>
              Unread
            </span>

            <strong style={styles.summaryValue}>
              {unreadCount}
            </strong>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: '#eaf8ef',
              color: '#2ed573'
            }}
          >
            <CheckCircle size={22} />
          </div>

          <div>
            <span style={styles.summaryLabel}>
              Read
            </span>

            <strong style={styles.summaryValue}>
              {notifications.length -
                unreadCount}
            </strong>
          </div>
        </div>
      </div>

      {/* ================= MAIN CARD ================= */}

      <div style={styles.card}>
        {/* CARD HEADER */}

        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>
              <Bell
                size={20}
                color="#ff4757"
              />

              <h2 style={styles.cardHeading}>
                Recent Notifications
              </h2>

              {unreadCount > 0 && (
                <span style={styles.badge}>
                  {unreadCount} New
                </span>
              )}
            </div>

            <p style={styles.cardSubtitle}>
              {filteredNotifications.length}{' '}
              notifications shown
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowClearConfirmation(true)
              }
              style={styles.clearAllButton}
            >
              <Trash2 size={16} />

              Clear All
            </button>
          )}
        </div>

        {/* ================= FILTERS ================= */}

        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <Search
              size={18}
              color="#868e96"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search notifications..."
              style={styles.searchInput}
              aria-label="Search notifications"
            />
          </div>

          <div style={styles.filterButtons}>
            <button
              type="button"
              onClick={() =>
                setFilter('all')
              }
              style={{
                ...styles.filterButton,
                ...(filter === 'all'
                  ? styles.activeFilter
                  : {})
              }}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter('unread')
              }
              style={{
                ...styles.filterButton,
                ...(filter === 'unread'
                  ? styles.activeFilter
                  : {})
              }}
            >
              Unread
              {unreadCount > 0 && (
                <span
                  style={styles.filterCount}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter('read')
              }
              style={{
                ...styles.filterButton,
                ...(filter === 'read'
                  ? styles.activeFilter
                  : {})
              }}
            >
              Read
            </button>
          </div>
        </div>

        {/* ================= NOTIFICATIONS ================= */}

        <div>
          {filteredNotifications.length >
          0 ? (
            filteredNotifications.map(
              (notification) => {
                const isUnread =
                  !notification.read;

                return (
                  <div
                    key={notification.id}
                    style={{
                      ...styles.notificationItem,
                      ...(isUnread
                        ? styles.unreadItem
                        : {})
                    }}
                    onClick={() =>
                      markAsRead(
                        notification.id
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();

                        markAsRead(
                          notification.id
                        );
                      }
                    }}
                    aria-label={
                      isUnread
                        ? `Mark ${notification.title} as read`
                        : notification.title
                    }
                  >
                    {/* ICON */}

                    <div
                      style={{
                        ...styles.notificationIcon,
                        backgroundColor:
                          getNotificationIconBackground(
                            notification.type
                          )
                      }}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div
                      style={
                        styles.notificationContent
                      }
                    >
                      <div
                        style={
                          styles.notificationTitleRow
                        }
                      >
                        <h3
                          style={
                            styles.notificationTitle
                          }
                        >
                          {notification.title}
                        </h3>

                        {isUnread && (
                          <span
                            style={styles.unreadLabel}
                          >
                            New
                          </span>
                        )}
                      </div>

                      <p
                        style={
                          styles.notificationMessage
                        }
                      >
                        {notification.message}
                      </p>

                      <span
                        style={styles.time}
                      >
                        {notification.time}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={styles.rightSection}
                    >
                      {isUnread && (
                        <div
                          style={styles.unreadDot}
                          title="Unread"
                          aria-label="Unread"
                        />
                      )}

                      {!notification.read && (
                        <button
                          type="button"
                          style={
                            styles.readButton
                          }
                          onClick={(event) => {
                            event.stopPropagation();

                            markAsRead(
                              notification.id
                            );
                          }}
                          title="Mark as read"
                          aria-label={`Mark ${notification.title} as read`}
                        >
                          <CheckCircle
                            size={17}
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        style={
                          styles.deleteButton
                        }
                        onClick={(event) =>
                          deleteNotification(
                            notification.id,
                            event
                          )
                        }
                        title="Delete notification"
                        aria-label={`Delete ${notification.title}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              }
            )
          ) : (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>
                <Bell size={30} />
              </div>

              <h3 style={styles.emptyTitle}>
                {notifications.length === 0
                  ? 'No notifications'
                  : 'No matching notifications'}
              </h3>

              <p style={styles.emptyMessage}>
                {notifications.length === 0
                  ? 'You are all caught up. New notifications will appear here.'
                  : 'Try changing your search or filter.'}
              </p>

              {(searchQuery ||
                filter !== 'all') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={styles.emptyAction}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= CLEAR CONFIRMATION ================= */}

      {showClearConfirmation && (
        <div
          style={styles.modalOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowClearConfirmation(false);
            }
          }}
        >
          <div
            style={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-notifications-title"
          >
            <button
              type="button"
              onClick={() =>
                setShowClearConfirmation(false)
              }
              style={styles.closeButton}
              aria-label="Close confirmation"
            >
              <X size={19} />
            </button>

            <div style={styles.confirmIcon}>
              <Trash2 size={24} />
            </div>

            <h2
              id="clear-notifications-title"
              style={styles.confirmTitle}
            >
              Clear all notifications?
            </h2>

            <p style={styles.confirmMessage}>
              This will remove all current
              notifications from this admin
              panel. This action cannot be
              undone.
            </p>

            <div style={styles.confirmActions}>
              <button
                type="button"
                onClick={() =>
                  setShowClearConfirmation(false)
                }
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={clearAllNotifications}
                style={styles.confirmDeleteButton}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: '#f5f6fa',
    minHeight: '100vh'
  },

  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '22px'
  },

  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  headingIcon: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    backgroundColor: '#fff0f1',
    color: '#ff4757',
    flexShrink: 0
  },

  heading: {
    margin: 0,
    fontSize: '30px',
    lineHeight: 1.2,
    color: '#2c3e50',
    fontWeight: '700'
  },

  subheading: {
    margin: '7px 0 0',
    color: '#7f8c8d',
    fontSize: '14px'
  },

  markAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 15px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  disabledButton: {
    opacity: 0.55,
    cursor: 'not-allowed'
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },

  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    padding: '18px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    boxShadow:
      '0 2px 8px rgba(0,0,0,0.04)'
  },

  summaryIcon: {
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '11px',
    flexShrink: 0
  },

  summaryLabel: {
    display: 'block',
    marginBottom: '4px',
    color: '#6c757d',
    fontSize: '12px'
  },

  summaryValue: {
    display: 'block',
    color: '#2c3e50',
    fontSize: '23px'
  },

  card: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '14px',
    boxShadow:
      '0 3px 12px rgba(0,0,0,0.05)'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    padding: '20px 22px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa'
  },

  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '9px'
  },

  cardHeading: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '700'
  },

  badge: {
    padding: '4px 9px',
    borderRadius: '20px',
    backgroundColor: '#ff4757',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700'
  },

  cardSubtitle: {
    margin: '5px 0 0 29px',
    color: '#868e96',
    fontSize: '12px'
  },

  clearAllButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 12px',
    border: '1px solid #f5c2c7',
    borderRadius: '7px',
    backgroundColor: '#fff5f5',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },

  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '15px 20px',
    borderBottom: '1px solid #e9ecef'
  },

  searchBox: {
    flex: '1 1 280px',
    minWidth: '220px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 12px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa'
  },

  searchInput: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#343a40',
    fontSize: '13px'
  },

  filterButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  filterButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    height: '38px',
    padding: '0 12px',
    border: '1px solid #dee2e6',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    color: '#6c757d',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },

  activeFilter: {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
    color: '#ffffff'
  },

  filterCount: {
    minWidth: '18px',
    height: '18px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.25)',
    fontSize: '10px'
  },

  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '13px',
    padding: '17px 20px',
    borderBottom: '1px solid #f0f1f2',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  unreadItem: {
    backgroundColor: '#fffaf3'
  },

  notificationIcon: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '11px',
    flexShrink: 0
  },

  notificationContent: {
    flex: 1,
    minWidth: 0
  },

  notificationTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px'
  },

  notificationTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '700'
  },

  unreadLabel: {
    padding: '2px 6px',
    borderRadius: '10px',
    backgroundColor: '#ff4757',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },

  notificationMessage: {
    margin: '0 0 6px',
    color: '#7f8c8d',
    fontSize: '13px',
    lineHeight: 1.5
  },

  time: {
    color: '#adb5bd',
    fontSize: '11px'
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0
  },

  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ff4757'
  },

  readButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#edf8f1',
    color: '#198754',
    cursor: 'pointer'
  },

  deleteButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#fff5f5',
    color: '#dc3545',
    cursor: 'pointer'
  },

  emptyBox: {
    padding: '70px 25px',
    textAlign: 'center',
    color: '#868e96'
  },

  emptyIcon: {
    width: '62px',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    borderRadius: '50%',
    backgroundColor: '#f8f9fa',
    color: '#adb5bd'
  },

  emptyTitle: {
    margin: '0 0 7px',
    color: '#495057',
    fontSize: '16px'
  },

  emptyMessage: {
    maxWidth: '420px',
    margin: '0 auto',
    color: '#868e96',
    fontSize: '13px',
    lineHeight: 1.5
  },

  emptyAction: {
    marginTop: '15px',
    padding: '9px 14px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#ff4757',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.55)'
  },

  confirmModal: {
    position: 'relative',
    width: '100%',
    maxWidth: '430px',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.2)',
    textAlign: 'center'
  },

  closeButton: {
    position: 'absolute',
    top: '13px',
    right: '13px',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    cursor: 'pointer'
  },

  confirmIcon: {
    width: '55px',
    height: '55px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    borderRadius: '50%',
    backgroundColor: '#fff0f1',
    color: '#dc3545'
  },

  confirmTitle: {
    margin: '0 0 9px',
    color: '#2c3e50',
    fontSize: '19px'
  },

  confirmMessage: {
    margin: '0 auto',
    maxWidth: '340px',
    color: '#6c757d',
    fontSize: '13px',
    lineHeight: 1.6
  },

  confirmActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '22px'
  },

  cancelButton: {
    minWidth: '90px',
    padding: '9px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    color: '#495057',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  confirmDeleteButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  }
};

export default Notifications;
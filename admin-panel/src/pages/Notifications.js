// src/pages/Notifications.js

import React, { useState } from 'react';

import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Trash2
} from 'lucide-react';

const Notifications = () => {

  // ================= STATES =================
  const [notifications, setNotifications] =
    useState([
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
    ]);

  // ================= ICONS =================
  const getIcon = (type) => {

    switch (type) {

      case 'success':
        return (
          <CheckCircle
            size={20}
            color="#2ed573"
          />
        );

      case 'warning':
        return (
          <AlertCircle
            size={20}
            color="#ffa502"
          />
        );

      case 'error':
        return (
          <XCircle
            size={20}
            color="#ff4757"
          />
        );

      default:
        return (
          <Info
            size={20}
            color="#1e90ff"
          />
        );

    }

  };

  // ================= MARK AS READ =================
  const markAsRead = (id) => {

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
            ...notification,
            read: true
          }
          : notification
      )
    );

  };

  // ================= DELETE NOTIFICATION =================
  const deleteNotification = (id) => {

    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.id !== id
      )
    );

  };

  // ================= UNREAD COUNT =================
  const unreadCount =
    notifications.filter(
      (notification) => !notification.read
    ).length;

  // ================= UI =================
  return (

    <div style={styles.container}>

      {/* ================= HEADER ================= */}
      <div style={styles.header}>

        <h1 style={styles.heading}>
          Notifications
        </h1>

        <p style={styles.subheading}>
          Stay updated with latest activities
        </p>

      </div>

      {/* ================= CARD ================= */}
      <div style={styles.card}>

        {/* CARD HEADER */}
        <div style={styles.cardHeader}>

          <div style={styles.cardTitle}>

            <Bell
              size={20}
              color="#ff4757"
            />

            <h2 style={styles.cardHeading}>
              Recent Notifications
            </h2>

          </div>

          <span style={styles.badge}>

            {unreadCount}
            {' '}
            New

          </span>

        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <div>

          {notifications.length > 0 ? (

            notifications.map((notification) => (

              <div
                key={notification.id}
                style={{
                  ...styles.notificationItem,

                  background:
                    notification.read
                      ? '#ffffff'
                      : '#fff5e8'
                }}
                onClick={() =>
                  markAsRead(
                    notification.id
                  )
                }
              >

                {/* ICON */}
                <div>

                  {getIcon(
                    notification.type
                  )}

                </div>

                {/* CONTENT */}
                <div style={{ flex: 1 }}>

                  <h4 style={styles.title}>

                    {notification.title}

                  </h4>

                  <p style={styles.message}>

                    {notification.message}

                  </p>

                  <span style={styles.time}>

                    {notification.time}

                  </span>

                </div>

                {/* RIGHT SIDE */}
                <div
                  style={styles.rightSection}
                >

                  {!notification.read && (

                    <div
                      style={styles.dot}
                    />

                  )}

                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {

                      e.stopPropagation();

                      deleteNotification(
                        notification.id
                      );

                    }}
                  >

                    <Trash2 size={16} />

                  </button>

                </div>

              </div>

            ))

          ) : (

            <div style={styles.emptyBox}>

              <Bell
                size={40}
                color="#ccc"
              />

              <p>
                No notifications available
              </p>

            </div>

          )}

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

  subheading: {
    color: '#7f8c8d',
    fontSize: '14px'
  },

  card: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow:
      '0 4px 12px rgba(0,0,0,0.05)',
    maxWidth: '850px',
    margin: '0 auto'
  },

  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #eee',
    background: '#f8f9fa',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  cardHeading: {
    fontSize: '18px',
    color: '#2c3e50'
  },

  badge: {
    background: '#ff4757',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },

  notificationItem: {
    padding: '18px 24px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    cursor: 'pointer',
    transition: '0.3s'
  },

  title: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#2c3e50'
  },

  message: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginBottom: '6px',
    lineHeight: '1.5'
  },

  time: {
    fontSize: '11px',
    color: '#b2bec3'
  },

  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  dot: {
    width: '8px',
    height: '8px',
    background: '#ff4757',
    borderRadius: '50%'
  },

  deleteBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#999'
  },

  emptyBox: {
    padding: '50px',
    textAlign: 'center',
    color: '#999'
  }

};

export default Notifications;
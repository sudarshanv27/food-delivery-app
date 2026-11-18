import React, { useEffect, useState } from 'react';
import {
  Bell,
  User,
  Search
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const [adminUser, setAdminUser] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // ======================================================
  // LOAD ADMIN USER
  // ======================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('adminUser');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === 'object') {
          setAdminUser(parsedUser);
        }
      }
    } catch (error) {
      console.error(
        'Failed to load admin user information:',
        error
      );

      setAdminUser({});
    }
  }, []);

  // ======================================================
  // ADMIN INFORMATION
  // ======================================================

  const adminName =
    adminUser?.name ||
    adminUser?.full_name ||
    adminUser?.username ||
    'Admin User';

  const adminEmail =
    adminUser?.email || '';

  const adminRole =
    adminUser?.user_type ||
    adminUser?.type ||
    adminUser?.role ||
    'Administrator';

  const avatarLetter =
    adminName
      .trim()
      .charAt(0)
      .toUpperCase() || 'A';

  // ======================================================
  // SEARCH
  // ======================================================

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    // Global search functionality can be connected later
    // to orders, users, restaurants, and delivery partners.
    console.log('Admin search:', query);
  };

  // ======================================================
  // NOTIFICATIONS
  // ======================================================

  const handleNotificationClick = () => {
    // Notification page will be connected here.
    console.log('Opening admin notifications...');
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <header className="admin-header">

      {/* ==================================================
          SEARCH
      ================================================== */}

      <form
        className="header-search"
        onSubmit={handleSearchSubmit}
        role="search"
      >
        <Search
          size={20}
          aria-hidden="true"
        />

        <input
          type="search"
          placeholder="Search orders, users, restaurants..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search admin panel"
        />
      </form>

      {/* ==================================================
          HEADER ACTIONS
      ================================================== */}

      <div className="header-actions">

        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="notification-btn"
          onClick={handleNotificationClick}
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell
            size={20}
            aria-hidden="true"
          />

          <span
            className="notification-badge"
            aria-label="3 unread notifications"
          >
            3
          </span>
        </button>

        {/* ==================================================
            ADMIN PROFILE
        ================================================== */}

        <div
          className="admin-profile"
          title={adminEmail || 'Administrator account'}
        >
          <div
            className="admin-avatar"
            aria-hidden="true"
          >
            {avatarLetter}
          </div>

          <div className="admin-info">

            <span className="admin-name">
              {adminName}
            </span>

            <span className="admin-role">
              {adminRole}
            </span>

          </div>
        </div>

      </div>

    </header>
  );
};

export default Header;
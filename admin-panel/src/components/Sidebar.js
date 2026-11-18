import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Bell,
  BarChart3,
  Truck
} from 'lucide-react';

import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  // ======================================================
  // NAVIGATION ITEMS
  // ======================================================

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: ShoppingBag
    },
    {
      path: '/restaurants',
      label: 'Restaurants',
      icon: Store
    },
    {
      path: '/users',
      label: 'Users',
      icon: Users
    },
    {
      path: '/delivery-partners',
      label: 'Delivery Partners',
      icon: Truck
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      path: '/notifications',
      label: 'Notifications',
      icon: Bell
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    // Remove all Admin Panel authentication data.
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    // Compatibility key used by older components.
    localStorage.removeItem('admin');

    // Clear any other temporary admin-panel data
    // that may be added later.
    sessionStorage.clear();

    navigate('/login', { replace: true });
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <aside className="sidebar">

      {/* ==================================================
          SIDEBAR HEADER
      ================================================== */}

      <div className="sidebar-header">

        <div className="logo">
          <TrendingUp
            size={28}
            aria-hidden="true"
          />

          <span>FoodieDash</span>
        </div>

        <span className="beta-badge">
          Admin
        </span>

      </div>

      {/* ==================================================
          NAVIGATION
      ================================================== */}

      <nav
        className="sidebar-nav"
        aria-label="Admin navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
              end={item.path === '/dashboard'}
            >
              <Icon
                size={20}
                aria-hidden="true"
              />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ==================================================
          SIDEBAR FOOTER
      ================================================== */}

      <div className="sidebar-footer">

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout from FoodieDash Admin Panel"
        >
          <LogOut
            size={20}
            aria-hidden="true"
          />

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;
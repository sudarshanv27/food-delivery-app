import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Bell,
  BarChart3
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <TrendingUp size={28} color="#ff4757" />
          <span>FoodieDash</span>
        </div>
        <div className="beta-badge">Admin</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item" end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/orders" className="nav-item">
          <ShoppingBag size={20} />
          <span>Orders</span>
        </NavLink>
        <NavLink to="/restaurants" className="nav-item">
          <Store size={20} />
          <span>Restaurants</span>
        </NavLink>
        <NavLink to="/users" className="nav-item">
          <Users size={20} />
          <span>Users</span>
        </NavLink>
        <NavLink to="/analytics" className="nav-item">
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/notifications" className="nav-item">
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
        <NavLink to="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
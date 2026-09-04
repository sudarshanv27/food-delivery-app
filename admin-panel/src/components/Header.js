import React from 'react';
import { Bell, User, Search } from 'lucide-react';
import './Header.css';

const Header = () => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <header className="admin-header">
      <div className="header-search">
        <Search size={20} />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="header-actions">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <div className="admin-profile">
          <div className="admin-avatar">
            {adminUser.name?.charAt(0) || 'A'}
          </div>
          <div className="admin-info">
            <span className="admin-name">{adminUser.name || 'Admin User'}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
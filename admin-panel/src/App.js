import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import DeliveryPartners from './pages/DeliveryPartners';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import './App.css';

// ======================================================
// AUTHENTICATION
// ======================================================

const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

const isAuthenticated = () => {
  const token = getAdminToken();

  return Boolean(token && token.trim());
};

// ======================================================
// PROTECTED ROUTE
// ======================================================

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// ======================================================
// AUTHENTICATED LAYOUT
// ======================================================

const AdminLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Header />

        <main className="content-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px'
          },
          success: {
            duration: 3000
          },
          error: {
            duration: 4000
          }
        }}
      />

      <Routes>

        {/* ==================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route
          path="/login"
          element={
            isAuthenticated()
              ? <Navigate to="/" replace />
              : <Login />
          }
        />

        {/* ==================================================
            PROTECTED ADMIN ROUTES
        ================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>

            {/* Dashboard */}
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Orders */}
            <Route
              path="/orders"
              element={<Orders />}
            />

            {/* Restaurants */}
            <Route
              path="/restaurants"
              element={<Restaurants />}
            />

            {/* Users */}
            <Route
              path="/users"
              element={<Users />}
            />

            {/* Delivery Partners */}
            <Route
              path="/delivery-partners"
              element={<DeliveryPartners />}
            />

            {/* Analytics */}
            <Route
              path="/analytics"
              element={<Analytics />}
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={<Notifications />}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings />}
            />

          </Route>
        </Route>

        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
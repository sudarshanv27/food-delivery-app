import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Restaurants from './pages/Restaurants';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

const isAuthenticated = () => {
  return localStorage.getItem('adminToken') !== null;
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <Layout>
              <Orders />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/restaurants" element={
          <PrivateRoute>
            <Layout>
              <Restaurants />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <Layout>
              <Users />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Layout>
              <Notifications />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute>
            <Layout>
              <Analytics />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
// admin-panel/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Restaurants from './pages/Restaurants';
import Orders from './pages/Orders';
import DeliveryPartners from './pages/DeliveryPartners';

function App() {
    const token = localStorage.getItem('adminToken');

    return (
        <BrowserRouter>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/users" element={token ? <Users /> : <Navigate to="/login" />} />
                <Route path="/restaurants" element={token ? <Restaurants /> : <Navigate to="/login" />} />
                <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
                <Route path="/delivery-partners" element={token ? <DeliveryPartners /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
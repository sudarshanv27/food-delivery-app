import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStats, { RevenueChart, OrderStatusChart, TopRestaurants } from '../../components/admin/AdminStats';
import DataTable from '../../components/admin/DataTable';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activePage, setActivePage] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [recentOrders, setRecentOrders] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [topRestaurants, setTopRestaurants] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Simulate API calls
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStats({
                totalRevenue: 1250000,
                totalOrders: 8926,
                totalUsers: 1248,
                totalRestaurants: 156,
                pendingOrders: 23,
                activeDeliveries: 45,
                activeOffers: 8,
                avgRating: 4.5
            });

            setRecentOrders([
                { id: 'ORD-001', customer: 'John Doe', restaurant: 'Pizza Hut', amount: 450, status: 'delivered', date: '2024-01-15' },
                { id: 'ORD-002', customer: 'Jane Smith', restaurant: "McDonald's", amount: 320, status: 'processing', date: '2024-01-15' },
                { id: 'ORD-003', customer: 'Mike Johnson', restaurant: 'KFC', amount: 280, status: 'pending', date: '2024-01-14' },
                { id: 'ORD-004', customer: 'Sarah Williams', restaurant: 'Biryani House', amount: 520, status: 'delivered', date: '2024-01-14' },
                { id: 'ORD-005', customer: 'David Brown', restaurant: 'Domino\'s', amount: 380, status: 'processing', date: '2024-01-13' }
            ]);

            setRevenueData([
                { day: 'Mon', revenue: 125000 },
                { day: 'Tue', revenue: 142000 },
                { day: 'Wed', revenue: 138000 },
                { day: 'Thu', revenue: 156000 },
                { day: 'Fri', revenue: 189000 },
                { day: 'Sat', revenue: 210000 },
                { day: 'Sun', revenue: 195000 }
            ]);

            setTopRestaurants([
                { id: 1, name: 'Pizza Hut', rating: 4.8, orders: 1250, revenue: 456000 },
                { id: 2, name: "McDonald's", rating: 4.7, orders: 1100, revenue: 389000 },
                { id: 3, name: 'KFC', rating: 4.6, orders: 980, revenue: 298000 },
                { id: 4, name: 'Biryani House', rating: 4.9, orders: 850, revenue: 245000 },
                { id: 5, name: 'Domino\'s', rating: 4.8, orders: 780, revenue: 234000 }
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        console.log('Search:', query);
    };

    const handleViewOrder = (order) => {
        setActivePage('orders');
    };

    const orderColumns = [
        { key: 'id', label: 'Order ID', sortable: true },
        { key: 'customer', label: 'Customer', sortable: true },
        { key: 'restaurant', label: 'Restaurant', sortable: true },
        { key: 'amount', label: 'Amount', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'date', label: 'Date', sortable: true }
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return (
                    <>
                        <AdminStats stats={stats} loading={loading} />

                        <div className="dashboard-charts">
                            <RevenueChart data={revenueData} loading={loading} />
                            <OrderStatusChart
                                data={{ delivered: 4500, processing: 320, pending: 23, cancelled: 45 }}
                                loading={loading}
                            />
                        </div>

                        <div className="dashboard-tables">
                            <div className="recent-orders">
                                <h3>Recent Orders</h3>
                                <DataTable
                                    columns={orderColumns}
                                    data={recentOrders}
                                    loading={loading}
                                    onRowClick={handleViewOrder}
                                />
                            </div>
                            <TopRestaurants restaurants={topRestaurants} loading={loading} />
                        </div>
                    </>
                );

            case 'users':
                return <div className="coming-soon">User Management - Coming Soon</div>;
            case 'restaurants':
                return <div className="coming-soon">Restaurant Management - Coming Soon</div>;
            case 'orders':
                return <div className="coming-soon">Order Management - Coming Soon</div>;
            case 'delivery':
                return <div className="coming-soon">Delivery Management - Coming Soon</div>;
            case 'offers':
                return <div className="coming-soon">Offers Management - Coming Soon</div>;
            case 'analytics':
                return <div className="coming-soon">Analytics - Coming Soon</div>;
            case 'reports':
                return <div className="coming-soon">Reports - Coming Soon</div>;
            case 'settings':
                return <div className="coming-soon">Settings - Coming Soon</div>;
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onPageChange={setActivePage}
                activePage={activePage}
            />

            <div className="admin-main">
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onSearch={handleSearch}
                    title={activePage.charAt(0).toUpperCase() + activePage.slice(1)}
                />
                <div className="admin-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
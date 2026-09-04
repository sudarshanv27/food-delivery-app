// src/components/profile/admin/AdminDeliveryManagement.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminDeliveryManagement.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AdminDeliveryManagement = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('today');
    const [stats, setStats] = useState({
        activeDeliveries: 0,
        completedToday: 0,
        activePartners: 0,
        avgDeliveryTime: 0,
        totalEarnings: 0,
        onTimeDelivery: 0,
        avgDistance: 0,
        peakHour: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
    const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
    const [selectedDeliveries, setSelectedDeliveries] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // table, grid, map
    const [sortConfig, setSortConfig] = useState({ key: 'started_at', direction: 'desc' });
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [partnerFormData, setPartnerFormData] = useState({
        name: '',
        phone: '',
        email: '',
        vehicle_type: 'Bike',
        vehicle_number: '',
        status: 'active'
    });
    const mapRef = useRef();

    // WebSocket connection for real-time updates
    useEffect(() => {
        const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws/deliveries');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleRealtimeUpdate(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        fetchAllData();

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            fetchAllData(true);
            checkForAlerts();
        }, 30000);

        return () => clearInterval(interval);
    }, [dateRange]);

    const handleRealtimeUpdate = (data) => {
        if (data.type === 'delivery_status_update') {
            setDeliveries(prev => prev.map(d =>
                d.id === data.delivery_id ? { ...d, status: data.status } : d
            ));
            showNotification(`Delivery ${data.order_id} status updated to ${data.status}`);
            fetchDeliveryStats();
        } else if (data.type === 'partner_location_update') {
            setDeliveryPartners(prev => prev.map(p =>
                p.id === data.partner_id ? { ...p, location: data.location } : p
            ));
        }
    };

    const checkForAlerts = () => {
        const newAlerts = [];

        // Check for delayed deliveries
        deliveries.forEach(delivery => {
            if (delivery.status === 'in_transit' && delivery.estimated_minutes) {
                const startTime = new Date(delivery.started_at);
                const elapsedMinutes = (new Date() - startTime) / 60000;
                if (elapsedMinutes > delivery.estimated_minutes * 1.5) {
                    newAlerts.push({
                        id: delivery.id,
                        type: 'delay',
                        message: `Delivery ${delivery.order_id} is significantly delayed`,
                        severity: 'high'
                    });
                }
            }
        });

        // Check for unassigned deliveries
        const unassignedCount = deliveries.filter(d => d.status === 'pending').length;
        if (unassignedCount > 5) {
            newAlerts.push({
                type: 'unassigned',
                message: `${unassignedCount} deliveries waiting for assignment`,
                severity: 'medium'
            });
        }

        setNotifications(newAlerts);
        if (newAlerts.length > 0 && document.visibilityState === 'visible') {
            showNotification(`${newAlerts.length} new alert${newAlerts.length > 1 ? 's' : ''}`);
        }
    };

    const showNotification = (message) => {
        if (Notification.permission === 'granted') {
            new Notification('Delivery Management', { body: message });
        }
        toast.info(message);
    };

    const fetchAllData = async (silent = false) => {
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setError(null);

        try {
            await Promise.all([
                fetchDeliveries(silent),
                fetchDeliveryPartners(silent),
                fetchDeliveryStats()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load delivery data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchDeliveries = async (silent = false) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/deliveries?range=${dateRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data.data || []);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            if (!silent) {
                setDeliveries(getMockDeliveries());
            }
            throw error;
        }
    };

    const fetchDeliveryPartners = async (silent = false) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/delivery-partners', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveryPartners(response.data.data || []);
        } catch (error) {
            console.error('Error fetching delivery partners:', error);
            if (!silent) {
                setDeliveryPartners(getMockPartners());
            }
            throw error;
        }
    };

    const fetchDeliveryStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/delivery-stats?range=${dateRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({
                activeDeliveries: deliveries.filter(d => ['pending', 'assigned', 'picked_up', 'in_transit'].includes(d.status)).length,
                completedToday: deliveries.filter(d => d.status === 'delivered' && new Date(d.completed_at).toDateString() === new Date().toDateString()).length,
                activePartners: deliveryPartners.filter(p => p.status === 'active').length,
                avgDeliveryTime: 28.5,
                totalEarnings: 15780,
                onTimeDelivery: 92.5,
                avgDistance: 3.2,
                peakHour: 13
            });
        }
    };

    const getMockDeliveries = () => {
        const statuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
        const partners = ['Mohan Singh', 'Raj Kumar', 'Amit Patel', 'Priya Sharma', 'Vikram Singh'];
        const restaurants = ['Pizza Hut', "McDonald's", 'KFC', 'Dominos', 'Burger King', 'Starbucks'];
        const customers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown'];

        return Array.from({ length: 25 }, (_, i) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const hasPartner = !['pending'].includes(status);
            const isCompleted = status === 'delivered';

            return {
                id: i + 1,
                order_id: `ORD${100000 + i}`,
                customer: customers[Math.floor(Math.random() * customers.length)],
                customer_phone: `+91 ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 9000) + 1000}`,
                restaurant: restaurants[Math.floor(Math.random() * restaurants.length)],
                restaurant_phone: `+91 ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 9000) + 1000}`,
                delivery_partner: hasPartner ? partners[Math.floor(Math.random() * partners.length)] : null,
                partner_id: hasPartner ? Math.floor(Math.random() * 5) + 1 : null,
                status: status,
                pickup_address: `${Math.floor(Math.random() * 500) + 1} Main St, Mumbai`,
                delivery_address: `${Math.floor(Math.random() * 500) + 1} Park Ave, Mumbai`,
                distance: `${(Math.random() * 8 + 1).toFixed(1)} km`,
                distance_km: parseFloat((Math.random() * 8 + 1).toFixed(1)),
                estimated_time: `${Math.floor(Math.random() * 30) + 10} min`,
                estimated_minutes: Math.floor(Math.random() * 30) + 10,
                started_at: isCompleted || hasPartner ? new Date(Date.now() - Math.random() * 3600000).toISOString() : null,
                completed_at: isCompleted ? new Date(Date.now() - Math.random() * 1800000).toISOString() : null,
                earnings: Math.floor(Math.random() * 150) + 40,
                tracking_url: 'https://maps.google.com',
                customer_instructions: Math.random() > 0.7 ? 'Ring the doorbell twice' : null,
                priority: Math.random() > 0.8 ? 'high' : 'normal',
                location: status !== 'delivered' && hasPartner ? {
                    lat: 19.0760 + (Math.random() - 0.5) * 0.1,
                    lng: 72.8777 + (Math.random() - 0.5) * 0.1
                } : null
            };
        });
    };

    const getMockPartners = () => {
        return [
            {
                id: 1, name: 'Mohan Singh', phone: '+91 98765 43210', email: 'mohan@example.com',
                status: 'active', rating: 4.8, total_deliveries: 156, completed_today: 5,
                earnings_today: 400, vehicle_type: 'Bike', vehicle_number: 'MH01AB1234',
                location: { lat: 19.0760, lng: 72.8777 }, joined_date: '2023-01-15'
            },
            {
                id: 2, name: 'Raj Kumar', phone: '+91 98765 43211', email: 'raj@example.com',
                status: 'active', rating: 4.9, total_deliveries: 203, completed_today: 7,
                earnings_today: 560, vehicle_type: 'Scooter', vehicle_number: 'MH02CD5678',
                location: { lat: 19.0820, lng: 72.8830 }, joined_date: '2023-03-20'
            },
            {
                id: 3, name: 'Amit Patel', phone: '+91 98765 43212', email: 'amit@example.com',
                status: 'inactive', rating: 4.5, total_deliveries: 89, completed_today: 0,
                earnings_today: 0, vehicle_type: 'Bike', vehicle_number: 'MH03EF9012',
                location: null, joined_date: '2023-06-10'
            },
            {
                id: 4, name: 'Priya Sharma', phone: '+91 98765 43213', email: 'priya@example.com',
                status: 'active', rating: 4.95, total_deliveries: 245, completed_today: 8,
                earnings_today: 640, vehicle_type: 'Scooter', vehicle_number: 'MH04GH3456',
                location: { lat: 19.0700, lng: 72.8700 }, joined_date: '2023-02-01'
            },
            {
                id: 5, name: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram@example.com',
                status: 'active', rating: 4.7, total_deliveries: 134, completed_today: 4,
                earnings_today: 320, vehicle_type: 'Bike', vehicle_number: 'MH05IJ7890',
                location: { lat: 19.0900, lng: 72.8900 }, joined_date: '2023-04-15'
            }
        ];
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Pending Assignment', color: '#FF9800', icon: '⏳', bg: 'rgba(255, 152, 0, 0.1)', progress: 0 },
            assigned: { label: 'Assigned', color: '#2196F3', icon: '👤', bg: 'rgba(33, 150, 243, 0.1)', progress: 20 },
            picked_up: { label: 'Picked Up', color: '#9C27B0', icon: '📦', bg: 'rgba(156, 39, 176, 0.1)', progress: 50 },
            in_transit: { label: 'In Transit', color: '#00BCD4', icon: '🚚', bg: 'rgba(0, 188, 212, 0.1)', progress: 75 },
            delivered: { label: 'Delivered', color: '#4CAF50', icon: '✅', bg: 'rgba(76, 175, 80, 0.1)', progress: 100 },
            cancelled: { label: 'Cancelled', color: '#F44336', icon: '❌', bg: 'rgba(244, 67, 54, 0.1)', progress: 0 }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <div className="status-badge-container">
                <span className="status-badge" style={{ background: config.bg, color: config.color }}>
                    {config.icon} {config.label}
                </span>
                {config.progress > 0 && config.progress < 100 && (
                    <div className="status-progress">
                        <div className="progress-bar" style={{ width: `${config.progress}%`, background: config.color }} />
                    </div>
                )}
            </div>
        );
    };

    const getPriorityBadge = (priority) => {
        if (priority === 'high') {
            return <span className="priority-badge high">🚨 High Priority</span>;
        }
        return null;
    };

    const updateDeliveryStatus = async (deliveryId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/deliveries/${deliveryId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Delivery status updated to ${newStatus}`);
            fetchDeliveries();
            fetchDeliveryStats();
        } catch (error) {
            console.error('Error updating delivery:', error);
            toast.error('Failed to update delivery status');
        }
    };

    const assignDeliveryPartner = async (deliveryId, partnerId) => {
        if (!partnerId) {
            toast.error('Please select a delivery partner');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/deliveries/${deliveryId}/assign`,
                { partner_id: partnerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Delivery partner assigned successfully');
            fetchAllData();
            setSelectedDelivery(null);
        } catch (error) {
            console.error('Error assigning partner:', error);
            toast.error('Failed to assign delivery partner');
        }
    };

    const bulkAssignPartners = async () => {
        const unassignedDeliveries = deliveries.filter(d =>
            selectedDeliveries.includes(d.id) && d.status === 'pending'
        );

        if (unassignedDeliveries.length === 0) {
            toast.error('No unassigned deliveries selected');
            return;
        }

        // Smart assignment based on proximity and availability
        const availablePartners = deliveryPartners.filter(p => p.status === 'active');
        const assignments = unassignedDeliveries.map(delivery => {
            const bestPartner = availablePartners.reduce((best, partner) => {
                const distance = calculateDistance(partner.location, delivery.location);
                return (!best || distance < best.distance) ? { partner, distance } : best;
            }, null);
            return { deliveryId: delivery.id, partnerId: bestPartner?.partner.id };
        });

        try {
            const token = localStorage.getItem('token');
            await Promise.all(assignments.map(assignment =>
                axios.put(`/api/admin/deliveries/${assignment.deliveryId}/assign`,
                    { partner_id: assignment.partnerId },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ));
            toast.success(`Assigned ${assignments.length} deliveries to partners`);
            fetchAllData();
            setSelectedDeliveries([]);
            setShowBulkAssignModal(false);
        } catch (error) {
            console.error('Error bulk assigning:', error);
            toast.error('Failed to assign some deliveries');
        }
    };

    const calculateDistance = (loc1, loc2) => {
        if (!loc1 || !loc2) return Infinity;
        const R = 6371;
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const updatePartnerStatus = async (partnerId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/delivery-partners/${partnerId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Partner status updated to ${status}`);
            fetchDeliveryPartners();
        } catch (error) {
            console.error('Error updating partner status:', error);
            toast.error('Failed to update partner status');
        }
    };

    const addDeliveryPartner = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/delivery-partners', partnerFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Delivery partner added successfully');
            setShowAddPartnerModal(false);
            setPartnerFormData({
                name: '', phone: '', email: '', vehicle_type: 'Bike', vehicle_number: '', status: 'active'
            });
            fetchDeliveryPartners();
        } catch (error) {
            console.error('Error adding partner:', error);
            toast.error('Failed to add delivery partner');
        }
    };

    const exportData = async (format = 'csv') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/deliveries/export?format=${format}&range=${dateRange}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `deliveries_report_${dateRange}_${new Date().toISOString()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / 60000);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
        return `${Math.floor(diffMinutes / 1440)} days ago`;
    };

    const formatDuration = (startDate, endDate) => {
        if (!startDate || !endDate) return 'N/A';
        const start = new Date(startDate);
        const end = new Date(endDate);
        const minutes = Math.floor((end - start) / 60000);
        if (minutes < 60) return `${minutes} min`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedDeliveries = useMemo(() => {
        const sorted = [...filteredDeliveries];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (sortConfig.key === 'started_at' || sortConfig.key === 'completed_at') {
                    aVal = new Date(aVal || 0);
                    bVal = new Date(bVal || 0);
                }
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [filteredDeliveries, sortConfig]);

    const filteredDeliveries = deliveries.filter(delivery => {
        if (filter !== 'all') {
            if (filter === 'active') return ['pending', 'assigned', 'picked_up', 'in_transit'].includes(delivery.status);
            if (filter === 'completed') return delivery.status === 'delivered';
            if (filter === 'pending') return delivery.status === 'pending';
            if (filter === 'cancelled') return delivery.status === 'cancelled';
        }

        if (searchTerm) {
            return delivery.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
        }

        return true;
    });

    const statsCards = [
        { title: 'Active Deliveries', value: stats.activeDeliveries, icon: '🚚', color: '#00BCD4', trend: 8.5 },
        { title: 'Completed Today', value: stats.completedToday, icon: '✅', color: '#4CAF50', trend: 12.3 },
        { title: 'Active Partners', value: stats.activePartners, icon: '👥', color: '#2196F3', trend: 5.2 },
        { title: 'Avg Delivery Time', value: `${stats.avgDeliveryTime} min`, icon: '⏱️', color: '#FF9800', trend: -8.1 },
        { title: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString()}`, icon: '💰', color: '#9C27B0', trend: 18.7 },
        { title: 'On-Time Delivery', value: `${stats.onTimeDelivery || 92.5}%`, icon: '🎯', color: '#8BC34A', trend: 3.4 },
        { title: 'Avg Distance', value: `${stats.avgDistance || 3.2} km`, icon: '📏', color: '#FF6B6B', trend: -2.1 },
        { title: 'Peak Hour', value: `${stats.peakHour || 13}:00`, icon: '⏰', color: '#FFD93D', trend: 0 }
    ];

    const TrendIndicator = ({ value }) => {
        if (!value) return null;
        const isPositive = value > 0;
        return (
            <span className={`trend ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(value)}%
            </span>
        );
    };

    const renderTableView = () => (
        <div className="deliveries-table-container">
            <table className="deliveries-table">
                <thead>
                    <tr>
                        <th className="checkbox-col">
                            <input
                                type="checkbox"
                                checked={selectedDeliveries.length === filteredDeliveries.length && filteredDeliveries.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedDeliveries(filteredDeliveries.map(d => d.id));
                                    } else {
                                        setSelectedDeliveries([]);
                                    }
                                }}
                            />
                        </th>
                        <th onClick={() => handleSort('order_id')}>Order ID {sortConfig.key === 'order_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                        <th>Customer</th>
                        <th>Restaurant</th>
                        <th>Delivery Partner</th>
                        <th onClick={() => handleSort('distance_km')}>Distance {sortConfig.key === 'distance_km' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                        <th>Est. Time</th>
                        <th>Status</th>
                        <th onClick={() => handleSort('earnings')}>Earnings {sortConfig.key === 'earnings' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedDeliveries.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="no-data">
                                <div className="no-data-content">
                                    <span>📭</span>
                                    <p>No deliveries found</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        sortedDeliveries.map(delivery => (
                            <tr key={delivery.id} className={`delivery-row status-${delivery.status} priority-${delivery.priority || 'normal'}`}>
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedDeliveries.includes(delivery.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedDeliveries(prev => [...prev, delivery.id]);
                                            } else {
                                                setSelectedDeliveries(prev => prev.filter(id => id !== delivery.id));
                                            }
                                        }}
                                    />
                                </td>
                                <td className="order-id">
                                    {delivery.order_id}
                                    {getPriorityBadge(delivery.priority)}
                                </td>
                                <td>
                                    <div className="customer-info">
                                        <strong>{delivery.customer}</strong>
                                        <small>{delivery.customer_phone}</small>
                                    </div>
                                </td>
                                <td>
                                    <div className="restaurant-info">
                                        <strong>{delivery.restaurant}</strong>
                                        <small>{delivery.restaurant_phone}</small>
                                    </div>
                                </td>
                                <td>
                                    {delivery.delivery_partner ? (
                                        <div className="partner-info">
                                            <span>{delivery.delivery_partner}</span>
                                            {delivery.started_at && <small>Started {getTimeAgo(delivery.started_at)}</small>}
                                            {delivery.completed_at && <small>Completed {getTimeAgo(delivery.completed_at)}</small>}
                                        </div>
                                    ) : (
                                        <span className="unassigned">Unassigned</span>
                                    )}
                                </td>
                                <td>{delivery.distance}</td>
                                <td>
                                    {delivery.estimated_time}
                                    {delivery.started_at && !delivery.completed_at && (
                                        <small className="elapsed-time">
                                            Elapsed: {formatDuration(delivery.started_at, new Date())}
                                        </small>
                                    )}
                                </td>
                                <td>{getStatusBadge(delivery.status)}</td>
                                <td className="earnings">₹{delivery.earnings}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="view-btn" onClick={() => setSelectedDelivery(delivery)} title="View Details">
                                            👁️
                                        </button>
                                        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                                            <select
                                                className="status-update"
                                                onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                                                value={delivery.status}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="picked_up">Picked Up</option>
                                                <option value="in_transit">In Transit</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderGridView = () => (
        <div className="deliveries-grid">
            {sortedDeliveries.map(delivery => (
                <div key={delivery.id} className={`delivery-card ${delivery.priority === 'high' ? 'high-priority' : ''}`}>
                    <div className="card-header">
                        <div className="order-id-badge">{delivery.order_id}</div>
                        {getStatusBadge(delivery.status)}
                    </div>
                    <div className="card-content">
                        <div className="card-row">
                            <span className="label">Customer:</span>
                            <span className="value">{delivery.customer}</span>
                        </div>
                        <div className="card-row">
                            <span className="label">Restaurant:</span>
                            <span className="value">{delivery.restaurant}</span>
                        </div>
                        <div className="card-row">
                            <span className="label">Partner:</span>
                            <span className="value">{delivery.delivery_partner || 'Unassigned'}</span>
                        </div>
                        <div className="card-row">
                            <span className="label">Distance:</span>
                            <span className="value">{delivery.distance}</span>
                        </div>
                        <div className="card-row">
                            <span className="label">Est. Time:</span>
                            <span className="value">{delivery.estimated_time}</span>
                        </div>
                        <div className="card-row">
                            <span className="label">Earnings:</span>
                            <span className="value earnings">₹{delivery.earnings}</span>
                        </div>
                    </div>
                    <div className="card-actions">
                        <button className="view-btn" onClick={() => setSelectedDelivery(delivery)}>View Details</button>
                        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                            <select onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)} value={delivery.status}>
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderMapView = () => {
        const activeDeliveries = deliveries.filter(d => d.location && ['assigned', 'picked_up', 'in_transit'].includes(d.status));
        const center = activeDeliveries[0]?.location || { lat: 19.0760, lng: 72.8777 };

        return (
            <div className="deliveries-map-container">
                <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: '500px', width: '100%' }} ref={mapRef}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {activeDeliveries.map(delivery => (
                        <Marker key={delivery.id} position={[delivery.location.lat, delivery.location.lng]}>
                            <Popup>
                                <div className="map-popup">
                                    <strong>{delivery.order_id}</strong>
                                    <p>To: {delivery.customer}</p>
                                    <p>Status: {delivery.status}</p>
                                    <button onClick={() => setSelectedDelivery(delivery)}>View Details</button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="delivery-loading-container">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading delivery management...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="delivery-error-container">
                <div className="error-content">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button onClick={() => fetchAllData()} className="retry-btn">
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-delivery-management">
            {/* Header */}
            <div className="section-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">🚚</span>
                        Delivery Management
                    </h2>
                    {refreshing && <span className="refreshing-badge">Refreshing...</span>}
                    {notifications.length > 0 && (
                        <button className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                            🔔 {notifications.length}
                        </button>
                    )}
                </div>
                <div className="header-controls">
                    <div className="view-mode-selector">
                        <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                            📋 Table
                        </button>
                        <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                            🔲 Grid
                        </button>
                        <button className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')}>
                            🗺️ Map
                        </button>
                    </div>
                    <div className="date-range-filter">
                        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    <button className="refresh-btn" onClick={() => fetchAllData()} title="Refresh data">
                        🔄
                    </button>
                    <div className="export-buttons">
                        <button onClick={() => exportData('csv')} className="export-btn csv">📄 CSV</button>
                        <button onClick={() => exportData('excel')} className="export-btn excel">📊 Excel</button>
                        <button onClick={() => exportData('pdf')} className="export-btn pdf">📑 PDF</button>
                    </div>
                </div>
            </div>

            {/* Notifications Panel */}
            {showNotifications && notifications.length > 0 && (
                <div className="notifications-panel">
                    <h4>Alerts</h4>
                    {notifications.map((notification, idx) => (
                        <div key={idx} className={`notification-item ${notification.severity}`}>
                            <span className="notification-icon">⚠️</span>
                            <p>{notification.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>
                                {stat.title}
                                <TrendIndicator value={stat.trend} />
                            </h3>
                            <p className="stat-value">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bulk Actions */}
            {selectedDeliveries.length > 0 && (
                <div className="bulk-actions-bar">
                    <span>{selectedDeliveries.length} deliveries selected</span>
                    <div className="bulk-buttons">
                        <button onClick={() => setShowBulkAssignModal(true)} className="bulk-assign-btn">
                            👥 Assign Partners
                        </button>
                        <button onClick={() => setSelectedDeliveries([])} className="clear-selection">
                            ✕ Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-buttons">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        All Deliveries
                    </button>
                    <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                        Active
                    </button>
                    <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        Pending Assignment
                    </button>
                    <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
                        Completed
                    </button>
                    <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
                        Cancelled
                    </button>
                </div>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Search by order ID, customer, restaurant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'map' && renderMapView()}

            {/* Delivery Partners Section */}
            <div className="delivery-partners-section">
                <div className="section-header">
                    <h3>
                        <span>👥 Delivery Partners</span>
                        <span className="partner-stats">{deliveryPartners.filter(p => p.status === 'active').length} Active</span>
                    </h3>
                    <button className="add-partner-btn" onClick={() => setShowAddPartnerModal(true)}>
                        + Add Partner
                    </button>
                </div>
                <div className="partners-grid">
                    {deliveryPartners.map(partner => (
                        <div key={partner.id} className="partner-card" onClick={() => {
                            setSelectedPartner(partner);
                            setShowPartnerModal(true);
                        }}>
                            <div className="partner-header">
                                <div className="partner-avatar" style={{ background: `linear-gradient(135deg, #667eea, #764ba2)` }}>
                                    {partner.name.charAt(0)}
                                </div>
                                <div className="partner-status-badge">
                                    <span className={`status-dot ${partner.status === 'active' ? 'active' : 'inactive'}`}>
                                        {partner.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div className="partner-info">
                                <h4>{partner.name}</h4>
                                <p className="partner-phone">{partner.phone}</p>
                                <div className="partner-stats">
                                    <span>⭐ {partner.rating}</span>
                                    <span>📦 {partner.total_deliveries}</span>
                                    <span>🚗 {partner.vehicle_type}</span>
                                </div>
                                {partner.status === 'active' && (
                                    <div className="partner-today-stats">
                                        <span>Today: {partner.completed_today || 0} deliveries</span>
                                        <span>₹{partner.earnings_today || 0}</span>
                                    </div>
                                )}
                                <div className="partner-joined">
                                    Joined: {new Date(partner.joined_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="partner-actions">
                                <button
                                    className={`toggle-status ${partner.status}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updatePartnerStatus(partner.id, partner.status === 'active' ? 'inactive' : 'active');
                                    }}
                                >
                                    {partner.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delivery Details Modal */}
            {selectedDelivery && (
                <div className="modal-overlay" onClick={() => setSelectedDelivery(null)}>
                    <div className="modal-content delivery-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delivery Details - {selectedDelivery.order_id}</h3>
                            <button className="close-modal" onClick={() => setSelectedDelivery(null)}>×</button>
                        </div>
                        <div className="delivery-details">
                            <div className="detail-section">
                                <h4>📋 Order Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Order ID:</strong> {selectedDelivery.order_id}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Status:</strong> {getStatusBadge(selectedDelivery.status)}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Distance:</strong> {selectedDelivery.distance}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Est. Time:</strong> {selectedDelivery.estimated_time}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Earnings:</strong> ₹{selectedDelivery.earnings}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Priority:</strong> {selectedDelivery.priority || 'Normal'}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>👤 Customer Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Name:</strong> {selectedDelivery.customer}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Phone:</strong> {selectedDelivery.customer_phone}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong>Delivery Address:</strong> {selectedDelivery.delivery_address}
                                    </div>
                                    {selectedDelivery.customer_instructions && (
                                        <div className="detail-item full-width instructions">
                                            <strong>📝 Instructions:</strong> {selectedDelivery.customer_instructions}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>🍕 Restaurant Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Name:</strong> {selectedDelivery.restaurant}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Phone:</strong> {selectedDelivery.restaurant_phone}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong>Pickup Address:</strong> {selectedDelivery.pickup_address}
                                    </div>
                                </div>
                            </div>

                            {selectedDelivery.delivery_partner && (
                                <div className="detail-section">
                                    <h4>🚚 Delivery Partner</h4>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Name:</strong> {selectedDelivery.delivery_partner}
                                        </div>
                                        {selectedDelivery.started_at && (
                                            <div className="detail-item">
                                                <strong>Started:</strong> {new Date(selectedDelivery.started_at).toLocaleString()}
                                            </div>
                                        )}
                                        {selectedDelivery.completed_at && (
                                            <div className="detail-item">
                                                <strong>Completed:</strong> {new Date(selectedDelivery.completed_at).toLocaleString()}
                                            </div>
                                        )}
                                        {selectedDelivery.started_at && !selectedDelivery.completed_at && (
                                            <div className="detail-item">
                                                <strong>Time Elapsed:</strong> {formatDuration(selectedDelivery.started_at, new Date())}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedDelivery.location && (
                                <div className="detail-section">
                                    <h4>📍 Current Location</h4>
                                    <div className="location-map-preview">
                                        <p>Lat: {selectedDelivery.location.lat}, Lng: {selectedDelivery.location.lng}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!selectedDelivery.delivery_partner && selectedDelivery.status !== 'cancelled' && (
                            <div className="assign-partner">
                                <h4>Assign Delivery Partner</h4>
                                <div className="assign-form">
                                    <select onChange={(e) => assignDeliveryPartner(selectedDelivery.id, e.target.value)}>
                                        <option value="">Select Partner</option>
                                        {deliveryPartners.filter(p => p.status === 'active').map(partner => (
                                            <option key={partner.id} value={partner.id}>
                                                {partner.name} (⭐ {partner.rating} - {partner.total_deliveries} deliveries - {partner.vehicle_type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            {selectedDelivery.tracking_url && (
                                <a href={selectedDelivery.tracking_url} target="_blank" rel="noopener noreferrer" className="track-btn">
                                    📍 Track Delivery
                                </a>
                            )}
                            <button onClick={() => setSelectedDelivery(null)} className="close-btn">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Partner Details Modal */}
            {showPartnerModal && selectedPartner && (
                <div className="modal-overlay" onClick={() => setShowPartnerModal(false)}>
                    <div className="modal-content partner-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Partner Details</h3>
                            <button className="close-modal" onClick={() => setShowPartnerModal(false)}>×</button>
                        </div>
                        <div className="partner-details">
                            <div className="partner-profile">
                                <div className="partner-avatar large" style={{ background: `linear-gradient(135deg, #667eea, #764ba2)` }}>
                                    {selectedPartner.name.charAt(0)}
                                </div>
                                <h3>{selectedPartner.name}</h3>
                                <p>{selectedPartner.email}</p>
                                <p>{selectedPartner.phone}</p>
                            </div>
                            <div className="partner-stats-detailed">
                                <div className="stat-item">
                                    <span className="stat-label">Rating</span>
                                    <span className="stat-value">⭐ {selectedPartner.rating}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Total Deliveries</span>
                                    <span className="stat-value">{selectedPartner.total_deliveries}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Vehicle</span>
                                    <span className="stat-value">{selectedPartner.vehicle_type} - {selectedPartner.vehicle_number}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Status</span>
                                    <span className={`status-value ${selectedPartner.status}`}>{selectedPartner.status}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Joined</span>
                                    <span className="stat-value">{new Date(selectedPartner.joined_date).toLocaleDateString()}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Today's Earnings</span>
                                    <span className="stat-value">₹{selectedPartner.earnings_today || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Partner Modal */}
            {showAddPartnerModal && (
                <div className="modal-overlay" onClick={() => setShowAddPartnerModal(false)}>
                    <div className="modal-content add-partner-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Delivery Partner</h3>
                            <button className="close-modal" onClick={() => setShowAddPartnerModal(false)}>×</button>
                        </div>
                        <form onSubmit={addDeliveryPartner}>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" required value={partnerFormData.name} onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input type="tel" required value={partnerFormData.phone} onChange={(e) => setPartnerFormData({ ...partnerFormData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" required value={partnerFormData.email} onChange={(e) => setPartnerFormData({ ...partnerFormData, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Vehicle Type *</label>
                                    <select value={partnerFormData.vehicle_type} onChange={(e) => setPartnerFormData({ ...partnerFormData, vehicle_type: e.target.value })}>
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Car">Car</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Number *</label>
                                    <input type="text" required value={partnerFormData.vehicle_number} onChange={(e) => setPartnerFormData({ ...partnerFormData, vehicle_number: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={partnerFormData.status} onChange={(e) => setPartnerFormData({ ...partnerFormData, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddPartnerModal(false)} className="cancel-btn">Cancel</button>
                                <button type="submit" className="submit-btn">Add Partner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Assign Modal */}
            {showBulkAssignModal && (
                <div className="modal-overlay" onClick={() => setShowBulkAssignModal(false)}>
                    <div className="modal-content bulk-assign-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Bulk Assign Partners</h3>
                            <button className="close-modal" onClick={() => setShowBulkAssignModal(false)}>×</button>
                        </div>
                        <div className="bulk-assign-content">
                            <p>Selected {selectedDeliveries.length} deliveries for assignment.</p>
                            <p>Partners will be assigned based on proximity and availability.</p>
                            <div className="delivery-summary">
                                <strong>Selected Deliveries:</strong>
                                <ul>
                                    {selectedDeliveries.map(id => {
                                        const delivery = deliveries.find(d => d.id === id);
                                        return delivery ? <li key={id}>{delivery.order_id} - {delivery.distance}</li> : null;
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setShowBulkAssignModal(false)} className="cancel-btn">Cancel</button>
                            <button onClick={bulkAssignPartners} className="submit-btn">Assign Partners</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDeliveryManagement;
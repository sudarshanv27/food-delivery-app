// src/components/profile/admin/AdminOffersManagement.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminOffersManagement.css';

const AdminOffersManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [editingOffer, setEditingOffer] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [customDateRange, setCustomDateRange] = useState({
        startDate: new Date(),
        endDate: new Date()
    });
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [stats, setStats] = useState({
        activeOffers: 0,
        totalOffers: 0,
        totalUses: 0,
        expiredOffers: 0,
        totalSavings: 0,
        conversionRate: 0,
        featuredOffers: 0,
        avgDiscount: 0,
        mostUsedOffer: null,
        topSavingOffer: null
    });
    const [analytics, setAnalytics] = useState({
        usageTrend: [],
        categoryPerformance: [],
        dailyRedemptions: [],
        topUsers: []
    });
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: '',
        max_discount: '',
        valid_from: new Date(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage_limit: '',
        usage_limit_per_user: '',
        applicable_on: 'all',
        applicable_restaurants: [],
        applicable_categories: [],
        is_active: true,
        is_featured: false,
        terms_conditions: '',
        banner_image: null
    });
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef();

    useEffect(() => {
        fetchOffers();
        fetchAnalytics();

        const interval = setInterval(() => {
            fetchOffers(true);
        }, 60000);

        return () => clearInterval(interval);
    }, [dateRange, customDateRange]);

    const fetchOffers = async (silent = false) => {
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                range: dateRange,
                start_date: dateRange === 'custom' ? customDateRange.startDate.toISOString() : '',
                end_date: dateRange === 'custom' ? customDateRange.endDate.toISOString() : ''
            });

            const response = await axios.get(`/api/admin/offers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOffers(response.data.data || []);
            calculateStats(response.data.data || []);
        } catch (error) {
            console.error('Error fetching offers:', error);
            const mockData = getMockOffers();
            setOffers(mockData);
            calculateStats(mockData);
            if (!silent) {
                toast.error('Using demo data. API not available.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/offers/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setAnalytics({
                usageTrend: generateMockUsageTrend(),
                categoryPerformance: [
                    { category: 'Percentage', usage: 45, revenue: 125000 },
                    { category: 'Fixed Amount', usage: 35, revenue: 85000 },
                    { category: 'Free Delivery', usage: 20, revenue: 45000 }
                ],
                dailyRedemptions: generateMockDailyRedemptions(),
                topUsers: [
                    { name: 'John D.', email: 'john@example.com', redemptions: 12, savings: 2400 },
                    { name: 'Jane S.', email: 'jane@example.com', redemptions: 9, savings: 1800 },
                    { name: 'Mike R.', email: 'mike@example.com', redemptions: 7, savings: 1400 }
                ]
            });
        }
    };

    const generateMockUsageTrend = () => {
        const data = [];
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toLocaleDateString(),
                redemptions: Math.floor(Math.random() * 50) + 10,
                revenue: Math.floor(Math.random() * 20000) + 5000
            });
        }
        return data;
    };

    const generateMockDailyRedemptions = () => {
        const data = [];
        for (let i = 0; i < 24; i++) {
            data.push({
                hour: i,
                redemptions: Math.floor(Math.random() * 30) + (i >= 11 && i <= 14 ? 20 : i >= 19 && i <= 22 ? 25 : 5)
            });
        }
        return data;
    };

    const calculateStats = (offersData) => {
        const now = new Date();
        const activeOffers = offersData.filter(o => o.is_active && new Date(o.valid_until) > now).length;
        const expiredOffers = offersData.filter(o => new Date(o.valid_until) < now).length;
        const totalUses = offersData.reduce((sum, o) => sum + (o.used_count || 0), 0);
        const totalSavings = offersData.reduce((sum, o) => sum + (o.total_savings || 0), 0);
        const featuredOffers = offersData.filter(o => o.is_featured).length;
        const avgDiscount = offersData.reduce((sum, o) => sum + (o.discount_value || 0), 0) / (offersData.length || 1);
        const mostUsedOffer = offersData.reduce((max, o) =>
            (o.used_count || 0) > (max.used_count || 0) ? o : max, offersData[0]);
        const topSavingOffer = offersData.reduce((max, o) =>
            (o.total_savings || 0) > (max.total_savings || 0) ? o : max, offersData[0]);

        setStats({
            activeOffers,
            totalOffers: offersData.length,
            totalUses,
            expiredOffers,
            totalSavings,
            conversionRate: offersData.length > 0 ? ((activeOffers / offersData.length) * 100).toFixed(1) : 0,
            featuredOffers,
            avgDiscount: avgDiscount.toFixed(0),
            mostUsedOffer,
            topSavingOffer
        });
    };

    const getMockOffers = () => {
        const offers = [];
        const types = ['percentage', 'fixed'];
        const titles = ['Welcome Discount', 'Flash Sale', 'Weekend Special', 'Festival Offer', 'First Order', 'Loyalty Reward'];

        for (let i = 1; i <= 12; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const isActive = Math.random() > 0.3;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 15);

            offers.push({
                id: i,
                code: `${titles[i % titles.length].toUpperCase().replace(' ', '')}${Math.floor(Math.random() * 100)}`,
                title: titles[i % titles.length],
                description: `Get amazing discounts on your ${titles[i % titles.length].toLowerCase()}! Limited time offer.`,
                discount_type: type,
                discount_value: type === 'percentage' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 300) + 50,
                min_order_amount: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 100 : 0,
                max_discount: type === 'percentage' ? Math.floor(Math.random() * 300) + 100 : null,
                valid_from: startDate.toISOString(),
                valid_until: endDate.toISOString(),
                usage_limit: Math.floor(Math.random() * 1000) + 100,
                usage_limit_per_user: Math.floor(Math.random() * 3) + 1,
                used_count: Math.floor(Math.random() * 500),
                applicable_on: ['all', 'restaurant', 'delivery'][Math.floor(Math.random() * 3)],
                is_active: isActive && endDate > new Date(),
                is_featured: Math.random() > 0.8,
                created_at: startDate.toISOString(),
                created_by: 'Admin',
                total_savings: Math.floor(Math.random() * 50000)
            });
        }
        return offers;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.code.trim()) errors.code = 'Offer code is required';
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.discount_value) errors.discount_value = 'Discount value is required';
        if (formData.discount_value <= 0) errors.discount_value = 'Discount value must be greater than 0';

        if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
            errors.discount_value = 'Percentage discount cannot exceed 100%';
        }

        if (formData.valid_from && formData.valid_until && formData.valid_from > formData.valid_until) {
            errors.valid_until = 'End date must be after start date';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date, field) => {
        setFormData({
            ...formData,
            [field]: date
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.size <= 2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, banner_image: reader.result }));
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Image must be less than 2MB');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const submitData = {
                ...formData,
                valid_from: formData.valid_from.toISOString(),
                valid_until: formData.valid_until.toISOString()
            };

            if (editingOffer) {
                await axios.put(`/api/admin/offers/${editingOffer.id}`, submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Offer updated successfully');
            } else {
                await axios.post('/api/admin/offers', submitData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Offer created successfully');
            }
            resetForm();
            fetchOffers();
        } catch (error) {
            console.error('Error saving offer:', error);
            toast.error(error.response?.data?.message || 'Failed to save offer');
        }
    };

    const handleDelete = async (offerId) => {
        if (window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/offers/${offerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Offer deleted successfully');
                fetchOffers();
            } catch (error) {
                console.error('Error deleting offer:', error);
                toast.error('Failed to delete offer');
            }
        }
    };

    const handleBulkDelete = async () => {
        const selectedIds = offers.filter(o => o.selected).map(o => o.id);
        if (selectedIds.length === 0) {
            toast.error('No offers selected');
            return;
        }

        if (window.confirm(`Delete ${selectedIds.length} offers? This action cannot be undone.`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('/api/admin/offers/bulk-delete', { ids: selectedIds }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(`${selectedIds.length} offers deleted successfully`);
                fetchOffers();
            } catch (error) {
                console.error('Error bulk deleting:', error);
                toast.error('Failed to delete offers');
            }
        }
    };

    const handleToggleStatus = async (offerId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/admin/offers/${offerId}/toggle-status`,
                { is_active: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            fetchOffers();
        } catch (error) {
            console.error('Error toggling offer status:', error);
            toast.error('Failed to update offer status');
        }
    };

    const handleDuplicate = async (offer) => {
        const duplicatedOffer = {
            ...offer,
            code: `${offer.code}_COPY${Math.floor(Math.random() * 1000)}`,
            title: `${offer.title} (Copy)`,
            used_count: 0,
            total_savings: 0,
            is_active: false,
            valid_from: new Date(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        delete duplicatedOffer.id;

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/offers', duplicatedOffer, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Offer duplicated successfully');
            fetchOffers();
        } catch (error) {
            console.error('Error duplicating offer:', error);
            toast.error('Failed to duplicate offer');
        }
    };

    const exportData = async (format = 'csv') => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/admin/offers/export?format=${format}&filter=${filter}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `offers_report_${new Date().toISOString()}.${format}`);
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

    const resetForm = () => {
        setFormData({
            code: '',
            title: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_order_amount: '',
            max_discount: '',
            valid_from: new Date(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            usage_limit: '',
            usage_limit_per_user: '',
            applicable_on: 'all',
            applicable_restaurants: [],
            applicable_categories: [],
            is_active: true,
            is_featured: false,
            terms_conditions: '',
            banner_image: null
        });
        setFormErrors({});
        setEditingOffer(null);
        setShowModal(false);
    };

    const editOffer = (offer) => {
        setEditingOffer(offer);
        setFormData({
            code: offer.code,
            title: offer.title,
            description: offer.description || '',
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            min_order_amount: offer.min_order_amount || '',
            max_discount: offer.max_discount || '',
            valid_from: new Date(offer.valid_from),
            valid_until: new Date(offer.valid_until),
            usage_limit: offer.usage_limit || '',
            usage_limit_per_user: offer.usage_limit_per_user || '',
            applicable_on: offer.applicable_on || 'all',
            applicable_restaurants: offer.applicable_restaurants || [],
            applicable_categories: offer.applicable_categories || [],
            is_active: offer.is_active,
            is_featured: offer.is_featured || false,
            terms_conditions: offer.terms_conditions || '',
            banner_image: offer.banner_image || null
        });
        setShowModal(true);
    };

    const viewAnalytics = (offer) => {
        setSelectedOffer(offer);
        setShowAnalyticsModal(true);
    };

    const getDiscountDisplay = (offer) => {
        if (offer.discount_type === 'percentage') {
            return `${offer.discount_value}% OFF`;
        } else {
            return `₹${offer.discount_value} OFF`;
        }
    };

    const getStatusBadge = (isActive, validUntil) => {
        const now = new Date();
        const validUntilDate = new Date(validUntil);
        const daysLeft = Math.ceil((validUntilDate - now) / (1000 * 60 * 60 * 24));

        if (!isActive) {
            return <span className="status-badge inactive"><span className="status-icon">⭕</span> Inactive</span>;
        }
        if (validUntilDate < now) {
            return <span className="status-badge expired"><span className="status-icon">⌛</span> Expired</span>;
        }
        if (daysLeft <= 3) {
            return <span className="status-badge expiring-soon"><span className="status-icon">⚠️</span> Expiring Soon ({daysLeft}d)</span>;
        }
        return <span className="status-badge active"><span className="status-icon">✅</span> Active</span>;
    };

    const getUsageProgress = (usedCount, usageLimit) => {
        if (!usageLimit) return null;
        const percentage = (usedCount / usageLimit) * 100;
        const isNearLimit = percentage >= 80;
        const isFull = percentage >= 100;

        return (
            <div className="usage-progress">
                <div className="progress-info">
                    <span>🎫 Redemptions: {usedCount.toLocaleString()} / {usageLimit.toLocaleString()}</span>
                    <span className={`percentage ${isNearLimit ? 'warning' : ''} ${isFull ? 'full' : ''}`}>
                        {percentage.toFixed(1)}%
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className={`progress-fill ${isNearLimit ? 'warning' : ''} ${isFull ? 'full' : ''}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>
        );
    };

    const sortedAndFilteredOffers = useMemo(() => {
        let filtered = [...offers];

        // Apply filters
        if (filter !== 'all') {
            const now = new Date();
            if (filter === 'active') {
                filtered = filtered.filter(o => o.is_active && new Date(o.valid_until) > now);
            } else if (filter === 'expired') {
                filtered = filtered.filter(o => new Date(o.valid_until) < now);
            } else if (filter === 'inactive') {
                filtered = filtered.filter(o => !o.is_active);
            } else if (filter === 'featured') {
                filtered = filtered.filter(o => o.is_featured);
            }
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.code.toLowerCase().includes(term) ||
                o.title.toLowerCase().includes(term) ||
                (o.description && o.description.toLowerCase().includes(term))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'valid_from' || sortBy === 'valid_until' || sortBy === 'created_at') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [offers, filter, searchTerm, sortBy, sortOrder]);

    const statsCards = [
        { title: 'Active Offers', value: stats.activeOffers, icon: '🎫', color: '#4CAF50', subtitle: 'Currently running', trend: '+12%' },
        { title: 'Total Offers', value: stats.totalOffers, icon: '📦', color: '#2196F3', subtitle: 'All time', trend: '+8%' },
        { title: 'Total Redemptions', value: stats.totalUses.toLocaleString(), icon: '🎯', color: '#FF9800', subtitle: 'Coupons used', trend: '+25%' },
        { title: 'Expired Offers', value: stats.expiredOffers, icon: '⏰', color: '#F44336', subtitle: 'Past offers', trend: '-5%' },
        { title: 'Total Savings', value: `₹${stats.totalSavings.toLocaleString()}`, icon: '💰', color: '#9C27B0', subtitle: 'Customer savings', trend: '+18%' },
        { title: 'Avg Discount', value: `${stats.avgDiscount}%`, icon: '✨', color: '#00BCD4', subtitle: 'Average value', trend: '+3%' },
        { title: 'Featured Offers', value: stats.featuredOffers, icon: '⭐', color: '#FFC107', subtitle: 'Highlighted', trend: '+2' },
        { title: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: '📈', color: '#8BC34A', subtitle: 'Active vs Total', trend: '+6%' }
    ];

    if (loading) {
        return (
            <div className="offers-loading-container">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p>Loading offers & promotions...</p>
            </div>
        );
    }

    return (
        <div className="admin-offers-management">
            {/* Header */}
            <div className="section-header">
                <div className="header-title">
                    <h2>
                        <span className="header-icon">🎫</span>
                        Offers & Promotions
                    </h2>
                    {refreshing && <span className="refreshing-badge">Refreshing...</span>}
                    <div className="header-stats">
                        <span className="stat-badge">
                            <span className="stat-dot active"></span>
                            {stats.activeOffers} Active
                        </span>
                        <span className="stat-badge">
                            <span className="stat-dot featured"></span>
                            {stats.featuredOffers} Featured
                        </span>
                    </div>
                </div>
                <div className="header-controls">
                    <div className="view-mode-selector">
                        <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                            ⊞ Grid
                        </button>
                        <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                            ≡ List
                        </button>
                    </div>
                    <div className="date-range-filter">
                        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                            <option value="all">All Time</option>
                            <option value="active">Currently Active</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="expired">Expired</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        {dateRange === 'custom' && (
                            <div className="custom-date-range">
                                <DatePicker
                                    selected={customDateRange.startDate}
                                    onChange={(date) => setCustomDateRange(prev => ({ ...prev, startDate: date }))}
                                    selectsStart
                                    startDate={customDateRange.startDate}
                                    endDate={customDateRange.endDate}
                                    placeholderText="Start date"
                                />
                                <span>to</span>
                                <DatePicker
                                    selected={customDateRange.endDate}
                                    onChange={(date) => setCustomDateRange(prev => ({ ...prev, endDate: date }))}
                                    selectsEnd
                                    startDate={customDateRange.startDate}
                                    endDate={customDateRange.endDate}
                                    minDate={customDateRange.startDate}
                                    placeholderText="End date"
                                />
                            </div>
                        )}
                    </div>
                    <button className="refresh-btn" onClick={() => fetchOffers()} title="Refresh data">
                        🔄
                    </button>
                    <div className="export-buttons">
                        <button onClick={() => exportData('csv')} className="export-btn csv">📄 CSV</button>
                        <button onClick={() => exportData('excel')} className="export-btn excel">📊 Excel</button>
                        <button onClick={() => exportData('pdf')} className="export-btn pdf">📑 PDF</button>
                    </div>
                    <button className="bulk-delete-btn" onClick={handleBulkDelete}>
                        🗑️ Bulk Delete
                    </button>
                    <button className="add-btn" onClick={() => setShowModal(true)}>
                        + Create New Offer
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>
                                {stat.title}
                                {stat.trend && <span className="stat-trend positive">{stat.trend}</span>}
                            </h3>
                            <p className="stat-value">{stat.value}</p>
                            <small className="stat-subtitle">{stat.subtitle}</small>
                        </div>
                    </div>
                ))}
            </div>

            {/* Most Used & Top Saving Highlights */}
            {(stats.mostUsedOffer || stats.topSavingOffer) && (
                <div className="highlights-section">
                    <div className="highlight-card">
                        <span className="highlight-icon">🏆</span>
                        <div className="highlight-info">
                            <h4>Most Used Offer</h4>
                            <p className="highlight-title">{stats.mostUsedOffer?.title}</p>
                            <p className="highlight-stats">{stats.mostUsedOffer?.used_count} redemptions</p>
                        </div>
                    </div>
                    <div className="highlight-card">
                        <span className="highlight-icon">💰</span>
                        <div className="highlight-info">
                            <h4>Top Saving Offer</h4>
                            <p className="highlight-title">{stats.topSavingOffer?.title}</p>
                            <p className="highlight-stats">₹{stats.topSavingOffer?.total_savings?.toLocaleString()} saved</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="filters-bar">
                <div className="filter-buttons">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        📋 All ({stats.totalOffers})
                    </button>
                    <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                        ✅ Active ({stats.activeOffers})
                    </button>
                    <button className={`filter-btn ${filter === 'expired' ? 'active' : ''}`} onClick={() => setFilter('expired')}>
                        ⌛ Expired ({stats.expiredOffers})
                    </button>
                    <button className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`} onClick={() => setFilter('inactive')}>
                        ⭕ Inactive ({stats.totalOffers - stats.activeOffers - stats.expiredOffers})
                    </button>
                    <button className={`filter-btn ${filter === 'featured' ? 'active' : ''}`} onClick={() => setFilter('featured')}>
                        ⭐ Featured ({stats.featuredOffers})
                    </button>
                </div>

                <div className="search-sort">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by code, title, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                        )}
                    </div>
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="created_at">Date Created</option>
                        <option value="valid_from">Valid From</option>
                        <option value="valid_until">Valid Until</option>
                        <option value="used_count">Most Used</option>
                        <option value="discount_value">Discount Value</option>
                    </select>
                    <button className="sort-order-btn" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            {sortedAndFilteredOffers.length !== offers.length && (
                <div className="results-summary">
                    Showing {sortedAndFilteredOffers.length} of {offers.length} offers
                    <button className="clear-filters" onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                        setSortBy('created_at');
                        setSortOrder('desc');
                    }}>Clear all filters</button>
                </div>
            )}

            {/* Offers Display */}
            {sortedAndFilteredOffers.length === 0 ? (
                <div className="no-offers">
                    <div className="empty-state">
                        <span className="empty-icon">🎫</span>
                        <h3>No offers found</h3>
                        <p>Try adjusting your filters or create a new offer to get started!</p>
                        <button className="add-btn primary" onClick={() => setShowModal(true)}>
                            + Create New Offer
                        </button>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="offers-grid">
                    {sortedAndFilteredOffers.map(offer => (
                        <div key={offer.id} className={`offer-card ${offer.is_featured ? 'featured' : ''}`}>
                            {offer.is_featured && <div className="featured-badge">⭐ Featured</div>}

                            <div className="offer-header">
                                <div className="offer-code">{offer.code}</div>
                                {getStatusBadge(offer.is_active, offer.valid_until)}
                            </div>

                            <div className="offer-body">
                                <h3>{offer.title}</h3>
                                <p className="offer-description">{offer.description}</p>

                                <div className="offer-details">
                                    <div className="detail">
                                        <span className="detail-label">Discount:</span>
                                        <span className="detail-value highlight">{getDiscountDisplay(offer)}</span>
                                    </div>
                                    {offer.min_order_amount > 0 && (
                                        <div className="detail">
                                            <span className="detail-label">Min. Order:</span>
                                            <span className="detail-value">₹{offer.min_order_amount}</span>
                                        </div>
                                    )}
                                    {offer.max_discount > 0 && (
                                        <div className="detail">
                                            <span className="detail-label">Max Discount:</span>
                                            <span className="detail-value">₹{offer.max_discount}</span>
                                        </div>
                                    )}
                                    <div className="detail">
                                        <span className="detail-label">Valid:</span>
                                        <span className="detail-value">
                                            {new Date(offer.valid_from).toLocaleDateString()} - {new Date(offer.valid_until).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail">
                                        <span className="detail-label">Applicable:</span>
                                        <span className="detail-value">
                                            {offer.applicable_on === 'all' ? 'All Orders' :
                                                offer.applicable_on === 'restaurant' ? '🍕 Restaurant Orders' : '🚚 Delivery Orders'}
                                        </span>
                                    </div>
                                </div>

                                {getUsageProgress(offer.used_count, offer.usage_limit)}

                                {offer.total_savings > 0 && (
                                    <div className="savings-info">
                                        <span>💰 Total Savings: ₹{offer.total_savings.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="offer-footer">
                                <button className="action-btn analytics" onClick={() => viewAnalytics(offer)} title="View analytics">
                                    📊
                                </button>
                                <button className="action-btn edit" onClick={() => editOffer(offer)} title="Edit offer">
                                    ✏️
                                </button>
                                <button className="action-btn duplicate" onClick={() => handleDuplicate(offer)} title="Duplicate offer">
                                    📋
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(offer.id)} title="Delete offer">
                                    🗑️
                                </button>
                                <button
                                    className={`action-btn toggle ${offer.is_active ? 'deactivate' : 'activate'}`}
                                    onClick={() => handleToggleStatus(offer.id, offer.is_active)}
                                    title={offer.is_active ? 'Deactivate' : 'Activate'}
                                >
                                    {offer.is_active ? '🔴' : '🟢'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="offers-table-container">
                    <table className="offers-table">
                        <thead>
                            <tr>
                                <th className="checkbox-col">
                                    <input type="checkbox" onChange={(e) => {
                                        const checked = e.target.checked;
                                        setOffers(prev => prev.map(o => ({ ...o, selected: checked })));
                                    }} />
                                </th>
                                <th>Code</th>
                                <th>Title</th>
                                <th>Discount</th>
                                <th>Valid Period</th>
                                <th>Redemptions</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredOffers.map(offer => (
                                <tr key={offer.id}>
                                    <td className="checkbox-col">
                                        <input type="checkbox" checked={offer.selected || false} onChange={(e) => {
                                            setOffers(prev => prev.map(o =>
                                                o.id === offer.id ? { ...o, selected: e.target.checked } : o
                                            ));
                                        }} />
                                    </td>
                                    <td className="offer-code-cell">{offer.code}</td>
                                    <td>
                                        <div className="offer-title-cell">
                                            <strong>{offer.title}</strong>
                                            {offer.is_featured && <span className="featured-tag">⭐</span>}
                                        </div>
                                    </td>
                                    <td className="discount-cell">{getDiscountDisplay(offer)}</td>
                                    <td className="date-cell">
                                        {new Date(offer.valid_from).toLocaleDateString()}<br />
                                        <small>to</small><br />
                                        {new Date(offer.valid_until).toLocaleDateString()}
                                    </td>
                                    <td className="usage-cell">
                                        {offer.used_count}/{offer.usage_limit || '∞'}
                                        <div className="mini-progress">
                                            <div className="mini-progress-fill" style={{ width: `${(offer.used_count / (offer.usage_limit || 1)) * 100}%` }} />
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(offer.is_active, offer.valid_until)}</td>
                                    <td className="actions-cell">
                                        <button className="icon-btn" onClick={() => viewAnalytics(offer)} title="Analytics">📊</button>
                                        <button className="icon-btn" onClick={() => editOffer(offer)} title="Edit">✏️</button>
                                        <button className="icon-btn" onClick={() => handleDuplicate(offer)} title="Duplicate">📋</button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(offer.id)} title="Delete">🗑️</button>
                                        <button className="icon-btn" onClick={() => handleToggleStatus(offer.id, offer.is_active)} title={offer.is_active ? 'Deactivate' : 'Activate'}>
                                            {offer.is_active ? '🔴' : '🟢'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Offer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => resetForm()}>
                    <div className="modal-content offer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <span className="modal-icon">{editingOffer ? '✏️' : '➕'}</span>
                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h3>
                            <button className="close-modal" onClick={resetForm}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="offer-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Offer Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        placeholder="e.g., WELCOME20"
                                        className={formErrors.code ? 'error' : ''}
                                        disabled={!!editingOffer}
                                    />
                                    {formErrors.code && <span className="error-message">{formErrors.code}</span>}
                                    <small>Unique code users will enter (uppercase recommended)</small>
                                </div>

                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Welcome Discount"
                                        className={formErrors.title ? 'error' : ''}
                                    />
                                    {formErrors.title && <span className="error-message">{formErrors.title}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe the offer details and terms..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Discount Type *</label>
                                    <select name="discount_type" value={formData.discount_type} onChange={handleInputChange}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Discount Value *</label>
                                    <input
                                        type="number"
                                        name="discount_value"
                                        value={formData.discount_value}
                                        onChange={handleInputChange}
                                        placeholder={formData.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                                        className={formErrors.discount_value ? 'error' : ''}
                                    />
                                    {formErrors.discount_value && <span className="error-message">{formErrors.discount_value}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Minimum Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="min_order_amount"
                                        value={formData.min_order_amount}
                                        onChange={handleInputChange}
                                        placeholder="0 for no minimum"
                                    />
                                </div>

                                {formData.discount_type === 'percentage' && (
                                    <div className="form-group">
                                        <label>Maximum Discount (₹)</label>
                                        <input
                                            type="number"
                                            name="max_discount"
                                            value={formData.max_discount}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 200"
                                        />
                                        <small>Maximum amount that can be discounted</small>
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Valid From *</label>
                                    <DatePicker
                                        selected={formData.valid_from}
                                        onChange={(date) => handleDateChange(date, 'valid_from')}
                                        selectsStart
                                        startDate={formData.valid_from}
                                        endDate={formData.valid_until}
                                        minDate={new Date()}
                                        className="date-picker"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Valid Until *</label>
                                    <DatePicker
                                        selected={formData.valid_until}
                                        onChange={(date) => handleDateChange(date, 'valid_until')}
                                        selectsEnd
                                        startDate={formData.valid_from}
                                        endDate={formData.valid_until}
                                        minDate={formData.valid_from}
                                        className="date-picker"
                                    />
                                    {formErrors.valid_until && <span className="error-message">{formErrors.valid_until}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Total Usage Limit</label>
                                    <input
                                        type="number"
                                        name="usage_limit"
                                        value={formData.usage_limit}
                                        onChange={handleInputChange}
                                        placeholder="Leave empty for unlimited"
                                    />
                                    <small>Maximum number of times this offer can be used</small>
                                </div>

                                <div className="form-group">
                                    <label>Per User Limit</label>
                                    <input
                                        type="number"
                                        name="usage_limit_per_user"
                                        value={formData.usage_limit_per_user}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 1"
                                    />
                                    <small>How many times each user can use this offer</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Applicable On</label>
                                    <select name="applicable_on" value={formData.applicable_on} onChange={handleInputChange}>
                                        <option value="all">All Orders</option>
                                        <option value="restaurant">Restaurant Orders Only</option>
                                        <option value="delivery">Delivery Orders Only</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Banner Image</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
                                        📷 Upload Image
                                    </button>
                                    {formData.banner_image && (
                                        <div className="image-preview">
                                            <img src={formData.banner_image} alt="Preview" />
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, banner_image: null }))}>Remove</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                                    <span>✅ Active immediately</span>
                                </label>
                                <label className="checkbox-label">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} />
                                    <span>⭐ Feature this offer (highlight on homepage)</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Terms & Conditions</label>
                                <textarea
                                    name="terms_conditions"
                                    value={formData.terms_conditions}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Enter terms and conditions for this offer..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={resetForm} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {showAnalyticsModal && selectedOffer && (
                <div className="modal-overlay" onClick={() => setShowAnalyticsModal(false)}>
                    <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Offer Analytics - {selectedOffer.code}</h3>
                            <button className="close-modal" onClick={() => setShowAnalyticsModal(false)}>✕</button>
                        </div>
                        <div className="analytics-content">
                            <div className="analytics-stats">
                                <div className="analytics-stat">
                                    <span className="stat-label">Redemptions</span>
                                    <span className="stat-number">{selectedOffer.used_count}</span>
                                </div>
                                <div className="analytics-stat">
                                    <span className="stat-label">Total Savings</span>
                                    <span className="stat-number">₹{selectedOffer.total_savings?.toLocaleString() || 0}</span>
                                </div>
                                <div className="analytics-stat">
                                    <span className="stat-label">Conversion Rate</span>
                                    <span className="stat-number">
                                        {((selectedOffer.used_count / (selectedOffer.usage_limit || 1)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="analytics-chart">
                                <h4>Usage Trend</h4>
                                <div className="trend-bars">
                                    {analytics.usageTrend.slice(-7).map((day, i) => (
                                        <div key={i} className="trend-bar-container">
                                            <div className="trend-bar" style={{ height: `${(day.redemptions / 50) * 100}%` }} />
                                            <span className="trend-label">{day.date.slice(0, 5)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOffersManagement;
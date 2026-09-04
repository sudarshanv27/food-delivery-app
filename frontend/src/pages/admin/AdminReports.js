import React, { useState, useEffect } from 'react';
import ChartComponent from '../../components/admin/ChartComponent';
import Button from '../../components/common/Button';
import './AdminReports.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        setStartDate(lastMonth.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        generateReport();
    }, []);

    const generateReport = async () => {
        setGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockData = {
                sales: {
                    summary: {
                        totalRevenue: 1250000,
                        totalOrders: 8926,
                        avgOrderValue: 140,
                        totalCustomers: 1248,
                        growth: 18.5
                    },
                    chartData: [
                        { label: 'Jan', value: 85000 },
                        { label: 'Feb', value: 92000 },
                        { label: 'Mar', value: 105000 },
                        { label: 'Apr', value: 118000 },
                        { label: 'May', value: 125000 },
                        { label: 'Jun', value: 142000 }
                    ],
                    topItems: [
                        { name: 'Margherita Pizza', quantity: 1250, revenue: 312500 },
                        { name: 'McChicken Burger', quantity: 1100, revenue: 176000 },
                        { name: 'Chicken Biryani', quantity: 980, revenue: 274400 }
                    ]
                },
                orders: {
                    summary: {
                        total: 8926,
                        completed: 8450,
                        cancelled: 356,
                        pending: 120,
                        completionRate: 94.7
                    },
                    chartData: [
                        { label: 'Jan', value: 1200 },
                        { label: 'Feb', value: 1350 },
                        { label: 'Mar', value: 1450 },
                        { label: 'Apr', value: 1520 },
                        { label: 'May', value: 1680 },
                        { label: 'Jun', value: 1726 }
                    ],
                    byStatus: [
                        { label: 'Delivered', value: 8450, color: '#4caf50' },
                        { label: 'Cancelled', value: 356, color: '#f44336' },
                        { label: 'Pending', value: 120, color: '#ff9800' }
                    ]
                },
                users: {
                    summary: {
                        total: 1248,
                        newUsers: 245,
                        activeUsers: 980,
                        growthRate: 24.5
                    },
                    chartData: [
                        { label: 'Jan', value: 850 },
                        { label: 'Feb', value: 920 },
                        { label: 'Mar', value: 1020 },
                        { label: 'Apr', value: 1120 },
                        { label: 'May', value: 1180 },
                        { label: 'Jun', value: 1248 }
                    ],
                    byRole: [
                        { label: 'Customers', value: 1020, color: '#2196f3' },
                        { label: 'Restaurant Owners', value: 156, color: '#ff9800' },
                        { label: 'Delivery Partners', value: 72, color: '#4caf50' }
                    ]
                }
            };

            setReportData(mockData[reportType]);
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    const exportReport = (format) => {
        console.log(`Exporting as ${format}`);
        alert(`Report exported as ${format.toUpperCase()}`);
    };

    const reportTypes = [
        { id: 'sales', label: 'Sales Report', icon: '💰' },
        { id: 'orders', label: 'Orders Report', icon: '📦' },
        { id: 'users', label: 'Users Report', icon: '👥' }
    ];

    const renderReportContent = () => {
        if (!reportData) return null;

        return (
            <div className="report-content">
                {/* Summary Cards */}
                <div className="report-summary">
                    {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} className="summary-card">
                            <div className="summary-label">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="summary-value">
                                {key.includes('Revenue') || key.includes('Value') ? `₹${value.toLocaleString()}` :
                                    key.includes('Rate') ? `${value}%` : value.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                {reportData.chartData && (
                    <div className="report-chart">
                        <h3>Trend Analysis</h3>
                        <ChartComponent
                            type="line"
                            data={reportData.chartData}
                            height={300}
                        />
                    </div>
                )}

                {/* Additional Data */}
                {reportData.topItems && (
                    <div className="report-table-section">
                        <h3>Top Selling Items</h3>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Quantity Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.topItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity.toLocaleString()}</td>
                                        <td>₹{item.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {reportData.byStatus && (
                    <div className="report-chart">
                        <h3>Status Distribution</h3>
                        <ChartComponent
                            type="pie"
                            data={reportData.byStatus}
                            height={300}
                        />
                    </div>
                )}

                {reportData.byRole && (
                    <div className="report-chart">
                        <h3>User Distribution by Role</h3>
                        <ChartComponent
                            type="doughnut"
                            data={reportData.byRole}
                            height={300}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="admin-reports">
            <div className="page-header">
                <h1>Reports & Analytics</h1>
                <p>Generate and export detailed reports</p>
            </div>

            {/* Report Controls */}
            <div className="report-controls">
                <div className="report-type-selector">
                    {reportTypes.map(type => (
                        <button
                            key={type.id}
                            className={`type-btn ${reportType === type.id ? 'active' : ''}`}
                            onClick={() => setReportType(type.id)}
                        >
                            <span className="type-icon">{type.icon}</span>
                            <span className="type-label">{type.label}</span>
                        </button>
                    ))}
                </div>

                <div className="date-range-selector">
                    <div className="date-inputs">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="quick-ranges">
                        <button onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date();
                            lastWeek.setDate(lastWeek.getDate() - 7);
                            setStartDate(lastWeek.toISOString().split('T')[0]);
                            setEndDate(today.toISOString().split('T')[0]);
                        }}>Last 7 Days</button>
                        <button onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date();
                            lastMonth.setMonth(lastMonth.getMonth() - 1);
                            setStartDate(lastMonth.toISOString().split('T')[0]);
                            setEndDate(today.toISOString().split('T')[0]);
                        }}>Last 30 Days</button>
                        <button onClick={() => {
                            const today = new Date();
                            const lastYear = new Date();
                            lastYear.setFullYear(lastYear.getFullYear() - 1);
                            setStartDate(lastYear.toISOString().split('T')[0]);
                            setEndDate(today.toISOString().split('T')[0]);
                        }}>Last 12 Months</button>
                    </div>
                </div>

                <div className="report-actions">
                    <Button
                        variant="primary"
                        onClick={generateReport}
                        isLoading={generating}
                    >
                        Generate Report
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('csv')}>
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => exportReport('pdf')}>
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Report Display */}
            {loading ? (
                <div className="report-loading">
                    <div className="loading-spinner"></div>
                    <p>Generating report...</p>
                </div>
            ) : (
                <div className="report-display">
                    <div className="report-header">
                        <h2>{reportTypes.find(t => t.id === reportType)?.label}</h2>
                        <div className="report-meta">
                            <span>Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
                            <span>Generated: {new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    {renderReportContent()}
                </div>
            )}
        </div>
    );
};

export default AdminReports;
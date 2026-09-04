import React, { useState, useEffect, useRef } from 'react';
import './ChartComponent.css';

const ChartComponent = ({
    type,
    data,
    title,
    height = 300,
    loading = false,
    onDataPointClick,
    showLegend = true,
    showTooltips = true,
    animate = true,
    theme = 'light',
    customColors = []
}) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [animatedData, setAnimatedData] = useState([]);
    const chartRef = useRef(null);

    useEffect(() => {
        if (animate && data && !loading) {
            animateChartData();
        } else {
            setAnimatedData(data || []);
        }
    }, [data, loading, animate]);

    const animateChartData = () => {
        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;

        const initialData = data.map(item => ({ ...item, value: 0 }));
        setAnimatedData(initialData);

        data.forEach((item, index) => {
            const target = item.value;
            const increment = target / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current += increment;
                if (step >= steps) {
                    current = target;
                    clearInterval(timer);
                }
                setAnimatedData(prev => {
                    const newData = [...prev];
                    newData[index] = { ...newData[index], value: Math.floor(current) };
                    return newData;
                });
            }, stepTime);
        });
    };

    const getColor = (index, customColor) => {
        const defaultColors = ['#ff4757', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#ffc107'];
        if (customColor) return customColor;
        if (customColors[index]) return customColors[index];
        return defaultColors[index % defaultColors.length];
    };

    const formatValue = (value, type = 'number') => {
        if (type === 'currency') {
            return `₹${value.toLocaleString()}`;
        }
        if (type === 'percentage') {
            return `${value}%`;
        }
        return value.toLocaleString();
    };

    const handlePointClick = (item, index) => {
        if (onDataPointClick) {
            onDataPointClick(item, index);
        }
    };

    const renderLineChart = () => {
        const chartData = animatedData.length ? animatedData : data;
        if (!chartData || chartData.length === 0) return <div className="no-data">No data available</div>;

        const maxValue = Math.max(...(chartData.map(d => d.value) || [0]));
        const minValue = Math.min(...(chartData.map(d => d.value) || [0]));
        const range = maxValue - minValue;

        const points = chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / (range || 1)) * 80;
            return `${x},${y}`;
        }).join(' ');

        const areaPoints = `${points} ${100},100 0,100`;

        return (
            <div className="line-chart-container">
                <div className="chart-y-axis">
                    <div className="y-axis-label">{formatValue(maxValue)}</div>
                    <div className="y-axis-label">{formatValue(minValue + (range * 0.5))}</div>
                    <div className="y-axis-label">{formatValue(minValue)}</div>
                </div>
                <div className="line-chart">
                    <svg viewBox="0 0 100 100" className="chart-svg" ref={chartRef}>
                        {/* Grid lines */}
                        <line x1="0" y1="0" x2="100" y2="0" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="2,2" />
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="2,2" />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="2,2" />
                        <line x1="0" y1="75" x2="100" y2="75" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="2,2" />
                        <line x1="0" y1="100" x2="100" y2="100" stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="2,2" />

                        {/* Area under line */}
                        <polygon
                            points={areaPoints}
                            fill="url(#gradient)"
                            opacity="0.3"
                            className="chart-area"
                        />

                        {/* Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#ff4757"
                            strokeWidth="2"
                            className="chart-line"
                        />

                        {/* Data points */}
                        {chartData.map((item, index) => {
                            const x = (index / (chartData.length - 1)) * 100;
                            const y = 100 - ((item.value - minValue) / (range || 1)) * 80;
                            const isHovered = hoveredPoint === index;

                            return (
                                <g key={index}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isHovered ? "4" : "2.5"}
                                        fill="#ff4757"
                                        className="chart-dot"
                                        onMouseEnter={() => setHoveredPoint(index)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                        onClick={() => handlePointClick(item, index)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {showTooltips && isHovered && (
                                        <g className="tooltip-group">
                                            <rect
                                                x={x - 20}
                                                y={y - 25}
                                                width="40"
                                                height="20"
                                                rx="3"
                                                fill="#333"
                                                opacity="0.9"
                                            />
                                            <text
                                                x={x}
                                                y={y - 12}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="3"
                                                fontWeight="bold"
                                            >
                                                {formatValue(item.value)}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff4757" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#ff4757" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="chart-labels">
                        {chartData.map((item, index) => (
                            <div key={index} className="chart-label">{item.label}</div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderBarChart = () => {
        const chartData = animatedData.length ? animatedData : data;
        if (!chartData || chartData.length === 0) return <div className="no-data">No data available</div>;

        const maxValue = Math.max(...(chartData.map(d => d.value) || [0]));

        return (
            <div className="bar-chart-container">
                <div className="chart-y-axis">
                    <div className="y-axis-label">{formatValue(maxValue)}</div>
                    <div className="y-axis-label">{formatValue(maxValue * 0.5)}</div>
                    <div className="y-axis-label">0</div>
                </div>
                <div className="bar-chart">
                    {chartData.map((item, index) => {
                        const percentage = (item.value / maxValue) * 100;
                        const isHovered = hoveredPoint === index;

                        return (
                            <div key={index} className="bar-item">
                                <div className="bar-label">{item.label}</div>
                                <div className="bar-container">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            height: `${percentage}%`,
                                            backgroundColor: getColor(index, item.color),
                                            transition: animate ? 'height 0.5s ease' : 'none'
                                        }}
                                        onMouseEnter={() => setHoveredPoint(index)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                        onClick={() => handlePointClick(item, index)}
                                    >
                                        {showTooltips && isHovered && (
                                            <div className="bar-tooltip">
                                                {formatValue(item.value)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        const chartData = animatedData.length ? animatedData : data;
        if (!chartData || chartData.length === 0) return <div className="no-data">No data available</div>;

        let startAngle = 0;
        const total = chartData?.reduce((sum, item) => sum + item.value, 0) || 1;
        const [selectedSlice, setSelectedSlice] = useState(null);

        return (
            <div className="pie-chart-container">
                <div className="pie-chart">
                    <svg viewBox="0 0 100 100" className="pie-svg">
                        {chartData.map((item, index) => {
                            const angle = (item.value / total) * 360;
                            const endAngle = startAngle + angle;
                            const startRad = (startAngle - 90) * Math.PI / 180;
                            const endRad = (endAngle - 90) * Math.PI / 180;
                            const x1 = 50 + 40 * Math.cos(startRad);
                            const y1 = 50 + 40 * Math.sin(startRad);
                            const x2 = 50 + 40 * Math.cos(endRad);
                            const y2 = 50 + 40 * Math.sin(endRad);
                            const largeArc = angle > 180 ? 1 : 0;

                            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                            const isSelected = selectedSlice === index;
                            const isHovered = hoveredPoint === index;

                            const slice = (
                                <path
                                    key={index}
                                    d={pathData}
                                    fill={getColor(index, item.color)}
                                    className={`pie-slice ${isSelected ? 'selected' : ''}`}
                                    stroke="white"
                                    strokeWidth={isSelected ? "2" : "0.5"}
                                    onMouseEnter={() => setHoveredPoint(index)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    onClick={() => {
                                        setSelectedSlice(isSelected ? null : index);
                                        handlePointClick(item, index);
                                    }}
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                />
                            );

                            startAngle = endAngle;

                            return slice;
                        })}
                        {selectedSlice !== null && (
                            <circle cx="50" cy="50" r="15" fill="white" opacity="0.9">
                                <animate attributeName="r" from="0" to="15" dur="0.3s" />
                            </circle>
                        )}
                    </svg>
                </div>

                {showLegend && (
                    <div className="pie-legend">
                        {chartData.map((item, index) => {
                            const percentage = ((item.value / total) * 100).toFixed(1);
                            const isHovered = hoveredPoint === index;

                            return (
                                <div
                                    key={index}
                                    className={`legend-item ${isHovered ? 'hovered' : ''}`}
                                    onMouseEnter={() => setHoveredPoint(index)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    onClick={() => handlePointClick(item, index)}
                                >
                                    <div
                                        className="legend-color"
                                        style={{ backgroundColor: getColor(index, item.color) }}
                                    />
                                    <span className="legend-label">{item.label}</span>
                                    <span className="legend-value">{formatValue(item.value)}</span>
                                    <span className="legend-percent">({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderDoughnutChart = () => {
        const chartData = animatedData.length ? animatedData : data;
        if (!chartData || chartData.length === 0) return <div className="no-data">No data available</div>;

        const total = chartData?.reduce((sum, item) => sum + item.value, 0) || 1;
        let currentAngle = 0;
        const [selectedSlice, setSelectedSlice] = useState(null);

        return (
            <div className="doughnut-chart-container">
                <div className="doughnut-chart">
                    <svg viewBox="0 0 100 100" className="doughnut-svg">
                        {chartData.map((item, index) => {
                            const angle = (item.value / total) * 360;
                            const startRad = (currentAngle - 90) * Math.PI / 180;
                            const endRad = (currentAngle + angle - 90) * Math.PI / 180;
                            const x1 = 50 + 35 * Math.cos(startRad);
                            const y1 = 50 + 35 * Math.sin(startRad);
                            const x2 = 50 + 35 * Math.cos(endRad);
                            const y2 = 50 + 35 * Math.sin(endRad);
                            const largeArc = angle > 180 ? 1 : 0;

                            const pathData = `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`;
                            const isSelected = selectedSlice === index;

                            currentAngle += angle;

                            return (
                                <path
                                    key={index}
                                    d={pathData}
                                    fill={getColor(index, item.color)}
                                    className={`doughnut-slice ${isSelected ? 'selected' : ''}`}
                                    stroke="white"
                                    strokeWidth={isSelected ? "2" : "0.5"}
                                    onMouseEnter={() => setHoveredPoint(index)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    onClick={() => {
                                        setSelectedSlice(isSelected ? null : index);
                                        handlePointClick(item, index);
                                    }}
                                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                />
                            );
                        })}
                        <circle cx="50" cy="50" r="20" fill="var(--chart-bg, #ffffff)">
                            <animate attributeName="r" from="0" to="20" dur="0.5s" />
                        </circle>
                    </svg>
                    <div className="doughnut-center">
                        <div className="center-value">{total.toLocaleString()}</div>
                        <div className="center-label">Total</div>
                    </div>
                </div>

                {showLegend && (
                    <div className="doughnut-legend">
                        {chartData.map((item, index) => (
                            <div key={index} className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: getColor(index, item.color) }} />
                                <span className="legend-label">{item.label}</span>
                                <span className="legend-value">{formatValue(item.value)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderAreaChart = () => {
        const chartData = animatedData.length ? animatedData : data;
        if (!chartData || chartData.length === 0) return <div className="no-data">No data available</div>;

        const maxValue = Math.max(...(chartData.map(d => d.value) || [0]));
        const points = chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 80;
            return `${x},${y}`;
        }).join(' ');

        const areaPoints = `${points} ${100},100 0,100`;

        return (
            <div className="area-chart-container">
                <svg viewBox="0 0 100 100" className="area-svg">
                    <polygon
                        points={areaPoints}
                        fill="url(#areaGradient)"
                        className="area-polygon"
                    />
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#ff4757"
                        strokeWidth="2"
                        className="area-line"
                    />
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff4757" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#ff4757" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="chart-labels">
                    {chartData.map((item, index) => (
                        <div key={index} className="chart-label">{item.label}</div>
                    ))}
                </div>
            </div>
        );
    };

    const renderRadarChart = () => {
        const chartData = animatedData.length ? animatedData : data;
        if (!chartData || chartData.length === 0) return <div className="no-data">No data available</div>;

        const maxValue = Math.max(...(chartData.map(d => d.value) || [0]));
        const angleStep = (Math.PI * 2) / chartData.length;
        const points = chartData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const radius = (item.value / maxValue) * 40;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');

        return (
            <div className="radar-chart-container">
                <svg viewBox="0 0 100 100" className="radar-svg">
                    {/* Grid circles */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
                        <circle
                            key={i}
                            cx="50"
                            cy="50"
                            r={40 * level}
                            fill="none"
                            stroke="#e0e0e0"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {/* Axis lines */}
                    {chartData.map((_, index) => {
                        const angle = index * angleStep - Math.PI / 2;
                        const x = 50 + 45 * Math.cos(angle);
                        const y = 50 + 45 * Math.sin(angle);
                        return (
                            <line
                                key={index}
                                x1="50"
                                y1="50"
                                x2={x}
                                y2={y}
                                stroke="#e0e0e0"
                                strokeWidth="0.5"
                            />
                        );
                    })}

                    {/* Data polygon */}
                    <polygon
                        points={points}
                        fill="#ff4757"
                        fillOpacity="0.3"
                        stroke="#ff4757"
                        strokeWidth="1.5"
                        className="radar-polygon"
                    />
                </svg>
                <div className="radar-labels">
                    {chartData.map((item, index) => (
                        <div key={index} className="radar-label">{item.label}</div>
                    ))}
                </div>
            </div>
        );
    };

    const getChartType = () => {
        switch (type) {
            case 'line': return renderLineChart();
            case 'bar': return renderBarChart();
            case 'pie': return renderPieChart();
            case 'doughnut': return renderDoughnutChart();
            case 'area': return renderAreaChart();
            case 'radar': return renderRadarChart();
            default: return renderBarChart();
        }
    };

    if (loading) {
        return (
            <div className="chart-component loading" style={{ height }}>
                <div className="chart-header">
                    <div className="chart-title-skeleton"></div>
                </div>
                <div className="chart-body-skeleton">
                    <div className="skeleton-wave"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`chart-component ${theme}`} style={{ height }}>
            <div className="chart-header">
                <h3 className="chart-title">{title}</h3>
                {data && data.length > 0 && (
                    <div className="chart-stats">
                        <div className="stat-badge">
                            Total: {formatValue(data.reduce((sum, item) => sum + item.value, 0))}
                        </div>
                    </div>
                )}
            </div>
            <div className="chart-body">
                {getChartType()}
            </div>
        </div>
    );
};

// Mini Chart Component for Cards
export const MiniSparkline = ({ data, color = '#ff4757', height = 40, width = 100 }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - minValue) / (range || 1)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="sparkline">
            <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={`${points} ${width},${height} 0,${height}`}
                fill="url(#sparklineGradient)"
            />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                className="sparkline-line"
            />
        </svg>
    );
};

// Progress Circle Component
export const ProgressCircle = ({ value, max = 100, size = 100, strokeWidth = 8, color = '#ff4757' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = (value / max) * circumference;
    const offset = circumference - progress;

    return (
        <div className="progress-circle" style={{ width: size, height: size }}>
            <svg viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from={circumference}
                        to={offset}
                        dur="1s"
                        fill="freeze"
                    />
                </circle>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize={size * 0.2}
                    fontWeight="bold"
                    fill={color}
                >
                    {Math.round((value / max) * 100)}%
                </text>
            </svg>
        </div>
    );
};

export default ChartComponent;
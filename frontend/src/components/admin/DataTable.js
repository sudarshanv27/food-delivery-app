import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    loading = false,
    onRowClick,
    onSort,
    onPageChange,
    totalItems = 0,
    itemsPerPage = 10,
    currentPage = 1,
    selectable = false,
    onSelect,
    actions,
    emptyMessage = 'No data available',
    showSearch = false,
    onSearch,
    searchPlaceholder = 'Search...',
    exportable = false,
    onExport,
    showColumnVisibility = false,
    showFilter = false,
    filters = [],
    onFilter,
    density = 'comfortable', // comfortable, compact, spacious
    stickyHeader = false,
    infiniteScroll = false,
    onLoadMore,
    rowClassName,
    onRowDoubleClick,
    expandableRows = false,
    renderExpandedRow,
    serverSide = false,
    totalPages: propTotalPages
}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const initialVisible = {};
        columns.forEach(col => {
            initialVisible[col.key] = col.visible !== false;
        });
        return initialVisible;
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterValues, setFilterValues] = useState({});
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hoveredRow, setHoveredRow] = useState(null);

    const totalPages = propTotalPages || Math.ceil(totalItems / itemsPerPage);

    // Handle sorting
    const handleSort = useCallback((column) => {
        if (!column.sortable) return;

        const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column.key);
        setSortDirection(newDirection);
        onSort?.(column.key, newDirection);
    }, [sortColumn, sortDirection, onSort]);

    // Handle select all
    const handleSelectAll = useCallback((e) => {
        const checked = e.target.checked;
        if (checked) {
            const allIds = data.map(item => item.id);
            setSelectedRows(allIds);
            onSelect?.(allIds);
        } else {
            setSelectedRows([]);
            onSelect?.([]);
        }
    }, [data, onSelect]);

    // Handle single row selection
    const handleSelectRow = useCallback((id, event) => {
        event.stopPropagation();
        setSelectedRows(prev => {
            const newSelected = prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id];
            onSelect?.(newSelected);
            return newSelected;
        });
    }, [onSelect]);

    // Handle row expand/collapse
    const handleRowExpand = useCallback((id, event) => {
        event.stopPropagation();
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    // Handle search
    const handleSearch = useCallback((e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) {
            onSearch(value);
        } else if (!serverSide) {
            // Client-side search handled by useMemo below
        }
    }, [onSearch]);

    // Handle filter change
    const handleFilterChange = useCallback((columnKey, value) => {
        setFilterValues(prev => ({ ...prev, [columnKey]: value }));
        if (onFilter) {
            onFilter({ ...filterValues, [columnKey]: value });
        }
    }, [filterValues, onFilter]);

    // Handle export
    const handleExport = useCallback((format) => {
        if (onExport) {
            onExport(format);
        } else {
            // Default export to CSV
            const exportData = data.map(row => {
                const exportRow = {};
                columns.forEach(col => {
                    if (col.export !== false) {
                        exportRow[col.label] = row[col.key];
                    }
                });
                return exportRow;
            });

            const csv = convertToCSV(exportData);
            downloadCSV(csv, `export_${new Date().toISOString()}.csv`);
        }
        setShowExportMenu(false);
    }, [data, columns, onExport]);

    // Convert to CSV helper
    const convertToCSV = (data) => {
        const headers = Object.keys(data[0] || {});
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    };

    // Download CSV helper
    const downloadCSV = (csv, filename) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Client-side filtering and searching
    const filteredData = useMemo(() => {
        if (serverSide) return data;

        let result = [...data];

        // Apply search
        if (searchTerm && !onSearch) {
            result = result.filter(row => {
                return columns.some(column => {
                    const value = row[column.key];
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }

        // Apply filters
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                result = result.filter(row => row[key] === value);
            }
        });

        // Apply sorting
        if (sortColumn) {
            result.sort((a, b) => {
                let aVal = a[sortColumn];
                let bVal = b[sortColumn];

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchTerm, filterValues, sortColumn, sortDirection, columns, serverSide, onSearch]);

    // Get sort icon
    const getSortIcon = (column) => {
        if (sortColumn !== column.key) return <span className="sort-icon-default">↕️</span>;
        return sortDirection === 'asc'
            ? <span className="sort-icon-asc">↑</span>
            : <span className="sort-icon-desc">↓</span>;
    };

    // Handle infinite scroll
    const handleScroll = useCallback((e) => {
        if (!infiniteScroll || loadingMore) return;

        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            setLoadingMore(true);
            onLoadMore?.().finally(() => setLoadingMore(false));
        }
    }, [infiniteScroll, loadingMore, onLoadMore]);

    // Get density class
    const getDensityClass = () => {
        switch (density) {
            case 'compact': return 'table-compact';
            case 'spacious': return 'table-spacious';
            default: return 'table-comfortable';
        }
    };

    if (loading && !loadingMore) {
        return (
            <div className="data-table-loading">
                <div className="table-skeleton">
                    <div className="skeleton-header">
                        <div className="skeleton-header-cell"></div>
                        <div className="skeleton-header-cell"></div>
                        <div className="skeleton-header-cell"></div>
                        <div className="skeleton-header-cell"></div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-row">
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                            <div className="skeleton-cell"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`data-table-container ${getDensityClass()}`}>
            {/* Table Toolbar */}
            {(showSearch || exportable || showColumnVisibility || showFilter) && (
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        {showSearch && (
                            <div className="search-wrapper">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="table-search-input"
                                />
                                {searchTerm && (
                                    <button
                                        className="clear-search"
                                        onClick={() => handleSearch({ target: { value: '' } })}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        )}

                        {showFilter && filters.length > 0 && (
                            <div className="filter-dropdown">
                                <button
                                    className="filter-btn"
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                >
                                    <span className="btn-icon">🔍</span>
                                    Filter
                                    {Object.keys(filterValues).length > 0 && (
                                        <span className="filter-badge">{Object.keys(filterValues).length}</span>
                                    )}
                                </button>
                                {showFilterMenu && (
                                    <div className="filter-menu">
                                        {filters.map(filter => (
                                            <div key={filter.key} className="filter-item">
                                                <label>{filter.label}</label>
                                                <select
                                                    value={filterValues[filter.key] || ''}
                                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                >
                                                    <option value="">All</option>
                                                    {filter.options.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                        <div className="filter-actions">
                                            <button onClick={() => setFilterValues({})}>Clear</button>
                                            <button onClick={() => setShowFilterMenu(false)}>Apply</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="toolbar-right">
                        {selectedRows.length > 0 && (
                            <div className="selected-info">
                                {selectedRows.length} selected
                            </div>
                        )}

                        {showColumnVisibility && (
                            <div className="columns-dropdown">
                                <button onClick={() => setShowColumnMenu(!showColumnMenu)}>
                                    <span className="btn-icon">📊</span>
                                    Columns
                                </button>
                                {showColumnMenu && (
                                    <div className="columns-menu">
                                        {columns.map(col => (
                                            <label key={col.key} className="column-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col.key]}
                                                    onChange={() => setVisibleColumns(prev => ({
                                                        ...prev,
                                                        [col.key]: !prev[col.key]
                                                    }))}
                                                />
                                                <span>{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {exportable && (
                            <div className="export-dropdown">
                                <button onClick={() => setShowExportMenu(!showExportMenu)}>
                                    <span className="btn-icon">📥</span>
                                    Export
                                </button>
                                {showExportMenu && (
                                    <div className="export-menu">
                                        <button onClick={() => handleExport('csv')}>Export as CSV</button>
                                        <button onClick={() => handleExport('excel')}>Export as Excel</button>
                                        <button onClick={() => handleExport('pdf')}>Export as PDF</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className={`table-responsive ${stickyHeader ? 'sticky-header' : ''}`} onScroll={handleScroll}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {expandableRows && <th className="expand-column"></th>}
                            {selectable && (
                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.filter(col => visibleColumns[col.key] !== false).map((column) => (
                                <th
                                    key={column.key}
                                    className={`${column.sortable ? 'sortable' : ''} ${column.align || 'left'}`}
                                    onClick={() => handleSort(column)}
                                    style={{ width: column.width }}
                                >
                                    <div className="th-content">
                                        {column.label}
                                        {column.sortable && getSortIcon(column)}
                                        {column.info && (
                                            <span className="column-info" title={column.info}>ⓘ</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && actions.length > 0 && <th className="actions-column">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={
                                    (expandableRows ? 1 : 0) +
                                    (selectable ? 1 : 0) +
                                    columns.filter(col => visibleColumns[col.key] !== false).length +
                                    (actions ? 1 : 0)
                                } className="empty-cell">
                                    <div className="empty-state">
                                        <div className="empty-icon">📭</div>
                                        <p>{emptyMessage}</p>
                                        {searchTerm && (
                                            <button onClick={() => handleSearch({ target: { value: '' } })}>
                                                Clear search
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, index) => (
                                <React.Fragment key={row.id || index}>
                                    <tr
                                        className={`
                                            ${onRowClick ? 'clickable' : ''} 
                                            ${selectedRows.includes(row.id) ? 'selected' : ''}
                                            ${hoveredRow === row.id ? 'hovered' : ''}
                                        `}
                                        onClick={() => onRowClick?.(row)}
                                        onDoubleClick={() => onRowDoubleClick?.(row)}
                                        onMouseEnter={() => setHoveredRow(row.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={rowClassName ? rowClassName(row) : {}}
                                    >
                                        {expandableRows && (
                                            <td className="expand-column">
                                                <button
                                                    className={`expand-btn ${expandedRows.has(row.id) ? 'expanded' : ''}`}
                                                    onClick={(e) => handleRowExpand(row.id, e)}
                                                >
                                                    {expandedRows.has(row.id) ? '▼' : '▶'}
                                                </button>
                                            </td>
                                        )}
                                        {selectable && (
                                            <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(row.id)}
                                                    onChange={(e) => handleSelectRow(row.id, e)}
                                                />
                                            </td>
                                        )}
                                        {columns.filter(col => visibleColumns[col.key] !== false).map((column) => (
                                            <td key={column.key} className={column.align || 'left'}>
                                                {column.render
                                                    ? column.render(row[column.key], row, index)
                                                    : row[column.key]
                                                }
                                            </td>
                                        ))}
                                        {actions && actions.length > 0 && (
                                            <td className="actions-column" onClick={(e) => e.stopPropagation()}>
                                                <div className="action-buttons">
                                                    {actions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            className={`action-btn ${action.className}`}
                                                            onClick={() => action.onClick(row, index)}
                                                            title={action.tooltip}
                                                            disabled={action.disabled?.(row)}
                                                        >
                                                            {typeof action.icon === 'string'
                                                                ? action.icon
                                                                : <action.icon />
                                                            }
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {expandableRows && expandedRows.has(row.id) && renderExpandedRow && (
                                        <tr className="expanded-row">
                                            <td colSpan={
                                                (selectable ? 1 : 0) +
                                                columns.filter(col => visibleColumns[col.key] !== false).length +
                                                (actions ? 1 : 0) + 1
                                            }>
                                                <div className="expanded-content">
                                                    {renderExpandedRow(row)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>

                {loadingMore && (
                    <div className="loading-more">
                        <div className="loading-spinner"></div>
                        Loading more...
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!infiniteScroll && totalPages > 1 && (
                <div className="pagination-controls">
                    <div className="pagination-info">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </div>

                    <div className="pagination-buttons">
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange?.(1)}
                            title="First page"
                        >
                            «
                        </button>
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange?.(currentPage - 1)}
                            title="Previous page"
                        >
                            ‹
                        </button>

                        <div className="pagination-pages">
                            {(() => {
                                const pages = [];
                                const maxVisible = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                if (endPage - startPage + 1 < maxVisible) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }

                                if (startPage > 1) {
                                    pages.push(
                                        <button key={1} className="page-btn" onClick={() => onPageChange?.(1)}>1</button>
                                    );
                                    if (startPage > 2) pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            className={`page-btn ${currentPage === i ? 'active' : ''}`}
                                            onClick={() => onPageChange?.(i)}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                                    pages.push(
                                        <button key={totalPages} className="page-btn" onClick={() => onPageChange?.(totalPages)}>
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pages;
                            })()}
                        </div>

                        <button
                            className="pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange?.(currentPage + 1)}
                            title="Next page"
                        >
                            ›
                        </button>
                        <button
                            className="pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange?.(totalPages)}
                            title="Last page"
                        >
                            »
                        </button>
                    </div>

                    <div className="pagination-rows-per-page">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onPageChange?.(1, parseInt(e.target.value))}
                        >
                            <option value={10}>10 rows</option>
                            <option value={25}>25 rows</option>
                            <option value={50}>50 rows</option>
                            <option value={100}>100 rows</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Status Badge Component
export const StatusBadge = ({ status, size = 'small', animated = false }) => {
    const getStatusConfig = () => {
        const configs = {
            active: { label: 'Active', color: '#4caf50', icon: '🟢', lightBg: '#e8f5e9' },
            inactive: { label: 'Inactive', color: '#f44336', icon: '🔴', lightBg: '#ffebee' },
            pending: { label: 'Pending', color: '#ff9800', icon: '⏳', lightBg: '#fff3e0' },
            approved: { label: 'Approved', color: '#4caf50', icon: '✅', lightBg: '#e8f5e9' },
            rejected: { label: 'Rejected', color: '#f44336', icon: '❌', lightBg: '#ffebee' },
            delivered: { label: 'Delivered', color: '#4caf50', icon: '✅', lightBg: '#e8f5e9' },
            processing: { label: 'Processing', color: '#2196f3', icon: '🔄', lightBg: '#e3f2fd' },
            cancelled: { label: 'Cancelled', color: '#f44336', icon: '❌', lightBg: '#ffebee' },
            completed: { label: 'Completed', color: '#4caf50', icon: '✅', lightBg: '#e8f5e9' },
            on_hold: { label: 'On Hold', color: '#ff9800', icon: '⏸️', lightBg: '#fff3e0' },
            shipped: { label: 'Shipped', color: '#2196f3', icon: '🚚', lightBg: '#e3f2fd' }
        };
        return configs[status] || { label: status, color: '#666', icon: '📋', lightBg: '#f5f5f5' };
    };

    const config = getStatusConfig();

    return (
        <span
            className={`table-status-badge ${size} ${animated ? 'pulse' : ''}`}
            style={{
                background: config.lightBg,
                color: config.color,
                borderLeft: `3px solid ${config.color}`
            }}
        >
            <span className="badge-icon">{config.icon}</span>
            <span className="badge-label">{config.label}</span>
        </span>
    );
};

// Enhanced Avatar Component
export const TableAvatar = ({ name, image, size = 'small', role, online = false }) => {
    return (
        <div className="table-avatar">
            <div className="avatar-wrapper">
                <img
                    src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff4757&color=fff&size=64&bold=true`}
                    alt={name}
                    className={`avatar-img ${size}`}
                    loading="lazy"
                />
                {online && <span className="online-indicator"></span>}
            </div>
            <div className="avatar-info">
                <div className="avatar-name">{name}</div>
                {role && <div className="avatar-role">{role}</div>}
            </div>
        </div>
    );
};

// Progress Bar Component for Table
export const TableProgress = ({ value, max = 100, showLabel = true, color }) => {
    const percentage = (value / max) * 100;
    const getColor = () => {
        if (color) return color;
        if (percentage >= 80) return '#4caf50';
        if (percentage >= 50) return '#ff9800';
        return '#ff4757';
    };

    return (
        <div className="table-progress">
            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${percentage}%`,
                        background: getColor()
                    }}
                />
            </div>
            {showLabel && <span className="progress-label">{value}/{max}</span>}
        </div>
    );
};

// Rating Stars Component
export const TableRating = ({ rating, max = 5, size = 'small' }) => {
    const stars = [];
    for (let i = 1; i <= max; i++) {
        stars.push(
            <span key={i} className={`rating-star ${i <= rating ? 'filled' : 'empty'} ${size}`}>
                {i <= rating ? '★' : '☆'}
            </span>
        );
    }
    return <div className="table-rating">{stars}</div>;
};

// Price Component
export const TablePrice = ({ amount, currency = '₹', discount, originalPrice }) => {
    return (
        <div className="table-price">
            {discount && originalPrice ? (
                <>
                    <span className="current-price">{currency}{amount.toLocaleString()}</span>
                    <span className="original-price">{currency}{originalPrice.toLocaleString()}</span>
                    <span className="discount-badge">-{discount}%</span>
                </>
            ) : (
                <span className="current-price">{currency}{amount.toLocaleString()}</span>
            )}
        </div>
    );
};

// Date Component
export const TableDate = ({ date, format = 'relative' }) => {
    const formatDate = (dateString) => {
        const dateObj = new Date(dateString);
        if (format === 'relative') {
            const now = new Date();
            const diff = now - dateObj;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
            return dateObj.toLocaleDateString();
        }
        return dateObj.toLocaleDateString();
    };

    return <span className="table-date">{formatDate(date)}</span>;
};

// Link Component
export const TableLink = ({ href, label, onClick, external = false }) => {
    if (onClick) {
        return (
            <button className="table-link" onClick={onClick}>
                {label}
            </button>
        );
    }

    return (
        <a
            href={href}
            className="table-link"
            target={external ? '_blank' : '_self'}
            rel={external ? 'noopener noreferrer' : ''}
        >
            {label}
            {external && <span className="external-icon">↗</span>}
        </a>
    );
};

export default DataTable;
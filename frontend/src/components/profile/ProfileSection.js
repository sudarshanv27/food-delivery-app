// src/components/profile/ProfileSection.js
import React, { useState, useRef, useEffect } from 'react';
import './ProfileSection.css';

const ProfileSection = ({
    title,
    icon,
    children,
    actions,
    className = '',
    variant = 'default', // 'default', 'card', 'compact', 'bordered'
    collapsible = false,
    defaultExpanded = true,
    showDivider = true,
    loading = false,
    error = null,
    onRetry,
    badge,
    badgeColor = '#ff4757',
    tooltip,
    footer,
    headerBackground = false,
    elevation = 0 // 0, 1, 2, 3
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isHovered, setIsHovered] = useState(false);
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState('auto');

    useEffect(() => {
        if (collapsible && contentRef.current) {
            setContentHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
        }
    }, [isExpanded, children, collapsible]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const getElevationClass = () => {
        if (elevation === 1) return 'elevation-1';
        if (elevation === 2) return 'elevation-2';
        if (elevation === 3) return 'elevation-3';
        return '';
    };

    return (
        <div
            className={`profile-section ${variant} ${getElevationClass()} ${className} ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Loading State */}
            {loading && (
                <div className="section-loading">
                    <div className="loading-skeleton">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-content"></div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="section-error">
                    <div className="error-content">
                        <span className="error-icon">⚠️</span>
                        <div className="error-message">{error}</div>
                        {onRetry && (
                            <button className="error-retry" onClick={onRetry}>
                                Retry
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Normal Content */}
            {!loading && !error && (
                <>
                    {(title || actions || collapsible) && (
                        <div className={`profile-section-header ${headerBackground ? 'with-background' : ''} ${collapsible ? 'collapsible-header' : ''}`}>
                            <div className="section-title-wrapper">
                                {collapsible && (
                                    <button
                                        className={`collapse-toggle ${isExpanded ? 'expanded' : ''}`}
                                        onClick={toggleExpand}
                                        aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                                    >
                                        <span className="toggle-icon">▶</span>
                                    </button>
                                )}

                                {title && (
                                    <div className="section-title">
                                        {icon && (
                                            <div className="icon-wrapper">
                                                <span className="section-icon">{icon}</span>
                                                {badge && (
                                                    <span
                                                        className="section-badge"
                                                        style={{ backgroundColor: badgeColor }}
                                                    >
                                                        {badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="title-content">
                                            <h3>{title}</h3>
                                            {tooltip && (
                                                <div className="tooltip-wrapper">
                                                    <span className="tooltip-icon">ℹ️</span>
                                                    <div className="tooltip-content">{tooltip}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {actions && (
                                <div className="section-actions" onClick={(e) => e.stopPropagation()}>
                                    {actions}
                                </div>
                            )}
                        </div>
                    )}

                    {showDivider && (title || actions) && <div className="section-divider"></div>}

                    <div
                        ref={contentRef}
                        className={`profile-section-content ${collapsible ? 'collapsible-content' : ''}`}
                        style={collapsible ? { maxHeight: contentHeight } : {}}
                    >
                        {children}
                    </div>

                    {footer && (
                        <>
                            <div className="section-divider"></div>
                            <div className="section-footer">
                                {footer}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

// Sub-components for common section patterns
export const ProfileSectionItem = ({ icon, label, value, action, onClick, variant = 'default' }) => {
    return (
        <div className={`profile-section-item ${variant}`} onClick={onClick}>
            {icon && <div className="item-icon">{icon}</div>}
            <div className="item-content">
                <div className="item-label">{label}</div>
                <div className="item-value">{value}</div>
            </div>
            {action && <div className="item-action">{action}</div>}
        </div>
    );
};

export const ProfileSectionGrid = ({ children, columns = 2, gap = 'medium' }) => {
    return (
        <div className={`profile-section-grid columns-${columns} gap-${gap}`}>
            {children}
        </div>
    );
};

export const ProfileSectionList = ({ children, divided = true }) => {
    return (
        <div className={`profile-section-list ${divided ? 'divided' : ''}`}>
            {children}
        </div>
    );
};

export const ProfileSectionCard = ({ children, onClick, selected = false, disabled = false }) => {
    return (
        <div
            className={`profile-section-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={!disabled ? onClick : undefined}
        >
            {children}
        </div>
    );
};

export default ProfileSection;
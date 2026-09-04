import React, { useState, useEffect, useRef } from 'react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = ({
    variant = 'compact',
    showLabels = true,
    position = 'bottom-left',
    animated = true,
    showPreview = true,
    quickToggle = true,
    onThemeChange,
    className = ''
}) => {
    const {
        theme,
        resolvedTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
        isDarkMode,
        isLightMode,
        isSystemMode,
        transitioning
    } = useTheme();

    const [isOpen, setIsOpen] = useState(false);
    const [hoveredTheme, setHoveredTheme] = useState(null);
    const [rippleEffect, setRippleEffect] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle theme change with ripple effect
    const handleThemeChange = (newTheme, callback) => {
        setRippleEffect(true);
        setTimeout(() => {
            callback();
            onThemeChange?.(newTheme);
            setRippleEffect(false);
            setIsOpen(false);
        }, 200);
    };

    // Get theme display info
    const getThemeInfo = () => {
        if (theme === THEMES.LIGHT) return { icon: '☀️', label: 'Light', color: '#ff9800', bg: 'linear-gradient(135deg, #ffd89b, #ff9800)' };
        if (theme === THEMES.DARK) return { icon: '🌙', label: 'Dark', color: '#667eea', bg: 'linear-gradient(135deg, #667eea, #764ba2)' };
        return { icon: '💻', label: 'System', color: '#4caf50', bg: 'linear-gradient(135deg, #4caf50, #45a049)' };
    };

    const currentTheme = getThemeInfo();

    // Get system theme info
    const getSystemThemeInfo = () => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return { icon: isDark ? '🌙' : '☀️', label: isDark ? 'Dark' : 'Light' };
    };

    const systemThemeInfo = getSystemThemeInfo();

    // Variant 1: Compact (Dropdown) - Best for navbars
    if (variant === 'compact') {
        return (
            <div
                className={`theme-switcher compact theme-position-${position} ${className}`}
                ref={dropdownRef}
            >
                <button
                    ref={buttonRef}
                    className={`theme-trigger ${animated ? 'animated' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={() => setHoveredTheme('current')}
                    onMouseLeave={() => setHoveredTheme(null)}
                    aria-label="Change theme"
                    aria-expanded={isOpen}
                    style={{ '--theme-color': currentTheme.color }}
                >
                    <span className={`theme-icon ${rippleEffect ? 'ripple' : ''}`}>
                        {currentTheme.icon}
                    </span>
                    {showLabels && (
                        <span className="theme-label">
                            {currentTheme.label}
                            {isSystemMode() && (
                                <span className="system-badge">
                                    {systemThemeInfo.icon}
                                </span>
                            )}
                        </span>
                    )}
                    <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>

                {isOpen && (
                    <div className={`theme-dropdown theme-dropdown-${position} ${animated ? 'slide-in' : ''}`}>
                        <div className="theme-dropdown-header">
                            <span className="dropdown-title">Select Theme</span>
                            {showPreview && (
                                <div className="dropdown-preview">
                                    <div className="preview-dot light" title="Light"></div>
                                    <div className="preview-dot dark" title="Dark"></div>
                                    <div className="preview-dot system" title="System"></div>
                                </div>
                            )}
                        </div>

                        <button
                            className={`theme-option ${theme === THEMES.LIGHT ? 'active' : ''} ${hoveredTheme === 'light' ? 'hovered' : ''}`}
                            onClick={() => handleThemeChange(THEMES.LIGHT, setLightTheme)}
                            onMouseEnter={() => setHoveredTheme('light')}
                            onMouseLeave={() => setHoveredTheme(null)}
                        >
                            <span className="option-icon">☀️</span>
                            <div className="option-content">
                                <span className="option-label">Light</span>
                                <span className="option-desc">Light mode theme</span>
                            </div>
                            {theme === THEMES.LIGHT && (
                                <span className="option-check">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </button>

                        <button
                            className={`theme-option ${theme === THEMES.DARK ? 'active' : ''} ${hoveredTheme === 'dark' ? 'hovered' : ''}`}
                            onClick={() => handleThemeChange(THEMES.DARK, setDarkTheme)}
                            onMouseEnter={() => setHoveredTheme('dark')}
                            onMouseLeave={() => setHoveredTheme(null)}
                        >
                            <span className="option-icon">🌙</span>
                            <div className="option-content">
                                <span className="option-label">Dark</span>
                                <span className="option-desc">Dark mode theme</span>
                            </div>
                            {theme === THEMES.DARK && (
                                <span className="option-check">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </button>

                        <button
                            className={`theme-option ${theme === THEMES.SYSTEM ? 'active' : ''} ${hoveredTheme === 'system' ? 'hovered' : ''}`}
                            onClick={() => handleThemeChange(THEMES.SYSTEM, setSystemTheme)}
                            onMouseEnter={() => setHoveredTheme('system')}
                            onMouseLeave={() => setHoveredTheme(null)}
                        >
                            <span className="option-icon">💻</span>
                            <div className="option-content">
                                <span className="option-label">System</span>
                                <span className="option-desc">
                                    {isDarkMode() ? 'Currently Dark' : 'Currently Light'} mode
                                </span>
                            </div>
                            {theme === THEMES.SYSTEM && (
                                <span className="option-check">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            )}
                        </button>

                        {showPreview && hoveredTheme && (
                            <div className="theme-preview-popup">
                                <div className={`preview-content preview-${hoveredTheme}`}>
                                    <div className="preview-header">
                                        <div className="preview-dot"></div>
                                        <div className="preview-line"></div>
                                    </div>
                                    <div className="preview-body">
                                        <div className="preview-card"></div>
                                        <div className="preview-text"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {transitioning && <div className="theme-transition-overlay" />}
            </div>
        );
    }

    // Variant 2: Full (Button Group) - Best for settings page
    if (variant === 'full') {
        return (
            <div className={`theme-switcher full ${className}`}>
                <div className="theme-section-header">
                    <h3 className="theme-section-title">Theme Preference</h3>
                    {quickToggle && (
                        <button onClick={toggleTheme} className="quick-toggle-btn">
                            <span className="quick-toggle-icon">
                                {isDarkMode() ? '🌙' : '☀️'}
                            </span>
                            <span className="quick-toggle-text">
                                Switch to {isDarkMode() ? 'Light' : 'Dark'}
                            </span>
                        </button>
                    )}
                </div>

                <div className="theme-buttons-group">
                    <button
                        onClick={() => handleThemeChange(THEMES.LIGHT, setLightTheme)}
                        className={`theme-card ${theme === THEMES.LIGHT ? 'active' : ''} ${animated ? 'animated' : ''}`}
                        onMouseEnter={() => setHoveredTheme('light')}
                        onMouseLeave={() => setHoveredTheme(null)}
                    >
                        <div className="theme-card-icon">☀️</div>
                        <div className="theme-card-content">
                            <div className="theme-card-title">Light</div>
                            <div className="theme-card-desc">Bright and clean interface</div>
                        </div>
                        {theme === THEMES.LIGHT && (
                            <div className="active-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Active
                            </div>
                        )}
                        {hoveredTheme === 'light' && !(theme === THEMES.LIGHT) && (
                            <div className="preview-overlay">
                                <span>Preview</span>
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => handleThemeChange(THEMES.DARK, setDarkTheme)}
                        className={`theme-card ${theme === THEMES.DARK ? 'active' : ''} ${animated ? 'animated' : ''}`}
                        onMouseEnter={() => setHoveredTheme('dark')}
                        onMouseLeave={() => setHoveredTheme(null)}
                    >
                        <div className="theme-card-icon">🌙</div>
                        <div className="theme-card-content">
                            <div className="theme-card-title">Dark</div>
                            <div className="theme-card-desc">Easy on the eyes at night</div>
                        </div>
                        {theme === THEMES.DARK && (
                            <div className="active-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Active
                            </div>
                        )}
                        {hoveredTheme === 'dark' && !(theme === THEMES.DARK) && (
                            <div className="preview-overlay">
                                <span>Preview</span>
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => handleThemeChange(THEMES.SYSTEM, setSystemTheme)}
                        className={`theme-card ${theme === THEMES.SYSTEM ? 'active' : ''} ${animated ? 'animated' : ''}`}
                        onMouseEnter={() => setHoveredTheme('system')}
                        onMouseLeave={() => setHoveredTheme(null)}
                    >
                        <div className="theme-card-icon">💻</div>
                        <div className="theme-card-content">
                            <div className="theme-card-title">System</div>
                            <div className="theme-card-desc">Matches your device settings</div>
                            <div className="theme-card-status">
                                Currently: {isDarkMode() ? 'Dark' : 'Light'}
                            </div>
                        </div>
                        {theme === THEMES.SYSTEM && (
                            <div className="active-badge">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Active
                            </div>
                        )}
                        {hoveredTheme === 'system' && !(theme === THEMES.SYSTEM) && (
                            <div className="preview-overlay">
                                <span>Preview</span>
                            </div>
                        )}
                    </button>
                </div>

                <div className="theme-info-panel">
                    <div className="current-theme-info">
                        <div className="info-icon" style={{ background: currentTheme.bg }}>
                            {currentTheme.icon}
                        </div>
                        <div className="info-content">
                            <div className="info-title">Current Theme</div>
                            <div className="info-text">
                                <strong>{currentTheme.label} Mode</strong>
                                {isSystemMode() && (
                                    <span className="system-indicator">
                                        (Following system: {systemThemeInfo.label})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="theme-tip">
                        <span className="tip-icon">💡</span>
                        <span className="tip-text">
                            {isDarkMode()
                                ? 'Dark mode reduces eye strain in low-light environments.'
                                : 'Light mode provides better readability in bright conditions.'}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Variant 3: Minimal (Icon Only) - Best for mobile
    if (variant === 'minimal') {
        return (
            <div className={`theme-switcher minimal ${className}`}>
                <button
                    onClick={toggleTheme}
                    className={`theme-toggle-minimal ${animated ? 'animated' : ''}`}
                    aria-label="Toggle theme"
                    onMouseEnter={() => setHoveredTheme(true)}
                    onMouseLeave={() => setHoveredTheme(false)}
                >
                    <div className="toggle-icon-wrapper">
                        {isDarkMode() ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        )}
                    </div>
                </button>

                {hoveredTheme && (
                    <div className="theme-tooltip">
                        <span className="tooltip-icon">{isDarkMode() ? '☀️' : '🌙'}</span>
                        <span className="tooltip-text">
                            Switch to {isDarkMode() ? 'Light' : 'Dark'} mode
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // Variant 4: Switch (Toggle Switch) - Best for sidebar
    if (variant === 'switch') {
        return (
            <div className={`theme-switcher switch ${className}`}>
                <div className="switch-container">
                    <div className="switch-label">
                        <span className="label-icon">☀️</span>
                        <span>Light Mode</span>
                    </div>
                    <label className="theme-switch">
                        <input
                            type="checkbox"
                            checked={isDarkMode()}
                            onChange={toggleTheme}
                        />
                        <span className="switch-slider"></span>
                    </label>
                    <div className="switch-label">
                        <span>Dark Mode</span>
                        <span className="label-icon">🌙</span>
                    </div>
                </div>
                {isSystemMode() && (
                    <div className="switch-note">
                        <span>💡 Following system preference</span>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default ThemeSwitcher;
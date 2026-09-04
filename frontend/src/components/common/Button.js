// src/components/common/Button.js
import React from 'react';
import './Button.css';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    onClick,
    className = '',
    icon = null,
    iconPosition = 'left',
    fullWidth = false,
    rounded = false,
    shadow = false,
    animated = false,
    active = false,
    loadingText = 'Loading...',
    tooltip = '',
    tooltipPosition = 'top',
    badge = null,
    badgeColor = '#ff4757',
    href = null,
    target = '_blank',
    rel = 'noopener noreferrer',
    ...restProps
}) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full-width',
        rounded && 'btn-rounded',
        shadow && 'btn-shadow',
        animated && 'btn-animated',
        active && 'btn-active',
        isLoading && 'btn-loading',
        className
    ].filter(Boolean).join(' ');

    const handleClick = (e) => {
        if (disabled || isLoading) return;
        onClick?.(e);
    };

    const renderSpinner = () => (
        <span className="btn-spinner">
            <svg className="spinner-icon" viewBox="0 0 24 24" width="16" height="16">
                <circle
                    className="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                <path
                    className="spinner-path"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    d="M12 2a10 10 0 0 1 10 10"
                />
            </svg>
            {loadingText !== 'Loading...' && (
                <span className="btn-loading-text">{loadingText}</span>
            )}
        </span>
    );

    const renderIcon = () => {
        if (typeof icon === 'string') {
            return <span className="btn-icon">{icon}</span>;
        }
        return icon;
    };

    const renderBadge = () => {
        if (!badge) return null;
        return (
            <span
                className="btn-badge"
                style={{ backgroundColor: badgeColor }}
                data-badge={badge}
            />
        );
    };

    const renderTooltip = () => {
        if (!tooltip) return null;
        return (
            <span className={`btn-tooltip btn-tooltip-${tooltipPosition}`}>
                {tooltip}
            </span>
        );
    };

    const buttonContent = (
        <>
            {isLoading && renderSpinner()}

            {!isLoading && icon && iconPosition === 'left' && (
                <span className="btn-icon-wrapper btn-icon-left">
                    {renderIcon()}
                </span>
            )}

            <span className="btn-text">
                {isLoading && loadingText !== 'Loading...' ? loadingText : children}
            </span>

            {!isLoading && icon && iconPosition === 'right' && (
                <span className="btn-icon-wrapper btn-icon-right">
                    {renderIcon()}
                </span>
            )}

            {renderBadge()}
            {renderTooltip()}
        </>
    );

    // Render as link if href is provided
    if (href && variant !== 'disabled') {
        return (
            <a
                href={disabled ? undefined : href}
                className={buttonClasses}
                target={target}
                rel={rel}
                onClick={handleClick}
                aria-disabled={disabled}
                role="button"
                {...restProps}
            >
                {buttonContent}
            </a>
        );
    }

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
            aria-disabled={disabled}
            {...restProps}
        >
            {buttonContent}
        </button>
    );
};

// Pre-configured Button variants
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const WarningButton = (props) => <Button variant="warning" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;

// Size variants
export const SmallButton = (props) => <Button size="small" {...props} />;
export const LargeButton = (props) => <Button size="large" {...props} />;

// Icon button
export const IconButton = ({ icon, label, ...props }) => (
    <Button icon={icon} aria-label={label} {...props}>
        {label}
    </Button>
);

// Social login buttons
export const GoogleButton = ({ children = 'Continue with Google', ...props }) => (
    <Button variant="outline" icon="G" {...props}>
        {children}
    </Button>
);

export const FacebookButton = ({ children = 'Continue with Facebook', ...props }) => (
    <Button variant="outline" icon="f" {...props}>
        {children}
    </Button>
);

// Action buttons
export const SubmitButton = ({ children = 'Submit', ...props }) => (
    <Button type="submit" variant="primary" {...props}>
        {children}
    </Button>
);

export const CancelButton = ({ children = 'Cancel', ...props }) => (
    <Button variant="ghost" {...props}>
        {children}
    </Button>
);

export const DeleteButton = ({ children = 'Delete', confirmMessage = 'Are you sure?', onConfirm, ...props }) => {
    const handleClick = (e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
            return;
        }
        onConfirm?.(e);
    };

    return (
        <Button variant="danger" onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};

export default Button;
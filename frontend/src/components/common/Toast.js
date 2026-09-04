import React, { useEffect, useState, useCallback } from 'react';
import './Toast.css';

const Toast = ({
    id,
    message,
    description,
    type = 'info',
    duration = 3000,
    onClose,
    position = 'top-right',
    action = null,
    actionText = 'Undo',
    onActionClick,
    showProgress = true,
    closable = true,
    icon = null,
    pauseOnHover = true,
    pauseOnFocusLoss = true,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);
    const [isHovered, setIsHovered] = useState(false);
    const progressIntervalRef = React.useRef(null);

    // Progress animation
    useEffect(() => {
        if (duration === 0 || !showProgress) return;

        const startTime = Date.now();
        const endTime = startTime + duration;

        const updateProgress = () => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            const percent = (remaining / duration) * 100;
            setProgress(percent);

            if (remaining > 0 && !isPaused && !isLeaving) {
                progressIntervalRef.current = requestAnimationFrame(updateProgress);
            }
        };

        progressIntervalRef.current = requestAnimationFrame(updateProgress);
        return () => {
            if (progressIntervalRef.current) {
                cancelAnimationFrame(progressIntervalRef.current);
            }
        };
    }, [duration, isPaused, isLeaving, showProgress]);

    // Auto close timer
    useEffect(() => {
        if (duration === 0) return;

        const timer = setTimeout(() => {
            if (!isPaused && !isLeaving) {
                handleClose();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, isPaused]);

    // Pause on hover
    const handleMouseEnter = () => {
        if (pauseOnHover) {
            setIsPaused(true);
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (pauseOnHover) {
            setIsPaused(false);
            setIsHovered(false);
        }
    };

    // Pause on window blur
    useEffect(() => {
        if (!pauseOnFocusLoss) return;

        const handleBlur = () => setIsPaused(true);
        const handleFocus = () => setIsPaused(false);

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [pauseOnFocusLoss]);

    const handleClose = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.(id);
        }, 300);
    }, [id, onClose]);

    const handleActionClick = () => {
        onActionClick?.();
        handleClose();
    };

    if (!isVisible) return null;

    const getIcon = () => {
        if (icon) return icon;

        switch (type) {
            case 'success':
                return (
                    <svg className="toast-icon toast-icon-success" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="toast-icon toast-icon-error" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="toast-icon toast-icon-warning" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                    </svg>
                );
            case 'loading':
                return (
                    <svg className="toast-icon toast-icon-loading" viewBox="0 0 24 24" fill="currentColor">
                        <circle className="loading-circle" cx="12" cy="12" r="10" />
                        <path className="loading-path" d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                );
            default:
                return (
                    <svg className="toast-icon toast-icon-info" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                );
        }
    };

    const getTypeClass = () => {
        switch (type) {
            case 'success': return 'toast-success';
            case 'error': return 'toast-error';
            case 'warning': return 'toast-warning';
            case 'loading': return 'toast-loading';
            default: return 'toast-info';
        }
    };

    return (
        <div
            className={`toast ${getTypeClass()} toast-${position} ${isLeaving ? 'toast-leave' : 'toast-enter'} ${isHovered ? 'toast-hovered' : ''} ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="alert"
            aria-live="polite"
        >
            <div className="toast-content">
                <div className="toast-icon-wrapper">
                    {getIcon()}
                    {type === 'loading' && <div className="loading-overlay"></div>}
                </div>
                <div className="toast-text">
                    <div className="toast-message">{message}</div>
                    {description && <div className="toast-description">{description}</div>}
                </div>
            </div>

            <div className="toast-actions">
                {action && (
                    <button className="toast-action-btn" onClick={handleActionClick}>
                        {actionText}
                    </button>
                )}
                {closable && (
                    <button className="toast-close" onClick={handleClose} aria-label="Close">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                )}
            </div>

            {showProgress && duration > 0 && !isPaused && (
                <div
                    className="toast-progress"
                    style={{ width: `${progress}%` }}
                />
            )}
        </div>
    );
};

// Toast Container Component (Enhanced)
export const ToastContainer = ({ toasts, removeToast, maxToasts = 5 }) => {
    const getPositionClass = (position) => {
        switch (position) {
            case 'top-left': return 'toast-container-top-left';
            case 'top-right': return 'toast-container-top-right';
            case 'top-center': return 'toast-container-top-center';
            case 'bottom-left': return 'toast-container-bottom-left';
            case 'bottom-right': return 'toast-container-bottom-right';
            case 'bottom-center': return 'toast-container-bottom-center';
            default: return 'toast-container-top-right';
        }
    };

    // Group toasts by position and limit per position
    const groupedToasts = toasts.reduce((acc, toast) => {
        const pos = toast.position || 'top-right';
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(toast);
        acc[pos] = acc[pos].slice(-maxToasts);
        return acc;
    }, {});

    return (
        <>
            {Object.entries(groupedToasts).map(([position, positionToasts]) => (
                <div key={position} className={`toast-container ${getPositionClass(position)}`}>
                    {positionToasts.map((toast, index) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            description={toast.description}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={removeToast}
                            position={position}
                            action={toast.action}
                            actionText={toast.actionText}
                            onActionClick={toast.onActionClick}
                            showProgress={toast.showProgress}
                            closable={toast.closable}
                            icon={toast.icon}
                            pauseOnHover={toast.pauseOnHover}
                            pauseOnFocusLoss={toast.pauseOnFocusLoss}
                            style={{ '--toast-index': index }}
                        />
                    ))}
                </div>
            ))}
        </>
    );
};

// Toast Hook for easy usage (Enhanced)
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((options) => {
        const {
            message,
            description,
            type = 'info',
            duration = 3000,
            position = 'top-right',
            action,
            actionText = 'Undo',
            onActionClick,
            showProgress = true,
            closable = true,
            icon,
            pauseOnHover = true,
            pauseOnFocusLoss = true,
            id = Date.now()
        } = typeof options === 'string' ? { message: options } : options;

        const newToast = {
            id,
            message,
            description,
            type,
            duration,
            position,
            action,
            actionText,
            onActionClick,
            showProgress,
            closable,
            icon,
            pauseOnHover,
            pauseOnFocusLoss
        };

        setToasts(prev => [...prev, newToast]);

        if (duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const updateToast = useCallback((id, updates) => {
        setToasts(prev => prev.map(toast =>
            toast.id === id ? { ...toast, ...updates } : toast
        ));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods
    const success = useCallback((message, options = {}) =>
        addToast({ ...options, message, type: 'success' }), [addToast]);

    const error = useCallback((message, options = {}) =>
        addToast({ ...options, message, type: 'error' }), [addToast]);

    const warning = useCallback((message, options = {}) =>
        addToast({ ...options, message, type: 'warning' }), [addToast]);

    const info = useCallback((message, options = {}) =>
        addToast({ ...options, message, type: 'info' }), [addToast]);

    const loading = useCallback((message, options = {}) =>
        addToast({ ...options, message, type: 'loading', duration: 0, closable: false }), [addToast]);

    const promise = useCallback(async (promise, options = {}) => {
        const { loading: loadingMsg = 'Loading...', success: successMsg, error: errorMsg } = options;
        const toastId = loading(loadingMsg);

        try {
            const result = await promise;
            updateToast(toastId, {
                type: 'success',
                message: typeof successMsg === 'function' ? successMsg(result) : successMsg,
                duration: 3000,
                closable: true
            });
            return result;
        } catch (err) {
            updateToast(toastId, {
                type: 'error',
                message: typeof errorMsg === 'function' ? errorMsg(err) : errorMsg,
                duration: 3000,
                closable: true
            });
            throw err;
        }
    }, [loading, updateToast]);

    return {
        toasts,
        addToast,
        removeToast,
        updateToast,
        clearAll,
        success,
        error,
        warning,
        info,
        loading,
        promise
    };
};

// Toast Provider Component
export const ToastProvider = ({ children, maxToasts = 5, autoClose = true, position = 'top-right' }) => {
    const { toasts, removeToast } = useToast();

    return (
        <>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} maxToasts={maxToasts} />
        </>
    );
};

// Predefined toast configurations
export const ToastTemplates = {
    welcome: (name) => ({
        message: `Welcome back, ${name}!`,
        description: 'We\'re glad to see you again.',
        type: 'success',
        duration: 4000,
        icon: '👋'
    }),
    saveSuccess: (itemName) => ({
        message: `${itemName} saved successfully`,
        type: 'success',
        duration: 3000,
        action: true,
        actionText: 'Undo'
    }),
    deleteConfirm: (itemName, onConfirm) => ({
        message: `Delete ${itemName}?`,
        description: 'This action cannot be undone.',
        type: 'warning',
        duration: 5000,
        action: true,
        actionText: 'Delete',
        onActionClick: onConfirm
    }),
    networkError: () => ({
        message: 'Network Error',
        description: 'Please check your internet connection and try again.',
        type: 'error',
        duration: 5000
    }),
    uploadProgress: (filename, progress) => ({
        message: `Uploading ${filename}`,
        description: `${progress}% complete`,
        type: 'loading',
        duration: 0,
        showProgress: true
    })
};

export default Toast;
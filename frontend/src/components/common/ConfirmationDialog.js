import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    size = 'small',
    icon = null,
    isLoading = false,
    destructive = false,
    showCancel = true,
    reverseButtons = false,
    onCancel,
    className = '',
    closeOnConfirm = true,
    closeOnCancel = true,
    autoCloseDelay = 0,
    countdown = false,
    countdownDuration = 5,
    showProgress = false,
    detailedMessage = null,
    additionalContent = null,
    loadingMessage = 'Processing...',
    successMessage = null,
    onSuccess,
    keyboardShortcuts = true
}) => {
    const [isLeaving, setIsLeaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdownValue, setCountdownValue] = useState(countdownDuration);
    const [progress, setProgress] = useState(0);

    // Countdown timer effect
    useEffect(() => {
        let timer;
        if (isOpen && countdown && !isLoading && !isSuccess) {
            timer = setInterval(() => {
                setCountdownValue(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleConfirm();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, countdown, isLoading, isSuccess]);

    // Progress animation effect
    useEffect(() => {
        if (isOpen && showProgress && isLoading) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 200);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [isOpen, showProgress, isLoading]);

    // Auto close delay effect
    useEffect(() => {
        let timer;
        if (isSuccess && autoCloseDelay > 0) {
            timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);
        }
        return () => clearTimeout(timer);
    }, [isSuccess, autoCloseDelay]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen || !keyboardShortcuts || isLoading) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !isLoading) {
                handleConfirm();
            } else if (e.key === 'Escape' && !isLoading) {
                handleCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, keyboardShortcuts]);

    const handleConfirm = async () => {
        if (isLoading || isSuccess) return;

        try {
            const result = await onConfirm?.();

            if (result !== false) {
                setIsSuccess(true);
                onSuccess?.();

                if (closeOnConfirm && autoCloseDelay === 0) {
                    setTimeout(() => {
                        handleClose();
                    }, 1000);
                } else if (closeOnConfirm) {
                    handleClose();
                }
            }
        } catch (error) {
            console.error('Confirmation action failed:', error);
        }
    };

    const handleCancel = () => {
        if (isLoading || isSuccess) return;

        onCancel?.();
        if (closeOnCancel) {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose?.();
            setIsLeaving(false);
            setIsSuccess(false);
            setCountdownValue(countdownDuration);
            setProgress(0);
        }, 300);
    };

    const getIcon = () => {
        if (isSuccess) return '✓';
        if (icon) return icon;

        switch (variant) {
            case 'danger':
                return '⚠️';
            case 'success':
                return '✓';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '❓';
        }
    };

    const getIconClass = () => {
        if (isSuccess) return 'icon-success';

        switch (variant) {
            case 'danger':
                return 'icon-danger';
            case 'success':
                return 'icon-success';
            case 'warning':
                return 'icon-warning';
            case 'info':
                return 'icon-info';
            default:
                return 'icon-primary';
        }
    };

    const getTitleIcon = () => {
        if (isSuccess) return null;

        switch (variant) {
            case 'danger':
                return '⚠️';
            case 'warning':
                return '⚠️';
            default:
                return null;
        }
    };

    const confirmVariant = destructive ? 'danger' : variant;
    const confirmButtonText = isSuccess ? successMessage || 'Success!' : (countdown && !isLoading ? `${confirmText} (${countdownValue}s)` : confirmText);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size={size}
            className={`confirmation-dialog ${className} ${isLeaving ? 'leaving' : ''} ${isSuccess ? 'success' : ''}`}
            showCloseButton={false}
            closeOnOverlayClick={!isLoading && !isSuccess}
            closeOnEscape={!isLoading && !isSuccess}
        >
            <div className="confirmation-content">
                {/* Progress Bar */}
                {showProgress && isLoading && (
                    <div className="confirmation-progress">
                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Success Animation */}
                {isSuccess && (
                    <div className="confirmation-success-animation">
                        <div className="success-checkmark">
                            <div className="check-icon">
                                <span className="icon-line line-tip"></span>
                                <span className="icon-line line-long"></span>
                                <div className="icon-circle"></div>
                                <div className="icon-fix"></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Icon */}
                {!isSuccess && (
                    <div className={`confirmation-icon ${getIconClass()}`}>
                        {getIcon()}
                        {getTitleIcon() && (
                            <span className="title-icon">{getTitleIcon()}</span>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="confirmation-title">
                    {isSuccess ? (successMessage ? 'Success!' : title) : title}
                </h3>

                {/* Message */}
                {!isSuccess && (
                    <p className="confirmation-message">{message}</p>
                )}

                {/* Detailed Message */}
                {detailedMessage && !isSuccess && (
                    <div className="confirmation-detailed-message">
                        {detailedMessage}
                    </div>
                )}

                {/* Additional Content */}
                {additionalContent && !isSuccess && (
                    <div className="confirmation-additional-content">
                        {additionalContent}
                    </div>
                )}

                {/* Success Message */}
                {isSuccess && successMessage && (
                    <p className="confirmation-success-message">{successMessage}</p>
                )}

                {/* Loading Message */}
                {isLoading && !isSuccess && loadingMessage && (
                    <div className="confirmation-loading-message">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>{loadingMessage}</span>
                    </div>
                )}

                {/* Actions */}
                {!isSuccess && (
                    <div className={`confirmation-actions ${reverseButtons ? 'reverse' : ''}`}>
                        {showCancel && (
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="cancel-btn"
                                size="medium"
                            >
                                {cancelText}
                            </Button>
                        )}

                        <Button
                            variant={confirmVariant}
                            onClick={handleConfirm}
                            isLoading={isLoading}
                            disabled={isLoading || (countdown && countdownValue > 0)}
                            className="confirm-btn"
                            size="medium"
                        >
                            {confirmButtonText}
                        </Button>
                    </div>
                )}

                {/* Success Action Button */}
                {isSuccess && autoCloseDelay > 0 && (
                    <div className="confirmation-auto-close">
                        Closing in {autoCloseDelay / 1000} seconds...
                    </div>
                )}

                {isSuccess && !autoCloseDelay && (
                    <div className="confirmation-actions">
                        <Button
                            variant="primary"
                            onClick={handleClose}
                            className="close-btn"
                            size="medium"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// Pre-configured dialogs for common use cases
export const DeleteConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    itemName = 'item',
    isLoading,
    itemCount = 1,
    permanent = false
}) => {
    const message = permanent
        ? `Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`
        : `Are you sure you want to delete "${itemName}"?`;

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Item"
            message={message}
            confirmText="Delete"
            variant="danger"
            destructive={true}
            icon="🗑️"
            isLoading={isLoading}
            detailedMessage={itemCount > 1 && `This will remove ${itemCount} items.`}
        />
    );
};

export const BulkDeleteConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    itemCount,
    isLoading
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Bulk Delete"
            message={`Are you sure you want to delete ${itemCount} selected items?`}
            confirmText="Delete All"
            variant="danger"
            destructive={true}
            icon="🗑️"
            isLoading={isLoading}
            detailedMessage="This action cannot be undone."
        />
    );
};

export const SaveConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    itemName = 'changes',
    isLoading,
    showCountdown = false
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Save Changes"
            message={`Do you want to save the ${itemName}?`}
            confirmText="Save"
            variant="success"
            icon="💾"
            isLoading={isLoading}
            countdown={showCountdown}
            countdownDuration={5}
            successMessage="Changes saved successfully!"
            autoCloseDelay={2000}
        />
    );
};

export const LogoutConfirmation = ({ isOpen, onClose, onConfirm, isLoading }) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Logout"
            message="Are you sure you want to logout? You will need to login again to access your account."
            confirmText="Logout"
            variant="warning"
            icon="🚪"
            isLoading={isLoading}
            successMessage="Logged out successfully!"
            autoCloseDelay={1500}
            onSuccess={() => {
                // Clear user data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }}
        />
    );
};

export const CancelOrderConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    orderId,
    isLoading,
    refundAmount = null
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Cancel Order"
            message={`Are you sure you want to cancel order #${orderId}?`}
            confirmText="Yes, Cancel Order"
            cancelText="No, Keep Order"
            variant="danger"
            destructive={true}
            icon="❌"
            isLoading={isLoading}
            detailedMessage={refundAmount && `A refund of ₹${refundAmount} will be processed to your original payment method.`}
            successMessage="Order cancelled successfully"
            autoCloseDelay={2000}
        />
    );
};

export const ClearCartConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    itemCount,
    isLoading,
    showCountdown = false
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Clear Cart"
            message={`Are you sure you want to clear your cart? You have ${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart.`}
            confirmText="Clear Cart"
            cancelText="Keep Items"
            variant="warning"
            icon="🛒"
            isLoading={isLoading}
            countdown={showCountdown}
            countdownDuration={3}
            successMessage="Cart cleared successfully!"
            autoCloseDelay={1500}
        />
    );
};

export const RemoveItemConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    isLoading,
    quantity = 1
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Remove Item"
            message={`Remove ${quantity > 1 ? quantity + 'x ' : ''}"${itemName}" from your cart?`}
            confirmText="Remove"
            variant="danger"
            destructive={true}
            icon="🗑️"
            isLoading={isLoading}
            successMessage="Item removed"
            autoCloseDelay={1000}
        />
    );
};

export const LeavePageConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    unsavedCount = null
}) => {
    const message = unsavedCount
        ? `You have ${unsavedCount} unsaved change${unsavedCount !== 1 ? 's' : ''}. Are you sure you want to leave?`
        : "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.";

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Leave Page?"
            message={message}
            confirmText="Leave"
            cancelText="Stay"
            variant="warning"
            icon="⚠️"
            isLoading={isLoading}
            reverseButtons={true}
        />
    );
};

export const SubmitConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    formName = 'form',
    isLoading,
    showProgress = true
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Submit Form"
            message={`Please review your ${formName} before submitting.`}
            confirmText="Submit"
            variant="primary"
            icon="📝"
            isLoading={isLoading}
            showProgress={showProgress}
            loadingMessage="Submitting..."
            successMessage="Submitted successfully!"
            autoCloseDelay={2000}
            detailedMessage="Once submitted, you won't be able to make changes."
        />
    );
};

export const DiscardChangesConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading
}) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Discard Changes?"
            message="You have unsaved changes. Are you sure you want to discard them?"
            confirmText="Discard"
            cancelText="Keep Editing"
            variant="danger"
            destructive={true}
            icon="⚠️"
            isLoading={isLoading}
            successMessage="Changes discarded"
            autoCloseDelay={1500}
        />
    );
};

// Two-factor authentication confirmation
export const TwoFactorConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    onResendCode,
    resendCountdown = 30
}) => {
    const [code, setCode] = useState('');
    const [countdown, setCountdown] = useState(resendCountdown);

    useEffect(() => {
        let timer;
        if (isOpen && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, countdown]);

    const additionalContent = (
        <div className="two-factor-content">
            <p className="two-factor-message">
                Please enter the verification code sent to your registered email/phone.
            </p>
            <input
                type="text"
                className="two-factor-input"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                autoFocus
            />
            <button
                className="resend-code-btn"
                onClick={onResendCode}
                disabled={countdown > 0}
            >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
            </button>
        </div>
    );

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={() => onConfirm?.(code)}
            title="Two-Factor Authentication"
            message=""
            confirmText="Verify"
            variant="primary"
            icon="🔐"
            isLoading={isLoading}
            additionalContent={additionalContent}
            showCancel={true}
            cancelText="Cancel"
        />
    );
};

export default ConfirmationDialog;
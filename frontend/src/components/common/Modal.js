import React, { useEffect, useCallback, useRef, useState } from 'react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    position = 'center',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    showHeader = true,
    showFooter = true,
    footer,
    actions,
    className = '',
    overlayClassName = '',
    contentClassName = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    onOpen,
    onCloseComplete,
    animation = 'slide',
    animationDuration = 300,
    closeOnOutsideClick = false,
    preventScroll = true,
    zIndex = 1000,
    ariaLabel,
    ariaDescribedBy,
    focusOnOpen = true,
    focusOnClose = true,
    initialFocusRef,
    finalFocusRef,
    returnFocus = true,
    trapFocus = true,
    blockScroll = true
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const closeButtonRef = useRef(null);

    // Handle mounting/unmounting with animation
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else if (shouldRender) {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), animationDuration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, animationDuration, shouldRender]);

    // Handle body scroll
    useEffect(() => {
        if (preventScroll && isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        } else if (!isOpen && preventScroll) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        return () => {
            if (preventScroll) {
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }
        };
    }, [isOpen, preventScroll]);

    // Focus management
    useEffect(() => {
        if (!isOpen) return;

        // Store previous focus
        if (returnFocus && document.activeElement) {
            previousFocusRef.current = document.activeElement;
        }

        // Set focus on modal or specified element
        if (focusOnOpen) {
            const focusTarget = initialFocusRef?.current || closeButtonRef.current || modalRef.current;
            setTimeout(() => focusTarget?.focus(), 100);
        }

        return () => {
            if (returnFocus && previousFocusRef.current && focusOnClose) {
                previousFocusRef.current.focus();
            }
        };
    }, [isOpen, focusOnOpen, returnFocus, focusOnClose, initialFocusRef]);

    // Trap focus within modal
    useEffect(() => {
        if (!trapFocus || !isOpen) return;

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements?.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, [isOpen, trapFocus]);

    // Handle escape key
    const handleEscape = useCallback((e) => {
        if (closeOnEscape && e.key === 'Escape' && isOpen && !isAnimating) {
            onClose();
        }
    }, [closeOnEscape, onClose, isOpen, isAnimating]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, handleEscape]);

    // Handle open/close callbacks
    useEffect(() => {
        if (isOpen && shouldRender) {
            onOpen?.();
        } else if (!isOpen && !shouldRender) {
            onCloseComplete?.();
        }
    }, [isOpen, shouldRender, onOpen, onCloseComplete]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleOutsideClick = useCallback((e) => {
        if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    }, [closeOnOutsideClick, onClose]);

    useEffect(() => {
        if (closeOnOutsideClick && isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            return () => document.removeEventListener('mousedown', handleOutsideClick);
        }
    }, [closeOnOutsideClick, isOpen, handleOutsideClick]);

    if (!shouldRender) return null;

    const modalSize = size === 'fullscreen' ? 'fullscreen' : size;
    const modalPosition = position;
    const modalAnimation = animation;

    return (
        <div
            className={`modal-overlay modal-position-${modalPosition} modal-animation-${modalAnimation} ${overlayClassName}`}
            onClick={handleOverlayClick}
            style={{
                '--modal-z-index': zIndex,
                '--modal-animation-duration': `${animationDuration}ms`
            }}
            role="presentation"
        >
            <div
                ref={modalRef}
                className={`modal-container modal-size-${modalSize} modal-animate-${isAnimating ? 'in' : 'out'} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel || title}
                aria-describedby={ariaDescribedBy}
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {showHeader && (
                    <div className={`modal-header ${headerClassName}`}>
                        <div className="modal-header-content">
                            {title && (
                                <h2 id="modal-title" className="modal-title">
                                    {title}
                                </h2>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                ref={closeButtonRef}
                                className="modal-close-btn"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                <div className={`modal-body ${bodyClassName}`}>
                    {children}
                </div>

                {(showFooter || footer || actions) && (
                    <div className={`modal-footer ${footerClassName}`}>
                        {footer}
                        {actions && (
                            <div className="modal-actions">
                                {actions}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Confirmation Modal Component (Enhanced)
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    loading = false,
    icon,
    detailMessage,
    confirmButtonProps = {},
    cancelButtonProps = {}
}) => {
    const getIcon = () => {
        if (icon) return icon;
        switch (variant) {
            case 'danger': return '⚠️';
            case 'success': return '✓';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    const getIconClass = () => {
        switch (variant) {
            case 'danger': return 'confirm-icon-danger';
            case 'success': return 'confirm-icon-success';
            case 'warning': return 'confirm-icon-warning';
            default: return 'confirm-icon-primary';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
            className="confirm-modal"
            footer={
                <div className="confirm-modal-actions">
                    <button
                        className={`btn btn-${variant}`}
                        onClick={onConfirm}
                        disabled={loading}
                        {...confirmButtonProps}
                    >
                        {loading ? (
                            <span className="btn-loading-spinner"></span>
                        ) : confirmText}
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={onClose}
                        disabled={loading}
                        {...cancelButtonProps}
                    >
                        {cancelText}
                    </button>
                </div>
            }
        >
            <div className="confirm-modal-content">
                <div className={`confirm-modal-icon ${getIconClass()}`}>
                    {getIcon()}
                </div>
                <p className="confirm-modal-message">{message}</p>
                {detailMessage && (
                    <p className="confirm-modal-detail">{detailMessage}</p>
                )}
            </div>
        </Modal>
    );
};

// Drawer Modal (Side Panel) - Enhanced
export const DrawerModal = ({
    isOpen,
    onClose,
    title,
    children,
    position = 'right',
    size = 'medium',
    showBackdrop = true,
    backdropOpacity = 0.5,
    ...props
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            position={position}
            size={size}
            className={`modal-drawer modal-drawer-${position} modal-drawer-size-${size}`}
            overlayClassName={`${!showBackdrop ? 'no-backdrop' : ''}`}
            style={{ '--backdrop-opacity': backdropOpacity }}
            {...props}
        >
            {children}
        </Modal>
    );
};

// Fullscreen Modal (Enhanced)
export const FullscreenModal = ({
    isOpen,
    onClose,
    title,
    children,
    showHeader = true,
    ...props
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="fullscreen"
            position="center"
            showHeader={showHeader}
            animation="fade"
            {...props}
        >
            {children}
        </Modal>
    );
};

// Bottom Sheet Modal
export const BottomSheetModal = ({
    isOpen,
    onClose,
    title,
    children,
    height = 'auto',
    draggable = true,
    ...props
}) => {
    const [dragStart, setDragStart] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const sheetRef = useRef(null);

    const handleTouchStart = (e) => {
        if (!draggable) return;
        setDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (!draggable || !dragStart) return;
        const delta = e.touches[0].clientY - dragStart;
        if (delta > 0) {
            setDragOffset(delta);
            sheetRef.current.style.transform = `translateY(${delta}px)`;
        }
    };

    const handleTouchEnd = () => {
        if (!draggable) return;
        if (dragOffset > 100) {
            onClose();
        } else {
            sheetRef.current.style.transform = '';
        }
        setDragStart(0);
        setDragOffset(0);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            position="bottom"
            size={height === 'auto' ? 'auto' : 'full'}
            className="modal-bottom-sheet"
            animation="slide-up"
            closeOnOverlayClick={true}
            {...props}
        >
            <div
                ref={sheetRef}
                className="bottom-sheet-content"
                style={{ height: height !== 'auto' ? height : 'auto' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {draggable && <div className="bottom-sheet-handle"></div>}
                {children}
            </div>
        </Modal>
    );
};

// Nested Modal Provider
export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState([]);

    const openModal = (modal) => {
        setModals(prev => [...prev, modal]);
    };

    const closeModal = (id) => {
        setModals(prev => prev.filter(modal => modal.id !== id));
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal, modals }}>
            {children}
            {modals.map(modal => (
                <Modal key={modal.id} {...modal.props} onClose={() => closeModal(modal.id)}>
                    {modal.content}
                </Modal>
            ))}
        </ModalContext.Provider>
    );
};

export const ModalContext = React.createContext({});

export default Modal;
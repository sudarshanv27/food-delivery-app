// web-app/src/utils/helpers.js

// ================= FORMAT PRICE =================
export const formatPrice = (price = 0) => {
    const amount = Number(price) || 0;

    return `₹${amount.toLocaleString('en-IN')}`;
};

// ================= FORMAT DATE =================
export const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString(
        'en-IN',
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }
    );
};

// ================= GET STATUS COLOR =================
export const getStatusColor = (status = '') => {
    const colors = {
        pending: '#ffa502',
        confirmed: '#1e90ff',
        preparing: '#ff6348',
        out_for_delivery: '#2ed573',
        delivered: '#2ed573',
        cancelled: '#ff4757',
    };

    return colors[status] || '#666666';
};

// ================= DEBOUNCE FUNCTION =================
export const debounce = (
    func,
    delay = 300
) => {
    let timeoutId;

    return (...args) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};
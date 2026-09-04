import { PRICE_CONSTANTS } from './constants';

/**
 * Calculate subtotal from cart items
 * @param {Array} items - Cart items array
 * @returns {number} Subtotal amount
 */
export const calculateSubtotal = (items) => {
    return items.reduce((total, item) => {
        const itemPrice = item.discountPrice || item.price;
        const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
        return total + (itemPrice + addonsTotal) * item.quantity;
    }, 0);
};

/**
 * Calculate tax amount (GST)
 * @param {number} subtotal - Subtotal amount
 * @param {number} taxRate - Tax rate (default: 5%)
 * @returns {number} Tax amount
 */
export const calculateTax = (subtotal, taxRate = PRICE_CONSTANTS.TAX_RATE) => {
    return subtotal * taxRate;
};

/**
 * Calculate delivery fee
 * @param {number} subtotal - Subtotal amount
 * @param {number} freeDeliveryThreshold - Threshold for free delivery
 * @param {number} deliveryFee - Base delivery fee
 * @returns {number} Delivery fee amount
 */
export const calculateDeliveryFee = (
    subtotal,
    freeDeliveryThreshold = PRICE_CONSTANTS.FREE_DELIVERY_THRESHOLD,
    deliveryFee = PRICE_CONSTANTS.DELIVERY_FEE
) => {
    return subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
};

/**
 * Calculate packaging fee
 * @param {number} packagingFee - Base packaging fee
 * @returns {number} Packaging fee
 */
export const calculatePackagingFee = (packagingFee = PRICE_CONSTANTS.PACKAGING_FEE) => {
    return packagingFee;
};

/**
 * Calculate discount amount
 * @param {number} subtotal - Subtotal amount
 * @param {Object} coupon - Coupon object
 * @returns {number} Discount amount
 */
export const calculateDiscount = (subtotal, coupon) => {
    if (!coupon) return 0;

    if (coupon.type === 'percentage') {
        return (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
        return Math.min(coupon.value, subtotal);
    }
    return 0;
};

/**
 * Calculate total amount
 * @param {Object} params - Calculation parameters
 * @returns {number} Total amount
 */
export const calculateTotal = ({
    subtotal,
    tax,
    deliveryFee,
    packagingFee,
    discount,
}) => {
    return subtotal + tax + deliveryFee + packagingFee - discount;
};

/**
 * Calculate full cart total with all components
 * @param {Array} items - Cart items
 * @param {Object} coupon - Applied coupon
 * @param {Object} options - Additional options (taxRate, deliveryFee, etc.)
 * @returns {Object} Complete price breakdown
 */
export const calculateCartTotal = (items, coupon = null, options = {}) => {
    const {
        taxRate = PRICE_CONSTANTS.TAX_RATE,
        deliveryFee = PRICE_CONSTANTS.DELIVERY_FEE,
        freeDeliveryThreshold = PRICE_CONSTANTS.FREE_DELIVERY_THRESHOLD,
        packagingFee = PRICE_CONSTANTS.PACKAGING_FEE,
    } = options;

    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal, taxRate);
    const delivery = calculateDeliveryFee(subtotal, freeDeliveryThreshold, deliveryFee);
    const packaging = calculatePackagingFee(packagingFee);
    const discount = calculateDiscount(subtotal, coupon);
    const total = calculateTotal({ subtotal, tax, deliveryFee: delivery, packagingFee: packaging, discount });

    // Calculate savings from discounts
    const originalSubtotal = items.reduce((total, item) => {
        const originalPrice = item.originalPrice || item.price;
        const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
        return total + (originalPrice + addonsTotal) * item.quantity;
    }, 0);
    const savings = originalSubtotal - subtotal;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        deliveryFee: delivery,
        packagingFee: packaging,
        discount: Math.round(discount * 100) / 100,
        total: Math.round(total * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        itemCount: items.reduce((count, item) => count + item.quantity, 0),
    };
};

/**
 * Calculate per-item total with addons
 * @param {Object} item - Cart item
 * @returns {number} Item total
 */
export const calculateItemTotal = (item) => {
    const itemPrice = item.discountPrice || item.price;
    const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    return (itemPrice + addonsTotal) * item.quantity;
};

/**
 * Calculate savings per item
 * @param {Object} item - Cart item
 * @returns {number} Savings amount
 */
export const calculateItemSavings = (item) => {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return (item.originalPrice - item.price) * item.quantity;
};

/**
 * Calculate tip amount
 * @param {number} total - Order total
 * @param {number} percentage - Tip percentage
 * @returns {number} Tip amount
 */
export const calculateTip = (total, percentage = 0) => {
    return (total * percentage) / 100;
};

/**
 * Split bill among multiple people
 * @param {number} total - Total amount
 * @param {number} people - Number of people
 * @returns {number} Amount per person
 */
export const splitBill = (total, people) => {
    if (people <= 0) return 0;
    return total / people;
};

/**
 * Calculate price with tax included
 * @param {number} price - Base price
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Price with tax
 */
export const priceWithTax = (price, taxRate = 5) => {
    return price * (1 + taxRate / 100);
};

/**
 * Calculate price without tax
 * @param {number} priceWithTax - Price including tax
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Price without tax
 */
export const priceWithoutTax = (priceWithTax, taxRate = 5) => {
    return priceWithTax / (1 + taxRate / 100);
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
};

/**
 * Get discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const getDiscountPercentage = (originalPrice, discountedPrice) => {
    if (originalPrice <= 0) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export default {
    calculateSubtotal,
    calculateTax,
    calculateDeliveryFee,
    calculatePackagingFee,
    calculateDiscount,
    calculateTotal,
    calculateCartTotal,
    calculateItemTotal,
    calculateItemSavings,
    calculateTip,
    splitBill,
    priceWithTax,
    priceWithoutTax,
    formatPrice,
    getDiscountPercentage,
};
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength and message
 */
export const validatePassword = (password) => {
    const result = {
        isValid: false,
        strength: 0,
        message: '',
        requirements: {
            minLength: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumber: false,
            hasSpecialChar: false,
        },
    };

    if (!password) {
        result.message = 'Password is required';
        return result;
    }

    result.requirements.minLength = password.length >= 6;
    result.requirements.hasUpperCase = /[A-Z]/.test(password);
    result.requirements.hasLowerCase = /[a-z]/.test(password);
    result.requirements.hasNumber = /[0-9]/.test(password);
    result.requirements.hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    const passedCount = Object.values(result.requirements).filter(Boolean).length;
    result.strength = (passedCount / 5) * 100;

    if (password.length < 6) {
        result.message = 'Password must be at least 6 characters';
    } else if (!result.requirements.hasUpperCase) {
        result.message = 'Password must contain at least one uppercase letter';
    } else if (!result.requirements.hasLowerCase) {
        result.message = 'Password must contain at least one lowercase letter';
    } else if (!result.requirements.hasNumber) {
        result.message = 'Password must contain at least one number';
    } else {
        result.isValid = true;
        result.message = 'Password is strong';
    }

    return result;
};

/**
 * Validate name (letters, spaces, hyphens)
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
export const isValidName = (name) => {
    const regex = /^[A-Za-z\s\-']{2,50}$/;
    return regex.test(name);
};

/**
 * Validate ZIP code (6 digits for India)
 * @param {string} zipCode - ZIP code
 * @returns {boolean} True if valid
 */
export const isValidZipCode = (zipCode) => {
    const regex = /^\d{6}$/;
    return regex.test(zipCode);
};

/**
 * Validate credit card number (Luhn algorithm)
 * @param {string} cardNumber - Card number
 * @returns {boolean} True if valid
 */
export const isValidCardNumber = (cardNumber) => {
    const num = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(num)) return false;

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num.charAt(i), 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
};

/**
 * Get card type from number
 * @param {string} cardNumber - Card number
 * @returns {string} Card type (visa, mastercard, amex, etc.)
 */
export const getCardType = (cardNumber) => {
    const num = cardNumber.replace(/\s/g, '');
    const patterns = {
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        amex: /^3[47][0-9]{13}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        rupay: /^6[0-9]{15}$/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(num)) return type;
    }
    return 'unknown';
};

/**
 * Validate CVV
 * @param {string} cvv - CVV code
 * @param {string} cardType - Card type (for Amex 4 digits)
 * @returns {boolean} True if valid
 */
export const isValidCVV = (cvv, cardType = '') => {
    const length = cardType === 'amex' ? 4 : 3;
    const regex = new RegExp(`^\\d{${length}}$`);
    return regex.test(cvv);
};

/**
 * Validate expiry date
 * @param {string} month - Expiry month (MM)
 * @param {string} year - Expiry year (YY or YYYY)
 * @returns {boolean} True if valid and not expired
 */
export const isValidExpiryDate = (month, year) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let expiryYear = parseInt(year, 10);
    if (expiryYear < 100) expiryYear += 2000;

    const expiryMonth = parseInt(month, 10);

    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    return true;
};

/**
 * Validate UPI ID
 * @param {string} upiId - UPI ID
 * @returns {boolean} True if valid
 */
export const isValidUPI = (upiId) => {
    const regex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,}$/;
    return regex.test(upiId);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate required fields
 * @param {Object} data - Form data
 * @param {Array} requiredFields - List of required field names
 * @returns {Object} Validation errors
 */
export const validateRequired = (data, requiredFields) => {
    const errors = {};
    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            errors[field] = `${field.replace(/_/g, ' ')} is required`;
        }
    });
    return errors;
};

/**
 * Validate address
 * @param {Object} address - Address object
 * @returns {Object} Validation errors
 */
export const validateAddress = (address) => {
    const errors = {};

    if (!address.street) errors.street = 'Street address is required';
    if (!address.city) errors.city = 'City is required';
    if (!address.state) errors.state = 'State is required';
    if (!address.zipCode) errors.zipCode = 'ZIP code is required';
    else if (!isValidZipCode(address.zipCode)) errors.zipCode = 'Invalid ZIP code';
    if (!address.phone) errors.phone = 'Phone number is required';
    else if (!isValidPhone(address.phone)) errors.phone = 'Invalid phone number';

    return errors;
};

/**
 * Validate review
 * @param {Object} review - Review object
 * @returns {Object} Validation errors
 */
export const validateReview = (review) => {
    const errors = {};

    if (!review.rating || review.rating < 1 || review.rating > 5) {
        errors.rating = 'Rating must be between 1 and 5';
    }
    if (!review.comment || review.comment.trim().length < 10) {
        errors.comment = 'Review must be at least 10 characters';
    }
    if (review.comment && review.comment.length > 500) {
        errors.comment = 'Review must be less than 500 characters';
    }

    return errors;
};

/**
 * Validate login form
 * @param {Object} data - Login data
 * @returns {Object} Validation errors
 */
export const validateLogin = (data) => {
    const errors = {};

    if (!data.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Invalid email format';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    return errors;
};

/**
 * Validate registration form
 * @param {Object} data - Registration data
 * @returns {Object} Validation errors
 */
export const validateRegister = (data) => {
    const errors = {};

    if (!data.full_name) {
        errors.full_name = 'Full name is required';
    } else if (!isValidName(data.full_name)) {
        errors.full_name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!data.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Invalid email format';
    }

    if (!data.phone) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Phone number must be 10 digits';
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
    }

    if (data.password !== data.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
    }

    return errors;
};

export default {
    isValidEmail,
    isValidPhone,
    validatePassword,
    isValidName,
    isValidZipCode,
    isValidCardNumber,
    getCardType,
    isValidCVV,
    isValidExpiryDate,
    isValidUPI,
    isValidUrl,
    validateRequired,
    validateAddress,
    validateReview,
    validateLogin,
    validateRegister,
};
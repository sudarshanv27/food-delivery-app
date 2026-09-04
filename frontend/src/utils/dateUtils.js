/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (date, time, datetime, full)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'datetime') => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const formats = {
    date: { year: 'numeric', month: 'short', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    dateLong: { year: 'numeric', month: 'long', day: 'numeric' },
    timeShort: { hour: '2-digit', minute: '2-digit' },
  };
  
  return d.toLocaleDateString('en-US', formats[format] || formats.datetime);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is yesterday
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is yesterday
 */
export const isYesterday = (date) => {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

/**
 * Check if date is this week
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is within current week
 */
export const isThisWeek = (date) => {
  const d = new Date(date);
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
};

/**
 * Check if date is this month
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is within current month
 */
export const isThisMonth = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

/**
 * Check if date is this year
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is within current year
 */
export const isThisYear = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
};

/**
 * Get start of day
 * @param {string|Date} date - Date
 * @returns {Date} Start of day (00:00:00)
 */
export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {string|Date} date - Date
 * @returns {Date} End of day (23:59:59)
 */
export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Get start of week (Monday)
 * @param {string|Date} date - Date
 * @returns {Date} Start of week
 */
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Get end of week (Sunday)
 * @param {string|Date} date - Date
 * @returns {Date} End of week
 */
export const endOfWeek = (date = new Date()) => {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Get start of month
 * @param {string|Date} date - Date
 * @returns {Date} Start of month
 */
export const startOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of month
 * @param {string|Date} date - Date
 * @returns {Date} End of month
 */
export const endOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Get start of year
 * @param {string|Date} date - Date
 * @returns {Date} Start of year
 */
export const startOfYear = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 0, 1);
};

/**
 * Get end of year
 * @param {string|Date} date - Date
 * @returns {Date} End of year
 */
export const endOfYear = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
};

/**
 * Add days to date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Subtract days from date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * Get day difference between two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {number} Number of days difference
 */
export const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get age from birthdate
 * @param {string|Date} birthdate - Birth date
 * @returns {number} Age in years
 */
export const getAge = (birthdate) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Check if date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d < now;
};

/**
 * Check if date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

/**
 * Get time slots for delivery
 * @param {number} intervalMinutes - Interval between slots in minutes
 * @param {number} hoursAhead - Hours to look ahead
 * @returns {Array} Array of time slots
 */
export const getTimeSlots = (intervalMinutes = 30, hoursAhead = 4) => {
  const slots = [];
  const now = new Date();
  const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  let current = new Date(Math.ceil(now.getTime() / (intervalMinutes * 60 * 1000)) * (intervalMinutes * 60 * 1000));
  
  while (current <= endTime) {
    slots.push({
      time: formatDate(current, 'time'),
      timestamp: current.getTime(),
    });
    current = new Date(current.getTime() + intervalMinutes * 60 * 1000);
  }
  
  return slots;
};

/**
 * Parse date string safely
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Date object or null if invalid
 */
export const safeParseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

export default {
  formatDate,
  formatRelativeTime,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  subtractDays,
  daysBetween,
  getAge,
  isPastDate,
  isFutureDate,
  getTimeSlots,
  safeParseDate,
};
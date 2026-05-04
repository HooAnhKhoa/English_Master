/**
 * Format response with standard structure
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object|array} data - Response data
 * @param {object} pagination - Pagination info
 * @returns {object} Formatted response
 */
const formatResponse = (success, message, data = null, pagination = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

/**
 * Calculate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination metadata
 */
const getPagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

/**
 * Generate slug from string
 * @param {string} text - Text to slugify
 * @returns {string} Slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get week number from date
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

/**
 * Calculate time difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Days difference
 */
const daysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
const sanitizeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string
 * @param {any} defaultValue - Default value if parse fails
 * @returns {any} Parsed JSON or default value
 */
const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Chunk array into smaller arrays
 * @param {array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {array} Array of chunks
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Remove duplicates from array
 * @param {array} array - Array with duplicates
 * @returns {array} Array without duplicates
 */
const removeDuplicates = (array) => {
  return [...new Set(array)];
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
const capitalizeFirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Truncate string
 * @param {string} string - String to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated string
 */
const truncate = (string, length = 100) => {
  if (string.length <= length) return string;
  return string.substring(0, length) + '...';
};

module.exports = {
  formatResponse,
  getPagination,
  slugify,
  generateRandomString,
  isValidEmail,
  formatDate,
  getWeekNumber,
  daysDifference,
  sanitizeHtml,
  safeJsonParse,
  delay,
  chunkArray,
  removeDuplicates,
  deepClone,
  isEmptyObject,
  capitalizeFirst,
  truncate,
};

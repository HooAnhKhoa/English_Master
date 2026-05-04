/**
 * Logger utility for consistent logging across the application
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Get timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Log info message
 * @param {string} message - Message to log
 * @param {object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  console.log(
    `${colors.blue}[INFO]${colors.reset} ${getTimestamp()} - ${message}`,
    Object.keys(meta).length > 0 ? meta : ''
  );
};

/**
 * Log success message
 * @param {string} message - Message to log
 * @param {object} meta - Additional metadata
 */
const success = (message, meta = {}) => {
  console.log(
    `${colors.green}[SUCCESS]${colors.reset} ${getTimestamp()} - ${message}`,
    Object.keys(meta).length > 0 ? meta : ''
  );
};

/**
 * Log warning message
 * @param {string} message - Message to log
 * @param {object} meta - Additional metadata
 */
const warn = (message, meta = {}) => {
  console.warn(
    `${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`,
    Object.keys(meta).length > 0 ? meta : ''
  );
};

/**
 * Log error message
 * @param {string} message - Message to log
 * @param {Error|object} error - Error object or metadata
 */
const error = (message, error = {}) => {
  console.error(
    `${colors.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`,
    error instanceof Error ? error.stack : error
  );
};

/**
 * Log debug message (only in development)
 * @param {string} message - Message to log
 * @param {object} meta - Additional metadata
 */
const debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `${colors.magenta}[DEBUG]${colors.reset} ${getTimestamp()} - ${message}`,
      Object.keys(meta).length > 0 ? meta : ''
    );
  }
};

/**
 * Log HTTP request
 * @param {object} req - Express request object
 */
const request = (req) => {
  console.log(
    `${colors.cyan}[REQUEST]${colors.reset} ${getTimestamp()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`
  );
};

module.exports = {
  info,
  success,
  warn,
  error,
  debug,
  request,
};

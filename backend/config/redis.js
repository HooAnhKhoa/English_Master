const Redis = require('ioredis');
require('dotenv').config();

// Redis client configuration
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts
    if (times > 3) {
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
});

// Redis connection events
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err.message);
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

// Helper functions for cache operations
const cache = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed value or null
   */
  async get(key) {
    try {
      if (redisClient.status !== 'ready') return null;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   */
  async set(key, value, ttl = 3600) {
    try {
      if (redisClient.status !== 'ready') return false;
      await redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  },

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      if (redisClient.status !== 'ready') return false;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  },

  /**
   * Delete keys by pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   */
  async delPattern(pattern) {
    try {
      if (redisClient.status !== 'ready') return false;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return false;
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   */
  async exists(key) {
    try {
      if (redisClient.status !== 'ready') return false;
      return await redisClient.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  },

  /**
   * Increment value
   * @param {string} key - Cache key
   */
  async incr(key) {
    try {
      if (redisClient.status !== 'ready') return null;
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Cache incr error:', error.message);
      return null;
    }
  },

  /**
   * Set expiration time
   * @param {string} key - Cache key
   * @param {number} seconds - Expiration time in seconds
   */
  async expire(key, seconds) {
    try {
      if (redisClient.status !== 'ready') return false;
      return await redisClient.expire(key, seconds);
    } catch (error) {
      console.error('Cache expire error:', error.message);
      return false;
    }
  },
};

module.exports = { redisClient, cache };

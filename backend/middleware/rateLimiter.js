const rateLimit = require('express-rate-limit');
const { redisClient } = require('../config/redis');

/**
 * Create rate limiter with Redis store (falls back to memory store if Redis unavailable)
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Too many requests from this IP, please try again later.',
    keyPrefix = 'rate_limit:',
  } = options;

  const limiterConfig = {
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
  };

  // Only use Redis store if Redis is connected
  if (redisClient.status === 'ready') {
    limiterConfig.store = {
      async increment(key) {
        const redisKey = `${keyPrefix}${key}`;
        const current = await redisClient.incr(redisKey);

        if (current === 1) {
          await redisClient.expire(redisKey, Math.ceil(windowMs / 1000));
        }

        return {
          totalHits: current,
          resetTime: new Date(Date.now() + windowMs),
        };
      },
      async decrement(key) {
        const redisKey = `${keyPrefix}${key}`;
        await redisClient.decr(redisKey);
      },
      async resetKey(key) {
        const redisKey = `${keyPrefix}${key}`;
        await redisClient.del(redisKey);
      },
    };
  }
  // Otherwise use default memory store

  return rateLimit(limiterConfig);
};

// General API rate limiter
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  keyPrefix: 'api_limit:',
});

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  keyPrefix: 'auth_limit:',
});

// AI conversation rate limiter
const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many AI requests, please slow down.',
  keyPrefix: 'ai_limit:',
});

// Upload rate limiter
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many upload requests, please try again later.',
  keyPrefix: 'upload_limit:',
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
};

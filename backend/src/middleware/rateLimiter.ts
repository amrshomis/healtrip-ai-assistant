import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: 100 requests per 15 minutes per IP.
 * Prevents abuse of the AI chat endpoint.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Stricter rate limiter for chat endpoint: 30 requests per 15 minutes.
 */
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many chat requests, please try again later.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED',
    },
  },
});

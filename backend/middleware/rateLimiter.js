import rateLimit from "express-rate-limit"


// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  // Login/register can be legitimately repeated during testing and "detection" flows.
  // Skip rate limiting for auth endpoints to avoid locking users out.
  skip: (req) => req.path?.startsWith("/api/auth"),
  message: {
    message: "Too many requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Bot-like behavior limiter
export const botLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 actions per minute
  message: {
    message: "Suspicious activity detected. Slow down."
  }
});

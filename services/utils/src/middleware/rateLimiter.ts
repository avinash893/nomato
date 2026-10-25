import type { Request, Response, NextFunction } from "express";
import { redisClient, isRedisReady } from "../config/redis.js";

interface RateLimiterOptions {
  windowMs?: number; // Time window in milliseconds (default: 60,000ms = 1 min)
  maxRequests?: number; // Max requests allowed per window (default: 30)
  keyPrefix?: string; // Redis key prefix
  message?: string; // Custom error message
}

interface MemoryRecord {
  count: number;
  resetAt: number;
}

// In-memory fallback map when Redis is not active/configured
const memoryStore = new Map<string, MemoryRecord>();

// Clean up expired in-memory records periodically every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 120000);

export const createRateLimiter = (options: RateLimiterOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 30;
  const keyPrefix = options.keyPrefix || "generic";
  const errorMessage =
    options.message ||
    "Too many requests. Please slow down and try again after a brief moment.";

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Determine client identifier (Forwarded IP or Remote Socket)
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : null) ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const key = `ratelimit:${keyPrefix}:${ip}`;

    // 1. Try Redis Rate Limiting
    if (redisClient && isRedisReady()) {
      try {
        const pipeline = redisClient.pipeline();
        pipeline.incr(key);
        pipeline.pttl(key);

        const results = await pipeline.exec();
        if (results && results[0] && results[1]) {
          const [incrErr, countVal] = results[0];
          const [ttlErr, ttlVal] = results[1];

          if (!incrErr && typeof countVal === "number") {
            const currentCount = countVal;
            let currentTtl = typeof ttlVal === "number" ? ttlVal : -1;

            // If key has no expiration set yet, set it now
            if (currentTtl < 0) {
              await redisClient.pexpire(key, windowMs);
              currentTtl = windowMs;
            }

            const remaining = Math.max(0, maxRequests - currentCount);
            const retryAfterSec = Math.ceil(Math.max(currentTtl, 1000) / 1000);

            res.setHeader("X-RateLimit-Limit", maxRequests);
            res.setHeader("X-RateLimit-Remaining", remaining);
            res.setHeader(
              "X-RateLimit-Reset",
              Math.ceil((Date.now() + currentTtl) / 1000)
            );

            if (currentCount > maxRequests) {
              res.setHeader("Retry-After", retryAfterSec);
              res.status(429).json({
                success: false,
                error: errorMessage,
                retryAfter: retryAfterSec,
              });
              return;
            }

            next();
            return;
          }
        }
      } catch (redisErr) {
        console.warn("⚠️ [RateLimiter] Redis operation failed, using in-memory fallback:", redisErr);
      }
    }

    // 2. In-Memory Fallback Rate Limiting
    const now = Date.now();
    let record = memoryStore.get(key);

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + windowMs,
      };
      memoryStore.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const ttlMs = Math.max(0, record.resetAt - now);
    const retryAfterSec = Math.ceil(Math.max(ttlMs, 1000) / 1000);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));

    if (record.count > maxRequests) {
      res.setHeader("Retry-After", retryAfterSec);
      res.status(429).json({
        success: false,
        error: errorMessage,
        retryAfter: retryAfterSec,
      });
      return;
    }

    next();
  };
};

// Specialized Rate Limiters
export const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 25, // 25 queries per minute per IP
  keyPrefix: "chat",
  message: "Too many AI chatbot requests. Please wait a moment before sending another message.",
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: "api",
  message: "API rate limit reached. Please wait a moment before making more requests.",
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: "strict",
  message: "Rate limit exceeded. Please wait a minute.",
});

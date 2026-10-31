import type { Request, Response, NextFunction } from "express";
import { redisClient, isRedisReady } from "../config/redis.js";

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
  message?: string;
}

interface MemoryRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryRecord>();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 120000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

export const createRateLimiter = (options: RateLimiterOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 30;
  const keyPrefix = options.keyPrefix || "auth";
  const errorMessage =
    options.message || "Too many authentication requests. Please try again after a moment.";

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : null) ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const key = `ratelimit:${keyPrefix}:${ip}`;

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
                message: errorMessage,
                retryAfter: retryAfterSec,
              });
              return;
            }

            next();
            return;
          }
        }
      } catch (redisErr) {
        console.warn("⚠️ [Auth RateLimiter] Redis error, using in-memory fallback:", redisErr);
      }
    }

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
        message: errorMessage,
        retryAfter: retryAfterSec,
      });
      return;
    }

    next();
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20, // 20 login/auth attempts per minute per IP
  keyPrefix: "login",
  message: "Too many login attempts. Please wait 1 minute before trying again.",
});

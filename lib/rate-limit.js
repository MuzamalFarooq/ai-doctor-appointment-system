import { LRUCache } from 'lru-cache';
import { prisma } from './prisma.js';

export function rateLimit({ interval = 60000, uniqueTokenPerInterval = 500, limit = 10 } = {}) {
  const tokenCache = new LRUCache({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    check: (token) => {
      const tokenCount = tokenCache.get(token) || 0;
      if (tokenCount >= limit) {
        throw new Error('Rate limit exceeded');
      }
      tokenCache.set(token, tokenCount + 1);
    },
  };
}

export const apiLimiter = rateLimit({ interval: 60000, limit: 60 });
export const authLimiter = rateLimit({ interval: 60000, limit: 10 });
export const aiLimiter = rateLimit({ interval: 60000, limit: 20 });

// In-memory fallback LRU cache for rate limiting (max 1000 keys)
const fallbackCache = new LRUCache({
  max: 1000,
  ttl: 15 * 60 * 1000, // 15 minutes default
});

// Circuit-breaker flag if DB is unreachable to avoid blocking requests
let isDbUnreachable = false;
let lastDbCheck = 0;

function withTimeout(promise, ms = 1000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Rate limiter DB timeout')), ms)
    ),
  ]);
}

/**
 * Shared rate limiter suitable for serverless / multi-instance production.
 * Backed by MongoDB via Prisma RateLimit model, with automatic in-memory fallback.
 * 
 * @param {Object} options
 * @param {string} options.key - Unique rate-limit identifier (e.g. 'forgot-pw:ip:1.2.3.4')
 * @param {number} options.limit - Max requests allowed within the window
 * @param {number} options.windowMs - Time window in milliseconds
 * @returns {Promise<{ success: boolean, remaining: number, resetTime: Date }>}
 */
export async function checkPersistentRateLimit({ key, limit = 5, windowMs = 15 * 60 * 1000 }) {
  const now = new Date();

  // 1. Fast path: check in-memory cache
  const cached = fallbackCache.get(key);
  if (cached && cached.expiresAt > now && cached.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: cached.expiresAt,
    };
  }

  // 2. Persistent storage in MongoDB (with circuit breaker & timeout)
  const shouldTryDb = !isDbUnreachable || Date.now() - lastDbCheck > 30000;

  if (shouldTryDb) {
    try {
      const result = await withTimeout(
        (async () => {
          const existing = await prisma.rateLimit.findUnique({
            where: { key },
          });

          if (existing && existing.expiresAt > now) {
            if (existing.count >= limit) {
              fallbackCache.set(key, { count: existing.count, expiresAt: existing.expiresAt });
              return {
                success: false,
                remaining: 0,
                resetTime: existing.expiresAt,
              };
            }

            const updated = await prisma.rateLimit.update({
              where: { key },
              data: { count: { increment: 1 } },
            });

            fallbackCache.set(key, { count: updated.count, expiresAt: updated.expiresAt });
            return {
              success: true,
              remaining: Math.max(0, limit - updated.count),
              resetTime: updated.expiresAt,
            };
          }

          // New window or expired record
          const expiresAt = new Date(now.getTime() + windowMs);
          await prisma.rateLimit.upsert({
            where: { key },
            create: {
              key,
              count: 1,
              expiresAt,
            },
            update: {
              count: 1,
              expiresAt,
            },
          });

          fallbackCache.set(key, { count: 1, expiresAt });
          return {
            success: true,
            remaining: limit - 1,
            resetTime: expiresAt,
          };
        })(),
        1000
      );

      // DB success - reset circuit breaker
      isDbUnreachable = false;
      return result;
    } catch (err) {
      // Mark DB as unreachable for 30 seconds
      isDbUnreachable = true;
      lastDbCheck = Date.now();
    }
  }

  // Fallback to in-memory LRU
  if (cached && cached.expiresAt > now) {
    if (cached.count >= limit) {
      return { success: false, remaining: 0, resetTime: cached.expiresAt };
    }
    cached.count += 1;
    fallbackCache.set(key, cached);
    return { success: true, remaining: limit - cached.count, resetTime: cached.expiresAt };
  }

  const expiresAt = new Date(now.getTime() + windowMs);
  fallbackCache.set(key, { count: 1, expiresAt });
  return { success: true, remaining: limit - 1, resetTime: expiresAt };
}

/**
 * Extract client IP from request headers safely.
 */
export function getClientIp(req) {
  const forwarded = req.headers?.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers?.get?.('x-real-ip') || req.headers?.['x-real-ip'];
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

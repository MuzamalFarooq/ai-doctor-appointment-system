import { LRUCache } from 'lru-cache';

const rateLimiters = new Map();

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

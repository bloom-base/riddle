/**
 * Cache Middleware
 * Provides caching functionality for Express endpoints
 * Checks Redis cache before executing handler and stores result
 */

import { Request, Response, NextFunction } from 'express';
import { getCached, setCached, isRedisConnected } from '../utils/redisClient.js';

/**
 * Create a cache middleware factory for GET endpoints
 * @param ttlSeconds - Time to live in seconds
 * @param keyGenerator - Function to generate cache key from request
 */
export function cacheMiddleware(
  ttlSeconds: number,
  keyGenerator: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if Redis is not connected
    if (!isRedisConnected()) {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      console.log(`🔍 Checking cache for: ${cacheKey}`);

      // Try to get from cache
      const cachedData = await getCached(cacheKey);
      if (cachedData) {
        console.log(`✅ Cache hit for: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache miss for: ${cacheKey}`);

      // Store original res.json to intercept the response
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response before sending
      res.json = function (data: any) {
        // Cache the response
        setCached(cacheKey, data, ttlSeconds).catch((err) => {
          console.error(`Error caching response for ${cacheKey}:`, err);
        });

        // Send the original response
        return originalJson(data);
      } as any;

      next();
    } catch (error) {
      console.error('Error in cache middleware:', error);
      // On error, just continue without caching
      next();
    }
  };
}

/**
 * Create a simple cache key from request parameters
 */
export function createDateCacheKey(prefix: string) {
  return (req: Request): string => {
    const { date } = req.params;
    const queryStr = Object.keys(req.query)
      .sort()
      .map((k) => `${k}=${req.query[k]}`)
      .join('&');

    const key = `${prefix}:${date || 'today'}${queryStr ? `:${queryStr}` : ''}`;
    return key;
  };
}

/**
 * Cache key generator for leaderboard endpoint
 * Format: leaderboard:{date}:{limit}
 */
export function leaderboardCacheKey(req: Request): string {
  const { date } = req.params;
  const limit = req.query.limit || '20';
  return `leaderboard:${date}:${limit}`;
}

/**
 * Cache key generator for riddle endpoint
 * Format: riddle:{date}
 */
export function riddleCacheKey(req: Request): string {
  const { date } = req.params;
  return `riddle:${date || 'today'}`;
}

/**
 * Cache key generator for stats endpoint
 * Format: stats:{date}
 */
export function statsCacheKey(req: Request): string {
  const { date } = req.params;
  return `stats:${date}`;
}

/**
 * Cache key generator for puzzle endpoint
 * Format: puzzle:{date}
 */
export function puzzleCacheKey(req: Request): string {
  const { date } = req.params;
  return `puzzle:${date || 'today'}`;
}

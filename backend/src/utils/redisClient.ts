/**
 * Redis Client Module
 * Manages Redis connection and provides cache utility methods
 */

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Initialize and connect to Redis
 */
export async function initializeRedis(): Promise<RedisClientType | null> {
  try {
    // Check if Redis is available via environment variable
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      console.warn('⚠️  REDIS_URL not configured. Cache will be disabled.');
      return null;
    }

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis reconnection failed after 10 attempts');
            return new Error('Redis max retries exceeded');
          }
          return retries * 100;
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis Client Ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null;
}

/**
 * Get value from cache
 */
export async function getCached<T = any>(key: string): Promise<T | null> {
  if (!redisClient) return null;

  try {
    const value = await redisClient.get(key);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function setCached(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
  if (!redisClient) return false;

  try {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCached(key: string): Promise<boolean> {
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple values from cache (by pattern or specific keys)
 */
export async function deleteCachedByPattern(pattern: string): Promise<number> {
  if (!redisClient) return 0;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;

    return await redisClient.del(keys);
  } catch (error) {
    console.error(`Error deleting cache pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    console.log('Redis disconnected');
  }
}

# Redis Caching Layer Documentation

## Overview

This document describes the Redis caching layer implementation for the Riddle backend API. The caching layer is designed to reduce database load and improve response times for high-traffic endpoints by caching frequently accessed data.

## Architecture

### Components

1. **Redis Client Module** (`backend/src/utils/redisClient.ts`)
   - Manages Redis connection lifecycle
   - Provides utility methods for cache operations (get, set, delete, pattern delete)
   - Handles connection errors gracefully
   - Supports graceful shutdown

2. **Cache Middleware** (`backend/src/middleware/cacheMiddleware.ts`)
   - Provides middleware factory for Express endpoints
   - Intercepts GET requests to check Redis cache
   - Caches successful responses before sending to client
   - Supports configurable TTL and custom cache key generation

3. **Endpoint Integration** (`backend/src/index.ts`)
   - Integrates cache middleware with specific endpoints
   - Implements cache invalidation on write operations
   - Initializes Redis on server startup

## Cached Endpoints

### 1. GET /api/riddle (Hot Endpoint ⭐)
- **TTL**: 24 hours (86400 seconds)
- **Cache Key**: `riddle:{date}`
- **Use Case**: Daily riddles are deterministic and don't change per date
- **Description**: Returns the daily riddle for a given date

**Example Cache Key**: `riddle:2024-04-21`

### 2. GET /api/riddle/:date (Hot Endpoint ⭐)
- **TTL**: 24 hours (86400 seconds)
- **Cache Key**: `riddle:{date}`
- **Use Case**: Same as above, for any date
- **Description**: Returns the riddle for a specific date

### 3. GET /api/leaderboard/:date (Hot Endpoint ⭐)
- **TTL**: 5 minutes (300 seconds)
- **Cache Key**: `leaderboard:{date}:{limit}`
- **Use Case**: Leaderboards are accessed frequently but update with each submission
- **Description**: Returns the top scores for a given date
- **Query Parameters**: `limit` (1-100, default: 20)

**Example Cache Keys**:
- `leaderboard:2024-04-21:20` (default limit)
- `leaderboard:2024-04-21:50` (custom limit)

## Cache Invalidation

Cache is automatically invalidated when write operations occur:

### POST /api/leaderboard/submit
When a user submits a leaderboard entry:
1. All leaderboard cache entries for that date are deleted: `leaderboard:{date}:*`
2. Stats cache for that date is deleted: `stats:{date}`
3. The new entry is recorded and fresh data is returned

**Cache Invalidation Example**:
```
User submits to 2024-04-21
→ Cache invalidates: leaderboard:2024-04-21:*
→ Cache invalidates: stats:2024-04-21
→ Next GET /api/leaderboard/2024-04-21 will fetch fresh data
```

## Configuration

### Environment Variables

Set the following environment variable to enable Redis caching:

```bash
REDIS_URL=redis://localhost:6379
# or for Redis Cloud
REDIS_URL=rediss://user:password@host:port
```

**Default Behavior**: If `REDIS_URL` is not set, Redis is optional and caching is disabled. The API continues to work without caching.

### Graceful Degradation

The caching layer is designed to be optional:
- If Redis is unavailable, requests bypass the cache and continue normally
- Connection errors are logged but don't crash the server
- The API remains fully functional without Redis

## Performance Impact

### Expected Benefits

1. **Riddle Endpoints** (GET /api/riddle)
   - Cached responses served in <1ms (vs ~5-10ms for computation)
   - 10-100x faster for cache hits
   - Nearly all requests are cache hits (same riddle all day)

2. **Leaderboard Endpoint** (GET /api/leaderboard/:date)
   - Cached responses served in <1ms (vs ~10-20ms for sorting/filtering)
   - 5-10x faster for cache hits
   - Cache hit rate: ~95% (refreshes every 5 minutes)

3. **Overall System**
   - Reduced CPU usage on main thread
   - Lower database load (if using persistent storage)
   - Better user experience with faster API responses

### Metrics to Monitor

- Cache hit/miss ratio
- Redis connection stability
- Response time percentiles (p50, p95, p99)
- Memory usage in Redis
- API response times with/without cache

## Cache Key Naming Convention

All cache keys follow a consistent naming pattern:

```
{endpoint}:{date}[:{additional_params}]
```

Examples:
- `riddle:2024-04-21`
- `leaderboard:2024-04-21:20`
- `stats:2024-04-21`
- `puzzle:2024-04-21`

This convention allows for:
- Easy pattern-based invalidation
- Clear cache key identification
- Easy debugging and monitoring

## Example Usage

### Development (without Redis)

```bash
# Redis is optional - app works fine without it
npm run dev  # No REDIS_URL set → caching disabled
```

### Production (with Redis)

```bash
# Set Redis URL
export REDIS_URL=redis://redis-service:6379

# Start the app
npm start
# Output will show: "💾 Redis Cache Layer: ✅ Enabled"
```

### Monitoring Cache Operations

The application logs cache operations:

```
✅ Cache hit for: riddle:2024-04-21
❌ Cache miss for: leaderboard:2024-04-21:20
🗑️  Cache invalidated for leaderboard and stats on 2024-04-21
```

## Testing

### Unit Tests

All existing tests pass with the new caching layer:
```bash
npm run test:run
# ✓ 48 tests passed
```

### Manual Testing

1. **Test Cache Hit**:
   ```bash
   curl http://localhost:3001/api/riddle
   # First request: cache miss, slower response
   # Second request: cache hit, faster response
   ```

2. **Test Cache Invalidation**:
   ```bash
   # Submit to leaderboard
   curl -X POST http://localhost:3001/api/leaderboard/submit \
     -H "Content-Type: application/json" \
     -d '{"date":"2024-04-21","username":"test","completionTime":5000}'

   # Check logs for "Cache invalidated" message
   # Next leaderboard request will fetch fresh data
   ```

3. **Test Graceful Degradation**:
   ```bash
   # Stop Redis
   # API continues to work normally
   # Logs show: "Cache will be disabled"
   ```

## Future Improvements

1. **Additional Cached Endpoints**
   - GET /api/stats/:date (stats cache)
   - GET /api/puzzle/:date (puzzle cache)
   - GET /api/leaderboard/:date/user/:username (user-specific cache)

2. **Cache Warm-up**
   - Pre-populate cache for today's and previous days' riddles
   - Pre-populate leaderboard cache on server startup

3. **Advanced Invalidation**
   - Implement cache versioning
   - Add manual cache flush endpoints for admin use
   - Cache dependencies and smart invalidation

4. **Monitoring**
   - Add metrics for cache hit/miss ratios
   - Track Redis memory usage
   - Add Prometheus-style metrics endpoint

5. **Configuration**
   - Make TTL values configurable per endpoint
   - Add feature flags for enabling/disabling specific caches
   - Support multiple cache backends (Memcached, etc.)

## Troubleshooting

### Redis Connection Issues

**Problem**: Logs show "Failed to initialize Redis"
```
⚠️  REDIS_URL not configured. Cache will be disabled.
```

**Solution**: Set the `REDIS_URL` environment variable

### Cache Not Working

**Problem**: Cache hits not happening
```
❌ Cache miss for: riddle:2024-04-21
```

**Solution**:
1. Check Redis is running: `redis-cli ping` → should return "PONG"
2. Check REDIS_URL is correct
3. Verify network connectivity to Redis server

### Memory Issues

**Problem**: Redis memory usage growing

**Solution**:
1. Reduce TTL values for high-traffic endpoints
2. Monitor cache key patterns with `redis-cli KEYS *`
3. Implement cache eviction policies in Redis config

## References

- [Redis Documentation](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Cache Invalidation Strategies](https://en.wikipedia.org/wiki/Cache_invalidation)

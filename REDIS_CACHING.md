# Redis Caching Layer - Enhancement Guide

This document outlines the improvements made to the Redis caching implementation for the Riddle backend.

## Recent Enhancements (This PR)

### 1. Connection Timeout (5 seconds)

**Problem Solved:**
- When Redis is unavailable, the client would hang indefinitely waiting for the OS socket timeout (2-3 minutes)
- This caused test suites to timeout and application startup to be extremely slow

**Solution:**
- Added `connectTimeout: 5000` to the socket configuration
- Now fails fast in 5 seconds instead of 2-3 minutes
- Allows graceful degradation to activate immediately

```typescript
socket: {
  connectTimeout: 5000, // Fast failure instead of OS timeout
  reconnectStrategy: (retries) => {
    // ... reconnection logic
  }
}
```

### 2. Idempotent Initialization

**Problem Solved:**
- Application calls `initializeRedis()` on startup
- Tests also call it in `beforeAll`
- Concurrent calls created race conditions and corrupted global state

**Solution:**
- Added `initialized` flag to guard against multiple calls
- First call initializes, subsequent calls return immediately
- Safe for concurrent initialization from different parts of the code

```typescript
let initialized = false;

export async function initializeRedis(): Promise<RedisClientType | null> {
  if (initialized) {
    return redisClient;
  }
  initialized = true;
  // ... rest of initialization
}
```

### 3. Improved Disconnect Handling

**Problem Solved:**
- `disconnectRedis()` could hang when quit() fails on stuck connections

**Solution:**
- Added 2-second timeout to the quit operation
- Uses Promise.race() to enforce timeout
- Graceful error handling with try-finally ensures cleanup always happens

```typescript
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      const quitPromise = redisClient.quit();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Quit timeout')), 2000)
      );
      await Promise.race([quitPromise, timeoutPromise]);
    } catch (error) {
      console.warn('Error disconnecting from Redis:', error);
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
}
```

## Existing Implementation Features

The existing Redis caching layer (from PR #44) provides:

### Cached Endpoints

- **GET /api/puzzle** - 24-hour cache (deterministic content)
- **GET /api/puzzle/:date** - 24-hour cache
- **GET /api/riddle** - 24-hour cache (deterministic content)
- **GET /api/riddle/:date** - 24-hour cache
- **GET /api/leaderboard/:date** - 5-minute cache (updates when new submissions arrive)
- **GET /api/stats/:date** - 5-minute cache (derived from leaderboard)

### Cache Invalidation

- **POST /api/leaderboard/submit** - Automatically invalidates leaderboard and stats cache for the date

### Middleware Pattern

Uses a flexible `cacheMiddleware` factory:

```typescript
app.get('/api/leaderboard/:date',
  cacheMiddleware(300, leaderboardCacheKey),
  (req: Request, res: Response) => {
    // Handler logic
  }
);
```

## Configuration

### Environment Variables

```bash
# Production (Fly.io)
REDIS_URL=redis://username:password@redis-host:6379/0

# Local development (optional)
REDIS_URL=redis://localhost:6379
```

**Note:** If `REDIS_URL` is not set, caching is disabled and the application continues to function normally.

## Performance Impact

### Response Times
- **Cache Hit**: <1ms (Redis lookup + JSON parsing)
- **Cache Miss**: Same as non-cached endpoint (5-15ms depending on operation)
- **Expected improvement**: 5-10x faster for high-traffic endpoints during peak usage

### Cache Hit Rate Expectations
- Puzzle endpoints: 95%+ (same content throughout the day)
- Riddle endpoints: 95%+ (same content throughout the day)
- Leaderboard endpoints: 70-80% (decreases after new submissions)
- Stats endpoints: 70-80% (updates with leaderboard)

## Monitoring

### Check Cache Status

```bash
# View all cache keys
redis-cli KEYS "*"

# Check specific entry
redis-cli GET "puzzle:date=2024-04-21"

# Monitor in real-time
redis-cli MONITOR

# View memory usage
redis-cli INFO memory
```

### Clear Cache (if needed)

```bash
# Clear all cache
redis-cli FLUSHDB

# Clear specific pattern
redis-cli DEL "leaderboard:*"
redis-cli DEL "puzzle:*"
redis-cli DEL "riddle:*"
```

## Deployment

### Fly.io Setup

```bash
# Provision Redis add-on
fly redis create --app riddle

# Get the Redis URL
fly config show --app riddle | grep REDIS_URL

# Set the environment variable
fly secrets set REDIS_URL="redis://..." --app riddle

# Deploy
fly deploy --app riddle
```

### Docker/Local Development

```bash
# Start Redis (Docker)
docker run -d -p 6379:6379 redis:7-alpine

# Or install locally
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# Start Redis
redis-server
```

## Testing

### Quick Test

```bash
# In one terminal, monitor Redis operations
redis-cli MONITOR

# In another terminal, call an endpoint multiple times
curl http://localhost:3001/api/puzzle
curl http://localhost:3001/api/puzzle  # Should be a cache hit

# Check cache keys
redis-cli KEYS "*"
```

### Running Tests

```bash
# Run backend tests
npm run test:backend

# Tests automatically skip Redis-specific operations if Redis is unavailable
```

## Troubleshooting

### Redis Connection Issues

If the application logs `REDIS_URL not configured`:
1. Set the environment variable: `export REDIS_URL=redis://localhost:6379`
2. Restart the application

If Redis is unavailable:
- The application will gracefully continue without caching
- Log messages will indicate cache operations are disabled
- All endpoints continue to work normally

### Slow Tests

If tests are slow (>10 seconds):
1. Check if Redis is running: `redis-cli ping` should return `PONG`
2. If not running, start Redis
3. Tests will be skipped if Redis is unavailable (should complete in <1 second)

### Memory Issues

If Redis memory grows too large:

```bash
# Check memory usage
redis-cli INFO memory

# Set memory limit and eviction policy
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Future Enhancements

1. **Cache warming** - Pre-populate cache for today's puzzle/riddle on startup
2. **Cache API** - Expose `/api/cache/stats` endpoint for monitoring
3. **Smart TTLs** - Adjust TTL based on request patterns
4. **Distributed caching** - Redis Sentinel for high availability
5. **Cache versioning** - Invalidate cache when code changes

## References

- [Redis Official Documentation](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
- [Express.js Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Fly.io Redis Add-on](https://fly.io/docs/reference/redis/)

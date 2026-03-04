# Deployment Build Test

## Purpose
Verify that the Dockerfile is correctly structured for the workspace monorepo.

## Test Checklist

### Dockerfile Structure
- [x] Uses multi-stage build (builder + runtime)
- [x] Based on node:20-alpine (required for lockfileVersion 3)
- [x] Installs backend dependencies separately
- [x] Installs frontend dependencies separately
- [x] Uses memory-optimized npm flags (--no-audit --prefer-offline)
- [x] Builds backend with TypeScript (tsc)
- [x] Builds frontend with Vite
- [x] Copies built artifacts to runtime image
- [x] Exposes correct ports (3000, 3001)
- [x] Starts both frontend and backend services

### Build Process
- Backend dependencies installed in /app/backend
- Frontend dependencies installed in /app/frontend
- No workspace-level dependency resolution (avoids memory issues)
- Each workspace builds independently

### Runtime Image
- Minimal alpine image
- Contains only necessary artifacts:
  - backend/dist (compiled TypeScript)
  - backend/node_modules (production dependencies)
  - frontend/dist (built Vite app)
- Uses 'serve' for static frontend hosting
- Backend runs with Node.js

## Expected Behavior
When deployed to Fly.io with `--remote-only`:
1. Builder stage installs backend dependencies
2. Builder stage compiles backend TypeScript
3. Builder stage installs frontend dependencies
4. Builder stage builds frontend with Vite
5. Runtime stage copies artifacts
6. Application starts successfully with both services

## Memory Optimization
The separation of workspace installations prevents npm from attempting to resolve all dependencies simultaneously, which was causing out-of-memory errors in the previous configuration.

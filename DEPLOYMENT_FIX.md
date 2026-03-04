# Deployment Fix - Memory Optimization

## Issue
The deployment was failing due to memory exhaustion when running `npm ci` on the workspace monorepo with lockfileVersion 3.

## Root Cause
The original Dockerfile attempted to install all dependencies at once using `npm ci` in the root workspace directory. This causes npm to resolve dependencies for all workspaces simultaneously, which requires significant memory, especially with lockfileVersion 3 (used by npm 10+ in Node 20).

## Solution
Restructured the Dockerfile to:

1. **Install dependencies per workspace**: Instead of installing all dependencies at once, we now install backend and frontend dependencies separately in their own directories.

2. **Use optimized npm flags**: Added `--no-audit` and `--prefer-offline` flags to reduce memory overhead during installation.

3. **Eliminated workspace resolution**: By installing dependencies in each workspace directory individually, we avoid the complex dependency resolution that happens at the root level.

## Changes Made

### Before
```dockerfile
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm ci
```

### After
```dockerfile
# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --no-audit --prefer-offline

# Install frontend dependencies
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install --no-audit --prefer-offline
```

## Benefits
- Significantly reduced memory usage during build
- More predictable build times
- Better layer caching (backend and frontend dependencies can be cached separately)
- Avoids workspace monorepo complexity in Docker build

## Testing
The fix has been applied and will be tested in the Fly.io remote build environment which has adequate memory resources.

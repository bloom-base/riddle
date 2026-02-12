# Deployment Guide

This document describes how to deploy the Riddle application.

## Quick Deploy to Fly.io

The fastest way to get Riddle live:

```bash
# 1. Authenticate with Fly
flyctl auth login

# 2. Deploy
flyctl deploy

# Done! Your app is live at https://riddle-game.fly.dev
```

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Local Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment (optional):
```bash
cp backend/.env.example backend/.env
```

3. Start development servers:
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Building for Production

### Build both frontend and backend:
```bash
npm run build
```

### Build individually:
```bash
# Frontend only
npm run build:frontend
# Output: frontend/dist/

# Backend only
npm run build:backend
# Output: backend/dist/
```

## Docker Deployment

### Build Docker image:
```bash
docker build -t riddle .
```

### Run container:
```bash
docker run -p 3000:3000 -p 3001:3001 riddle
```

## Environment Variables

### Backend (.env or .env.production)
```
PORT=3001
NODE_ENV=production
```

The `.env.production` file is included for production deployments.

## Production Deployment Checklist

- [x] Build frontend and backend successfully
- [x] Backend tests pass (31 tests)
- [x] Docker image builds successfully
- [x] CORS configured for cross-origin requests
- [x] Health check endpoints available
- [x] NODE_ENV=production configured
- [ ] Deploy to Fly.io (see DEPLOYMENT_GUIDE.md)
- [ ] Verify live URL is accessible
- [ ] Test API endpoints on live server
- [ ] Monitor application logs and metrics

## Performance Optimization

### Frontend
- Built with Vite for optimized production builds
- CSS is minified (16.97 kB → 3.75 kB gzipped)
- JavaScript is minified and tree-shaken (155.45 kB → 49.45 kB gzipped)
- Source maps disabled in production build

### Backend
- Express server is lightweight and fast
- Puzzle generation uses deterministic seeding for consistency
- API responses are JSON optimized

## Monitoring

Monitor these key endpoints:
- `GET /api/health` - Health check (should return 200)
- `GET /api/puzzle` - Daily puzzle generation
- `POST /api/validate` - Match validation
- `POST /api/leaderboard/submit` - Leaderboard submissions

## Architecture

The deployment uses a multi-stage Docker build:

1. **Builder Stage**: Installs dependencies and builds both frontend and backend
2. **Runtime Stage**: Lightweight Alpine Linux with only production dependencies
3. **Service Startup**: Serves frontend on port 3000, backend API on port 3001

## Troubleshooting

### Frontend won't connect to backend
- Ensure backend is running on correct port (3001)
- Check CORS configuration in backend
- Verify API endpoints in frontend fetch calls

### Slow puzzle loading
- Check network tab for API latency
- Verify backend is not hitting resource limits
- Check puzzle generation performance

### Deployment fails
- Check Fly.io logs: `flyctl logs`
- Verify fly.toml configuration
- Ensure all required environment variables are set

## Scaling Considerations

For high traffic:
- Use `flyctl scale vm` to upgrade machine type
- Use `flyctl scale count` for horizontal scaling
- Implement database for persistent leaderboards (future)
- Add Redis for session caching (future)
- Implement rate limiting on validation endpoints (future)

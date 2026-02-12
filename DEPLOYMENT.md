# Deployment Guide

This document describes how to deploy the Riddle application.

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

### Backend (.env)
```
PORT=3001
NODE_ENV=production
```

## Running Tests Before Deployment

### All tests:
```bash
npm test
```

### Backend tests:
```bash
npm run test:backend
```

### Frontend tests:
```bash
npm run test:frontend
```

## Production Deployment Checklist

- [ ] Run all tests and ensure they pass
- [ ] Build frontend and backend
- [ ] Verify no console errors in frontend
- [ ] Test API endpoints with sample requests
- [ ] Check responsive design on mobile devices
- [ ] Verify daily puzzle rotation works correctly
- [ ] Set up monitoring/logging
- [ ] Configure CORS if frontend and backend are on different domains
- [ ] Set NODE_ENV=production in backend

## Performance Optimization

### Frontend
- Built with Vite for optimized production builds
- CSS is minified
- JavaScript is minified and tree-shaken
- Source maps disabled in production

### Backend
- Express server is lightweight
- Puzzle generation is cached per day
- Validation is instant on server side

## Monitoring

Monitor these endpoints:
- `GET /api/health` - Health check (should return 200)
- `POST /api/validate` - Validation latency should be <50ms
- Error logs for failed puzzle generations

## Troubleshooting

### Frontend won't connect to backend
- Ensure backend is running on correct port (3001)
- Check CORS configuration in backend
- Verify API proxy in vite.config.ts

### Slow puzzle loading
- Check network tab for API latency
- Ensure backend is not CPU-bound
- Verify quotes data is loading properly

### Tests failing after deployment
- Run `npm test:run` to check test status
- Verify environment variables are set
- Check database connectivity (if added in future)

## Scaling Considerations

For high traffic:
- Add load balancer for backend instances
- Implement puzzle caching for popular dates
- Consider CDN for frontend assets
- Add database for user persistence (future feature)
- Implement rate limiting on /api/validate endpoint

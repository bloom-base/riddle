# Riddle Deployment Guide

This guide explains how to deploy the Riddle application to production using Docker and Fly.io.

## Prerequisites

- [Fly CLI](https://fly.io/docs/getting-started/installing-flyctl/) installed and authenticated
- Docker installed (for local testing)
- Git repository configured

## Quick Start (Fly.io)

### 1. Authenticate with Fly

```bash
flyctl auth login
```

### 2. Create a Fly app

```bash
flyctl launch
```

This will prompt you to configure your app. The `fly.toml` file has been pre-configured, so you can accept most defaults.

### 3. Set environment variables

```bash
flyctl secrets set NODE_ENV=production PORT=3001
```

### 4. Deploy

```bash
flyctl deploy
```

Your app will be live at: `https://riddle-game.fly.dev`

## Manual Deployment Steps

### Build the Docker Image

```bash
docker build -t riddle:latest .
```

### Test Locally

```bash
docker run -p 3000:3000 -p 3001:3001 riddle:latest
```

Then visit http://localhost:3000 in your browser.

### Deploy to Fly.io

```bash
# If first time
flyctl launch

# For subsequent deployments
flyctl deploy
```

## Production Configuration

### Environment Variables

The following environment variables are set in `fly.toml`:

- `PORT`: Backend API port (default: 3001)
- `NODE_ENV`: Set to `production` for optimizations
- `CORS_ORIGIN`: Frontend URL (auto-configured on Fly.io)

### Health Checks

The deployment includes health checks for both services:

- **Frontend**: HTTP check on port 3000 at `/` (interval: 10s)
- **Backend API**: HTTP check on port 3001 at `/api/health` (interval: 10s)

If a service fails health checks, the machine will be automatically restarted.

## Application Architecture

The deployed application runs two services:

1. **Frontend** (Port 3000)
   - React + Vite built static files
   - Served via `serve`
   - Handles UI and user interactions

2. **Backend API** (Port 3001)
   - Express.js server
   - Handles puzzle generation, validation, and leaderboards
   - RESTful API endpoints

Both services run in a single Docker container, coordinated via a shell script.

## Scaling

For high traffic scenarios:

### Vertical Scaling
```bash
flyctl scale vm shared-cpu-1x
```

### Horizontal Scaling (multiple machines)
```bash
flyctl scale count 3
```

### Persistent Data
The `fly.toml` includes a mounted volume for future database use:
```
[[mounts]]
  source = "riddle_data"
  destination = "/data"
```

## Monitoring

### View Logs

```bash
flyctl logs
```

### Monitor Metrics

```bash
flyctl status
```

### SSH into the machine

```bash
flyctl ssh console
```

## Troubleshooting

### App won't start

Check logs:
```bash
flyctl logs --follow
```

Look for:
- Port conflicts
- Missing environment variables
- Module not found errors

### Slow responses

Check machine resources:
```bash
flyctl status
```

Consider upgrading machine type or scaling horizontally.

### CORS issues

Frontend requests to backend should work automatically since both are on the same domain. If issues persist:

1. Check backend CORS configuration in `backend/src/index.ts`
2. Verify API URLs in frontend fetch calls

## Rollback

To rollback to a previous version:

```bash
flyctl releases
flyctl releases rollback
```

## CI/CD Integration

To set up automatic deployments on git push, configure GitHub Actions or similar:

```yaml
# Example GitHub Actions workflow
name: Deploy to Fly
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions@1.4
        with:
          args: "deploy"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Performance Optimization

The deployed app includes:

- Vite production build (minified JS/CSS)
- Frontend served statically with gzip compression
- Backend runs with NODE_ENV=production
- Health checks prevent unhealthy instances from serving traffic

## Support & Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Riddle README](./README.md)
- [Twitch Integration Guide](./TWITCH_INTEGRATION.md)

---

**Deployed at**: https://riddle-game.fly.dev (once launched)

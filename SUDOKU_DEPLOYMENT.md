# Sudoku Demo Deployment Guide

Deploy the 3×3 Sudoku puzzle game as a standalone demo to Fly.io with a dedicated URL.

## Quick Start

Deploy the Sudoku demo in one command:

```bash
# 1. Install Fly CLI (if not already installed)
# Visit https://fly.io/docs/getting-started/installing-flyctl/

# 2. Authenticate with Fly.io
flyctl auth login

# 3. Deploy Sudoku to separate URL
flyctl deploy --config fly.sudoku.toml --app sudoku-demo

# Your app will be live at: https://sudoku-demo.fly.dev
```

## Overview

The Sudoku demo is a **standalone deployment** of the 3×3 Sudoku puzzle game, separate from the main Riddle platform at `riddle-game.fly.dev`.

### Features

- **Daily Puzzle Generation**: New 3×3 Sudoku puzzle every day
- **Deterministic Daily Rotation**: Same puzzle for all users on the same day
- **Beautiful UI**: Clean, responsive interface optimized for desktop and mobile
- **Real-time Validation**: Instant feedback on correct/incorrect entries
- **Hint System**: Fill random empty cells with correct numbers
- **Leaderboard**: Compete with other players, track fastest solvers
- **Countdown Timer**: Shows time until next daily puzzle reset

## Architecture

The Sudoku demo runs **both frontend and backend in a single container**:

- **Frontend**: React 18 + TypeScript (served on port 3000)
- **Backend**: Express.js + TypeScript (API on port 3001)
- **Database**: In-memory leaderboard (ephemeral, resets on restart)

### File Structure

```
riddle/
├── Dockerfile.sudoku          # Multi-stage Docker build for Sudoku
├── fly.sudoku.toml            # Fly.io configuration for Sudoku
├── backend/
│   └── src/
│       └── services/
│           ├── sudokuService.ts       # Sudoku logic
│           └── sudokuService.test.ts  # Tests
├── frontend/
│   ├── sudoku.html            # Sudoku app entry point
│   ├── src/
│   │   ├── SudokuApp.tsx       # Main Sudoku app component
│   │   └── components/
│   │       ├── SudokuPuzzle.tsx        # Puzzle component
│   │       └── SudokuPuzzle.css        # Puzzle styling
│   └── vite.config.ts         # Multi-entry build configuration
```

## How It Works

### Daily Puzzle Generation

1. **Deterministic Seeding**: Date string (YYYY-MM-DD) is hashed to create a seed
2. **Backtracking Algorithm**: Generates valid 3×3 Sudoku solution
3. **Cell Removal**: Removes 4-5 cells to create the puzzle
4. **Same Daily Puzzle**: All users see the same puzzle for the same day

### Game Flow

1. User opens the Sudoku app at `https://sudoku-demo.fly.dev`
2. Frontend requests today's puzzle from `/api/sudoku/puzzle`
3. User enters numbers into empty cells
4. Real-time validation against stored solution
5. Completion triggers `/api/sudoku/validate` endpoint
6. Leaderboard submission to `/api/sudoku/leaderboard/submit`

### API Endpoints

The backend provides these Sudoku-specific endpoints:

```
GET  /api/sudoku/puzzle/:date?              - Get Sudoku puzzle for date
GET  /api/sudoku/solution/:date?            - Get solution (for validation)
POST /api/sudoku/validate                   - Validate user's solution
POST /api/sudoku/leaderboard/submit         - Submit completion time
GET  /api/sudoku/leaderboard/:date          - Get leaderboard for date
```

## Deployment Options

### Option 1: Deploy to Fly.io (Recommended)

Fastest and simplest for production:

```bash
# Deploy with custom app name
flyctl deploy --config fly.sudoku.toml --app sudoku-demo

# Deploy with different name
flyctl deploy --config fly.sudoku.toml --app my-sudoku-app

# View logs
flyctl logs --app sudoku-demo

# Scale machines
flyctl scale count 3 --app sudoku-demo

# SSH into machine
flyctl ssh console --app sudoku-demo
```

### Option 2: Deploy to Fly.io (with modifications)

To deploy to a different Fly.io app name:

1. Edit `fly.sudoku.toml`:
   ```toml
   app = "my-custom-sudoku-name"
   ```

2. Deploy:
   ```bash
   flyctl deploy --config fly.sudoku.toml
   ```

### Option 3: Docker Locally

Build and test the Sudoku app locally:

```bash
# Build Docker image
docker build -f Dockerfile.sudoku -t sudoku-demo .

# Run locally
docker run -p 3000:3000 -p 3001:3001 sudoku-demo

# Visit in browser
# Frontend: http://localhost:3000
# API: http://localhost:3001/api/sudoku/puzzle
```

### Option 4: Development Mode

For local development without Docker:

```bash
# Install dependencies
npm install

# Start development servers (both frontend and backend)
npm run dev

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001

# Separately in different terminals:
npm run dev:frontend   # Frontend on 3000
npm run dev:backend    # Backend on 3001
```

## Configuration

### Environment Variables

Sudoku deployment uses these environment variables:

```env
NODE_ENV=production    # Environment mode
PORT=3001              # Backend port (internal)
```

These are set in `fly.sudoku.toml` under `[env]` and `[env.production]`.

### Customization

#### Change App Name

Edit `fly.sudoku.toml`:
```toml
app = "your-app-name"  # Your custom Fly.io app name
```

#### Change Difficulty

Edit `backend/src/services/sudokuService.ts` in `createPuzzle()`:

```typescript
// Current: 4-5 cells removed (easy)
const numToRemove = 4 + rng.nextInt(2);

// For medium: 5-6 cells
const numToRemove = 5 + rng.nextInt(2);

// For hard: 6-7 cells
const numToRemove = 6 + rng.nextInt(2);
```

#### Customize Styling

Edit `frontend/src/components/SudokuPuzzle.css`:

```css
/* Change primary color */
.sudoku-puzzle {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* Change grid color */
.sudoku-grid {
  border: 3px solid #your-color;
}
```

## Scaling & Performance

### For Small Traffic (< 1000 users/day)

Default configuration in `fly.sudoku.toml`:
```toml
min_machines_running = 1
auto_start_machines = true
auto_stop_machines = true
```

Costs ~$5/month on Fly.io

### For Medium Traffic (1000-10000 users/day)

Scale up machines:

```bash
flyctl scale count 3 --app sudoku-demo

# Or edit fly.sudoku.toml:
[http_service]
  min_machines_running = 3
  auto_start_machines = true
  auto_stop_machines = false
```

### For High Traffic (> 10000 users/day)

Use Fly.io's autoscaling:

```bash
# Enable autoscaling
flyctl autoscale set --min 3 --max 10 --app sudoku-demo

# Monitor
flyctl status --app sudoku-demo
flyctl scale show --app sudoku-demo
```

## Monitoring & Maintenance

### View Logs

```bash
flyctl logs --app sudoku-demo

# Follow logs in real-time
flyctl logs --app sudoku-demo -f

# View recent errors
flyctl logs --app sudoku-demo | grep "error"
```

### Health Checks

The deployment includes automatic health checks:

```toml
[checks.http]
  type = "http"
  port = 3000              # Frontend health check
  path = "/"

[checks.health]
  type = "http"
  port = 3001              # Backend health check
  path = "/api/health"
```

If health checks fail, Fly.io automatically restarts the app.

### Performance Monitoring

```bash
# Check machine status
flyctl status --app sudoku-demo

# View metrics
flyctl metrics --app sudoku-demo

# CPU and memory usage
flyctl ssh console --app sudoku-demo
# Then run: top, free, df, etc.
```

## Troubleshooting

### App won't start

```bash
# Check logs
flyctl logs --app sudoku-demo

# Check health status
flyctl status --app sudoku-demo

# SSH into machine to debug
flyctl ssh console --app sudoku-demo
```

### High latency

- Check number of running machines: `flyctl scale show`
- Increase machines: `flyctl scale count 3`
- Enable autoscaling: `flyctl autoscale set --min 3 --max 10`

### Leaderboard not updating

- Leaderboard is in-memory (resets on deployment)
- For persistent storage, use Fly.io Postgres:
  ```bash
  flyctl postgres create --app sudoku-demo
  ```
- Then update `leaderboardService.ts` to use Postgres

### "Failed to fetch puzzle"

- Check backend is running: `flyctl status --app sudoku-demo`
- Check API endpoint: `curl https://sudoku-demo.fly.dev/api/sudoku/puzzle`
- Check CORS configuration in `backend/src/index.ts`

## Building Locally

### Prerequisites

- Node.js 16+
- npm or yarn
- Fly CLI (for Fly.io deployment)

### Build Steps

```bash
# Install dependencies
npm install

# Run tests
npm test              # All tests
npm run test:backend  # Backend only
npm run test:frontend # Frontend only

# Build
npm run build         # Build both
npm run build:backend # Backend only
npm run build:frontend # Frontend only

# Development
npm run dev           # Both (watch mode)
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

### Build Output

After `npm run build:frontend`, outputs appear in `frontend/dist/`:

```
dist/
├── index.html              # Quote app (main)
├── sudoku.html             # Sudoku app (separate entry)
├── main.js                 # Quote app bundle
├── sudoku.js               # Sudoku app bundle
├── chunks/index.*.js       # Shared code
└── assets/                 # CSS and images
```

## Separating from Main Riddle App

The Sudoku demo is **fully isolated** from the main Riddle app:

### Frontend
- Separate entry point: `sudoku.html` → `SudokuApp.tsx`
- Separate local storage key: `sudokuUsername` (vs `riddleUsername`)
- Separate leaderboard: `/api/sudoku/leaderboard/` (vs `/api/leaderboard/`)

### Backend
- Separate API routes: `/api/sudoku/*` (vs `/api/*`)
- Separate service: `sudokuService.ts` (vs `puzzleService.ts`)
- Shared: Leaderboard service (reused for both puzzle types)

### Deployment
- Separate Fly.io app: `sudoku-demo` (vs `riddle-game`)
- Separate Docker config: `Dockerfile.sudoku` (vs `Dockerfile`)
- Separate Fly config: `fly.sudoku.toml` (vs `fly.toml`)

To deploy both simultaneously:

```bash
# Main Riddle app
flyctl deploy --config fly.toml --app riddle-game

# Sudoku demo app (separate)
flyctl deploy --config fly.sudoku.toml --app sudoku-demo

# Both are now live at different URLs:
# - https://riddle-game.fly.dev (Quote matching)
# - https://sudoku-demo.fly.dev  (Sudoku puzzle)
```

## Next Steps

1. Deploy: `flyctl deploy --config fly.sudoku.toml --app sudoku-demo`
2. Test: Visit `https://sudoku-demo.fly.dev`
3. Monitor: `flyctl logs --app sudoku-demo`
4. Scale: `flyctl scale count 3 --app sudoku-demo`
5. Share: Link your friends to the Sudoku demo!

## Support

For issues or questions:

1. Check Fly.io documentation: https://fly.io/docs/
2. View logs: `flyctl logs --app sudoku-demo`
3. SSH into machine: `flyctl ssh console --app sudoku-demo`
4. Check health: `curl https://sudoku-demo.fly.dev/api/health`

---

*Sudoku demo deployment guide for the Riddle project on Bloom Base.*

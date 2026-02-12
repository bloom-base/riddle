/**
 * Riddle Backend Server
 * Daily puzzle API for quote fragment matching game
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generatePuzzle, validateMatches, PuzzleMatch } from './services/puzzleService.js';
import {
  submitCompletion,
  getLeaderboard,
  getDailyStats,
  hasCompletedToday,
  getUserBestTime
} from './services/leaderboardService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * GET /api/puzzle
 * GET /api/puzzle/:date
 * Get today's puzzle or puzzle for a specific date
 * Date format: YYYY-MM-DD (optional, defaults to today)
 */
app.get('/api/puzzle', (req: Request, res: Response) => {
  try {
    const date = new Date();
    const puzzle = generatePuzzle(date);
    res.json(puzzle);
  } catch (error) {
    console.error('Error generating puzzle:', error);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
});

app.get('/api/puzzle/:date', (req: Request, res: Response) => {
  try {
    let date = new Date();
    
    if (req.params.date) {
      const parsedDate = new Date(req.params.date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
      date = parsedDate;
    }
    
    const puzzle = generatePuzzle(date);
    res.json(puzzle);
  } catch (error) {
    console.error('Error generating puzzle:', error);
    res.status(500).json({ error: 'Failed to generate puzzle' });
  }
});

/**
 * POST /api/validate
 * Validate user's match attempts
 * Body: { date: string, matches: PuzzleMatch[] }
 */
app.post('/api/validate', (req: Request, res: Response) => {
  try {
    const { date, matches } = req.body;
    
    if (!date || !matches || !Array.isArray(matches)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    const puzzleDate = new Date(date);
    if (isNaN(puzzleDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const puzzle = generatePuzzle(puzzleDate);
    const { allCorrect, results } = validateMatches(matches, puzzle);
    
    res.json({
      success: true,
      allCorrect,
      results: Object.fromEntries(results)
    });
  } catch (error) {
    console.error('Error validating matches:', error);
    res.status(500).json({ error: 'Failed to validate matches' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/leaderboard/submit
 * Submit a completion time to the leaderboard
 * Body: { date: string, username: string, completionTime: number }
 */
app.post('/api/leaderboard/submit', (req: Request, res: Response) => {
  try {
    const { date, username, completionTime } = req.body;

    if (!date || !username || completionTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof completionTime !== 'number' || completionTime < 0) {
      return res.status(400).json({ error: 'Invalid completion time' });
    }

    const entry = submitCompletion(date, username, completionTime);
    res.json({
      success: true,
      entry,
      stats: getDailyStats(date)
    });
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
    res.status(500).json({ error: 'Failed to submit leaderboard entry' });
  }
});

/**
 * GET /api/leaderboard/:date
 * Get leaderboard for a specific date
 * Optional query param: limit (default: 20)
 */
app.get('/api/leaderboard/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const leaderboard = getLeaderboard(date, limit);
    const stats = getDailyStats(date);

    res.json({
      date,
      leaderboard,
      stats
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/stats/:date
 * Get daily statistics for a specific date
 */
app.get('/api/stats/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const stats = getDailyStats(date);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/leaderboard/:date/user/:username
 * Check if user has completed puzzle and get their best time
 */
app.get('/api/leaderboard/:date/user/:username', (req: Request, res: Response) => {
  try {
    const { date, username } = req.params;
    const completed = hasCompletedToday(date, username);
    const bestTime = getUserBestTime(date, username);

    res.json({
      date,
      username,
      completed,
      bestTime
    });
  } catch (error) {
    console.error('Error checking user completion:', error);
    res.status(500).json({ error: 'Failed to check user status' });
  }
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎭 Riddle backend server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   GET  /api/puzzle/:date              - Get puzzle for date (default: today)`);
  console.log(`   POST /api/validate                  - Validate match attempts`);
  console.log(`   POST /api/leaderboard/submit        - Submit completion time`);
  console.log(`   GET  /api/leaderboard/:date         - Get leaderboard for date`);
  console.log(`   GET  /api/stats/:date               - Get daily statistics`);
  console.log(`   GET  /api/leaderboard/:date/user/:username - Check user completion`);
  console.log(`   GET  /api/health                    - Health check`);
});

export default app;

/**
 * Riddle Backend Server
 * Daily puzzle API for quote fragment matching game
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generatePuzzle, validateMatches, PuzzleMatch } from './services/puzzleService.js';

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
 * GET /api/puzzle/:date
 * Get today's puzzle or puzzle for a specific date
 * Date format: YYYY-MM-DD (optional, defaults to today)
 */
app.get('/api/puzzle/:date?', (req: Request, res: Response) => {
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
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎭 Riddle backend server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   GET  /api/puzzle/:date        - Get puzzle for date (default: today)`);
  console.log(`   POST /api/validate            - Validate match attempts`);
  console.log(`   GET  /api/health              - Health check`);
});

export default app;

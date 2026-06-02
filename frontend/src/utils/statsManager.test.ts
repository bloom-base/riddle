import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStats,
  saveStats,
  recordPuzzleSolve,
  getTotalSolved,
  getAverageSolveTimeMs,
  getAccuracyPercent,
  formatTime,
  resetStats,
} from './statsManager';

beforeEach(() => {
  localStorage.clear();
});

describe('loadStats', () => {
  it('returns empty stats when nothing is stored', () => {
    const stats = loadStats();
    expect(stats.quotes.totalSolved).toBe(0);
    expect(stats.wordLadder.totalSolved).toBe(0);
    expect(stats.riddle.totalSolved).toBe(0);
    expect(stats.firstSolveDate).toBeNull();
  });

  it('returns saved stats from localStorage', () => {
    const saved = {
      quotes: { totalSolved: 5, totalTimeMs: 30000, totalAttempts: 7, fastestTimeMs: 4000 },
      wordLadder: { totalSolved: 3, totalTimeMs: 0, totalAttempts: 3, fastestTimeMs: 0 },
      riddle: { totalSolved: 2, totalTimeMs: 0, totalAttempts: 2, fastestTimeMs: 0 },
      firstSolveDate: '2025-01-01',
    };
    localStorage.setItem('riddlePuzzleStats', JSON.stringify(saved));
    const stats = loadStats();
    expect(stats.quotes.totalSolved).toBe(5);
    expect(stats.wordLadder.totalSolved).toBe(3);
    expect(stats.firstSolveDate).toBe('2025-01-01');
  });

  it('handles corrupt localStorage data gracefully', () => {
    localStorage.setItem('riddlePuzzleStats', 'not-json');
    const stats = loadStats();
    expect(stats.quotes.totalSolved).toBe(0);
  });

  it('fills in missing fields for forward-compat', () => {
    localStorage.setItem('riddlePuzzleStats', JSON.stringify({ quotes: { totalSolved: 2 } }));
    const stats = loadStats();
    expect(stats.quotes.totalSolved).toBe(2);
    expect(stats.quotes.totalTimeMs).toBe(0);
    expect(stats.wordLadder.totalSolved).toBe(0);
  });
});

describe('recordPuzzleSolve', () => {
  it('increments totalSolved for the given type', () => {
    const stats1 = recordPuzzleSolve({ type: 'quotes' });
    expect(stats1.quotes.totalSolved).toBe(1);
    const stats2 = recordPuzzleSolve({ type: 'quotes' });
    expect(stats2.quotes.totalSolved).toBe(2);
  });

  it('tracks timeMs and fastestTimeMs', () => {
    recordPuzzleSolve({ type: 'quotes', timeMs: 10000 });
    const stats = recordPuzzleSolve({ type: 'quotes', timeMs: 5000 });
    expect(stats.quotes.totalTimeMs).toBe(15000);
    expect(stats.quotes.fastestTimeMs).toBe(5000);
  });

  it('does not update fastestTimeMs with slower time', () => {
    recordPuzzleSolve({ type: 'quotes', timeMs: 5000 });
    const stats = recordPuzzleSolve({ type: 'quotes', timeMs: 8000 });
    expect(stats.quotes.fastestTimeMs).toBe(5000);
  });

  it('tracks attempts for accuracy', () => {
    const stats = recordPuzzleSolve({ type: 'quotes', attempts: 3 });
    expect(stats.quotes.totalAttempts).toBe(3);
    expect(stats.quotes.totalSolved).toBe(1);
  });

  it('defaults to 1 attempt when not specified', () => {
    const stats = recordPuzzleSolve({ type: 'wordLadder' });
    expect(stats.wordLadder.totalAttempts).toBe(1);
  });

  it('sets firstSolveDate on first ever solve', () => {
    const stats = recordPuzzleSolve({ type: 'riddle' });
    expect(stats.firstSolveDate).toBe(new Date().toISOString().slice(0, 10));
  });

  it('does not overwrite firstSolveDate on subsequent solves', () => {
    const initial = {
      quotes: { totalSolved: 1, totalTimeMs: 0, totalAttempts: 1, fastestTimeMs: 0 },
      wordLadder: { totalSolved: 0, totalTimeMs: 0, totalAttempts: 0, fastestTimeMs: 0 },
      riddle: { totalSolved: 0, totalTimeMs: 0, totalAttempts: 0, fastestTimeMs: 0 },
      firstSolveDate: '2024-06-01',
    };
    saveStats(initial);
    const stats = recordPuzzleSolve({ type: 'quotes' });
    expect(stats.firstSolveDate).toBe('2024-06-01');
  });

  it('persists to localStorage', () => {
    recordPuzzleSolve({ type: 'wordLadder' });
    const raw = localStorage.getItem('riddlePuzzleStats');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.wordLadder.totalSolved).toBe(1);
  });
});

describe('derived helpers', () => {
  it('getTotalSolved sums all types', () => {
    recordPuzzleSolve({ type: 'quotes' });
    recordPuzzleSolve({ type: 'wordLadder' });
    recordPuzzleSolve({ type: 'riddle' });
    recordPuzzleSolve({ type: 'riddle' });
    const stats = loadStats();
    expect(getTotalSolved(stats)).toBe(4);
  });

  it('getAverageSolveTimeMs computes from quotes', () => {
    recordPuzzleSolve({ type: 'quotes', timeMs: 10000 });
    recordPuzzleSolve({ type: 'quotes', timeMs: 20000 });
    const stats = loadStats();
    expect(getAverageSolveTimeMs(stats)).toBe(15000);
  });

  it('getAverageSolveTimeMs returns 0 when no data', () => {
    const stats = loadStats();
    expect(getAverageSolveTimeMs(stats)).toBe(0);
  });

  it('getAccuracyPercent computes from quotes', () => {
    recordPuzzleSolve({ type: 'quotes', attempts: 2 });
    recordPuzzleSolve({ type: 'quotes', attempts: 1 });
    const stats = loadStats();
    // 2 solves / 3 total attempts = 67%
    expect(getAccuracyPercent(stats)).toBe(67);
  });

  it('getAccuracyPercent returns 0 when no attempts', () => {
    expect(getAccuracyPercent(loadStats())).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats seconds only', () => {
    expect(formatTime(45000)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125000)).toBe('2m 5s');
  });

  it('returns dash for zero', () => {
    expect(formatTime(0)).toBe('—');
  });

  it('returns dash for negative', () => {
    expect(formatTime(-100)).toBe('—');
  });
});

describe('resetStats', () => {
  it('clears all stats back to zero', () => {
    recordPuzzleSolve({ type: 'quotes', timeMs: 5000 });
    recordPuzzleSolve({ type: 'wordLadder' });
    const fresh = resetStats();
    expect(getTotalSolved(fresh)).toBe(0);
    expect(fresh.firstSolveDate).toBeNull();
    // Also persisted
    expect(getTotalSolved(loadStats())).toBe(0);
  });
});

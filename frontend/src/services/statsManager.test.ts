import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordPuzzleStat,
  getAllStats,
  getStatsByDifficulty,
  clearStats,
} from './statsManager';
import type { Difficulty } from './statsManager';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k in store) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (_i: number) => null as string | null,
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe('statsManager', () => {
  describe('recordPuzzleStat', () => {
    it('records a stat and can retrieve it', () => {
      recordPuzzleStat({
        date: '2026-06-01',
        difficulty: 'easy',
        solveTimeMs: 30000,
        accuracy: 100,
        puzzleType: 'quote',
      });

      const stats = getAllStats();
      expect(stats).toHaveLength(1);
      expect(stats[0].date).toBe('2026-06-01');
      expect(stats[0].difficulty).toBe('easy');
      expect(stats[0].solveTimeMs).toBe(30000);
      expect(stats[0].timestamp).toBeGreaterThan(0);
    });

    it('deduplicates by date + puzzleType', () => {
      recordPuzzleStat({
        date: '2026-06-01',
        difficulty: 'easy',
        solveTimeMs: 30000,
        accuracy: 100,
        puzzleType: 'quote',
      });
      recordPuzzleStat({
        date: '2026-06-01',
        difficulty: 'easy',
        solveTimeMs: 25000,
        accuracy: 95,
        puzzleType: 'quote',
      });

      expect(getAllStats()).toHaveLength(1);
    });

    it('allows same date with different puzzleType', () => {
      recordPuzzleStat({
        date: '2026-06-01',
        difficulty: 'easy',
        solveTimeMs: 30000,
        accuracy: 100,
        puzzleType: 'quote',
      });
      recordPuzzleStat({
        date: '2026-06-01',
        difficulty: 'medium',
        solveTimeMs: 45000,
        accuracy: 80,
        puzzleType: 'riddle',
      });

      expect(getAllStats()).toHaveLength(2);
    });
  });

  describe('getStatsByDifficulty', () => {
    it('returns aggregates for all 3 difficulties', () => {
      const result = getStatsByDifficulty();
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.difficulty)).toEqual(['easy', 'medium', 'hard']);
    });

    it('returns zeros when no data exists', () => {
      const result = getStatsByDifficulty();
      for (const agg of result) {
        expect(agg.totalSolved).toBe(0);
        expect(agg.avgSolveTimeSec).toBe(0);
        expect(agg.avgAccuracy).toBe(0);
        expect(agg.recentSolveTimes).toEqual([]);
        expect(agg.recentAccuracies).toEqual([]);
      }
    });

    it('computes correct averages', () => {
      const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
      const times = [20000, 40000, 60000];
      const accuracies = [100, 80, 60];

      for (let i = 0; i < 3; i++) {
        recordPuzzleStat({
          date: `2026-06-0${i + 1}`,
          difficulty: difficulties[i],
          solveTimeMs: times[i],
          accuracy: accuracies[i],
          puzzleType: 'quote',
        });
      }

      const result = getStatsByDifficulty();
      const easy = result.find((r) => r.difficulty === 'easy')!;
      expect(easy.totalSolved).toBe(1);
      expect(easy.avgSolveTimeSec).toBe(20); // 20000ms = 20s
      expect(easy.avgAccuracy).toBe(100);

      const hard = result.find((r) => r.difficulty === 'hard')!;
      expect(hard.avgSolveTimeSec).toBe(60);
      expect(hard.avgAccuracy).toBe(60);
    });

    it('limits recent trend data points', () => {
      // Add 15 easy puzzles
      for (let i = 0; i < 15; i++) {
        recordPuzzleStat({
          date: `2026-01-${String(i + 1).padStart(2, '0')}`,
          difficulty: 'easy',
          solveTimeMs: (i + 1) * 1000,
          accuracy: 90 + (i % 10),
          puzzleType: 'quote',
        });
      }

      const result = getStatsByDifficulty(5);
      const easy = result.find((r) => r.difficulty === 'easy')!;
      expect(easy.recentSolveTimes).toHaveLength(5);
      expect(easy.recentAccuracies).toHaveLength(5);
      // Should be the last 5
      expect(easy.recentSolveTimes[0]).toBe(11); // 11000ms = 11s
    });
  });

  describe('clearStats', () => {
    it('removes all stats', () => {
      recordPuzzleStat({
        date: '2026-06-01',
        difficulty: 'easy',
        solveTimeMs: 30000,
        accuracy: 100,
        puzzleType: 'quote',
      });

      expect(getAllStats()).toHaveLength(1);
      clearStats();
      expect(getAllStats()).toHaveLength(0);
    });
  });
});

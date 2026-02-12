/**
 * Tests for Leaderboard Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitCompletion,
  getLeaderboard,
  getDailyStats,
  hasCompletedToday,
  getUserBestTime,
  clearOldLeaderboards
} from './leaderboardService.js';

describe('LeaderboardService', () => {
  const testDate = '2024-01-15';

  beforeEach(() => {
    // Clear leaderboards before each test
    clearOldLeaderboards(0);
  });

  describe('submitCompletion', () => {
    it('should submit a completion and return entry', () => {
      const entry = submitCompletion(testDate, 'Alice', 30000);

      expect(entry.username).toBe('Alice');
      expect(entry.completionTime).toBe(30000);
      expect(entry.date).toBe(testDate);
      expect(entry.timestamp).toBeDefined();
    });

    it('should sanitize username', () => {
      const entry = submitCompletion(testDate, '  Bob  ', 25000);
      expect(entry.username).toBe('Bob');
    });

    it('should truncate long usernames', () => {
      const longUsername = 'a'.repeat(100);
      const entry = submitCompletion(testDate, longUsername, 20000);
      expect(entry.username.length).toBe(50);
    });

    it('should allow multiple submissions for same date', () => {
      submitCompletion(testDate, 'Alice', 30000);
      submitCompletion(testDate, 'Bob', 25000);
      const leaderboard = getLeaderboard(testDate);

      expect(leaderboard.length).toBe(2);
    });
  });

  describe('getLeaderboard', () => {
    it('should return empty array for non-existent date', () => {
      const leaderboard = getLeaderboard('2099-12-31');
      expect(leaderboard).toEqual([]);
    });

    it('should sort by completion time ascending', () => {
      submitCompletion(testDate, 'Slow', 60000);
      submitCompletion(testDate, 'Fast', 10000);
      submitCompletion(testDate, 'Medium', 30000);

      const leaderboard = getLeaderboard(testDate);

      expect(leaderboard[0].username).toBe('Fast');
      expect(leaderboard[1].username).toBe('Medium');
      expect(leaderboard[2].username).toBe('Slow');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 30; i++) {
        submitCompletion(testDate, `User${i}`, 10000 + i * 1000);
      }

      const leaderboard = getLeaderboard(testDate, 10);
      expect(leaderboard.length).toBe(10);
    });

    it('should default to limit of 20', () => {
      for (let i = 0; i < 50; i++) {
        submitCompletion(testDate, `User${i}`, 10000 + i * 1000);
      }

      const leaderboard = getLeaderboard(testDate);
      expect(leaderboard.length).toBe(20);
    });
  });

  describe('getDailyStats', () => {
    it('should return zero stats for empty date', () => {
      const stats = getDailyStats('2099-12-31');

      expect(stats.totalSolvers).toBe(0);
      expect(stats.averageTime).toBe(0);
      expect(stats.fastestTime).toBe(0);
      expect(stats.fastestSolver).toBe('No solvers yet');
    });

    it('should calculate correct stats', () => {
      submitCompletion(testDate, 'Alice', 30000);
      submitCompletion(testDate, 'Bob', 20000);
      submitCompletion(testDate, 'Charlie', 40000);

      const stats = getDailyStats(testDate);

      expect(stats.date).toBe(testDate);
      expect(stats.totalSolvers).toBe(3);
      expect(stats.fastestTime).toBe(20000);
      expect(stats.fastestSolver).toBe('Bob');
      expect(stats.averageTime).toBe(30000); // (30000 + 20000 + 40000) / 3
    });

    it('should handle single solver', () => {
      submitCompletion(testDate, 'Alice', 25000);
      const stats = getDailyStats(testDate);

      expect(stats.totalSolvers).toBe(1);
      expect(stats.averageTime).toBe(25000);
      expect(stats.fastestTime).toBe(25000);
      expect(stats.fastestSolver).toBe('Alice');
    });
  });

  describe('hasCompletedToday', () => {
    it('should return false for non-existent user', () => {
      submitCompletion(testDate, 'Alice', 30000);
      expect(hasCompletedToday(testDate, 'Bob')).toBe(false);
    });

    it('should return true for existing user', () => {
      submitCompletion(testDate, 'Alice', 30000);
      expect(hasCompletedToday(testDate, 'Alice')).toBe(true);
    });

    it('should handle case sensitivity and whitespace', () => {
      submitCompletion(testDate, 'Alice', 30000);
      expect(hasCompletedToday(testDate, '  Alice  ')).toBe(true);
    });
  });

  describe('getUserBestTime', () => {
    it('should return null for non-existent user', () => {
      submitCompletion(testDate, 'Alice', 30000);
      const best = getUserBestTime(testDate, 'Bob');
      expect(best).toBeNull();
    });

    it('should return first submission if only one', () => {
      const entry = submitCompletion(testDate, 'Alice', 30000);
      const best = getUserBestTime(testDate, 'Alice');

      expect(best).toEqual(entry);
    });

    it('should return fastest time if multiple submissions', () => {
      submitCompletion(testDate, 'Alice', 40000);
      const fastEntry = submitCompletion(testDate, 'Alice', 20000);
      submitCompletion(testDate, 'Alice', 30000);

      const best = getUserBestTime(testDate, 'Alice');

      expect(best?.completionTime).toBe(20000);
      expect(best).toEqual(fastEntry);
    });
  });

  describe('clearOldLeaderboards', () => {
    it('should clear leaderboards older than specified days', () => {
      const oldDate = '2024-01-01';
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3);
      const recentDateStr = recentDate.toISOString().split('T')[0];

      submitCompletion(oldDate, 'Alice', 30000);
      submitCompletion(recentDateStr, 'Bob', 25000);

      clearOldLeaderboards(5); // Keep 5 days

      expect(getLeaderboard(oldDate).length).toBe(0);
      expect(getLeaderboard(recentDateStr).length).toBe(1);
    });
  });
});

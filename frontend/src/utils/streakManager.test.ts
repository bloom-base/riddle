import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTodayDate,
  getYesterdayDate,
  loadStreakData,
  saveStreakData,
  shouldResetStreak,
  recordCompletion,
  getCurrentStreak,
  isMilestone,
  getNextMilestone,
  getMotivationalMessage,
  type StreakData,
} from './streakManager';

describe('streakManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getTodayDate', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = getTodayDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getYesterdayDate', () => {
    it('should return yesterday\'s date in YYYY-MM-DD format', () => {
      const yesterday = getYesterdayDate();
      expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Verify it's actually one day before today
      const today = new Date(getTodayDate());
      const yesterdayDate = new Date(yesterday);
      const diffDays = Math.round((today.getTime() - yesterdayDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(1);
    });
  });

  describe('loadStreakData', () => {
    it('should return default data when localStorage is empty', () => {
      const data = loadStreakData();
      expect(data).toEqual({
        currentStreak: 0,
        lastCompletedDate: null,
        longestStreak: 0,
        totalCompletions: 0,
      });
    });

    it('should load stored data from localStorage', () => {
      const mockData: StreakData = {
        currentStreak: 5,
        lastCompletedDate: '2024-01-15',
        longestStreak: 10,
        totalCompletions: 20,
      };
      localStorage.setItem('riddleStreakData', JSON.stringify(mockData));

      const data = loadStreakData();
      expect(data).toEqual(mockData);
    });

    it('should return default data on JSON parse error', () => {
      localStorage.setItem('riddleStreakData', 'invalid json');
      const data = loadStreakData();
      expect(data).toEqual({
        currentStreak: 0,
        lastCompletedDate: null,
        longestStreak: 0,
        totalCompletions: 0,
      });
    });
  });

  describe('saveStreakData', () => {
    it('should save data to localStorage', () => {
      const data: StreakData = {
        currentStreak: 7,
        lastCompletedDate: '2024-01-15',
        longestStreak: 7,
        totalCompletions: 10,
      };
      saveStreakData(data);

      const stored = localStorage.getItem('riddleStreakData');
      expect(stored).toBe(JSON.stringify(data));
    });
  });

  describe('shouldResetStreak', () => {
    it('should return false when lastCompletedDate is null', () => {
      expect(shouldResetStreak(null)).toBe(false);
    });

    it('should return false when lastCompletedDate is today', () => {
      const today = getTodayDate();
      expect(shouldResetStreak(today)).toBe(false);
    });

    it('should return false when lastCompletedDate is yesterday', () => {
      const yesterday = getYesterdayDate();
      expect(shouldResetStreak(yesterday)).toBe(false);
    });

    it('should return true when lastCompletedDate is before yesterday', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const date = twoDaysAgo.toISOString().split('T')[0];
      expect(shouldResetStreak(date)).toBe(true);
    });
  });

  describe('recordCompletion', () => {
    it('should start a new streak on first completion', () => {
      const today = getTodayDate();
      const result = recordCompletion(today);

      expect(result.isNewCompletion).toBe(true);
      expect(result.previousStreak).toBe(0);
      expect(result.streakData.currentStreak).toBe(1);
      expect(result.streakData.lastCompletedDate).toBe(today);
      expect(result.streakData.totalCompletions).toBe(1);
      expect(result.streakData.longestStreak).toBe(1);
    });

    it('should increment streak when completing on consecutive days', () => {
      const yesterday = getYesterdayDate();
      const initialData: StreakData = {
        currentStreak: 3,
        lastCompletedDate: yesterday,
        longestStreak: 3,
        totalCompletions: 3,
      };
      saveStreakData(initialData);

      const today = getTodayDate();
      const result = recordCompletion(today);

      expect(result.isNewCompletion).toBe(true);
      expect(result.previousStreak).toBe(3);
      expect(result.streakData.currentStreak).toBe(4);
      expect(result.streakData.totalCompletions).toBe(4);
      expect(result.streakData.longestStreak).toBe(4);
    });

    it('should reset streak when a day is missed', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const oldDate = threeDaysAgo.toISOString().split('T')[0];

      const initialData: StreakData = {
        currentStreak: 5,
        lastCompletedDate: oldDate,
        longestStreak: 5,
        totalCompletions: 10,
      };
      saveStreakData(initialData);

      const today = getTodayDate();
      const result = recordCompletion(today);

      expect(result.isNewCompletion).toBe(true);
      expect(result.previousStreak).toBe(5);
      expect(result.streakData.currentStreak).toBe(1);
      expect(result.streakData.totalCompletions).toBe(11);
      expect(result.streakData.longestStreak).toBe(5); // Longest streak unchanged
    });

    it('should not increment when completing same day twice', () => {
      const today = getTodayDate();
      const firstResult = recordCompletion(today);
      expect(firstResult.isNewCompletion).toBe(true);
      expect(firstResult.streakData.currentStreak).toBe(1);

      const secondResult = recordCompletion(today);
      expect(secondResult.isNewCompletion).toBe(false);
      expect(secondResult.streakData.currentStreak).toBe(1);
      expect(secondResult.streakData.totalCompletions).toBe(1);
    });

    it('should update longest streak when surpassing previous record', () => {
      const yesterday = getYesterdayDate();
      const initialData: StreakData = {
        currentStreak: 5,
        lastCompletedDate: yesterday,
        longestStreak: 5,
        totalCompletions: 10,
      };
      saveStreakData(initialData);

      const today = getTodayDate();
      const result = recordCompletion(today);

      expect(result.streakData.currentStreak).toBe(6);
      expect(result.streakData.longestStreak).toBe(6);
    });
  });

  describe('getCurrentStreak', () => {
    it('should return current streak without resetting if still valid', () => {
      const today = getTodayDate();
      const data: StreakData = {
        currentStreak: 7,
        lastCompletedDate: today,
        longestStreak: 7,
        totalCompletions: 10,
      };
      saveStreakData(data);

      const result = getCurrentStreak();
      expect(result.currentStreak).toBe(7);
    });

    it('should reset streak to 0 if a day was missed', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const oldDate = threeDaysAgo.toISOString().split('T')[0];

      const data: StreakData = {
        currentStreak: 5,
        lastCompletedDate: oldDate,
        longestStreak: 5,
        totalCompletions: 10,
      };
      saveStreakData(data);

      const result = getCurrentStreak();
      expect(result.currentStreak).toBe(0);
    });
  });

  describe('isMilestone', () => {
    it('should return true for milestone numbers', () => {
      expect(isMilestone(3)).toBe(true);
      expect(isMilestone(7)).toBe(true);
      expect(isMilestone(14)).toBe(true);
      expect(isMilestone(30)).toBe(true);
      expect(isMilestone(50)).toBe(true);
      expect(isMilestone(100)).toBe(true);
      expect(isMilestone(365)).toBe(true);
    });

    it('should return false for non-milestone numbers', () => {
      expect(isMilestone(1)).toBe(false);
      expect(isMilestone(2)).toBe(false);
      expect(isMilestone(5)).toBe(false);
      expect(isMilestone(10)).toBe(false);
      expect(isMilestone(15)).toBe(false);
    });
  });

  describe('getNextMilestone', () => {
    it('should return the next milestone after current streak', () => {
      expect(getNextMilestone(0)).toBe(3);
      expect(getNextMilestone(1)).toBe(3);
      expect(getNextMilestone(3)).toBe(7);
      expect(getNextMilestone(5)).toBe(7);
      expect(getNextMilestone(7)).toBe(14);
      expect(getNextMilestone(14)).toBe(30);
      expect(getNextMilestone(30)).toBe(50);
      expect(getNextMilestone(100)).toBe(365);
    });

    it('should return the highest milestone when already past it', () => {
      expect(getNextMilestone(365)).toBe(365);
      expect(getNextMilestone(500)).toBe(365);
    });
  });

  describe('getMotivationalMessage', () => {
    it('should return appropriate messages for different streak lengths', () => {
      expect(getMotivationalMessage(1)).toBe("Great start! Keep it up!");
      expect(getMotivationalMessage(2)).toBe("Two in a row! You're on fire!");
      expect(getMotivationalMessage(3)).toBe("Three days! The habit is forming!");
      expect(getMotivationalMessage(5)).toBe("Keep the streak alive!");
      expect(getMotivationalMessage(7)).toBe("One week straight! Amazing!");
      expect(getMotivationalMessage(10)).toBe("You're unstoppable!");
      expect(getMotivationalMessage(14)).toBe("Two weeks! You're a puzzle master!");
      expect(getMotivationalMessage(20)).toBe("Incredible dedication!");
      expect(getMotivationalMessage(30)).toBe("30 days! That's legendary!");
      expect(getMotivationalMessage(50)).toBe("You're on an epic journey!");
      expect(getMotivationalMessage(100)).toBe("100 days! You're a puzzle legend!");
      expect(getMotivationalMessage(200)).toBe("Unbelievable! Keep going!");
    });
  });
});

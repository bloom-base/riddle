import { describe, it, expect } from 'vitest';
import { getDailyRiddle, getRiddleQuestion, getAllRiddles, getRiddleCount } from './riddleService';
import { RIDDLES } from '../data/riddles';

describe('riddleService', () => {
  describe('getDailyRiddle', () => {
    it('should return a riddle for today', () => {
      const riddle = getDailyRiddle();

      expect(riddle).toBeDefined();
      expect(riddle).toHaveProperty('date');
      expect(riddle).toHaveProperty('id');
      expect(riddle).toHaveProperty('question');
      expect(riddle).toHaveProperty('answer');
      expect(riddle).toHaveProperty('difficulty');
      expect(riddle).toHaveProperty('category');
    });

    it('should return the same riddle for the same date', () => {
      const date = new Date('2024-01-15');
      const riddle1 = getDailyRiddle(date);
      const riddle2 = getDailyRiddle(date);

      expect(riddle1).toEqual(riddle2);
    });

    it('should return different riddles for different dates', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');

      const riddle1 = getDailyRiddle(date1);
      const riddle2 = getDailyRiddle(date2);

      // They might be the same by chance, but their dates should be different
      expect(riddle1.date).not.toBe(riddle2.date);
    });

    it('should use UTC date for consistency', () => {
      // Create dates with different timezones but same UTC date
      const date1 = new Date('2024-01-15T00:00:00Z');
      const date2 = new Date('2024-01-15T23:59:59Z');

      const riddle1 = getDailyRiddle(date1);
      const riddle2 = getDailyRiddle(date2);

      expect(riddle1.id).toBe(riddle2.id);
      expect(riddle1.date).toBe(riddle2.date);
    });

    it('should include all required riddle properties', () => {
      const riddle = getDailyRiddle();

      expect(typeof riddle.id).toBe('string');
      expect(typeof riddle.question).toBe('string');
      expect(typeof riddle.answer).toBe('string');
      expect(typeof riddle.difficulty).toBe('string');
      expect(typeof riddle.category).toBe('string');
      expect(typeof riddle.date).toBe('string');

      expect(riddle.question.length).toBeGreaterThan(0);
      expect(riddle.answer.length).toBeGreaterThan(0);
    });

    it('should return riddle from the RIDDLES array', () => {
      const riddle = getDailyRiddle();
      const riddleExists = RIDDLES.some(r => r.id === riddle.id);

      expect(riddleExists).toBe(true);
    });
  });

  describe('getRiddleQuestion', () => {
    it('should return riddle without answer', () => {
      const question = getRiddleQuestion();

      expect(question).toBeDefined();
      expect(question).toHaveProperty('date');
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('difficulty');
      expect(question).toHaveProperty('category');
      expect(question).not.toHaveProperty('answer');
    });

    it('should match the full riddle except for answer', () => {
      const date = new Date('2024-01-15');
      const fullRiddle = getDailyRiddle(date);
      const questionOnly = getRiddleQuestion(date);

      expect(questionOnly.id).toBe(fullRiddle.id);
      expect(questionOnly.question).toBe(fullRiddle.question);
      expect(questionOnly.date).toBe(fullRiddle.date);
      expect(questionOnly.difficulty).toBe(fullRiddle.difficulty);
      expect(questionOnly.category).toBe(fullRiddle.category);
    });
  });

  describe('getAllRiddles', () => {
    it('should return all riddles', () => {
      const riddles = getAllRiddles();

      expect(riddles).toBeDefined();
      expect(Array.isArray(riddles)).toBe(true);
      expect(riddles.length).toBe(RIDDLES.length);
    });

    it('should return a copy of the riddles array', () => {
      const riddles = getAllRiddles();
      riddles.push({
        id: 'test',
        question: 'test',
        answer: 'test',
        difficulty: 'easy',
        category: 'test'
      });

      expect(riddles.length).not.toBe(RIDDLES.length);
    });

    it('should contain at least 10 riddles', () => {
      const riddles = getAllRiddles();
      expect(riddles.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('getRiddleCount', () => {
    it('should return the correct count of riddles', () => {
      const count = getRiddleCount();

      expect(count).toBe(RIDDLES.length);
      expect(count).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Date-based rotation', () => {
    it('should rotate through different riddles over multiple days', () => {
      const riddleIds = new Set<string>();
      const startDate = new Date('2024-01-01');

      // Get riddles for 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const riddle = getDailyRiddle(date);
        riddleIds.add(riddle.id);
      }

      // Should have multiple unique riddles (at least 5 different ones in 30 days)
      expect(riddleIds.size).toBeGreaterThanOrEqual(5);
    });

    it('should be deterministic for past dates', () => {
      const historicalDate = new Date('2020-01-01');
      const riddle1 = getDailyRiddle(historicalDate);
      const riddle2 = getDailyRiddle(historicalDate);

      expect(riddle1).toEqual(riddle2);
    });

    it('should work for future dates', () => {
      const futureDate = new Date('2030-12-31');
      const riddle = getDailyRiddle(futureDate);

      expect(riddle).toBeDefined();
      expect(riddle.date).toBe('2030-12-31');
    });
  });
});

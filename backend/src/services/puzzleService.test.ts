import { describe, it, expect } from 'vitest';
import {
  generatePuzzle,
  validateMatches,
  getQuoteInfo,
  PuzzleMatch
} from './puzzleService';

describe('Puzzle Service', () => {
  describe('generatePuzzle', () => {
    it('should generate a puzzle for today', () => {
      const puzzle = generatePuzzle();
      
      expect(puzzle).toBeDefined();
      expect(puzzle.date).toBeDefined();
      expect(puzzle.openings).toBeDefined();
      expect(puzzle.closings).toBeDefined();
      expect(puzzle.correctMatches).toBeDefined();
      expect(Array.isArray(puzzle.openings)).toBe(true);
      expect(Array.isArray(puzzle.closings)).toBe(true);
      expect(Array.isArray(puzzle.correctMatches)).toBe(true);
    });

    it('should generate 8-10 quote pairs', () => {
      const puzzle = generatePuzzle();
      
      expect(puzzle.openings.length).toBeGreaterThanOrEqual(8);
      expect(puzzle.openings.length).toBeLessThanOrEqual(10);
      expect(puzzle.closings.length).toBe(puzzle.openings.length);
      expect(puzzle.correctMatches.length).toBe(puzzle.openings.length);
    });

    it('should have the same puzzle for the same date', () => {
      const testDate = new Date('2024-01-15');
      const puzzle1 = generatePuzzle(testDate);
      const puzzle2 = generatePuzzle(testDate);
      
      expect(puzzle1.date).toBe(puzzle2.date);
      expect(puzzle1.openings.length).toBe(puzzle2.openings.length);
      expect(puzzle1.closings.length).toBe(puzzle2.closings.length);
      expect(puzzle1.correctMatches.length).toBe(puzzle2.correctMatches.length);
    });

    it('should have different puzzles for different dates', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      const puzzle1 = generatePuzzle(date1);
      const puzzle2 = generatePuzzle(date2);
      
      expect(puzzle1.date).not.toBe(puzzle2.date);
      // The opening/closing IDs should be different due to rotation
      expect(puzzle1.openings[0].id).not.toBe(puzzle2.openings[0].id);
    });

    it('should have non-empty fragments', () => {
      const puzzle = generatePuzzle();
      
      puzzle.openings.forEach((opening) => {
        expect(opening.id).toBeTruthy();
        expect(opening.text.length).toBeGreaterThan(0);
      });
      
      puzzle.closings.forEach((closing) => {
        expect(closing.id).toBeTruthy();
        expect(closing.text.length).toBeGreaterThan(0);
      });
    });

    it('should have correct matches with proper IDs', () => {
      const puzzle = generatePuzzle();
      
      puzzle.correctMatches.forEach((match) => {
        expect(match.id).toBeTruthy();
        expect(match.openingId).toBeTruthy();
        expect(match.closingId).toBeTruthy();
        
        // Verify IDs exist in the respective arrays
        const openingExists = puzzle.openings.some((o) => o.id === match.openingId);
        const closingExists = puzzle.closings.some((c) => c.id === match.closingId);
        
        expect(openingExists).toBe(true);
        expect(closingExists).toBe(true);
      });
    });
  });

  describe('validateMatches', () => {
    it('should validate correct matches', () => {
      const puzzle = generatePuzzle();
      const { allCorrect, results } = validateMatches(puzzle.correctMatches, puzzle);
      
      expect(allCorrect).toBe(true);
      results.forEach((isCorrect) => {
        expect(isCorrect).toBe(true);
      });
    });

    it('should detect incorrect matches', () => {
      const puzzle = generatePuzzle();
      
      // Create incorrect matches (swap some closings)
      const incorrectMatches: PuzzleMatch[] = puzzle.correctMatches.map((match, index) => {
        const nextIndex = (index + 1) % puzzle.correctMatches.length;
        return {
          id: match.id,
          openingId: match.openingId,
          closingId: puzzle.correctMatches[nextIndex].closingId
        };
      });
      
      const { allCorrect } = validateMatches(incorrectMatches, puzzle);
      
      expect(allCorrect).toBe(false);
    });

    it('should mark specific incorrect matches', () => {
      const puzzle = generatePuzzle();
      
      // Create a mix of correct and incorrect matches
      const mixedMatches: PuzzleMatch[] = puzzle.correctMatches.map((match, index) => {
        if (index === 0) {
          // Make first match incorrect
          const nextIndex = (index + 1) % puzzle.correctMatches.length;
          return {
            id: match.id,
            openingId: match.openingId,
            closingId: puzzle.correctMatches[nextIndex].closingId
          };
        }
        return match;
      });
      
      const { allCorrect, results } = validateMatches(mixedMatches, puzzle);
      
      expect(allCorrect).toBe(false);
      expect(results.get(puzzle.correctMatches[0].openingId)).toBe(false);
      expect(results.get(puzzle.correctMatches[1].openingId)).toBe(true);
    });

    it('should handle partial matches', () => {
      const puzzle = generatePuzzle();
      
      // Only match first half
      const partialMatches = puzzle.correctMatches.slice(0, Math.floor(puzzle.correctMatches.length / 2));
      
      const { allCorrect, results } = validateMatches(partialMatches, puzzle);
      
      expect(allCorrect).toBe(false);
      expect(results.size).toBe(partialMatches.length);
    });
  });

  describe('getQuoteInfo', () => {
    it('should return quote info for valid ID', () => {
      const quote = getQuoteInfo('twain_1');
      
      expect(quote).toBeDefined();
      expect(quote?.author).toBe('Mark Twain');
      expect(quote?.book).toBeTruthy();
      expect(quote?.fullQuote).toBeTruthy();
    });

    it('should return null for invalid ID', () => {
      const quote = getQuoteInfo('invalid_id_12345');
      
      expect(quote).toBeNull();
    });

    it('should have correct quote data', () => {
      const quote = getQuoteInfo('melville_1');
      
      expect(quote?.author).toBe('Herman Melville');
      expect(quote?.book).toBe('Moby Dick');
      expect(quote?.openingFragment).toBe('Call me');
      expect(quote?.closingFragment).toBe('Ishmael.');
      expect(quote?.fullQuote).toBe('Call me Ishmael.');
    });
  });
});

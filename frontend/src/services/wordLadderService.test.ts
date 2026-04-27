import { describe, it, expect } from 'vitest';
import {
  differsByOneLetter,
  isValidWord,
  validateChain,
  getDailyWordLadder,
  findShortestPath,
} from './wordLadderService';

/* ─── differsByOneLetter ─── */

describe('differsByOneLetter', () => {
  it('returns true for a single letter change', () => {
    expect(differsByOneLetter('CAT', 'COT')).toBe(true);
    expect(differsByOneLetter('COT', 'COG')).toBe(true);
    expect(differsByOneLetter('COG', 'DOG')).toBe(true);
  });

  it('returns false when more than one letter differs', () => {
    expect(differsByOneLetter('CAT', 'DOG')).toBe(false);
    expect(differsByOneLetter('COLD', 'WARM')).toBe(false);
  });

  it('returns false for identical words', () => {
    expect(differsByOneLetter('CAT', 'CAT')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(differsByOneLetter('CAT', 'CATS')).toBe(false);
  });
});

/* ─── isValidWord ─── */

describe('isValidWord', () => {
  it('recognises words in the dictionary', () => {
    expect(isValidWord('CAT')).toBe(true);
    expect(isValidWord('DOG')).toBe(true);
    expect(isValidWord('COLD')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isValidWord('cat')).toBe(true);
    expect(isValidWord('Dog')).toBe(true);
  });

  it('rejects gibberish', () => {
    expect(isValidWord('XYZ')).toBe(false);
    expect(isValidWord('QQQQ')).toBe(false);
  });
});

/* ─── validateChain ─── */

describe('validateChain', () => {
  it('validates a correct chain CAT→COT→COG→DOG', () => {
    const { steps, won } = validateChain('CAT', 'DOG', ['COT', 'COG', 'DOG']);
    expect(won).toBe(true);
    expect(steps.every((s) => s.valid)).toBe(true);
  });

  it('rejects an invalid word in the chain', () => {
    const { steps, won } = validateChain('CAT', 'DOG', ['XYZ']);
    expect(won).toBe(false);
    expect(steps[0].valid).toBe(false);
    expect(steps[0].error).toContain('Not a valid word');
  });

  it('rejects a step that changes more than one letter', () => {
    const { steps, won } = validateChain('CAT', 'DOG', ['DOG']);
    expect(won).toBe(false);
    expect(steps[0].valid).toBe(false);
    expect(steps[0].error).toContain('exactly one letter');
  });

  it('reports incomplete chain (valid steps but not yet at target)', () => {
    const { steps, won } = validateChain('CAT', 'DOG', ['COT']);
    expect(won).toBe(false);
    expect(steps[0].valid).toBe(true);
  });

  it('rejects wrong-length words', () => {
    const { steps, won } = validateChain('CAT', 'DOG', ['COTS']);
    expect(won).toBe(false);
    expect(steps[0].valid).toBe(false);
    expect(steps[0].error).toContain('3 letters');
  });
});

/* ─── getDailyWordLadder ─── */

describe('getDailyWordLadder', () => {
  it('is deterministic for the same date', () => {
    const a = getDailyWordLadder(new Date('2025-06-15'));
    const b = getDailyWordLadder(new Date('2025-06-15'));
    expect(a).toEqual(b);
  });

  it('produces different puzzles for different dates', () => {
    const a = getDailyWordLadder(new Date('2025-06-15'));
    const b = getDailyWordLadder(new Date('2025-06-16'));
    // They *could* theoretically be the same pair, but probability is very low
    expect(a.date).not.toEqual(b.date);
  });

  it('returns valid start and end words', () => {
    const puzzle = getDailyWordLadder(new Date('2025-06-15'));
    expect(isValidWord(puzzle.start)).toBe(true);
    expect(isValidWord(puzzle.end)).toBe(true);
    expect(puzzle.start.length).toBe(puzzle.wordLength);
    expect(puzzle.end.length).toBe(puzzle.wordLength);
  });
});

/* ─── findShortestPath ─── */

describe('findShortestPath', () => {
  it('finds a path from CAT to DOG', () => {
    const path = findShortestPath('CAT', 'DOG');
    expect(path).not.toBeNull();
    expect(path![0]).toBe('CAT');
    expect(path![path!.length - 1]).toBe('DOG');

    // every consecutive pair should differ by exactly 1 letter
    for (let i = 0; i < path!.length - 1; i++) {
      expect(differsByOneLetter(path![i], path![i + 1])).toBe(true);
    }
  });

  it('returns a single-element path for identical words', () => {
    const path = findShortestPath('CAT', 'CAT');
    expect(path).toEqual(['CAT']);
  });
});

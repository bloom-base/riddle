/**
 * Puzzle Service
 * Handles puzzle generation, validation, and daily rotation
 */

import { QUOTES, getQuoteOfDay, Quote } from '../data/quotes.js';

export interface PuzzleMatch {
  id: string;
  openingId: string;
  closingId: string;
}

export interface Puzzle {
  date: string;
  openings: Array<{ id: string; text: string }>;
  closings: Array<{ id: string; text: string }>;
  correctMatches: PuzzleMatch[];
}

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
}

/**
 * Generate a puzzle for a specific date
 * Shuffles the closing fragments to create the matching challenge
 */
export function generatePuzzle(date: Date = new Date()): Puzzle {
  const dateString = date.toISOString().split('T')[0];
  const todaysQuotes = getQuoteOfDay(date);
  
  // Create openings and closings arrays
  const openings = todaysQuotes.map((quote) => ({
    id: `opening_${quote.id}`,
    text: quote.openingFragment
  }));
  
  const closings = todaysQuotes.map((quote) => ({
    id: `closing_${quote.id}`,
    text: quote.closingFragment
  }));
  
  // Shuffle closings using Fisher-Yates algorithm with deterministic seed
  const seedFromDate = dateString.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const shuffledClosings = [...closings];
  let seed = seedFromDate;
  
  for (let i = shuffledClosings.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [shuffledClosings[i], shuffledClosings[j]] = [shuffledClosings[j], shuffledClosings[i]];
  }
  
  // Create correct matches mapping
  const correctMatches = todaysQuotes.map((quote) => ({
    id: quote.id,
    openingId: `opening_${quote.id}`,
    closingId: `closing_${quote.id}`
  }));
  
  return {
    date: dateString,
    openings,
    closings: shuffledClosings,
    correctMatches
  };
}

/**
 * Validate user's match attempts
 */
export function validateMatches(
  userMatches: PuzzleMatch[],
  puzzle: Puzzle
): { allCorrect: boolean; results: Map<string, boolean> } {
  const results = new Map<string, boolean>();
  
  // Create a map of correct matches for quick lookup
  const correctMatchMap = new Map<string, string>();
  puzzle.correctMatches.forEach((match) => {
    correctMatchMap.set(match.openingId, match.closingId);
  });
  
  // Check each user match
  let allCorrect = userMatches.length === puzzle.correctMatches.length;
  userMatches.forEach((userMatch) => {
    const expectedClosingId = correctMatchMap.get(userMatch.openingId);
    const isCorrect = expectedClosingId === userMatch.closingId;
    results.set(userMatch.openingId, isCorrect);
    
    if (!isCorrect) {
      allCorrect = false;
    }
  });
  
  return { allCorrect, results };
}

/**
 * Get detailed information about a quote for display
 */
export function getQuoteInfo(quoteId: string): Quote | null {
  return QUOTES.find((q) => q.id === quoteId) || null;
}

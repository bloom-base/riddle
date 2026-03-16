/**
 * Riddle Service
 * Handles daily riddle rotation and retrieval
 */

import { RIDDLES, getRiddleOfDay, Riddle } from '../data/riddles.js';

export interface DailyRiddle {
  date: string;
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
}

/**
 * Get the daily riddle for a specific date
 * Returns riddle with answer (caller controls when to reveal)
 */
export function getDailyRiddle(date: Date = new Date()): DailyRiddle {
  // Use UTC date for consistency
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dateString = utcDate.toISOString().split('T')[0];

  const riddle = getRiddleOfDay(utcDate);

  return {
    date: dateString,
    id: riddle.id,
    question: riddle.question,
    answer: riddle.answer,
    difficulty: riddle.difficulty,
    category: riddle.category
  };
}

/**
 * Get riddle question only (without answer)
 * Useful for API responses where answer should be revealed separately
 */
export function getRiddleQuestion(date: Date = new Date()): Omit<DailyRiddle, 'answer'> {
  const riddle = getDailyRiddle(date);
  const { answer, ...questionData } = riddle;
  return questionData;
}

/**
 * Get all riddles (for admin/testing purposes)
 */
export function getAllRiddles(): Riddle[] {
  return [...RIDDLES];
}

/**
 * Get riddle count
 */
export function getRiddleCount(): number {
  return RIDDLES.length;
}

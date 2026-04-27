/**
 * Word Ladder Service
 * Deterministic daily puzzle generation & client-side validation.
 * No network calls required — everything runs against the bundled word list.
 */

import {
  getWordsByLength,
  LADDER_PAIRS_3,
  LADDER_PAIRS_4,
  type LadderPair,
} from '../data/wordLadderWords.js';

/* ──────────────────────────── helpers ──────────────────────────── */

/** Simple seeded PRNG (mulberry32). */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn a YYYY-MM-DD string into a numeric seed. */
function dateSeed(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(31, h) + dateStr.charCodeAt(i)) | 0;
  }
  return h;
}

/* ──────────────────────── public types ─────────────────────────── */

export interface DailyWordLadder {
  date: string;
  start: string;
  end: string;
  wordLength: number;
  minSteps: number;
}

/* ──────────────────── daily puzzle generation ──────────────────── */

/**
 * Returns today's (or the given date's) Word Ladder puzzle.
 * Deterministic: same date → same puzzle.
 */
export function getDailyWordLadder(date: Date = new Date()): DailyWordLadder {
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

  const rng = seededRandom(dateSeed(dateStr));

  // Alternate between 3-letter (easier) and 4-letter days
  const dayNum = Math.floor(date.getTime() / 86400000);
  const pairs = dayNum % 2 === 0 ? LADDER_PAIRS_3 : LADDER_PAIRS_4;

  const idx = Math.floor(rng() * pairs.length);
  const pair: LadderPair = pairs[idx];

  return {
    date: dateStr,
    start: pair.start,
    end: pair.end,
    wordLength: pair.start.length,
    minSteps: pair.minSteps,
  };
}

/* ──────────────────── validation helpers ───────────────────────── */

/** Are two words of the same length differing in exactly one letter? */
export function differsByOneLetter(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
    if (diffs > 1) return false;
  }
  return diffs === 1;
}

/** Is the word in our dictionary for its length? */
export function isValidWord(word: string): boolean {
  const dict = getWordsByLength(word.length);
  return dict.has(word.toUpperCase());
}

export type StepResult = {
  word: string;
  valid: boolean;
  error?: string;
};

/**
 * Validate an entire chain from start → end.
 * `chain` should include every word the player entered (NOT including the
 * pre-filled start word, but INCLUDING the target end word if they reached it).
 *
 * Returns per-step validation results plus an overall `won` flag.
 */
export function validateChain(
  start: string,
  end: string,
  chain: string[],
): { steps: StepResult[]; won: boolean } {
  const upperStart = start.toUpperCase();
  const upperEnd = end.toUpperCase();
  const wordLen = upperStart.length;

  let prev = upperStart;
  const steps: StepResult[] = [];
  let allValid = true;

  for (const raw of chain) {
    const word = raw.toUpperCase();

    if (word.length !== wordLen) {
      steps.push({ word, valid: false, error: `Must be ${wordLen} letters` });
      allValid = false;
      continue;
    }

    if (!isValidWord(word)) {
      steps.push({ word, valid: false, error: 'Not a valid word' });
      allValid = false;
      continue;
    }

    if (!differsByOneLetter(prev, word)) {
      steps.push({ word, valid: false, error: 'Change exactly one letter' });
      allValid = false;
      continue;
    }

    steps.push({ word, valid: true });
    prev = word;
  }

  const won = allValid && chain.length > 0 && prev === upperEnd;
  return { steps, won };
}

/**
 * Use BFS to find the shortest path between two words.
 * Returns null if no path exists, otherwise the path (including start and end).
 */
export function findShortestPath(start: string, end: string): string[] | null {
  const upperStart = start.toUpperCase();
  const upperEnd = end.toUpperCase();

  if (upperStart === upperEnd) return [upperStart];

  const dict = getWordsByLength(upperStart.length);
  if (!dict.has(upperStart) || !dict.has(upperEnd)) return null;

  const visited = new Set<string>([upperStart]);
  const parent = new Map<string, string>();
  const queue: string[] = [upperStart];

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (let i = 0; i < current.length; i++) {
      for (const ch of alpha) {
        if (ch === current[i]) continue;
        const next = current.slice(0, i) + ch + current.slice(i + 1);

        if (!dict.has(next) || visited.has(next)) continue;

        visited.add(next);
        parent.set(next, current);

        if (next === upperEnd) {
          // reconstruct path
          const path: string[] = [next];
          let w = next;
          while (parent.has(w)) {
            w = parent.get(w)!;
            path.push(w);
          }
          return path.reverse();
        }

        queue.push(next);
      }
    }
  }

  return null; // no path
}

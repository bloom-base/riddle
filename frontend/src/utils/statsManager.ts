/**
 * statsManager — persists per-puzzle-type solve metrics in localStorage.
 *
 * Tracked data per puzzle type:
 *   - total solves
 *   - total time spent (ms) — only for timed puzzles
 *   - accuracy (correct / total attempts) — only for attempt-based puzzles
 *
 * Also tracks aggregate stats across all types.
 */

const STORAGE_KEY = 'riddlePuzzleStats';

export type PuzzleType = 'quotes' | 'wordLadder' | 'riddle';

export interface PuzzleTypeStats {
  totalSolved: number;
  totalTimeMs: number;   // cumulative solve time (0 if not timed)
  totalAttempts: number;  // total submit attempts (for accuracy)
  fastestTimeMs: number;  // best solve time (Infinity stored as 0)
}

export interface PuzzleStats {
  quotes: PuzzleTypeStats;
  wordLadder: PuzzleTypeStats;
  riddle: PuzzleTypeStats;
  /** ISO date string of first ever recorded solve */
  firstSolveDate: string | null;
}

function emptyTypeStats(): PuzzleTypeStats {
  return { totalSolved: 0, totalTimeMs: 0, totalAttempts: 0, fastestTimeMs: 0 };
}

function emptyStats(): PuzzleStats {
  return {
    quotes: emptyTypeStats(),
    wordLadder: emptyTypeStats(),
    riddle: emptyTypeStats(),
    firstSolveDate: null,
  };
}

export function loadStats(): PuzzleStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PuzzleStats;
      // Ensure all keys exist (forward-compat)
      return {
        quotes: { ...emptyTypeStats(), ...parsed.quotes },
        wordLadder: { ...emptyTypeStats(), ...parsed.wordLadder },
        riddle: { ...emptyTypeStats(), ...parsed.riddle },
        firstSolveDate: parsed.firstSolveDate ?? null,
      };
    }
  } catch {
    // corrupt data — start fresh
  }
  return emptyStats();
}

export function saveStats(stats: PuzzleStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    /* quota exceeded — silently ignore */
  }
}

export interface RecordSolveOptions {
  type: PuzzleType;
  timeMs?: number;      // solve time in ms (optional)
  attempts?: number;    // number of attempts for this solve (default 1)
}

/**
 * Record a puzzle completion and return the updated stats.
 */
export function recordPuzzleSolve(opts: RecordSolveOptions): PuzzleStats {
  const stats = loadStats();
  const typeStats = stats[opts.type];

  typeStats.totalSolved += 1;
  typeStats.totalAttempts += opts.attempts ?? 1;

  if (opts.timeMs && opts.timeMs > 0) {
    typeStats.totalTimeMs += opts.timeMs;
    if (typeStats.fastestTimeMs === 0 || opts.timeMs < typeStats.fastestTimeMs) {
      typeStats.fastestTimeMs = opts.timeMs;
    }
  }

  if (!stats.firstSolveDate) {
    stats.firstSolveDate = new Date().toISOString().slice(0, 10);
  }

  saveStats(stats);
  return stats;
}

/* ── Derived helpers ── */

export function getTotalSolved(stats: PuzzleStats): number {
  return stats.quotes.totalSolved + stats.wordLadder.totalSolved + stats.riddle.totalSolved;
}

export function getAverageSolveTimeMs(stats: PuzzleStats): number {
  // Only quotes have meaningful timed data
  const q = stats.quotes;
  if (q.totalSolved === 0 || q.totalTimeMs === 0) return 0;
  return Math.round(q.totalTimeMs / q.totalSolved);
}

export function getAccuracyPercent(stats: PuzzleStats): number {
  // Accuracy = solves / attempts for quotes (the only puzzle with retries)
  const q = stats.quotes;
  if (q.totalAttempts === 0) return 0;
  return Math.round((q.totalSolved / q.totalAttempts) * 100);
}

export function formatTime(ms: number): string {
  if (ms <= 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function resetStats(): PuzzleStats {
  const fresh = emptyStats();
  saveStats(fresh);
  return fresh;
}

/**
 * Stats Manager – tracks per-puzzle solve data in localStorage.
 *
 * Each completion is stored as a PuzzleStat and grouped by difficulty
 * for the DifficultyChart visualisation on the stats dashboard.
 */

const STORAGE_KEY = 'riddlePuzzleStats';
const MAX_ENTRIES = 500; // keep storage bounded

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleStat {
  date: string;            // YYYY-MM-DD
  difficulty: Difficulty;
  solveTimeMs: number;     // milliseconds to complete
  accuracy: number;        // 0-100 (percentage of correct answers)
  puzzleType: 'quote' | 'riddle' | 'wordladder';
  timestamp: number;       // epoch ms when recorded
}

export interface DifficultyAggregate {
  difficulty: Difficulty;
  avgSolveTimeSec: number;
  avgAccuracy: number;
  totalSolved: number;
  recentSolveTimes: number[];   // last N solve times in seconds (for trend)
  recentAccuracies: number[];   // last N accuracies (for trend)
}

function loadStats(): PuzzleStat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as PuzzleStat[];
    }
  } catch {
    // ignore corrupt data
  }
  return [];
}

function saveStats(stats: PuzzleStat[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats.slice(-MAX_ENTRIES)));
}

/**
 * Record a puzzle completion.
 * De-duplicates by date+puzzleType so the same puzzle isn't counted twice.
 */
export function recordPuzzleStat(stat: Omit<PuzzleStat, 'timestamp'>): void {
  const stats = loadStats();
  const exists = stats.some(
    (s) => s.date === stat.date && s.puzzleType === stat.puzzleType
  );
  if (exists) return;

  stats.push({ ...stat, timestamp: Date.now() });
  saveStats(stats);
}

/** Get all raw stats */
export function getAllStats(): PuzzleStat[] {
  return loadStats();
}

/**
 * Aggregate stats by difficulty, returning averages and recent data points.
 * @param limit  Number of recent data points for trend lines (default 10)
 */
export function getStatsByDifficulty(limit = 10): DifficultyAggregate[] {
  const stats = loadStats();
  const byDifficulty: Record<Difficulty, PuzzleStat[]> = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const s of stats) {
    if (byDifficulty[s.difficulty]) {
      byDifficulty[s.difficulty].push(s);
    }
  }

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  return difficulties.map((diff) => {
    const items = byDifficulty[diff].sort((a, b) => a.timestamp - b.timestamp);
    const recent = items.slice(-limit);

    const totalSolved = items.length;
    const avgSolveTimeSec =
      totalSolved > 0
        ? items.reduce((sum, s) => sum + s.solveTimeMs, 0) / totalSolved / 1000
        : 0;
    const avgAccuracy =
      totalSolved > 0
        ? items.reduce((sum, s) => sum + s.accuracy, 0) / totalSolved
        : 0;

    return {
      difficulty: diff,
      avgSolveTimeSec: Math.round(avgSolveTimeSec * 10) / 10,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      totalSolved,
      recentSolveTimes: recent.map((s) => Math.round(s.solveTimeMs / 1000)),
      recentAccuracies: recent.map((s) => s.accuracy),
    };
  });
}

/** Clear all stats (for testing / reset) */
export function clearStats(): void {
  localStorage.removeItem(STORAGE_KEY);
}

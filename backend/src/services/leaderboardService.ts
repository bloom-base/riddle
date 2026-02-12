/**
 * Leaderboard Service
 * Tracks completion times and solver names for daily puzzles
 * Uses in-memory storage for demo (can be upgraded to database)
 */

export interface LeaderboardEntry {
  username: string;
  completionTime: number; // milliseconds
  timestamp: string; // ISO timestamp
  date: string; // YYYY-MM-DD
}

export interface DailyStats {
  date: string;
  totalSolvers: number;
  averageTime: number; // milliseconds
  fastestTime: number; // milliseconds
  fastestSolver: string;
}

// In-memory storage: date -> array of entries
const leaderboards = new Map<string, LeaderboardEntry[]>();

/**
 * Submit a completion time to the leaderboard
 */
export function submitCompletion(
  date: string,
  username: string,
  completionTime: number
): LeaderboardEntry {
  if (!leaderboards.has(date)) {
    leaderboards.set(date, []);
  }

  const entry: LeaderboardEntry = {
    username: sanitizeUsername(username),
    completionTime,
    timestamp: new Date().toISOString(),
    date
  };

  const entries = leaderboards.get(date)!;
  entries.push(entry);

  // Keep only last 100 entries per day to prevent unbounded growth
  if (entries.length > 100) {
    entries.shift();
  }

  return entry;
}

/**
 * Get leaderboard for a specific date, sorted by completion time
 */
export function getLeaderboard(date: string, limit: number = 20): LeaderboardEntry[] {
  const entries = leaderboards.get(date) || [];
  return entries
    .sort((a, b) => a.completionTime - b.completionTime)
    .slice(0, limit);
}

/**
 * Get statistics for a specific date
 */
export function getDailyStats(date: string): DailyStats {
  const entries = leaderboards.get(date) || [];

  if (entries.length === 0) {
    return {
      date,
      totalSolvers: 0,
      averageTime: 0,
      fastestTime: 0,
      fastestSolver: 'No solvers yet'
    };
  }

  const sortedByTime = [...entries].sort((a, b) => a.completionTime - b.completionTime);
  const fastestEntry = sortedByTime[0];
  const averageTime = entries.reduce((sum, e) => sum + e.completionTime, 0) / entries.length;

  return {
    date,
    totalSolvers: entries.length,
    averageTime: Math.round(averageTime),
    fastestTime: fastestEntry.completionTime,
    fastestSolver: fastestEntry.username
  };
}

/**
 * Check if a username is already on the leaderboard for today
 */
export function hasCompletedToday(date: string, username: string): boolean {
  const entries = leaderboards.get(date) || [];
  return entries.some((e) => e.username === sanitizeUsername(username));
}

/**
 * Get user's fastest time for a date
 */
export function getUserBestTime(date: string, username: string): LeaderboardEntry | null {
  const entries = leaderboards.get(date) || [];
  const userEntries = entries.filter((e) => e.username === sanitizeUsername(username));

  if (userEntries.length === 0) return null;

  return userEntries.reduce((best, current) =>
    current.completionTime < best.completionTime ? current : best
  );
}

/**
 * Sanitize username to prevent injection and keep it reasonable
 */
function sanitizeUsername(username: string): string {
  return username
    .trim()
    .substring(0, 50) // Max 50 characters
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Clear old leaderboards (older than 7 days) - useful for memory management
 */
export function clearOldLeaderboards(daysToKeep: number = 7): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffString = cutoffDate.toISOString().split('T')[0];

  for (const date of leaderboards.keys()) {
    if (date < cutoffString) {
      leaderboards.delete(date);
    }
  }
}

/**
 * Get size of leaderboard storage (for debugging)
 */
export function getStorageStats(): {
  totalDates: number;
  totalEntries: number;
  memoryUsageEstimate: string;
} {
  let totalEntries = 0;
  for (const entries of leaderboards.values()) {
    totalEntries += entries.length;
  }

  // Rough estimate: ~200 bytes per entry
  const estimatedBytes = totalEntries * 200;
  const estimatedMB = (estimatedBytes / 1024 / 1024).toFixed(2);

  return {
    totalDates: leaderboards.size,
    totalEntries,
    memoryUsageEstimate: `${estimatedMB} MB`
  };
}

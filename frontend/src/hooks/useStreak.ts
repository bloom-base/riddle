import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'riddleSolveHistory';
const MAX_STORED_DATES = 365;

interface SolveHistory {
  solvedDates: string[]; // sorted YYYY-MM-DD strings
  longestStreak: number;
}

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  hasSolvedDate: (date: string) => boolean;
  recordSolve: (date: string) => void;
}

/** Add one day to a YYYY-MM-DD string (UTC, so no DST issues) */
function addDay(date: string): string {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Compute current streak and all-time longest from a sorted array of unique dates */
function computeStreaks(solvedDates: string[]): { current: number; longest: number } {
  if (solvedDates.length === 0) return { current: 0, longest: 0 };

  // Longest streak: scan forward looking for consecutive days
  let longest = 1;
  let run = 1;
  for (let i = 1; i < solvedDates.length; i++) {
    if (addDay(solvedDates[i - 1]) === solvedDates[i]) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Current streak: walk backwards from the last solved date
  const last = solvedDates[solvedDates.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);

  // Streak is alive only if the player solved today or yesterday
  if (last !== today && last !== yesterday) {
    return { current: 0, longest };
  }

  let current = 1;
  for (let i = solvedDates.length - 2; i >= 0; i--) {
    if (addDay(solvedDates[i]) === solvedDates[i + 1]) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

function loadHistory(): SolveHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SolveHistory;
      if (Array.isArray(parsed.solvedDates)) return parsed;
    }
  } catch {
    // ignore corrupt data
  }
  return { solvedDates: [], longestStreak: 0 };
}

function saveHistory(history: SolveHistory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useStreak(): StreakInfo {
  const [history, setHistory] = useState<SolveHistory>(() => loadHistory());

  // Memoize streak computation — only re-runs when solvedDates array changes
  const { current, longest } = useMemo(
    () => computeStreaks(history.solvedDates),
    [history.solvedDates]
  );

  // Cache as a Set for O(1) lookups
  const solvedDatesSet = useMemo(
    () => new Set(history.solvedDates),
    [history.solvedDates]
  );

  const hasSolvedDate = useCallback(
    (date: string) => solvedDatesSet.has(date),
    [solvedDatesSet]
  );

  const recordSolve = useCallback((date: string) => {
    setHistory((prev) => {
      if (prev.solvedDates.includes(date)) return prev; // already recorded

      // Fast path: new dates are almost always appended to the end
      const last = prev.solvedDates[prev.solvedDates.length - 1];
      const inserted =
        prev.solvedDates.length === 0 || date > last
          ? [...prev.solvedDates, date]
          : [...prev.solvedDates, date].sort();

      const solvedDates = inserted.slice(-MAX_STORED_DATES);

      const { longest: newLongest } = computeStreaks(solvedDates);
      const next: SolveHistory = {
        solvedDates,
        longestStreak: Math.max(prev.longestStreak, newLongest),
      };
      saveHistory(next);
      return next;
    });
  }, []);

  return {
    currentStreak: current,
    // longestStreak stored in history handles gaps across sessions
    longestStreak: Math.max(longest, history.longestStreak),
    hasSolvedDate,
    recordSolve,
  };
}

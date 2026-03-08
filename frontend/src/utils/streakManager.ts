/**
 * Streak Manager - Handles user's daily puzzle completion streak
 */

export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
  totalCompletions: number;
}

const STORAGE_KEY = 'riddleStreakData';

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format (local timezone)
 */
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Load streak data from localStorage
 */
export function loadStreakData(): StreakData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        currentStreak: 0,
        lastCompletedDate: null,
        longestStreak: 0,
        totalCompletions: 0,
      };
    }
    return JSON.parse(stored) as StreakData;
  } catch (error) {
    console.error('Error loading streak data:', error);
    return {
      currentStreak: 0,
      lastCompletedDate: null,
      longestStreak: 0,
      totalCompletions: 0,
    };
  }
}

/**
 * Save streak data to localStorage
 */
export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving streak data:', error);
  }
}

/**
 * Check if the current streak should be reset based on last completed date
 */
export function shouldResetStreak(lastCompletedDate: string | null): boolean {
  if (!lastCompletedDate) return false;
  
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  
  // Streak continues if last completed was today or yesterday
  // Streak resets if it was before yesterday
  return lastCompletedDate !== today && lastCompletedDate !== yesterday;
}

/**
 * Update streak data when a puzzle is completed
 * Returns the updated streak data and whether this was today's first completion
 */
export function recordCompletion(date: string): { 
  streakData: StreakData; 
  isNewCompletion: boolean;
  previousStreak: number;
} {
  const streakData = loadStreakData();
  const today = getTodayDate();
  
  // Check if they already completed today
  if (streakData.lastCompletedDate === today) {
    return { 
      streakData, 
      isNewCompletion: false,
      previousStreak: streakData.currentStreak 
    };
  }
  
  const previousStreak = streakData.currentStreak;
  
  // Check if streak should be reset
  if (shouldResetStreak(streakData.lastCompletedDate)) {
    streakData.currentStreak = 1;
  } else {
    // Continue the streak
    streakData.currentStreak += 1;
  }
  
  // Update stats
  streakData.lastCompletedDate = today;
  streakData.totalCompletions += 1;
  
  // Update longest streak
  if (streakData.currentStreak > streakData.longestStreak) {
    streakData.longestStreak = streakData.currentStreak;
  }
  
  saveStreakData(streakData);
  
  return { 
    streakData, 
    isNewCompletion: true,
    previousStreak 
  };
}

/**
 * Get the current streak, checking if it needs to be reset
 */
export function getCurrentStreak(): StreakData {
  const streakData = loadStreakData();
  
  if (shouldResetStreak(streakData.lastCompletedDate)) {
    streakData.currentStreak = 0;
    saveStreakData(streakData);
  }
  
  return streakData;
}

/**
 * Check if a streak number is a milestone
 */
export function isMilestone(streak: number): boolean {
  return [3, 7, 14, 30, 50, 100, 365].includes(streak);
}

/**
 * Get the next milestone after the current streak
 */
export function getNextMilestone(currentStreak: number): number {
  const milestones = [3, 7, 14, 30, 50, 100, 365];
  return milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
}

/**
 * Get a motivational message based on streak length
 */
export function getMotivationalMessage(streak: number): string {
  if (streak === 1) return "Great start! Keep it up!";
  if (streak === 2) return "Two in a row! You're on fire!";
  if (streak === 3) return "Three days! The habit is forming!";
  if (streak < 7) return "Keep the streak alive!";
  if (streak === 7) return "One week straight! Amazing!";
  if (streak < 14) return "You're unstoppable!";
  if (streak === 14) return "Two weeks! You're a puzzle master!";
  if (streak < 30) return "Incredible dedication!";
  if (streak === 30) return "30 days! That's legendary!";
  if (streak < 100) return "You're on an epic journey!";
  if (streak === 100) return "100 days! You're a puzzle legend!";
  return "Unbelievable! Keep going!";
}

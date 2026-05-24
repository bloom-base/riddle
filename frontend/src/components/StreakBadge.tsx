import { useState, useEffect, useRef } from 'react';
import Confetti from './Confetti';
import './StreakBadge.css';

const MILESTONES = [7, 14, 30, 50, 100, 365];
const MILESTONE_STORAGE_KEY = 'riddleLastTriggeredMilestone';

/** Return the highest milestone the streak has reached (or 0) */
function highestMilestone(streak: number): number {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= MILESTONES[i]) return MILESTONES[i];
  }
  return 0;
}

/** Pick fire emoji size tier based on streak */
function flameTier(streak: number): 'none' | 'base' | 'warm' | 'hot' | 'inferno' {
  if (streak <= 0) return 'none';
  if (streak < 7) return 'base';
  if (streak < 14) return 'warm';
  if (streak < 30) return 'hot';
  return 'inferno';
}

/** Milestone celebration message */
function milestoneMessage(milestone: number): string {
  switch (milestone) {
    case 7: return '🔥 1 week streak!';
    case 14: return '🔥🔥 2 week streak!';
    case 30: return '🌟 30 day streak!';
    case 50: return '⚡ 50 day streak!';
    case 100: return '💎 100 day streak!';
    case 365: return '👑 1 year streak!';
    default: return '';
  }
}

function getLastTriggeredMilestone(): number {
  try {
    const val = localStorage.getItem(MILESTONE_STORAGE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setLastTriggeredMilestone(milestone: number): void {
  try {
    localStorage.setItem(MILESTONE_STORAGE_KEY, String(milestone));
  } catch {
    // ignore
  }
}

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  solvedToday: boolean;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  longestStreak,
  solvedToday,
}) => {
  const prevStreakRef = useRef(currentStreak);
  const [showPulse, setShowPulse] = useState(false);
  const [showMilestoneConfetti, setShowMilestoneConfetti] = useState(false);
  const [milestoneText, setMilestoneText] = useState('');

  const tier = flameTier(currentStreak);
  const milestone = highestMilestone(currentStreak);

  // Detect streak increase → trigger pulse and possibly milestone confetti
  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = currentStreak;

    // Only animate when streak actually increased (not on initial mount with same value)
    if (currentStreak > prev && prev >= 0) {
      // Pulse animation on every increase
      setShowPulse(true);
      const pulseTimer = setTimeout(() => setShowPulse(false), 800);

      // Milestone confetti: only if we just crossed a milestone boundary
      const prevMilestone = highestMilestone(prev);
      if (milestone > prevMilestone) {
        const lastTriggered = getLastTriggeredMilestone();
        if (milestone > lastTriggered) {
          setLastTriggeredMilestone(milestone);
          setMilestoneText(milestoneMessage(milestone));
          setShowMilestoneConfetti(true);

          const confettiTimer = setTimeout(() => {
            setShowMilestoneConfetti(false);
            setMilestoneText('');
          }, 4000);

          return () => {
            clearTimeout(pulseTimer);
            clearTimeout(confettiTimer);
          };
        }
      }

      return () => clearTimeout(pulseTimer);
    }
  }, [currentStreak, milestone]);

  // Also check on mount: if we're at a milestone that hasn't been celebrated yet
  // (e.g., page loaded right after streak was recorded elsewhere)
  useEffect(() => {
    if (solvedToday && milestone > 0) {
      const lastTriggered = getLastTriggeredMilestone();
      if (milestone > lastTriggered) {
        setLastTriggeredMilestone(milestone);
        setMilestoneText(milestoneMessage(milestone));
        setShowMilestoneConfetti(true);

        const timer = setTimeout(() => {
          setShowMilestoneConfetti(false);
          setMilestoneText('');
        }, 4000);

        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only on mount

  const badgeClasses = [
    'streak-badge',
    solvedToday ? 'solved-today' : '',
    currentStreak > 0 ? 'has-streak' : '',
    showPulse ? 'streak-pulse' : '',
    milestone >= 30 ? 'milestone-glow' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <Confetti
        active={showMilestoneConfetti}
        duration={3000}
        particleCount={80}
      />
      <div className={badgeClasses}>
        <div className="streak-main">
          <span className={`streak-flame flame-${tier}`} aria-hidden="true">
            {currentStreak > 0 ? '🔥' : '○'}
          </span>
          <span className="streak-count">{currentStreak}</span>
          <span className="streak-label">day{currentStreak !== 1 ? 's' : ''}</span>
        </div>

        {milestoneText && (
          <div className="milestone-message" role="status">
            {milestoneText}
          </div>
        )}

        {solvedToday && !milestoneText && (
          <div className="solved-today-badge" title="You've completed today's puzzle!">
            ✓ Today
          </div>
        )}

        {longestStreak > 1 && (
          <div className="streak-best" title={`Your best streak: ${longestStreak} days`}>
            Best: {longestStreak}
          </div>
        )}
      </div>
    </>
  );
};

export default StreakBadge;

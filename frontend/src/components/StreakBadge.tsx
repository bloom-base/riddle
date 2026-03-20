import './StreakBadge.css';

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
  return (
    <div className={`streak-badge ${solvedToday ? 'solved-today' : ''} ${currentStreak > 0 ? 'has-streak' : ''}`}>
      <div className="streak-main">
        <span className="streak-flame" aria-hidden="true">
          {currentStreak > 0 ? '🔥' : '○'}
        </span>
        <span className="streak-count">{currentStreak}</span>
        <span className="streak-label">day{currentStreak !== 1 ? 's' : ''}</span>
      </div>

      {solvedToday && (
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
  );
};

export default StreakBadge;

import React, { useEffect, useState } from 'react';
import './StreakCounter.css';
import { isMilestone, getMotivationalMessage, getNextMilestone } from '../utils/streakManager';

interface StreakCounterProps {
  streak: number;
  showCelebration?: boolean;
  onCelebrationEnd?: () => void;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ 
  streak, 
  showCelebration = false,
  onCelebrationEnd 
}) => {
  const [celebrating, setCelebrating] = useState(false);
  const [animateStreak, setAnimateStreak] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      setCelebrating(true);
      setAnimateStreak(true);
      
      // End celebration after 3 seconds
      const timer = setTimeout(() => {
        setCelebrating(false);
        onCelebrationEnd?.();
      }, 3000);

      // Reset animation after it plays
      const animTimer = setTimeout(() => {
        setAnimateStreak(false);
      }, 600);

      return () => {
        clearTimeout(timer);
        clearTimeout(animTimer);
      };
    }
  }, [showCelebration, onCelebrationEnd]);

  if (streak === 0) {
    return null;
  }

  const milestone = isMilestone(streak);
  const nextMilestone = getNextMilestone(streak);
  const message = getMotivationalMessage(streak);

  return (
    <div className={`streak-counter ${milestone ? 'milestone' : ''} ${celebrating ? 'celebrating' : ''}`}>
      <div className={`streak-display ${animateStreak ? 'animate' : ''}`}>
        <span className="streak-icon">🔥</span>
        <span className="streak-number">{streak}</span>
        <span className="streak-label">day{streak !== 1 ? 's' : ''}</span>
      </div>
      
      {streak >= 3 && (
        <div className="streak-message">
          {message}
        </div>
      )}

      {!milestone && nextMilestone && (
        <div className="streak-progress">
          <div className="progress-text">
            {nextMilestone - streak} more {nextMilestone - streak === 1 ? 'day' : 'days'} to {nextMilestone}-day milestone!
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(streak / nextMilestone) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {celebrating && milestone && (
        <div className="milestone-celebration">
          <div className="confetti-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="confetti-piece" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              />
            ))}
          </div>
          <div className="milestone-message">
            <div className="milestone-icon">🎉</div>
            <div className="milestone-text">
              <strong>{streak}-Day Milestone!</strong>
              <p>Incredible dedication!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakCounter;

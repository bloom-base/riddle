import React, { useState, useEffect, useRef } from 'react';
import './PuzzleTimer.css';

interface PuzzleTimerProps {
  /** Whether the timer is visible (controlled by settings) */
  visible: boolean;
  /** Callback fired when the timer reaches zero */
  onExpire?: () => void;
  /** CSS class name override */
  className?: string;
}

/**
 * Returns the next local midnight as an epoch timestamp (ms).
 */
function nextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Total milliseconds in one day – used as the "full bar" reference.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns a CSS colour for the progress bar.
 * 100 → 50 %  green
 *  50 → 15 %  yellow/amber
 *  15 →  0 %  red
 */
function barColor(pct: number): string {
  if (pct > 50) return 'var(--timer-green)';
  if (pct > 15) return 'var(--timer-yellow)';
  return 'var(--timer-red)';
}

/**
 * Visual countdown timer with a horizontal progress bar that empties as
 * midnight approaches. Colour shifts green → yellow → red.
 */
const PuzzleTimer: React.FC<PuzzleTimerProps> = ({
  visible,
  onExpire,
  className = '',
}) => {
  // Capture the target once on mount so it doesn't reset at midnight
  const targetRef = useRef(nextMidnight());
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(0, targetRef.current - Date.now())
  );
  const [expired, setExpired] = useState(false);
  const expiredRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, targetRef.current - Date.now());
      setRemaining(ms);

      if (ms <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setExpired(true);
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpire]);

  if (!visible) return null;

  // Format HH:MM:SS
  const totalSecs = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (how much time is left in the day)
  const pct = Math.min(100, Math.max(0, (remaining / MS_PER_DAY) * 100));
  const color = barColor(pct);

  return (
    <div
      className={`puzzle-timer ${expired ? 'puzzle-timer--expired' : ''} ${className}`}
      role="timer"
      aria-label={expired ? 'Time expired' : `Time remaining: ${display}`}
    >
      {expired ? (
        <div className="puzzle-timer__expired-msg">
          <span className="puzzle-timer__expired-icon" aria-hidden="true">🌙</span>
          <span className="puzzle-timer__expired-text">Come back tomorrow!</span>
        </div>
      ) : (
        <>
          <div className="puzzle-timer__header">
            <span className="puzzle-timer__label">Time remaining</span>
            <span className="puzzle-timer__digits">{display}</span>
          </div>
          <div
            className="puzzle-timer__track"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="puzzle-timer__fill"
              style={{
                width: `${pct}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PuzzleTimer;

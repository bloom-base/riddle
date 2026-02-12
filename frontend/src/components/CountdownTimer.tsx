import React, { useState, useEffect } from 'react';
import './CountdownTimer.css';

interface CountdownTimerProps {
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeRemaining) {
    return null;
  }

  return (
    <div className={`countdown-timer ${className}`}>
      <div className="countdown-label">Next puzzle in</div>
      <div className="countdown-display">
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeRemaining.hours).padStart(2, '0')}</span>
          <span className="countdown-unit-label">Hours</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span className="countdown-unit-label">Minutes</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-unit">
          <span className="countdown-value">{String(timeRemaining.seconds).padStart(2, '0')}</span>
          <span className="countdown-unit-label">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;

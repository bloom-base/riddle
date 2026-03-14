import React, { useEffect, useState } from 'react';
import './Confetti.css';

interface ConfettiProps {
  active: boolean;
  duration?: number; // Duration in milliseconds (default: 2500)
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 2500,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setIsVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration, onComplete]);

  if (!isVisible) return null;

  // Generate confetti particles
  const particles = [];
  const particleCount = 50; // Optimized count for performance

  for (let i = 0; i < particleCount; i++) {
    // Random colors from the app's color palette
    const colors = [
      '#3498db', // secondary-color
      '#27ae60', // success-color
      '#e74c3c', // error-color (red)
      '#f39c12', // orange
      '#9b59b6', // purple
      '#1abc9c', // turquoise
      '#e67e22', // carrot
      '#f1c40f', // yellow
    ];

    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 0.5;
    const animationDuration = 1.5 + Math.random() * 1;
    const size = 8 + Math.random() * 6; // 8-14px
    const rotation = Math.random() * 360;

    particles.push(
      <div
        key={i}
        className="confetti-particle"
        style={{
          left: `${left}%`,
          backgroundColor: color,
          animationDelay: `${animationDelay}s`,
          animationDuration: `${animationDuration}s`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${rotation}deg)`,
        }}
      />
    );
  }

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles}
    </div>
  );
};

export default Confetti;

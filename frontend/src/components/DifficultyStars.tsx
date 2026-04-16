import React, { useEffect, useState } from 'react';
import './DifficultyStars.css';

interface DifficultyStarsProps {
  difficulty: 'easy' | 'medium' | 'hard';
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const DifficultyStars: React.FC<DifficultyStarsProps> = ({
  difficulty,
  animated = true,
  size = 'medium'
}) => {
  const [isAnimating, setIsAnimating] = useState(animated);

  // Map difficulty levels to star counts and colors
  const getDifficultyConfig = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy':
        return {
          stars: 2,
          color: 'easy',
          label: 'Easy'
        };
      case 'medium':
        return {
          stars: 3,
          color: 'medium',
          label: 'Medium'
        };
      case 'hard':
        return {
          stars: 5,
          color: 'hard',
          label: 'Hard'
        };
      default:
        return {
          stars: 1,
          color: 'easy',
          label: 'Unknown'
        };
    }
  };

  const config = getDifficultyConfig(difficulty);

  useEffect(() => {
    // Reset animation state
    setIsAnimating(animated);
  }, [difficulty, animated]);

  return (
    <div
      className={`difficulty-stars ${size} ${config.color} ${isAnimating ? 'animating' : ''}`}
      title={`Difficulty: ${config.label}`}
      aria-label={`Difficulty: ${config.label} (${config.stars} star${config.stars !== 1 ? 's' : ''})`}
    >
      {Array.from({ length: config.stars }).map((_, index) => (
        <span
          key={index}
          className="star"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default DifficultyStars;

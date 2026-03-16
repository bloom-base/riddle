import React, { useState } from 'react';
import './DailyRiddle.css';

interface DailyRiddleData {
  date: string;
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
}

interface DailyRiddleProps {
  riddle: DailyRiddleData;
}

const DailyRiddle: React.FC<DailyRiddleProps> = ({ riddle }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  return (
    <div className="daily-riddle">
      <div className="riddle-header">
        <h2>🤔 Daily Riddle</h2>
        <div className="riddle-meta">
          <span className="difficulty" title={`Difficulty: ${riddle.difficulty}`}>
            {getDifficultyEmoji(riddle.difficulty)}
          </span>
          <span className="category">{riddle.category}</span>
        </div>
      </div>

      <div className="riddle-content">
        <div className="riddle-question">
          <p>{riddle.question}</p>
        </div>

        {!isRevealed ? (
          <button
            className="reveal-button"
            onClick={handleReveal}
            aria-label="Reveal answer"
          >
            💡 Reveal Answer
          </button>
        ) : (
          <div className="riddle-answer revealed">
            <div className="answer-label">Answer:</div>
            <div className="answer-text">{riddle.answer}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRiddle;

import React from 'react';
import './HintButton.css';

interface HintButtonProps {
  onHintClick: () => void;
  hintsUsed: number;
  disabled?: boolean;
}

/**
 * HintButton Component
 * Provides a button to reveal hints for stuck players
 */
const HintButton: React.FC<HintButtonProps> = ({ onHintClick, hintsUsed, disabled = false }) => {
  return (
    <div className="hint-container">
      <button
        className="hint-button"
        onClick={onHintClick}
        disabled={disabled}
        aria-label="Get a hint"
      >
        💡 Hint ({hintsUsed} used)
      </button>
      {hintsUsed > 0 && (
        <div className="hint-warning" role="status">
          Using hints affects leaderboard ranking
        </div>
      )}
    </div>
  );
};

export default HintButton;

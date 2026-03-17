import React, { useState, useEffect } from 'react';
import './QuoteMatchingPuzzle.css';

// Confetti Component
const Confetti: React.FC = () => {
  useEffect(() => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84'];
    const confettiCount = Math.floor(Math.random() * 21) + 30; // 30-50 pieces

    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';

      // Random properties
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 0.5;
      const animationDuration = 2 + Math.random() * 1; // 2-3 seconds
      const rotation = Math.random() * 360;
      const size = Math.random() * 8 + 6; // 6-14px

      confetti.style.cssText = `
        left: ${left}%;
        background-color: ${color};
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        transform: rotate(${rotation}deg);
        width: ${size}px;
        height: ${size}px;
      `;

      confettiContainer.appendChild(confetti);
    }

    // Cleanup after animation completes
    const cleanup = setTimeout(() => {
      confettiContainer.remove();
    }, 3500); // Clean up after 3.5 seconds

    return () => {
      clearTimeout(cleanup);
      confettiContainer.remove();
    };
  }, []);

  return null;
};

interface Fragment {
  id: string;
  text: string;
}

interface Puzzle {
  date: string;
  openings: Fragment[];
  closings: Fragment[];
  correctMatches: Array<{ id: string; openingId: string; closingId: string }>;
  hints: Array<{ id: string; hint: string }>;
}

interface Match {
  id: string;
  openingId: string;
  closingId: string;
}

interface QuoteMatchingPuzzleProps {
  puzzle: Puzzle;
  onComplete?: (completionTimeMs: number) => void;
  startTime?: number;
}

const QuoteMatchingPuzzle: React.FC<QuoteMatchingPuzzleProps> = ({ 
  puzzle, 
  onComplete,
  startTime = 0
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedOpening, setDraggedOpening] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    allCorrect: boolean;
    results?: Record<string, boolean>;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [shownHints, setShownHints] = useState<Set<string>>(new Set());

  // Get the closing fragment ID that matches a given opening
  const getMatchedClosingId = (openingId: string): string | undefined => {
    return matches.find((m) => m.openingId === openingId)?.closingId;
  };

  // Handle drag start on opening fragment
  const handleDragStart = (openingId: string) => {
    setDraggedOpening(openingId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedOpening(null);
  };

  // Handle drop on closing fragment
  const handleDropOnClosing = (closingId: string) => {
    if (draggedOpening === null) return;

    // Find the quote ID from the opening and closing
    const opening = puzzle.openings.find((o) => o.id === draggedOpening);
    const closing = puzzle.closings.find((c) => c.id === closingId);

    if (!opening || !closing) return;

    // Extract quote ID (format: "opening_quoteId" or "closing_quoteId")
    const quoteId = draggedOpening.replace('opening_', '');

    // Add or update match
    const newMatches = matches.filter((m) => m.openingId !== draggedOpening);
    newMatches.push({
      id: quoteId,
      openingId: draggedOpening,
      closingId
    });

    setMatches(newMatches);
    setDraggedOpening(null);
  };

  // Handle tap-based matching on mobile
  const handleTapMatch = (openingId: string, closingId: string) => {
    const opening = puzzle.openings.find((o) => o.id === openingId);
    const closing = puzzle.closings.find((c) => c.id === closingId);

    if (!opening || !closing) return;

    const quoteId = openingId.replace('opening_', '');

    const newMatches = matches.filter((m) => m.openingId !== openingId);
    newMatches.push({
      id: quoteId,
      openingId,
      closingId
    });

    setMatches(newMatches);
  };

  // Remove a match
  const handleRemoveMatch = (openingId: string) => {
    setMatches(matches.filter((m) => m.openingId !== openingId));
  };

  // Show hint for a specific quote
  const handleShowHint = (quoteId: string) => {
    setShownHints(new Set([...shownHints, quoteId]));
  };

  // Get hint text for a quote ID
  const getHintForQuote = (quoteId: string): string | undefined => {
    return puzzle.hints.find((h) => h.id === quoteId)?.hint;
  };

  // Submit answers for validation
  const handleSubmit = async () => {
    if (matches.length === 0) {
      alert('Please make at least one match');
      return;
    }

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: puzzle.date,
          matches
        })
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      setValidationResult({
        isValid: true,
        allCorrect: result.allCorrect,
        results: result.results
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Validation error:', error);
      alert('Error validating answers. Please try again.');
    }
  };

  // Call onComplete callback when puzzle is completed
  useEffect(() => {
    if (submitted && validationResult?.allCorrect && startTime && onComplete) {
      const completionTime = Date.now() - startTime;
      if (completionTime > 0) {
        onComplete(completionTime);
      }
    }
  }, [submitted, validationResult, startTime, onComplete]);

  // Render match line connecting opening to closing
  const renderMatchLine = (match: Match) => {
    const opening = puzzle.openings.find((o) => o.id === match.openingId);
    const closing = puzzle.closings.find((c) => c.id === match.closingId);

    if (!opening || !closing) return null;

    const isCorrect = puzzle.correctMatches.some(
      (cm) => cm.openingId === match.openingId && cm.closingId === match.closingId
    );

    return (
      <div key={match.id} className="match-item">
        <div className={`match-status ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '✓' : '✗'}
        </div>
        <div className="match-content">
          <p className="opening-text">{opening.text}</p>
          <p className="closing-text">{closing.text}</p>
        </div>
        <button
          className="remove-btn"
          onClick={() => handleRemoveMatch(match.openingId)}
          title="Remove this match"
        >
          ×
        </button>
      </div>
    );
  };

  if (submitted && validationResult?.allCorrect) {
    const completionTime = startTime ? Date.now() - startTime : 0;

    const formatTime = (ms: number): string => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="puzzle-container">
        <Confetti />
        <div className="completion-screen">
          <div className="celebration">🎉</div>
          <h2>Congratulations!</h2>
          <p>You've matched all the quotes correctly!</p>
          <div className="completion-time">
            ⏱️ Time: {formatTime(completionTime)}
          </div>
          <div className="matches-summary">
            <h3>Your matches:</h3>
            {matches.map(renderMatchLine)}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Back to Puzzle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="puzzle-container">
      <div className="puzzle-content">
        {/* Left Column: Opening Fragments */}
        <div className="column openings">
          <h2>Opening Fragments</h2>
          <div className="fragments-list">
            {puzzle.openings.map((opening) => {
              const isMatched = matches.some((m) => m.openingId === opening.id);
              const matchedClosingId = getMatchedClosingId(opening.id);

              return (
                <div
                  key={opening.id}
                  className={`fragment opening ${isMatched ? 'matched' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(opening.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    // Mobile: show closing options
                    const modal = document.getElementById(`closings-modal-${opening.id}`);
                    if (modal) modal.classList.add('active');
                  }}
                >
                  <span className="fragment-text">{opening.text}</span>
                  {isMatched && (
                    <span className="matched-indicator">
                      → {matchedClosingId}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Closing Fragments */}
        <div className="column closings">
          <h2>Closing Fragments</h2>
          <div className="fragments-list">
            {puzzle.closings.map((closing) => (
              <div
                key={closing.id}
                className="fragment closing"
                draggable={false}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnClosing(closing.id)}
              >
                <span className="fragment-text">{closing.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matches Summary */}
      {matches.length > 0 && (
        <div className="matches-container">
          <h3>Your Matches ({matches.length}/{puzzle.openings.length})</h3>
          <div className="matches-list">
            {matches.map(renderMatchLine)}
          </div>
        </div>
      )}

      {/* Validation Feedback */}
      {submitted && validationResult && !validationResult.allCorrect && (
        <div className="validation-feedback">
          <h3>Almost there!</h3>
          <p>
            {Object.values(validationResult.results || {}).filter((v) => v).length}{' '}
            out of {matches.length} matches are correct.
          </p>

          {/* Show hints for incorrect matches */}
          <div className="hints-section">
            {matches.map((match) => {
              const isCorrect = puzzle.correctMatches.some(
                (cm) => cm.openingId === match.openingId && cm.closingId === match.closingId
              );
              const quoteId = match.id;
              const hintText = getHintForQuote(quoteId);
              const hasShownHint = shownHints.has(quoteId);

              // Only show hint UI for incorrect matches
              if (isCorrect) return null;

              return (
                <div key={quoteId} className="hint-container">
                  {!hasShownHint ? (
                    <button
                      className="btn btn-hint"
                      onClick={() => handleShowHint(quoteId)}
                    >
                      💡 Get Hint
                    </button>
                  ) : (
                    <div className="hint-callout">
                      <div className="hint-icon">💡</div>
                      <div className="hint-text">{hintText}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setSubmitted(false);
              setValidationResult(null);
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Submit Button */}
      <div className="submit-container">
        <button
          className={`btn btn-primary ${matches.length === puzzle.openings.length ? 'ready' : ''}`}
          onClick={handleSubmit}
          disabled={matches.length === 0}
        >
          {matches.length === puzzle.openings.length
            ? '✓ Submit All Matches'
            : `Submit (${matches.length}/${puzzle.openings.length})`}
        </button>
      </div>
    </div>
  );
};

export default QuoteMatchingPuzzle;

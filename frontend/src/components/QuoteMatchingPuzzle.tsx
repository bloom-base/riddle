import React, { useState, useEffect } from 'react';
import './QuoteMatchingPuzzle.css';

interface Fragment {
  id: string;
  text: string;
}

interface Puzzle {
  date: string;
  openings: Fragment[];
  closings: Fragment[];
  correctMatches: Array<{ id: string; openingId: string; closingId: string }>;
}

interface Match {
  id: string;
  openingId: string;
  closingId: string;
}

interface QuoteMatchingPuzzleProps {
  puzzle: Puzzle;
}

const QuoteMatchingPuzzle: React.FC<QuoteMatchingPuzzleProps> = ({ puzzle }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedOpening, setDraggedOpening] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    allCorrect: boolean;
    results?: Record<string, boolean>;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
    return (
      <div className="puzzle-container">
        <div className="completion-screen">
          <div className="celebration">🎉</div>
          <h2>Congratulations!</h2>
          <p>You've matched all the quotes correctly!</p>
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

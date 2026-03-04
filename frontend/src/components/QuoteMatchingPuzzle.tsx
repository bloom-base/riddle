import React, { useState, useEffect } from 'react';
import './QuoteMatchingPuzzle.css';
import HintButton from './HintButton';

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
  onComplete?: (completionTimeMs: number, hintsUsed: number) => void;
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
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [revealedCharacters, setRevealedCharacters] = useState<Set<string>>(new Set());

  // Get the closing fragment ID that matches a given opening
  const getMatchedClosingId = (openingId: string): string | undefined => {
    return matches.find((m) => m.openingId === openingId)?.closingId;
  };

  // Handle hint reveal - reveals one character from a random unmatched pair
  const handleHintClick = () => {
    // Find unmatched pairs
    const unmatchedOpenings = puzzle.openings.filter(
      (opening) => !matches.some((m) => m.openingId === opening.id)
    );

    if (unmatchedOpenings.length === 0) {
      return; // All matched already
    }

    // Pick a random unmatched opening
    const randomOpening = unmatchedOpenings[Math.floor(Math.random() * unmatchedOpenings.length)];
    
    // Find the correct closing for this opening
    const correctMatch = puzzle.correctMatches.find((m) => m.openingId === randomOpening.id);
    if (!correctMatch) return;

    const correctClosing = puzzle.closings.find((c) => c.id === correctMatch.closingId);
    if (!correctClosing) return;

    // Find characters in the closing that haven't been revealed yet
    const closingChars = correctClosing.text.split('');
    const unrevealedIndices = closingChars
      .map((_, idx) => idx)
      .filter((idx) => !revealedCharacters.has(`${correctMatch.closingId}_${idx}`));

    if (unrevealedIndices.length === 0) {
      // All characters already revealed, find another pair
      return handleHintClick();
    }

    // Reveal multiple characters at once for better hint value
    const numToReveal = Math.min(3, unrevealedIndices.length);
    const indicesToReveal = [];
    for (let i = 0; i < numToReveal; i++) {
      const randomIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      indicesToReveal.push(randomIdx);
      unrevealedIndices.splice(unrevealedIndices.indexOf(randomIdx), 1);
    }

    // Update revealed characters
    const newRevealed = new Set(revealedCharacters);
    indicesToReveal.forEach((idx) => {
      newRevealed.add(`${correctMatch.closingId}_${idx}`);
    });
    setRevealedCharacters(newRevealed);
    setHintsUsed(hintsUsed + 1);
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

  // Call onComplete callback when puzzle is completed
  useEffect(() => {
    if (submitted && validationResult?.allCorrect && startTime && onComplete) {
      const completionTime = Date.now() - startTime;
      if (completionTime > 0) {
        onComplete(completionTime, hintsUsed);
      }
    }
  }, [submitted, validationResult, startTime, onComplete, hintsUsed]);

  // Render fragment text with revealed hints
  const renderFragmentText = (fragmentId: string, text: string) => {
    return text.split('').map((char, idx) => {
      const isRevealed = revealedCharacters.has(`${fragmentId}_${idx}`);
      return (
        <span
          key={idx}
          className={isRevealed ? 'revealed-char' : ''}
        >
          {char}
        </span>
      );
    });
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
    const completionTime = startTime ? Date.now() - startTime : 0;

    const formatTime = (ms: number): string => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="puzzle-container">
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
                <span className="fragment-text">
                  {renderFragmentText(closing.id, closing.text)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hint Button */}
      {!submitted && (
        <HintButton
          onHintClick={handleHintClick}
          hintsUsed={hintsUsed}
          disabled={matches.length === puzzle.openings.length}
        />
      )}

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

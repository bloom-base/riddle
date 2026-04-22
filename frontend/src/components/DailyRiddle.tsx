import React, { useState, useEffect, useCallback, useRef } from 'react';
import './DailyRiddle.css';
import DifficultyStars from './DifficultyStars';

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

const MAX_HINTS = 3;
const CHAR_REVEAL_MS = 200;

/** Build the localStorage key for hint usage on a given date. */
function hintStorageKey(date: string): string {
  return `riddleHints_${date}`;
}

/** Load persisted hint count for the given puzzle date. */
function loadHintCount(date: string): number {
  try {
    const raw = localStorage.getItem(hintStorageKey(date));
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), MAX_HINTS) : 0;
  } catch {
    return 0;
  }
}

/** Persist hint count for the given puzzle date. */
function saveHintCount(date: string, count: number): void {
  try {
    localStorage.setItem(hintStorageKey(date), String(count));
  } catch {
    /* quota exceeded – silently ignore */
  }
}

/**
 * Generate a deterministic hint string from the answer.
 *
 * Each successive hint reveals more of the answer:
 *   Hint 1 → first letter + blanks  ("A _ _ _ _ _ _ _")
 *   Hint 2 → first letter + middle + blanks ("A _ _ _ b _ _ _")
 *   Hint 3 → first half revealed ("A _ k _ y b _ _ _")  (roughly)
 *
 * Non-alpha characters (spaces, hyphens, etc.) are always shown.
 */
function buildHintText(answer: string, hintNumber: number): string {
  const chars = answer.split('');
  const alphaIndices = chars
    .map((ch, i) => (/[a-zA-Z0-9]/.test(ch) ? i : -1))
    .filter((i) => i !== -1);

  const totalAlpha = alphaIndices.length;

  // Determine how many alpha chars to reveal for this hint level
  let revealCount: number;
  if (hintNumber === 1) {
    revealCount = Math.max(1, Math.ceil(totalAlpha * 0.15)); // ~15 %
  } else if (hintNumber === 2) {
    revealCount = Math.max(2, Math.ceil(totalAlpha * 0.4)); // ~40 %
  } else {
    revealCount = Math.max(3, Math.ceil(totalAlpha * 0.7)); // ~70 %
  }

  // Always include the first alpha char; spread the rest evenly
  const revealSet = new Set<number>();
  if (alphaIndices.length > 0) revealSet.add(alphaIndices[0]);

  const step = Math.max(1, Math.floor(totalAlpha / revealCount));
  for (let i = 0; i < totalAlpha && revealSet.size < revealCount; i += step) {
    revealSet.add(alphaIndices[i]);
  }
  // Fill remaining from beginning if step-based didn't reach quota
  for (let i = 0; revealSet.size < revealCount && i < totalAlpha; i++) {
    revealSet.add(alphaIndices[i]);
  }

  return chars
    .map((ch, i) => {
      if (!/[a-zA-Z0-9]/.test(ch)) return ch; // always show non-alpha
      return revealSet.has(i) ? ch : '_';
    })
    .join('');
}

const DailyRiddle: React.FC<DailyRiddleProps> = ({ riddle }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(() => loadHintCount(riddle.date));
  const [activeHint, setActiveHint] = useState<string | null>(
    () => {
      const count = loadHintCount(riddle.date);
      return count > 0 ? buildHintText(riddle.answer, count) : null;
    }
  );
  const [visibleChars, setVisibleChars] = useState<number>(
    () => {
      // If returning to page with an existing hint, show it fully
      const count = loadHintCount(riddle.date);
      if (count > 0) {
        return buildHintText(riddle.answer, count).length;
      }
      return 0;
    }
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state when the riddle prop changes (e.g. navigating between dates)
  useEffect(() => {
    const count = loadHintCount(riddle.date);
    setHintsUsed(count);
    setIsRevealed(false);
    setIsAnimating(false);
    if (count > 0) {
      const text = buildHintText(riddle.answer, count);
      setActiveHint(text);
      setVisibleChars(text.length);
    } else {
      setActiveHint(null);
      setVisibleChars(0);
    }
  }, [riddle.date, riddle.answer]);

  // Cleanup animation timer on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const isSolved = isRevealed;
  const hintsDisabled = hintsUsed >= MAX_HINTS || isSolved || isAnimating;

  const handleGetHint = useCallback(() => {
    if (hintsDisabled) return;

    const nextCount = hintsUsed + 1;
    const hintText = buildHintText(riddle.answer, nextCount);

    setHintsUsed(nextCount);
    saveHintCount(riddle.date, nextCount);
    setActiveHint(hintText);
    setVisibleChars(0);
    setIsAnimating(true);

    // Character-by-character reveal animation
    let charIndex = 0;
    const revealNext = () => {
      charIndex++;
      setVisibleChars(charIndex);
      if (charIndex < hintText.length) {
        animTimerRef.current = setTimeout(revealNext, CHAR_REVEAL_MS);
      } else {
        setIsAnimating(false);
      }
    };
    animTimerRef.current = setTimeout(revealNext, CHAR_REVEAL_MS);
  }, [hintsDisabled, hintsUsed, riddle.answer, riddle.date]);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const hintButtonLabel =
    hintsUsed >= MAX_HINTS
      ? 'No hints remaining'
      : isAnimating
        ? 'Revealing hint…'
        : `Get Hint (${MAX_HINTS - hintsUsed} left)`;

  return (
    <div className="daily-riddle">
      <div className="riddle-header">
        <h2>🤔 Daily Riddle</h2>
        <div className="riddle-meta">
          <DifficultyStars
            difficulty={riddle.difficulty as 'easy' | 'medium' | 'hard'}
            animated
            size="medium"
          />
          <span className="category">{riddle.category}</span>
        </div>
      </div>

      <div className="riddle-content">
        <div className="riddle-question">
          <p>{riddle.question}</p>
        </div>

        {/* ── Hint area ── */}
        <div className="hint-section">
          <div className="hint-controls">
            <button
              className={`hint-button${hintsDisabled ? ' hint-button--disabled' : ''}`}
              onClick={handleGetHint}
              disabled={hintsDisabled}
              aria-label={hintButtonLabel}
            >
              💡 Get Hint
            </button>
            <span className="hint-counter" aria-live="polite">
              Hints used: {hintsUsed}/{MAX_HINTS}
            </span>
          </div>

          {activeHint && (
            <div
              className={`hint-display${isAnimating ? ' hint-display--animating' : ' hint-display--complete'}`}
              aria-live="polite"
              role="status"
            >
              <span className="hint-label">Hint {hintsUsed}:</span>
              <span className="hint-text" aria-label={`Hint: ${activeHint}`}>
                {activeHint.split('').map((ch, i) => (
                  <span
                    key={`${hintsUsed}-${i}`}
                    className={`hint-char${i < visibleChars ? ' hint-char--visible' : ''}`}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {/* ── Answer reveal ── */}
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

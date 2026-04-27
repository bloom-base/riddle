/**
 * WordLadder — interactive puzzle component.
 *
 * The player sees a start word and a target word and must transform
 * the start into the target by changing exactly one letter at a time,
 * where every intermediate word must be a real English word.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  getDailyWordLadder,
  validateChain,
  isValidWord,
  differsByOneLetter,
  findShortestPath,
  type DailyWordLadder,
  type StepResult,
} from '../services/wordLadderService';

/* ────────────────────────── component ─────────────────────────── */

export default function WordLadder() {
  const [puzzle] = useState<DailyWordLadder>(() => getDailyWordLadder());
  const [chain, setChain] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [won, setWon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintPath, setHintPath] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist win state per date in localStorage
  const storageKey = `wordLadder-${puzzle.date}`;
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.chain && data.won) {
          setChain(data.chain);
          setWon(true);
          const { steps } = validateChain(puzzle.start, puzzle.end, data.chain);
          setStepResults(steps);
        }
      } catch { /* ignore corrupt data */ }
    }
  }, [storageKey, puzzle.start, puzzle.end]);

  const saveWin = useCallback((finalChain: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify({ chain: finalChain, won: true }));
  }, [storageKey]);

  /* ── submit a word ── */
  const handleSubmit = useCallback(() => {
    const word = currentInput.trim().toUpperCase();
    if (!word) return;

    setError(null);

    if (word.length !== puzzle.wordLength) {
      setError(`Word must be ${puzzle.wordLength} letters`);
      return;
    }

    if (!isValidWord(word)) {
      setError(`"${word}" is not in the word list`);
      return;
    }

    const prev = chain.length === 0 ? puzzle.start : chain[chain.length - 1];
    if (!differsByOneLetter(prev.toUpperCase(), word)) {
      setError('Change exactly one letter from the previous word');
      return;
    }

    const newChain = [...chain, word];
    setChain(newChain);
    setCurrentInput('');

    const result = validateChain(puzzle.start, puzzle.end, newChain);
    setStepResults(result.steps);

    if (result.won) {
      setWon(true);
      saveWin(newChain);
    }
  }, [currentInput, chain, puzzle, saveWin]);

  /* ── undo last step ── */
  const handleUndo = useCallback(() => {
    if (chain.length === 0 || won) return;
    const newChain = chain.slice(0, -1);
    setChain(newChain);
    setError(null);
    const result = validateChain(puzzle.start, puzzle.end, newChain);
    setStepResults(result.steps);
  }, [chain, won, puzzle]);

  /* ── restart ── */
  const handleRestart = useCallback(() => {
    setChain([]);
    setStepResults([]);
    setCurrentInput('');
    setError(null);
    setWon(false);
    setShowHint(false);
    setHintPath(null);
    localStorage.removeItem(storageKey);
    inputRef.current?.focus();
  }, [storageKey]);

  /* ── hint ── */
  const handleHint = useCallback(() => {
    if (!hintPath) {
      const path = findShortestPath(puzzle.start, puzzle.end);
      setHintPath(path);
    }
    setShowHint(true);
  }, [hintPath, puzzle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit],
  );

  /* ── derive the "previous" word for display ── */
  const previousWord = chain.length > 0 ? chain[chain.length - 1] : puzzle.start;

  return (
    <section className="word-ladder" aria-label="Word Ladder puzzle">
      <div className="wl-header">
        <h2 className="wl-title">🪜 Word Ladder</h2>
        <p className="wl-subtitle">
          Transform <strong>{puzzle.start}</strong> into{' '}
          <strong>{puzzle.end}</strong> one letter at a time
        </p>
      </div>

      {/* ── chain display ── */}
      <div className="wl-chain" role="list" aria-label="Current word chain">
        {/* Start word (fixed) */}
        <div className="wl-step wl-step--start" role="listitem">
          <span className="wl-step-word">{puzzle.start}</span>
          <span className="wl-step-label">start</span>
        </div>

        {/* Player steps */}
        {chain.map((word, i) => {
          const sr = stepResults[i];
          const isLast = i === chain.length - 1;
          const cls = sr?.valid === false ? 'wl-step--error' : isLast && won ? 'wl-step--win' : 'wl-step--ok';
          return (
            <div className={`wl-step ${cls}`} key={i} role="listitem">
              <span className="wl-step-num">{i + 1}</span>
              <span className="wl-step-word">{word}</span>
              {sr?.error && <span className="wl-step-err">{sr.error}</span>}
            </div>
          );
        })}

        {/* Target word indicator */}
        {!won && (
          <div className="wl-step wl-step--target" role="listitem">
            <span className="wl-step-word">{puzzle.end}</span>
            <span className="wl-step-label">target</span>
          </div>
        )}
      </div>

      {/* ── input area ── */}
      {!won && (
        <div className="wl-input-area">
          <div className="wl-input-row">
            <input
              ref={inputRef}
              className="wl-input"
              type="text"
              maxLength={puzzle.wordLength}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder={`Enter a ${puzzle.wordLength}-letter word…`}
              aria-label="Enter next word"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <button className="wl-btn wl-btn--submit" onClick={handleSubmit}>
              Add
            </button>
          </div>

          {error && (
            <p className="wl-error" role="alert">
              {error}
            </p>
          )}

          <div className="wl-actions">
            <button
              className="wl-btn wl-btn--secondary"
              onClick={handleUndo}
              disabled={chain.length === 0}
            >
              ↩ Undo
            </button>
            <button className="wl-btn wl-btn--secondary" onClick={handleRestart}>
              🔄 Restart
            </button>
            <button className="wl-btn wl-btn--secondary" onClick={handleHint}>
              💡 Hint
            </button>
          </div>

          {showHint && hintPath && (
            <p className="wl-hint">
              Shortest solution is <strong>{hintPath.length - 1} steps</strong>.
              {hintPath.length > 1 && (
                <> Try starting with <strong>{hintPath[1]}</strong>.</>
              )}
            </p>
          )}
          {showHint && !hintPath && (
            <p className="wl-hint wl-hint--warn">
              No solution found in the current word list — this puzzle may be extra tricky!
            </p>
          )}

          <p className="wl-info">
            Current word: <strong>{previousWord}</strong>
            {' · '}Steps so far: <strong>{chain.length}</strong>
            {' · '}Min possible: <strong>{puzzle.minSteps}</strong>
          </p>
        </div>
      )}

      {/* ── win state ── */}
      {won && (
        <div className="wl-win">
          <span className="wl-win-emoji" aria-hidden="true">🎉</span>
          <h3 className="wl-win-title">Brilliant!</h3>
          <p className="wl-win-body">
            You transformed <strong>{puzzle.start}</strong> → <strong>{puzzle.end}</strong>{' '}
            in <strong>{chain.length}</strong> step{chain.length !== 1 ? 's' : ''}!
            {chain.length === puzzle.minSteps && (
              <span className="wl-win-optimal"> ⭐ Optimal solution!</span>
            )}
          </p>
          <button className="wl-btn wl-btn--primary" onClick={handleRestart}>
            Play Again
          </button>
        </div>
      )}
    </section>
  );
}

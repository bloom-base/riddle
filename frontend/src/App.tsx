import { useState, useEffect, useRef } from 'react';
import './App.css';
import QuoteMatchingPuzzle from './components/QuoteMatchingPuzzle';
import Leaderboard from './components/Leaderboard';
import CountdownTimer from './components/CountdownTimer';
import DailyRiddle from './components/DailyRiddle';
import StreakBadge from './components/StreakBadge';
import PuzzleArchive from './components/PuzzleArchive';
import { useStreak } from './hooks/useStreak';

interface Puzzle {
  date: string;
  openings: Array<{ id: string; text: string }>;
  closings: Array<{ id: string; text: string }>;
  correctMatches: Array<{ id: string; openingId: string; closingId: string }>;
  hints: Array<{ id: string; hint: string }>;
  difficulty: 'easy' | 'medium' | 'hard';
  puzzleHint: string;
}

interface DailyRiddleData {
  date: string;
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
}

function formatPuzzleDate(dateStr: string): string {
  // Append noon time to avoid timezone edge-cases shifting the date
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [riddle, setRiddle] = useState<DailyRiddleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mode, setMode] = useState<'daily' | 'archive'>('daily');
  const [archiveDate, setArchiveDate] = useState<string | null>(null);
  const [archivePuzzle, setArchivePuzzle] = useState<Puzzle | null>(null);
  const [archiveRiddle, setArchiveRiddle] = useState<DailyRiddleData | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const { currentStreak, longestStreak, hasSolvedDate, recordSolve } = useStreak();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [puzzleResponse, riddleResponse] = await Promise.all([
          fetch('/api/puzzle'),
          fetch('/api/riddle'),
        ]);

        if (!puzzleResponse.ok) throw new Error('Failed to fetch puzzle');
        if (!riddleResponse.ok) throw new Error('Failed to fetch riddle');

        const puzzleData = await puzzleResponse.json();
        const riddleData = await riddleResponse.json();

        setPuzzle(puzzleData);
        setRiddle(riddleData);
        setStartTime(Date.now());

        const savedUsername = localStorage.getItem('riddleUsername');
        if (savedUsername) {
          setUsername(savedUsername);
        } else {
          setShowUsernamePrompt(true);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Focus the username input when the modal opens
  useEffect(() => {
    if (showUsernamePrompt) {
      setTimeout(() => usernameInputRef.current?.focus(), 50);
    }
  }, [showUsernamePrompt]);

  // Load puzzle for archive date
  useEffect(() => {
    if (mode === 'archive' && archiveDate) {
      const loadArchivePuzzle = async () => {
        try {
          setArchiveLoading(true);
          const [puzzleResponse, riddleResponse] = await Promise.all([
            fetch(`/api/puzzle/${archiveDate}`),
            fetch(`/api/riddle/${archiveDate}`),
          ]);

          if (!puzzleResponse.ok) throw new Error('Failed to fetch puzzle');
          if (!riddleResponse.ok) throw new Error('Failed to fetch riddle');

          const puzzleData = await puzzleResponse.json();
          const riddleData = await riddleResponse.json();

          setArchivePuzzle(puzzleData);
          setArchiveRiddle(riddleData);
        } catch (err) {
          console.error('Error loading archive puzzle:', err);
        } finally {
          setArchiveLoading(false);
        }
      };

      loadArchivePuzzle();
    }
  }, [mode, archiveDate]);

  const handleSetUsername = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length > 0 && trimmed.length <= 50) {
      setUsername(trimmed);
      localStorage.setItem('riddleUsername', trimmed);
      setShowUsernamePrompt(false);
    }
  };

  const handleSkipUsername = () => {
    handleSetUsername('Anonymous');
  };

  const handlePuzzleComplete = async (completionTimeMs: number) => {
    if (!puzzle || !username) return;

    recordSolve(puzzle.date);

    try {
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: puzzle.date,
          username,
          completionTime: completionTimeMs,
        }),
      });
    } catch (err) {
      console.error('Error submitting to leaderboard:', err);
    }
  };

  const handleArchivePuzzleComplete = async (completionTimeMs: number) => {
    if (!archivePuzzle || !username) return;

    recordSolve(archivePuzzle.date);

    try {
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: archivePuzzle.date,
          username,
          completionTime: completionTimeMs,
        }),
      });
    } catch (err) {
      console.error('Error submitting archive puzzle to leaderboard:', err);
    }
  };

  const handleSelectArchiveDate = (date: string) => {
    setArchiveDate(date);
  };

  const handleBackToDaily = () => {
    setMode('daily');
    setArchiveDate(null);
    setArchivePuzzle(null);
    setArchiveRiddle(null);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="loading-screen">
        <span className="loading-icon">🎭</span>
        <p className="loading-text">Loading today's puzzle…</p>
        <div className="loading-dots">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !puzzle) {
    return (
      <div className="error-screen">
        <span className="error-icon">😵</span>
        <p className="error-title">{error ? 'Something went wrong' : 'No puzzle today'}</p>
        <p className="error-body">
          {error
            ? `${error}. Please refresh the page or try again later.`
            : 'No puzzle is available right now. Check back soon!'}
        </p>
      </div>
    );
  }

  /* ── Full app ── */
  return (
    <div className="app">

      {/* ── Username Modal ── */}
      {showUsernamePrompt && (
        <div className="username-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="username-modal">
            <span className="modal-emoji" aria-hidden="true">🎭</span>
            <h2 className="modal-title" id="modal-title">Join the Challenge!</h2>
            <p className="modal-subtitle">
              Enter your name to compete on the daily leaderboard and track your streak.
            </p>
            <input
              ref={usernameInputRef}
              className="modal-input"
              type="text"
              maxLength={50}
              placeholder="Your name…"
              defaultValue={username}
              aria-label="Username"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetUsername((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              className="modal-btn-primary"
              onClick={() =>
                handleSetUsername(usernameInputRef.current?.value ?? '')
              }
            >
              Start Playing →
            </button>
            <button className="modal-btn-secondary" onClick={handleSkipUsername}>
              Play anonymously
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">🎭</span>
            <div className="brand-text">
              <h1 className="brand-name">Riddle</h1>
              <p className="brand-tagline">One puzzle a day</p>
            </div>
          </div>

          <div className="header-nav">
            <button
              className={`nav-pill ${mode === 'daily' ? 'active' : ''}`}
              onClick={() => setMode('daily')}
              title="View today's puzzle"
              aria-label="View today's puzzle"
            >
              ⏰ Today
            </button>
            <button
              className={`nav-pill ${mode === 'archive' ? 'active' : ''}`}
              onClick={() => setMode('archive')}
              title="Browse puzzle archive"
              aria-label="Browse puzzle archive"
            >
              📚 Archive
            </button>
          </div>

          <div className="header-right">
            <StreakBadge
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              solvedToday={hasSolvedDate(puzzle.date)}
            />
            {username && (
              <button
                className="user-pill"
                onClick={() => setShowUsernamePrompt(true)}
                title="Change username"
                aria-label={`Signed in as ${username}. Click to change.`}
              >
                <span className="user-pill-icon" aria-hidden="true">👤</span>
                <span className="user-pill-name">{username}</span>
                <span className="user-pill-gear" aria-hidden="true">⚙️</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="main-content">
        {mode === 'daily' ? (
          <>
            {/* ── Date hero banner ── */}
            <div className="puzzle-hero" aria-label="Today's puzzle info">
              <div className="hero-inner">
                <div className="hero-date-block">
                  <span className="hero-eyebrow">Today's puzzle</span>
                  <span className="hero-date">{formatPuzzleDate(puzzle.date)}</span>
                </div>
                <CountdownTimer />
              </div>
            </div>

            {riddle && <DailyRiddle riddle={riddle} />}
            <QuoteMatchingPuzzle
              puzzle={puzzle}
              onComplete={handlePuzzleComplete}
              startTime={startTime ?? 0}
            />
            <Leaderboard date={puzzle.date} />
          </>
        ) : (
          <>
            {!archiveDate ? (
              <PuzzleArchive
                solvedDates={new Set(
                  Array.from({ length: 365 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                  }).filter((date) => hasSolvedDate(date))
                )}
                onSelectDate={handleSelectArchiveDate}
              />
            ) : archiveLoading ? (
              <div className="loading-screen">
                <span className="loading-icon">🎭</span>
                <p className="loading-text">Loading puzzle…</p>
                <div className="loading-dots">
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </div>
              </div>
            ) : archivePuzzle ? (
              <>
                <button
                  className="back-button"
                  onClick={handleBackToDaily}
                  aria-label="Back to archive"
                >
                  ← Back to Archive
                </button>

                {/* ── Date hero banner ── */}
                <div className="puzzle-hero" aria-label="Archive puzzle info">
                  <div className="hero-inner">
                    <div className="hero-date-block">
                      <span className="hero-eyebrow">
                        {hasSolvedDate(archivePuzzle.date) ? '✓ Solved' : 'Not solved'}
                      </span>
                      <span className="hero-date">{formatPuzzleDate(archivePuzzle.date)}</span>
                    </div>
                  </div>
                </div>

                {archiveRiddle && <DailyRiddle riddle={archiveRiddle} />}
                <QuoteMatchingPuzzle
                  puzzle={archivePuzzle}
                  onComplete={handleArchivePuzzleComplete}
                  startTime={0}
                />
                <Leaderboard date={archivePuzzle.date} />
              </>
            ) : (
              <div className="error-screen">
                <span className="error-icon">😵</span>
                <p className="error-title">Puzzle not found</p>
                <p className="error-body">Could not load this puzzle. Try selecting another date.</p>
                <button
                  className="modal-btn-primary"
                  onClick={() => {
                    setArchiveDate(null);
                  }}
                >
                  Back to Archive
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">🎭 Riddle</span>
          <span className="footer-sep">·</span>
          <span>Match fragments from famous U.S. literature quotes</span>
          <span className="footer-sep">·</span>
          <span>Perfect for Twitch communities</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

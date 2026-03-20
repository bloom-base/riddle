import { useState, useEffect } from 'react';
import './App.css';
import QuoteMatchingPuzzle from './components/QuoteMatchingPuzzle';
import Leaderboard from './components/Leaderboard';
import CountdownTimer from './components/CountdownTimer';
import DailyRiddle from './components/DailyRiddle';
import StreakBadge from './components/StreakBadge';
import { useStreak } from './hooks/useStreak';

interface Puzzle {
  date: string;
  openings: Array<{ id: string; text: string }>;
  closings: Array<{ id: string; text: string }>;
  correctMatches: Array<{ id: string; openingId: string; closingId: string }>;
  hints: Array<{ id: string; hint: string }>;
}

interface DailyRiddleData {
  date: string;
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  category: string;
}

function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [riddle, setRiddle] = useState<DailyRiddleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { currentStreak, longestStreak, hasSolvedDate, recordSolve } = useStreak();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both puzzle and riddle in parallel
        const [puzzleResponse, riddleResponse] = await Promise.all([
          fetch('/api/puzzle'),
          fetch('/api/riddle')
        ]);

        if (!puzzleResponse.ok) {
          throw new Error('Failed to fetch puzzle');
        }
        if (!riddleResponse.ok) {
          throw new Error('Failed to fetch riddle');
        }

        const puzzleData = await puzzleResponse.json();
        const riddleData = await riddleResponse.json();

        setPuzzle(puzzleData);
        setRiddle(riddleData);
        setStartTime(Date.now());

        // Check if username is in localStorage
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

  const handleSetUsername = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length > 0 && trimmed.length <= 50) {
      setUsername(trimmed);
      localStorage.setItem('riddleUsername', trimmed);
      setShowUsernamePrompt(false);
    }
  };

  const handlePuzzleComplete = async (completionTimeMs: number) => {
    if (!puzzle || !username) return;

    // Record the solve in persistent history and update streak
    recordSolve(puzzle.date);

    try {
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: puzzle.date,
          username,
          completionTime: completionTimeMs
        })
      });
    } catch (error) {
      console.error('Error submitting to leaderboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <h1>🎭 Riddle</h1>
          <div className="loading">Loading today's puzzle...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="container">
          <h1>🎭 Riddle</h1>
          <div className="error">Error: {error}</div>
          <p>Unable to load the puzzle. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="app">
        <div className="container">
          <h1>🎭 Riddle</h1>
          <div className="error">No puzzle available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>🎭 Riddle</h1>
            <p>One puzzle a day keeps the brain sharp</p>
          </div>
          <div className="header-right">
            {puzzle && (
              <StreakBadge
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                solvedToday={hasSolvedDate(puzzle.date)}
              />
            )}
            {username && (
              <div className="username-display">
                👤 {username}
                <button
                  className="username-change"
                  onClick={() => setShowUsernamePrompt(true)}
                  title="Change username"
                >
                  ⚙️
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="container">
        {showUsernamePrompt && (
          <div className="username-prompt">
            <div className="username-prompt-content">
              <h2>Join the Challenge!</h2>
              <p>Enter your name to compete on the leaderboard:</p>
              <input
                type="text"
                maxLength={50}
                placeholder="Your name"
                defaultValue={username}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSetUsername((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button 
                onClick={(e) => handleSetUsername((e.currentTarget.previousElementSibling as HTMLInputElement).value)}
              >
                Start Playing
              </button>
              <button 
                className="skip-btn"
                onClick={() => {
                  handleSetUsername('Anonymous');
                }}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        <CountdownTimer />
        {riddle && <DailyRiddle riddle={riddle} />}
        <QuoteMatchingPuzzle
          puzzle={puzzle}
          onComplete={handlePuzzleComplete}
          startTime={startTime || 0}
        />
        <Leaderboard date={puzzle.date} />
      </main>

      <footer className="footer">
        <p>Match the opening and closing fragments to complete famous U.S. literature quotes</p>
        <p className="footer-subtext">Stream it live! Perfect for Twitch communities</p>
      </footer>
    </div>
  );
}

export default App;

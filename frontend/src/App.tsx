import React, { useState, useEffect } from 'react';
import './App.css';
import QuoteMatchingPuzzle from './components/QuoteMatchingPuzzle';

interface Puzzle {
  date: string;
  openings: Array<{ id: string; text: string }>;
  closings: Array<{ id: string; text: string }>;
  correctMatches: Array<{ id: string; openingId: string; closingId: string }>;
}

function App() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPuzzle = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/puzzle');
        if (!response.ok) {
          throw new Error('Failed to fetch puzzle');
        }
        const data = await response.json();
        setPuzzle(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching puzzle:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();
  }, []);

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
        <h1>🎭 Riddle</h1>
        <p>One puzzle a day keeps the brain sharp</p>
      </header>
      
      <main className="container">
        <QuoteMatchingPuzzle puzzle={puzzle} />
      </main>

      <footer className="footer">
        <p>Match the opening and closing fragments to complete famous U.S. literature quotes</p>
      </footer>
    </div>
  );
}

export default App;

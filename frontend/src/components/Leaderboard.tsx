import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

export interface LeaderboardEntry {
  username: string;
  completionTime: number;
  timestamp: string;
}

export interface DailyStats {
  date: string;
  totalSolvers: number;
  averageTime: number;
  fastestTime: number;
  fastestSolver: string;
}

interface LeaderboardProps {
  date: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ date }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/leaderboard/${date}?limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }

        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [date]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h2>🏆 Today's Leaderboard</h2>
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h2>🏆 Today's Leaderboard</h2>
        <div className="error">Error loading leaderboard</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2>🏆 Today's Leaderboard</h2>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Solvers</div>
            <div className="stat-value">{stats.totalSolvers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Fastest Time</div>
            <div className="stat-value">{formatTime(stats.fastestTime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Time</div>
            <div className="stat-value">{formatTime(stats.averageTime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Fastest Solver</div>
            <div className="stat-value-name">{stats.fastestSolver}</div>
          </div>
        </div>
      )}

      {leaderboard.length > 0 ? (
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div key={`${entry.username}-${entry.timestamp}`} className="leaderboard-item">
              <div className="rank">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>
              <div className="name">{entry.username}</div>
              <div className="time">{formatTime(entry.completionTime)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-solvers">
          <p>No solvers yet. Be the first! 🎯</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

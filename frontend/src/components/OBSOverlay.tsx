import React, { useState, useEffect } from 'react';
import './OBSOverlay.css';
import CountdownTimer from './CountdownTimer';

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

interface OBSOverlayProps {
  date: string;
}

const OBSOverlay: React.FC<OBSOverlayProps> = ({ date }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard/${date}?limit=5`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    // Refresh leaderboard every 10 seconds
    const interval = setInterval(fetchLeaderboard, 10000);

    return () => clearInterval(interval);
  }, [date]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="obs-overlay">
      <div className="obs-container">
        {/* Title */}
        <div className="obs-title">
          <h1>🎭 Daily Riddle</h1>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer className="obs-overlay" />

        {/* Stats */}
        {stats && !loading && (
          <div className="obs-stats">
            <div className="obs-stat">
              <span className="obs-stat-label">Solvers:</span>
              <span className="obs-stat-value">{stats.totalSolvers}</span>
            </div>
            <div className="obs-stat">
              <span className="obs-stat-label">Fastest:</span>
              <span className="obs-stat-value">{formatTime(stats.fastestTime)}</span>
            </div>
          </div>
        )}

        {/* Live Solvers */}
        {leaderboard.length > 0 && !loading && (
          <div className="obs-solvers">
            <div className="obs-solvers-title">Live Solvers</div>
            <div className="obs-solvers-list">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={`${entry.username}-${entry.timestamp}`} className="obs-solver">
                  <span className="obs-solver-rank">#{index + 1}</span>
                  <span className="obs-solver-name">{entry.username}</span>
                  <span className="obs-solver-time">{formatTime(entry.completionTime)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="obs-cta">
          <p>Join at riddle.streamers.local or scan QR code</p>
        </div>
      </div>
    </div>
  );
};

export default OBSOverlay;

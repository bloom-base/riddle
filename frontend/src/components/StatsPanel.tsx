import { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadStats,
  getTotalSolved,
  getAverageSolveTimeMs,
  getAccuracyPercent,
  formatTime,
  type PuzzleStats,
  type PuzzleType,
} from '../utils/statsManager';
import './StatsPanel.css';

interface StatsPanelProps {
  open: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
}

const TYPE_LABELS: Record<PuzzleType, { label: string; emoji: string; color: string }> = {
  quotes: { label: 'Quote Match', emoji: '📜', color: 'var(--accent)' },
  wordLadder: { label: 'Word Ladder', emoji: '🪜', color: 'var(--success)' },
  riddle: { label: 'Daily Riddle', emoji: '🧩', color: 'var(--warm)' },
};

export default function StatsPanel({ open, onClose, currentStreak, longestStreak }: StatsPanelProps) {
  const [stats, setStats] = useState<PuzzleStats | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load stats whenever modal opens
  useEffect(() => {
    if (open) {
      setStats(loadStats());
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on overlay click
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  if (!open || !stats) return null;

  const totalSolved = getTotalSolved(stats);
  const avgTime = getAverageSolveTimeMs(stats);
  const accuracy = getAccuracyPercent(stats);

  // Find max for bar scaling
  const typeCounts: { type: PuzzleType; count: number }[] = [
    { type: 'quotes', count: stats.quotes.totalSolved },
    { type: 'wordLadder', count: stats.wordLadder.totalSolved },
    { type: 'riddle', count: stats.riddle.totalSolved },
  ];
  const maxCount = Math.max(...typeCounts.map((t) => t.count), 1);

  return (
    <div
      className="stats-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      <div className="stats-modal">
        {/* Header */}
        <div className="stats-header">
          <h2 className="stats-title" id="stats-title">📊 Your Stats</h2>
          <button className="stats-close" onClick={onClose} aria-label="Close stats">
            ✕
          </button>
        </div>

        {/* Streak highlight */}
        <div className="stats-streaks">
          <div className="stats-streak-card stats-streak-current">
            <span className="stats-streak-value">{currentStreak}</span>
            <span className="stats-streak-label">Current Streak</span>
          </div>
          <div className="stats-streak-card stats-streak-best">
            <span className="stats-streak-value">{longestStreak}</span>
            <span className="stats-streak-label">Best Streak</span>
          </div>
        </div>

        {/* Aggregate KPIs */}
        <div className="stats-kpis">
          <div className="stats-kpi">
            <span className="stats-kpi-value">{totalSolved}</span>
            <span className="stats-kpi-label">Puzzles Solved</span>
          </div>
          <div className="stats-kpi">
            <span className="stats-kpi-value">{avgTime > 0 ? formatTime(avgTime) : '—'}</span>
            <span className="stats-kpi-label">Avg Solve Time</span>
          </div>
          <div className="stats-kpi">
            <span className="stats-kpi-value">{accuracy > 0 ? `${accuracy}%` : '—'}</span>
            <span className="stats-kpi-label">Accuracy</span>
          </div>
        </div>

        {/* Bar chart by puzzle type */}
        <div className="stats-chart-section">
          <h3 className="stats-section-title">Solves by Type</h3>
          <div className="stats-bars">
            {typeCounts.map(({ type, count }) => {
              const info = TYPE_LABELS[type];
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div className="stats-bar-row" key={type}>
                  <span className="stats-bar-label">
                    <span className="stats-bar-emoji">{info.emoji}</span>
                    {info.label}
                  </span>
                  <div className="stats-bar-track">
                    <div
                      className="stats-bar-fill"
                      style={{
                        width: `${Math.max(pct, count > 0 ? 8 : 0)}%`,
                        background: info.color,
                      }}
                    />
                  </div>
                  <span className="stats-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fastest time */}
        {stats.quotes.fastestTimeMs > 0 && (
          <div className="stats-fastest">
            ⚡ Best quote match time: <strong>{formatTime(stats.quotes.fastestTimeMs)}</strong>
          </div>
        )}

        {/* Empty state */}
        {totalSolved === 0 && (
          <div className="stats-empty">
            <span className="stats-empty-emoji">🎯</span>
            <p>No puzzles solved yet. Complete a puzzle to start tracking your stats!</p>
          </div>
        )}
      </div>
    </div>
  );
}

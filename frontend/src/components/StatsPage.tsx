import { useState, useEffect, useCallback } from 'react';
import DifficultyChart from './DifficultyChart';
import { getStatsByDifficulty, getAllStats, clearStats } from '../services/statsManager';
import type { DifficultyAggregate, PuzzleStat } from '../services/statsManager';
import './StatsPage.css';

interface StatsPageProps {
  onBack: () => void;
}

const StatsPage: React.FC<StatsPageProps> = ({ onBack }) => {
  const [aggregates, setAggregates] = useState<DifficultyAggregate[]>([]);
  const [allStats, setAllStats] = useState<PuzzleStat[]>([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const refreshData = useCallback(() => {
    setAggregates(getStatsByDifficulty(10));
    setAllStats(getAllStats());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handler = () => refreshData();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refreshData]);

  const totalSolved = allStats.length;
  const overallAvgTime =
    totalSolved > 0
      ? Math.round(
          allStats.reduce((sum, s) => sum + s.solveTimeMs, 0) / totalSolved / 1000
        )
      : 0;
  const overallAvgAccuracy =
    totalSolved > 0
      ? Math.round(
          (allStats.reduce((sum, s) => sum + s.accuracy, 0) / totalSolved) * 10
        ) / 10
      : 0;

  // Best difficulty (highest accuracy)
  const bestDifficulty = aggregates
    .filter((a) => a.totalSolved > 0)
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)[0];

  const handleReset = () => {
    clearStats();
    refreshData();
    setShowConfirmReset(false);
  };

  return (
    <div className="stats-page">
      <button className="back-button" onClick={onBack} aria-label="Back">
        ← Back
      </button>

      <div className="stats-header">
        <span className="stats-icon" aria-hidden="true">📊</span>
        <h2 className="stats-title">Your Stats</h2>
        <p className="stats-subtitle">
          Track your performance across puzzle difficulties
        </p>
      </div>

      {/* Summary cards */}
      <div className="stats-summary">
        <div className="stats-card">
          <span className="stats-card__value">{totalSolved}</span>
          <span className="stats-card__label">Puzzles Solved</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">
            {overallAvgTime > 0 ? `${overallAvgTime}s` : '—'}
          </span>
          <span className="stats-card__label">Avg Solve Time</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">
            {overallAvgAccuracy > 0 ? `${overallAvgAccuracy}%` : '—'}
          </span>
          <span className="stats-card__label">Avg Accuracy</span>
        </div>
        <div className="stats-card">
          <span className="stats-card__value">
            {bestDifficulty
              ? bestDifficulty.difficulty.charAt(0).toUpperCase() +
                bestDifficulty.difficulty.slice(1)
              : '—'}
          </span>
          <span className="stats-card__label">Best Category</span>
        </div>
      </div>

      {/* Charts */}
      <div className="stats-charts">
        <DifficultyChart data={aggregates} metric="time" />
        <DifficultyChart data={aggregates} metric="accuracy" />
      </div>

      {/* Per-difficulty breakdown table */}
      {totalSolved > 0 && (
        <div className="stats-breakdown">
          <h3 className="stats-breakdown__title">Breakdown by Difficulty</h3>
          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>Solved</th>
                  <th>Avg Time</th>
                  <th>Avg Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {aggregates.map((a) => (
                  <tr key={a.difficulty}>
                    <td>
                      <span
                        className={`stats-diff-badge stats-diff-badge--${a.difficulty}`}
                      >
                        {a.difficulty.charAt(0).toUpperCase() + a.difficulty.slice(1)}
                      </span>
                    </td>
                    <td>{a.totalSolved}</td>
                    <td>{a.totalSolved > 0 ? `${a.avgSolveTimeSec}s` : '—'}</td>
                    <td>{a.totalSolved > 0 ? `${a.avgAccuracy}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="stats-reset">
        {!showConfirmReset ? (
          <button
            className="stats-reset__btn"
            onClick={() => setShowConfirmReset(true)}
          >
            Reset Stats
          </button>
        ) : (
          <div className="stats-reset__confirm">
            <span>Are you sure? This cannot be undone.</span>
            <button className="stats-reset__yes" onClick={handleReset}>
              Yes, reset
            </button>
            <button
              className="stats-reset__no"
              onClick={() => setShowConfirmReset(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;

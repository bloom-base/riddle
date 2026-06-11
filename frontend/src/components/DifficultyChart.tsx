import { useMemo } from 'react';
import type { DifficultyAggregate } from '../services/statsManager';
import './DifficultyChart.css';

interface DifficultyChartProps {
  data: DifficultyAggregate[];
  metric: 'time' | 'accuracy';
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

/**
 * Pure CSS bar + sparkline chart comparing puzzle difficulties.
 * Shows either average solve time or accuracy, with recent trend dots.
 */
const DifficultyChart: React.FC<DifficultyChartProps> = ({ data, metric }) => {
  // Compute bar heights relative to the max value
  const { bars, maxVal, unit, title } = useMemo(() => {
    const isTime = metric === 'time';
    const title = isTime ? 'Avg Solve Time' : 'Avg Accuracy';
    const unit = isTime ? 's' : '%';

    const values = data.map((d) =>
      isTime ? d.avgSolveTimeSec : d.avgAccuracy
    );
    const max = Math.max(...values, isTime ? 10 : 100); // minimum scale

    const bars = data.map((d, i) => ({
      difficulty: d.difficulty,
      value: values[i],
      heightPct: max > 0 ? (values[i] / max) * 100 : 0,
      total: d.totalSolved,
      trendPoints: isTime ? d.recentSolveTimes : d.recentAccuracies,
    }));

    return { bars, maxVal: max, unit, title };
  }, [data, metric]);

  const hasAnyData = data.some((d) => d.totalSolved > 0);

  if (!hasAnyData) {
    return (
      <div className="diff-chart diff-chart--empty">
        <h3 className="diff-chart__title">{title}</h3>
        <p className="diff-chart__empty-msg">
          Complete some puzzles to see your {metric === 'time' ? 'solve time' : 'accuracy'} trends!
        </p>
      </div>
    );
  }

  return (
    <div className="diff-chart">
      <h3 className="diff-chart__title">{title}</h3>

      <div className="diff-chart__bars" role="img" aria-label={`${title} comparison chart`}>
        {/* Y-axis labels */}
        <div className="diff-chart__y-axis">
          <span>{metric === 'accuracy' ? '100%' : `${Math.round(maxVal)}s`}</span>
          <span>{metric === 'accuracy' ? '50%' : `${Math.round(maxVal / 2)}s`}</span>
          <span>0{unit}</span>
        </div>

        {/* Bars */}
        <div className="diff-chart__bar-group">
          {bars.map((bar) => (
            <div className="diff-chart__bar-col" key={bar.difficulty}>
              <div className="diff-chart__bar-track">
                <div
                  className="diff-chart__bar-fill"
                  style={{
                    height: `${Math.max(bar.heightPct, bar.total > 0 ? 4 : 0)}%`,
                    backgroundColor: DIFFICULTY_COLORS[bar.difficulty],
                  }}
                  title={`${DIFFICULTY_LABELS[bar.difficulty]}: ${bar.value}${unit} (${bar.total} solved)`}
                >
                  {bar.total > 0 && (
                    <span className="diff-chart__bar-value">
                      {bar.value}{unit}
                    </span>
                  )}
                </div>
              </div>
              <span className="diff-chart__bar-label">
                {DIFFICULTY_LABELS[bar.difficulty]}
              </span>
              <span className="diff-chart__bar-count">
                {bar.total} solved
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sparkline trend */}
      <div className="diff-chart__trends">
        <h4 className="diff-chart__trend-title">Recent Trend</h4>
        <div className="diff-chart__trend-rows">
          {bars.map((bar) => (
            <div className="diff-chart__trend-row" key={bar.difficulty}>
              <span
                className="diff-chart__trend-dot"
                style={{ backgroundColor: DIFFICULTY_COLORS[bar.difficulty] }}
              />
              <span className="diff-chart__trend-label">
                {DIFFICULTY_LABELS[bar.difficulty]}
              </span>
              <div className="diff-chart__sparkline">
                {bar.trendPoints.length > 0 ? (
                  <Sparkline
                    points={bar.trendPoints}
                    color={DIFFICULTY_COLORS[bar.difficulty]}
                    unit={unit}
                  />
                ) : (
                  <span className="diff-chart__no-data">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="diff-chart__legend" role="list" aria-label="Chart legend">
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <div className="diff-chart__legend-item" key={d} role="listitem">
            <span
              className="diff-chart__legend-swatch"
              style={{ backgroundColor: DIFFICULTY_COLORS[d] }}
            />
            {DIFFICULTY_LABELS[d]}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Sparkline sub-component (pure CSS dots + line) ── */
interface SparklineProps {
  points: number[];
  color: string;
  unit: string;
}

const Sparkline: React.FC<SparklineProps> = ({ points, color, unit }) => {
  if (points.length === 0) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  return (
    <div className="sparkline" aria-label={`Trend: ${points.join(', ')}${unit}`}>
      {points.map((val, i) => {
        const heightPct = ((val - min) / range) * 60 + 20; // 20-80% range
        return (
          <div
            key={i}
            className="sparkline__col"
            title={`${val}${unit}`}
          >
            <div
              className="sparkline__dot"
              style={{
                bottom: `${heightPct}%`,
                backgroundColor: color,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default DifficultyChart;

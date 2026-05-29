import React, { useState, useMemo, useEffect, useRef } from 'react';
import './PuzzleArchive.css';

type Difficulty = 'easy' | 'medium' | 'hard';
type DifficultyFilter = 'all' | Difficulty;

interface ArchiveDate {
  date: string;
  isSolved: boolean;
  isToday: boolean;
  isPast: boolean;
}

interface PuzzleArchiveProps {
  solvedDates: Set<string>;
  onSelectDate: (date: string) => void;
}

const FILTER_OPTIONS: { value: DifficultyFilter; label: string; emoji: string }[] = [
  { value: 'all', label: 'Show all', emoji: '🎯' },
  { value: 'easy', label: 'Easy', emoji: '🟢' },
  { value: 'medium', label: 'Medium', emoji: '🟡' },
  { value: 'hard', label: 'Hard', emoji: '🔴' },
];

const PuzzleArchive: React.FC<PuzzleArchiveProps> = ({ solvedDates, onSelectDate }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [difficulties, setDifficulties] = useState<Record<string, Difficulty>>({});
  const [fadeKey, setFadeKey] = useState(0);
  const difficultiesFetchedRef = useRef<string>('');

  // Fetch difficulties for the visible date range
  useEffect(() => {
    const fetchDifficulties = async () => {
      let fromDate: string;
      let toDate: string;

      if (viewMode === 'calendar') {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        firstDay.setDate(firstDay.getDate() - firstDay.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(lastDay.getDate() + 41);

        fromDate = firstDay.toISOString().split('T')[0];
        toDate = lastDay.toISOString().split('T')[0];
      } else {
        const end = new Date(today);
        end.setDate(end.getDate() - 1);
        const start = new Date(today);
        start.setDate(start.getDate() - 90);
        fromDate = start.toISOString().split('T')[0];
        toDate = end.toISOString().split('T')[0];
      }

      const cacheKey = `${fromDate}_${toDate}`;
      if (difficultiesFetchedRef.current === cacheKey) return;

      try {
        const response = await fetch(`/api/puzzles/difficulties?from=${fromDate}&to=${toDate}`);
        if (response.ok) {
          const data = await response.json();
          setDifficulties(prev => ({ ...prev, ...data }));
          difficultiesFetchedRef.current = cacheKey;
        }
      } catch (err) {
        console.error('Error fetching difficulties:', err);
      }
    };

    fetchDifficulties();
  }, [viewMode, currentMonth]);

  // Trigger fade animation on filter change
  const handleFilterChange = (filter: DifficultyFilter) => {
    setDifficultyFilter(filter);
    setFadeKey(k => k + 1);
  };

  // Generate calendar data for the current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates: ArchiveDate[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      dates.push({
        date: dateStr,
        isSolved: solvedDates.has(dateStr),
        isToday: dateStr === todayStr,
        isPast: current < today
      });

      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [currentMonth, solvedDates]);

  // Generate list of past 90 days for list view
  const pastDaysList = useMemo(() => {
    const dates: ArchiveDate[] = [];
    const current = new Date(today);
    current.setDate(current.getDate() - 1);

    for (let i = 0; i < 90; i++) {
      const dateStr = current.toISOString().split('T')[0];
      dates.push({
        date: dateStr,
        isSolved: solvedDates.has(dateStr),
        isToday: false,
        isPast: true
      });
      current.setDate(current.getDate() - 1);
    }

    return dates.reverse();
  }, [solvedDates]);

  // Filter the list view dates by difficulty
  const filteredPastDays = useMemo(() => {
    if (difficultyFilter === 'all') return pastDaysList;
    return pastDaysList.filter(item => difficulties[item.date] === difficultyFilter);
  }, [pastDaysList, difficultyFilter, difficulties]);

  // For calendar, determine which dates match the filter (for dimming non-matching)
  const calendarMatchesFilter = useMemo(() => {
    if (difficultyFilter === 'all') return null; // null means show all normally
    const matching = new Set<string>();
    calendarData.forEach(item => {
      if (difficulties[item.date] === difficultyFilter) {
        matching.add(item.date);
      }
    });
    return matching;
  }, [calendarData, difficultyFilter, difficulties]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth);
    }
  };

  const handleToday = () => {
    setCurrentMonth(today);
  };

  const getDifficultyBadge = (date: string): string | null => {
    const d = difficulties[date];
    if (!d) return null;
    if (d === 'easy') return '🟢';
    if (d === 'medium') return '🟡';
    return '🔴';
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) <= today;

  // Count difficulties for filter badges
  const filterCounts = useMemo(() => {
    const source = viewMode === 'list' ? pastDaysList : calendarData.filter(d => d.isPast);
    const counts: Record<DifficultyFilter, number> = { all: source.length, easy: 0, medium: 0, hard: 0 };
    source.forEach(item => {
      const d = difficulties[item.date] as DifficultyFilter | undefined;
      if (d && d in counts) counts[d]++;
    });
    return counts;
  }, [viewMode, pastDaysList, calendarData, difficulties]);

  return (
    <div className="puzzle-archive">
      <div className="archive-header">
        <h2>📚 Puzzle Archive</h2>
        <p className="archive-subtitle">Browse and replay past daily puzzles</p>
      </div>

      <div className="archive-controls">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            title="Calendar view"
            aria-label="Switch to calendar view"
          >
            📅 Calendar
          </button>
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
            aria-label="Switch to list view"
          >
            📋 List
          </button>
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="difficulty-filter" role="group" aria-label="Filter by difficulty">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`filter-btn ${difficultyFilter === opt.value ? 'active' : ''} filter-${opt.value}`}
            onClick={() => handleFilterChange(opt.value)}
            aria-pressed={difficultyFilter === opt.value}
            title={`Show ${opt.label.toLowerCase()} puzzles`}
          >
            <span className="filter-emoji" aria-hidden="true">{opt.emoji}</span>
            <span className="filter-label">{opt.label}</span>
            <span className="filter-count">{filterCounts[opt.value]}</span>
          </button>
        ))}
      </div>

      {viewMode === 'calendar' ? (
        <div className="calendar-view archive-fade-in" key={`cal-${fadeKey}`}>
          <div className="calendar-header">
            <button
              className="nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              ←
            </button>
            <h3>{monthName}</h3>
            <button
              className="nav-btn"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="calendar-weekdays">
            <div className="weekday">Sun</div>
            <div className="weekday">Mon</div>
            <div className="weekday">Tue</div>
            <div className="weekday">Wed</div>
            <div className="weekday">Thu</div>
            <div className="weekday">Fri</div>
            <div className="weekday">Sat</div>
          </div>

          <div className="calendar-grid">
            {calendarData.map((item) => {
              const dimmed = calendarMatchesFilter !== null && !calendarMatchesFilter.has(item.date) && item.isPast;
              return (
                <button
                  key={item.date}
                  className={`calendar-day ${item.isToday ? 'today' : ''} ${
                    item.isPast ? 'available' : 'future'
                  } ${item.isSolved ? 'solved' : 'unsolved'}${dimmed ? ' dimmed' : ''}`}
                  onClick={() => item.isPast && !dimmed && onSelectDate(item.date)}
                  disabled={!item.isPast || dimmed}
                  title={`${item.date}${item.isSolved ? ' (Solved)' : ''}${difficulties[item.date] ? ` — ${difficulties[item.date]}` : ''}`}
                  aria-label={`${item.date}${item.isSolved ? ' - Solved' : ' - Not solved'}${
                    item.isToday ? ' - Today' : ''
                  }${difficulties[item.date] ? ` - ${difficulties[item.date]}` : ''}`}
                >
                  <span className="date-number">{new Date(item.date + 'T12:00:00').getDate()}</span>
                  {item.isSolved && <span className="solved-indicator" aria-hidden="true">✓</span>}
                  {item.isToday && <span className="today-indicator" aria-hidden="true">●</span>}
                  {item.isPast && getDifficultyBadge(item.date) && (
                    <span className="difficulty-badge" aria-hidden="true">{getDifficultyBadge(item.date)}</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            className="today-btn"
            onClick={handleToday}
            aria-label="Go to today"
          >
            Today
          </button>
        </div>
      ) : (
        <div className="list-view archive-fade-in" key={`list-${fadeKey}`}>
          <div className="list-header">
            <p className="list-title">
              {difficultyFilter === 'all'
                ? 'Last 90 days'
                : `Last 90 days — ${difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)} only`}
            </p>
            <p className="list-legend">
              <span className="legend-item">✓ Solved</span>
              <span className="legend-item">○ Unsolved</span>
              <span className="legend-item">🟢 Easy</span>
              <span className="legend-item">🟡 Medium</span>
              <span className="legend-item">🔴 Hard</span>
            </p>
          </div>
          <div className="dates-list">
            {filteredPastDays.length === 0 ? (
              <div className="empty-filter-message">
                <span className="empty-icon" aria-hidden="true">🔍</span>
                <p>No {difficultyFilter} puzzles found in the last 90 days.</p>
                <button
                  className="filter-btn active filter-all"
                  onClick={() => handleFilterChange('all')}
                >
                  Show all puzzles
                </button>
              </div>
            ) : (
              filteredPastDays.map((item) => (
                <button
                  key={item.date}
                  className={`date-item ${item.isSolved ? 'solved' : 'unsolved'}`}
                  onClick={() => onSelectDate(item.date)}
                  aria-label={`${formatDateForList(item.date)}${item.isSolved ? ' - Solved' : ' - Not solved'}${difficulties[item.date] ? ` - ${difficulties[item.date]}` : ''}`}
                >
                  <span className="date-label">{formatDateForList(item.date)}</span>
                  <span className="date-item-right">
                    {difficulties[item.date] && (
                      <span className={`difficulty-tag difficulty-${difficulties[item.date]}`}>
                        {difficulties[item.date]}
                      </span>
                    )}
                    <span className={`status-indicator ${item.isSolved ? 'solved' : 'unsolved'}`}>
                      {item.isSolved ? '✓' : '○'}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function formatDateForList(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export default PuzzleArchive;

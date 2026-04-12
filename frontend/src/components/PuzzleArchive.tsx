import React, { useState, useMemo } from 'react';
import './PuzzleArchive.css';

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

const PuzzleArchive: React.FC<PuzzleArchiveProps> = ({ solvedDates, onSelectDate }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(today);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Generate calendar data for the current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from the previous Sunday

    const dates: ArchiveDate[] = [];
    const current = new Date(startDate);

    // Generate 6 weeks worth of dates
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
    current.setDate(current.getDate() - 1); // Start from yesterday

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

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const canGoNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1) <= today;

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

      {viewMode === 'calendar' ? (
        <div className="calendar-view">
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
            {calendarData.map((item) => (
              <button
                key={item.date}
                className={`calendar-day ${item.isToday ? 'today' : ''} ${
                  item.isPast ? 'available' : 'future'
                } ${item.isSolved ? 'solved' : 'unsolved'}`}
                onClick={() => item.isPast && onSelectDate(item.date)}
                disabled={!item.isPast}
                title={`${item.date}${item.isSolved ? ' (Solved)' : ''}`}
                aria-label={`${item.date}${item.isSolved ? ' - Solved' : ' - Not solved'}${
                  item.isToday ? ' - Today' : ''
                }`}
              >
                <span className="date-number">{new Date(item.date + 'T12:00:00').getDate()}</span>
                {item.isSolved && <span className="solved-indicator" aria-hidden="true">✓</span>}
                {item.isToday && <span className="today-indicator" aria-hidden="true">●</span>}
              </button>
            ))}
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
        <div className="list-view">
          <div className="list-header">
            <p className="list-title">Last 90 days</p>
            <p className="list-legend">
              <span className="legend-item">✓ Solved</span>
              <span className="legend-item">○ Unsolved</span>
            </p>
          </div>
          <div className="dates-list">
            {pastDaysList.map((item) => (
              <button
                key={item.date}
                className={`date-item ${item.isSolved ? 'solved' : 'unsolved'}`}
                onClick={() => onSelectDate(item.date)}
                aria-label={`${formatDateForList(item.date)}${item.isSolved ? ' - Solved' : ' - Not solved'}`}
              >
                <span className="date-label">{formatDateForList(item.date)}</span>
                <span className={`status-indicator ${item.isSolved ? 'solved' : 'unsolved'}`}>
                  {item.isSolved ? '✓' : '○'}
                </span>
              </button>
            ))}
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

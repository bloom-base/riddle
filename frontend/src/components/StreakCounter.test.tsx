import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StreakCounter from './StreakCounter';

describe('StreakCounter', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('should not render when streak is 0', () => {
    const { container } = render(<StreakCounter streak={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('should display streak count with fire emoji', () => {
    render(<StreakCounter streak={5} />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
  });

  it('should display singular "day" for streak of 1', () => {
    render(<StreakCounter streak={1} />);
    expect(screen.getByText('day')).toBeInTheDocument();
  });

  it('should display motivational message for streaks >= 3', () => {
    render(<StreakCounter streak={3} />);
    expect(screen.getByText('Three days! The habit is forming!')).toBeInTheDocument();
  });

  it('should not display motivational message for streaks < 3', () => {
    render(<StreakCounter streak={2} />);
    expect(screen.queryByText(/habit/i)).not.toBeInTheDocument();
  });

  it('should display progress bar for non-milestone streaks', () => {
    render(<StreakCounter streak={5} />);
    expect(screen.getByText(/2 more days to 7-day milestone!/)).toBeInTheDocument();
    expect(screen.getByClassName('progress-bar')).toBeInTheDocument();
  });

  it('should not display progress bar for milestone streaks', () => {
    render(<StreakCounter streak={7} />);
    expect(screen.queryByClassName('progress-bar')).not.toBeInTheDocument();
  });

  it('should apply milestone class for milestone streaks', () => {
    const { container } = render(<StreakCounter streak={7} />);
    const streakCounter = container.firstChild as HTMLElement;
    expect(streakCounter.classList.contains('milestone')).toBe(true);
  });

  it('should not apply milestone class for non-milestone streaks', () => {
    const { container } = render(<StreakCounter streak={5} />);
    const streakCounter = container.firstChild as HTMLElement;
    expect(streakCounter.classList.contains('milestone')).toBe(false);
  });

  it('should display milestone celebration when showCelebration is true and is milestone', () => {
    render(<StreakCounter streak={7} showCelebration={true} />);
    expect(screen.getByText('7-Day Milestone!')).toBeInTheDocument();
    expect(screen.getByText('Incredible dedication!')).toBeInTheDocument();
  });

  it('should call onCelebrationEnd after 3 seconds', () => {
    vi.useFakeTimers();
    const onCelebrationEnd = vi.fn();
    
    render(<StreakCounter streak={7} showCelebration={true} onCelebrationEnd={onCelebrationEnd} />);
    
    expect(onCelebrationEnd).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(3000);
    
    expect(onCelebrationEnd).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });

  it('should display correct progress percentage', () => {
    const { container } = render(<StreakCounter streak={5} />);
    const progressFill = container.querySelector('.progress-fill') as HTMLElement;
    
    // 5 days toward 7-day milestone = 5/7 * 100 = ~71.43%
    expect(progressFill.style.width).toBe(`${(5 / 7) * 100}%`);
  });
});

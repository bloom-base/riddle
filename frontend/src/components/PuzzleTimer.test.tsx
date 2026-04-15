import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PuzzleTimer from './PuzzleTimer';

describe('PuzzleTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when visible is false', () => {
    const { container } = render(<PuzzleTimer visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders timer display when visible is true', () => {
    render(<PuzzleTimer visible={true} />);
    expect(screen.getByRole('timer')).toBeTruthy();
    expect(screen.getByText('Time remaining')).toBeTruthy();
  });

  it('displays time in HH:MM:SS format', () => {
    render(<PuzzleTimer visible={true} />);
    // Should contain a digits element with a time-like pattern
    const digits = screen.getByText(/^\d{2}:\d{2}:\d{2}$/);
    expect(digits).toBeTruthy();
  });

  it('shows progress bar with correct aria attributes', () => {
    render(<PuzzleTimer visible={true} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('calls onExpire when time reaches zero', () => {
    const onExpire = vi.fn();

    // Set time to 1 second before midnight
    const almostMidnight = new Date('2026-04-15T23:59:59.500');
    vi.setSystemTime(almostMidnight);

    render(<PuzzleTimer visible={true} onExpire={onExpire} />);

    // Advance 1 second → hits midnight boundary → remaining = 0
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('shows expired message when time is up', () => {
    // Start 500ms before midnight
    const almostMidnight = new Date('2026-04-15T23:59:59.500');
    vi.setSystemTime(almostMidnight);

    render(<PuzzleTimer visible={true} />);

    // Advance past midnight
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Come back tomorrow!')).toBeTruthy();
  });
});

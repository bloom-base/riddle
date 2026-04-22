import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DailyRiddle from './DailyRiddle';

const mockRiddle = {
  date: '2024-01-15',
  id: 'riddle_1',
  question: 'What has keys but no locks?',
  answer: 'A keyboard',
  difficulty: 'easy',
  category: 'technology'
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DailyRiddle', () => {
  it('renders the riddle question', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.getByText('🤔 Daily Riddle')).toBeInTheDocument();
    expect(screen.getByText(mockRiddle.question)).toBeInTheDocument();
  });

  it('displays category and difficulty', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.getByText(mockRiddle.category)).toBeInTheDocument();
    // Check for difficulty stars (easy = 2 stars)
    expect(screen.getByTitle('Difficulty: Easy')).toBeInTheDocument();
  });

  it('initially hides the answer', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.queryByText(mockRiddle.answer)).not.toBeInTheDocument();
    expect(screen.getByText(/Reveal Answer/i)).toBeInTheDocument();
  });

  it('reveals answer when reveal button is clicked', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    const revealButton = screen.getByText(/Reveal Answer/i);
    fireEvent.click(revealButton);

    expect(screen.getByText(mockRiddle.answer)).toBeInTheDocument();
    expect(screen.queryByText(/Reveal Answer/i)).not.toBeInTheDocument();
  });

  it('displays correct difficulty stars for easy riddle', () => {
    const easyRiddle = { ...mockRiddle, difficulty: 'easy' };
    render(<DailyRiddle riddle={easyRiddle} />);

    const difficultyElement = screen.getByTitle('Difficulty: Easy');
    expect(difficultyElement.textContent).toBe('★★');
  });

  it('displays correct difficulty stars for medium riddle', () => {
    const mediumRiddle = { ...mockRiddle, difficulty: 'medium' };
    render(<DailyRiddle riddle={mediumRiddle} />);

    const difficultyElement = screen.getByTitle('Difficulty: Medium');
    expect(difficultyElement.textContent).toBe('★★★');
  });

  it('displays correct difficulty stars for hard riddle', () => {
    const hardRiddle = { ...mockRiddle, difficulty: 'hard' };
    render(<DailyRiddle riddle={hardRiddle} />);

    const difficultyElement = screen.getByTitle('Difficulty: Hard');
    expect(difficultyElement.textContent).toBe('★★★★★');
  });

  it('shows answer label when revealed', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    const revealButton = screen.getByText(/Reveal Answer/i);
    fireEvent.click(revealButton);

    expect(screen.getByText('Answer:')).toBeInTheDocument();
  });

  it('applies revealed class to answer when shown', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    const revealButton = screen.getByText(/Reveal Answer/i);
    fireEvent.click(revealButton);

    const answerElement = screen.getByText(mockRiddle.answer).parentElement;
    expect(answerElement?.classList.contains('riddle-answer')).toBe(true);
    expect(answerElement?.classList.contains('revealed')).toBe(true);
  });

  it('handles different category names', () => {
    const riddleWithCategory = { ...mockRiddle, category: 'wordplay' };
    render(<DailyRiddle riddle={riddleWithCategory} />);

    expect(screen.getByText('wordplay')).toBeInTheDocument();
  });

  it('handles long riddle questions', () => {
    const longRiddle = {
      ...mockRiddle,
      question: 'This is a very long riddle question that should still be displayed properly in the component even though it is quite lengthy and contains many words.'
    };
    render(<DailyRiddle riddle={longRiddle} />);

    expect(screen.getByText(longRiddle.question)).toBeInTheDocument();
  });

  it('has accessible reveal button', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    const revealButton = screen.getByLabelText('Reveal answer');
    expect(revealButton).toBeInTheDocument();
    expect(revealButton.tagName).toBe('BUTTON');
  });
});

/* ─────────────────────────────────────────────
   Hint Feature Tests
   ───────────────────────────────────────────── */

describe('DailyRiddle – Hint System', () => {
  it('shows Get Hint button and initial counter', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.getByText('💡 Get Hint')).toBeInTheDocument();
    expect(screen.getByText('Hints used: 0/3')).toBeInTheDocument();
  });

  it('reveals a hint when Get Hint is clicked', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    fireEvent.click(screen.getByText('💡 Get Hint'));

    // Counter updates immediately
    expect(screen.getByText('Hints used: 1/3')).toBeInTheDocument();
    // Hint label appears
    expect(screen.getByText('Hint 1:')).toBeInTheDocument();
  });

  it('animates characters one at a time (200ms each)', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    fireEvent.click(screen.getByText('💡 Get Hint'));

    // Before any timer ticks, no chars should be visible
    const chars = document.querySelectorAll('.hint-char');
    expect(chars.length).toBeGreaterThan(0);

    const visibleBefore = document.querySelectorAll('.hint-char--visible');
    expect(visibleBefore.length).toBe(0);

    // After one tick (200ms), first char visible
    act(() => { vi.advanceTimersByTime(200); });
    expect(document.querySelectorAll('.hint-char--visible').length).toBe(1);

    // After second tick
    act(() => { vi.advanceTimersByTime(200); });
    expect(document.querySelectorAll('.hint-char--visible').length).toBe(2);
  });

  it('increments counter with each hint', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    // Use hint 1
    fireEvent.click(screen.getByText('💡 Get Hint'));
    // Complete animation
    act(() => { vi.advanceTimersByTime(20000); });
    expect(screen.getByText('Hints used: 1/3')).toBeInTheDocument();

    // Use hint 2
    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });
    expect(screen.getByText('Hints used: 2/3')).toBeInTheDocument();

    // Use hint 3
    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });
    expect(screen.getByText('Hints used: 3/3')).toBeInTheDocument();
  });

  it('disables hint button after 3 hints', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('💡 Get Hint'));
      act(() => { vi.advanceTimersByTime(20000); });
    }

    const button = screen.getByText('💡 Get Hint');
    expect(button).toBeDisabled();
  });

  it('disables hint button when answer is revealed', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    fireEvent.click(screen.getByText(/Reveal Answer/i));

    const hintButton = screen.getByText('💡 Get Hint');
    expect(hintButton).toBeDisabled();
  });

  it('persists hint count in localStorage', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });

    expect(localStorage.getItem('riddleHints_2024-01-15')).toBe('1');

    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });

    expect(localStorage.getItem('riddleHints_2024-01-15')).toBe('2');
  });

  it('restores hint count from localStorage on mount', () => {
    localStorage.setItem('riddleHints_2024-01-15', '2');

    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.getByText('Hints used: 2/3')).toBeInTheDocument();
    // Previous hint text should be fully visible
    expect(screen.getByText('Hint 2:')).toBeInTheDocument();
  });

  it('does not allow clicking Get Hint during animation', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    fireEvent.click(screen.getByText('💡 Get Hint'));
    // Animation in progress – button should be disabled
    expect(screen.getByText('💡 Get Hint')).toBeDisabled();

    // Counter should still be 1 (no extra hints)
    expect(screen.getByText('Hints used: 1/3')).toBeInTheDocument();
  });

  it('shows progressively more characters with each hint level', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    // Hint 1 – reveal ~15%
    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });

    const hint1Chars = document.querySelectorAll('.hint-char--visible');
    const hint1UnderscoreCount = Array.from(hint1Chars).filter(
      (el) => el.textContent === '_'
    ).length;

    // Hint 2 – should reveal more
    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });

    const hint2Chars = document.querySelectorAll('.hint-char--visible');
    const hint2UnderscoreCount = Array.from(hint2Chars).filter(
      (el) => el.textContent === '_'
    ).length;

    // More underscores replaced in hint 2 means fewer underscores
    expect(hint2UnderscoreCount).toBeLessThanOrEqual(hint1UnderscoreCount);
  });

  it('uses different localStorage keys for different dates', () => {
    const riddle1 = { ...mockRiddle, date: '2024-01-15' };
    const riddle2 = { ...mockRiddle, date: '2024-01-16' };

    const { unmount } = render(<DailyRiddle riddle={riddle1} />);
    fireEvent.click(screen.getByText('💡 Get Hint'));
    act(() => { vi.advanceTimersByTime(20000); });
    unmount();

    render(<DailyRiddle riddle={riddle2} />);
    expect(screen.getByText('Hints used: 0/3')).toBeInTheDocument();
    expect(localStorage.getItem('riddleHints_2024-01-15')).toBe('1');
    expect(localStorage.getItem('riddleHints_2024-01-16')).toBeNull();
  });
});

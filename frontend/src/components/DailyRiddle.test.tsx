import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyRiddle from './DailyRiddle';

const mockRiddle = {
  date: '2024-01-15',
  id: 'riddle_1',
  question: 'What has keys but no locks?',
  answer: 'A keyboard',
  difficulty: 'easy',
  category: 'technology'
};

describe('DailyRiddle', () => {
  it('renders the riddle question', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.getByText('🤔 Daily Riddle')).toBeInTheDocument();
    expect(screen.getByText(mockRiddle.question)).toBeInTheDocument();
  });

  it('displays category and difficulty', () => {
    render(<DailyRiddle riddle={mockRiddle} />);

    expect(screen.getByText(mockRiddle.category)).toBeInTheDocument();
    // Check for difficulty stars (easy = ⭐)
    expect(screen.getByTitle('Difficulty: easy')).toBeInTheDocument();
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

  it('displays correct difficulty emoji for easy riddle', () => {
    const easyRiddle = { ...mockRiddle, difficulty: 'easy' };
    render(<DailyRiddle riddle={easyRiddle} />);

    const difficultyElement = screen.getByTitle('Difficulty: easy');
    expect(difficultyElement.textContent).toBe('⭐');
  });

  it('displays correct difficulty emoji for medium riddle', () => {
    const mediumRiddle = { ...mockRiddle, difficulty: 'medium' };
    render(<DailyRiddle riddle={mediumRiddle} />);

    const difficultyElement = screen.getByTitle('Difficulty: medium');
    expect(difficultyElement.textContent).toBe('⭐⭐');
  });

  it('displays correct difficulty emoji for hard riddle', () => {
    const hardRiddle = { ...mockRiddle, difficulty: 'hard' };
    render(<DailyRiddle riddle={hardRiddle} />);

    const difficultyElement = screen.getByTitle('Difficulty: hard');
    expect(difficultyElement.textContent).toBe('⭐⭐⭐');
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

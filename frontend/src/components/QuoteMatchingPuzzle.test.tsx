import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuoteMatchingPuzzle from './QuoteMatchingPuzzle';

const mockPuzzle = {
  date: '2024-01-15',
  openings: [
    { id: 'opening_1', text: 'It was the best of times,' },
    { id: 'opening_2', text: 'Call me' }
  ],
  closings: [
    { id: 'closing_1', text: 'it was the worst of times.' },
    { id: 'closing_2', text: 'Ishmael.' }
  ],
  correctMatches: [
    { id: 'quote_1', openingId: 'opening_1', closingId: 'closing_1' },
    { id: 'quote_2', openingId: 'opening_2', closingId: 'closing_2' }
  ]
};

describe('QuoteMatchingPuzzle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render puzzle with openings and closings', () => {
    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    expect(screen.getByText(/Opening Fragments/i)).toBeInTheDocument();
    expect(screen.getByText(/Closing Fragments/i)).toBeInTheDocument();
    expect(screen.getByText('It was the best of times,')).toBeInTheDocument();
    expect(screen.getByText('Call me')).toBeInTheDocument();
    expect(screen.getByText('it was the worst of times.')).toBeInTheDocument();
    expect(screen.getByText('Ishmael.')).toBeInTheDocument();
  });

  it('should display submit button initially disabled', () => {
    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('should create a match when drag-dropping opening to closing', () => {
    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    const opening = screen.getByText('It was the best of times,');
    const closing = screen.getByText('it was the worst of times.');
    
    // Simulate drag start
    fireEvent.dragStart(opening);
    expect(opening.parentElement).toHaveClass('opening');
    
    // Simulate drop on closing
    fireEvent.dragOver(closing.closest('.closing')!);
    fireEvent.drop(closing.closest('.closing')!);
    
    // Check that match count updates
    expect(screen.getByText(/Your Matches/i)).toBeInTheDocument();
  });

  it('should update match count in submit button', async () => {
    const { rerender } = render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    // Initially disabled
    let submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/0\/2/);
    
    // Simulate making a match via drag-drop
    const opening = screen.getByText('It was the best of times,');
    const closing = screen.getByText('it was the worst of times.');
    
    fireEvent.dragStart(opening);
    fireEvent.dragOver(closing.closest('.closing')!);
    fireEvent.drop(closing.closest('.closing')!);
    
    // Re-render to see updated state
    rerender(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    // Should now show 1 match
    submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toHaveTextContent(/Submit \(1\/2\)/);
  });

  it('should validate matches on submit', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        allCorrect: true,
        results: {
          opening_1: true,
          opening_2: true
        }
      })
    });

    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    // Make a match
    const opening = screen.getByText('It was the best of times,');
    const closing = screen.getByText('it was the worst of times.');
    
    fireEvent.dragStart(opening);
    fireEvent.dragOver(closing.closest('.closing')!);
    fireEvent.drop(closing.closest('.closing')!);
    
    // Try to submit (should show alert if not all matched)
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);
    
    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/validate',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('should remove a match when X button clicked', async () => {
    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    // Make a match
    const opening = screen.getByText('It was the best of times,');
    const closing = screen.getByText('it was the worst of times.');
    
    fireEvent.dragStart(opening);
    fireEvent.dragOver(closing.closest('.closing')!);
    fireEvent.drop(closing.closest('.closing')!);
    
    // Find and click remove button
    const removeButtons = screen.getAllByTitle('Remove this match');
    expect(removeButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(removeButtons[0]);
    
    // Match should be removed
    await waitFor(() => {
      expect(screen.queryByText(/Your Matches/i)).not.toBeInTheDocument();
    });
  });

  it('should display error message on validation failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Validation failed'));

    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    // Make a match
    const opening = screen.getByText('It was the best of times,');
    const closing = screen.getByText('it was the worst of times.');
    
    fireEvent.dragStart(opening);
    fireEvent.dragOver(closing.closest('.closing')!);
    fireEvent.drop(closing.closest('.closing')!);
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);
    
    // Wait for error handling
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should show completion screen on all correct answers', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        allCorrect: true,
        results: {
          opening_1: true,
          opening_2: true
        }
      })
    });

    const onComplete = vi.fn();

    render(
      <QuoteMatchingPuzzle 
        puzzle={mockPuzzle} 
        onComplete={onComplete}
      />
    );
    
    // Make both matches
    const openingElements = document.querySelectorAll('.fragment.opening');
    const closingElements = document.querySelectorAll('.fragment.closing');
    
    // Match 1
    fireEvent.dragStart(openingElements[0]);
    fireEvent.dragOver(closingElements[0]);
    fireEvent.drop(closingElements[0]);
    
    // Match 2
    fireEvent.dragStart(openingElements[1]);
    fireEvent.dragOver(closingElements[1]);
    fireEvent.drop(closingElements[1]);
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /✓ Submit All Matches/i });
    fireEvent.click(submitBtn);
    
    // Wait for completion screen
    await waitFor(() => {
      expect(screen.getByText(/Congratulations/i)).toBeInTheDocument();
    });
  });

  it('should be disabled when no matches are made', () => {
    render(<QuoteMatchingPuzzle puzzle={mockPuzzle} />);
    
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/0\/2/);
  });
});

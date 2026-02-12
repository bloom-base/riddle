import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (global.fetch as any).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(<App />);
    expect(screen.getByText(/Loading today's puzzle/i)).toBeInTheDocument();
  });

  it('should render error state on fetch failure', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it('should render puzzle when data loads successfully', async () => {
    const mockPuzzle = {
      date: '2024-01-15',
      openings: [
        { id: 'opening_1', text: 'It was the best of times,' }
      ],
      closings: [
        { id: 'closing_1', text: 'it was the worst of times.' }
      ],
      correctMatches: [
        { id: 'quote_1', openingId: 'opening_1', closingId: 'closing_1' }
      ]
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockPuzzle
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('It was the best of times,')).toBeInTheDocument();
      expect(screen.getByText('it was the worst of times.')).toBeInTheDocument();
    });
  });

  it('should render header and footer', async () => {
    const mockPuzzle = {
      date: '2024-01-15',
      openings: [],
      closings: [],
      correctMatches: []
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPuzzle
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/🎭 Riddle/)).toBeInTheDocument();
      expect(screen.getByText(/One puzzle a day keeps the brain sharp/)).toBeInTheDocument();
    });
  });
});

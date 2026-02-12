import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SudokuPuzzle from './SudokuPuzzle';

const mockPuzzle = {
  date: '2024-01-15',
  puzzle: [
    [1, 0, 3],
    [4, 5, 0],
    [0, 8, 9]
  ],
  difficulty: 'easy'
};

const mockStartTime = Date.now() - 10000; // 10 seconds ago

describe('SudokuPuzzle Component', () => {
  beforeEach(() => {
    // Mock fetch for solution
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/sudoku/solution')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              date: '2024-01-15',
              solution: [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
              ]
            })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('should render the Sudoku puzzle component', () => {
    const onComplete = vi.fn();
    render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    expect(screen.getByText('3×3 Sudoku')).toBeInTheDocument();
    expect(screen.getByText(/Difficulty:/)).toBeInTheDocument();
  });

  it('should display the puzzle grid with 9 cells', async () => {
    const onComplete = vi.fn();
    render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    await waitFor(() => {
      const cells = screen.getAllByRole('textbox');
      expect(cells).toHaveLength(9);
    });
  });

  it('should display original puzzle numbers as disabled cells', async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    await waitFor(() => {
      const disabledCells = container.querySelectorAll('.sudoku-cell:disabled');
      expect(disabledCells.length).toBeGreaterThan(0);
    });
  });

  it('should allow entering numbers in empty cells', async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    await waitFor(() => {
      const cells = container.querySelectorAll('.sudoku-cell:not(:disabled)');
      expect(cells.length).toBeGreaterThan(0);
    });

    const firstEmptyCell = container.querySelector(
      '.sudoku-cell:not(:disabled)'
    ) as HTMLInputElement;

    if (firstEmptyCell) {
      fireEvent.change(firstEmptyCell, { target: { value: '2' } });
      expect(firstEmptyCell.value).toBe('2');
    }
  });

  it('should not allow invalid numbers', async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    await waitFor(() => {
      const cells = container.querySelectorAll('.sudoku-cell:not(:disabled)');
      expect(cells.length).toBeGreaterThan(0);
    });

    const firstEmptyCell = container.querySelector(
      '.sudoku-cell:not(:disabled)'
    ) as HTMLInputElement;

    if (firstEmptyCell) {
      fireEvent.change(firstEmptyCell, { target: { value: '10' } });
      // Should not update to invalid value
      expect(firstEmptyCell.value).toBe('');

      fireEvent.change(firstEmptyCell, { target: { value: 'abc' } });
      expect(firstEmptyCell.value).toBe('');
    }
  });

  it('should show Rules section', () => {
    const onComplete = vi.fn();
    render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Fill the 3×3 grid so each row, column, and box contains the numbers 1-9/
      )
    ).toBeInTheDocument();
  });

  it('should have Hint and Reset buttons', async () => {
    const onComplete = vi.fn();
    render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Hint/)).toBeInTheDocument();
      expect(screen.getByText(/Reset/)).toBeInTheDocument();
    });
  });

  it('should reset puzzle when Reset button is clicked', async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    // Fill in a cell
    await waitFor(() => {
      const firstEmptyCell = container.querySelector(
        '.sudoku-cell:not(:disabled)'
      ) as HTMLInputElement;
      fireEvent.change(firstEmptyCell, { target: { value: '2' } });
    });

    // Click reset
    const resetBtn = screen.getByText(/Reset/);
    fireEvent.click(resetBtn);

    // Check cells are empty again
    await waitFor(() => {
      const firstEmptyCell = container.querySelector(
        '.sudoku-cell:not(:disabled)'
      ) as HTMLInputElement;
      expect(firstEmptyCell.value).toBe('');
    });
  });

  it('should show difficulty level', async () => {
    const onComplete = vi.fn();
    render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('easy')).toBeInTheDocument();
    });
  });

  it('should render with responsive design', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <SudokuPuzzle
        puzzle={mockPuzzle}
        onComplete={onComplete}
        startTime={mockStartTime}
      />
    );

    const sudokuPuzzle = container.querySelector('.sudoku-puzzle');
    expect(sudokuPuzzle).toBeInTheDocument();
    expect(sudokuPuzzle).toHaveClass('sudoku-puzzle');
  });
});

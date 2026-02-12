import React, { useState, useEffect } from 'react';
import './SudokuPuzzle.css';

type SudokuGrid = number[][];

interface PuzzleData {
  date: string;
  puzzle: SudokuGrid;
  difficulty: string;
}

interface Props {
  puzzle: PuzzleData;
  onComplete: (completionTimeMs: number) => void;
  startTime: number;
}

const SudokuPuzzle: React.FC<Props> = ({ puzzle, onComplete, startTime }) => {
  const [grid, setGrid] = useState<SudokuGrid>(puzzle.puzzle.map(row => [...row]));
  const [solution, setSolution] = useState<SudokuGrid | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch the solution from the server
  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const response = await fetch(`/api/sudoku/solution?date=${puzzle.date}`);
        if (!response.ok) throw new Error('Failed to fetch solution');
        const data = await response.json();
        setSolution(data.solution);
      } catch (error) {
        console.error('Error fetching solution:', error);
        setMessage('Error loading puzzle');
      }
    };

    fetchSolution();
  }, [puzzle.date]);

  const handleCellChange = (row: number, col: number, value: string) => {
    // Only allow numbers 1-9 or empty
    const num = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 9) return;

    // Don't allow editing puzzle cells (original numbers)
    if (puzzle.puzzle[row][col] !== 0) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Check if puzzle is complete
    checkCompletion(newGrid);
  };

  const checkCompletion = async (currentGrid: SudokuGrid) => {
    if (!solution) return;

    // Check if all cells are filled
    let allFilled = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (currentGrid[i][j] === 0) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) break;
    }

    if (!allFilled) return;

    // Validate against solution
    try {
      const response = await fetch('/api/sudoku/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: puzzle.date,
          grid: currentGrid
        })
      });

      if (!response.ok) throw new Error('Validation failed');
      const result = await response.json();

      if (result.allCorrect) {
        setIsComplete(true);
        setMessage('🎉 Puzzle solved! Well done!');
        const completionTime = Date.now() - startTime;
        onComplete(completionTime);
      } else {
        setMessage('❌ Some cells are incorrect. Keep trying!');
      }
    } catch (error) {
      console.error('Error validating puzzle:', error);
      setMessage('Error validating puzzle');
    }
  };

  const resetPuzzle = () => {
    setGrid(puzzle.puzzle.map(row => [...row]));
    setIsComplete(false);
    setMessage('');
    setSelectedCell(null);
  };

  const fillRandomCell = () => {
    if (!solution) return;

    const newGrid = grid.map(r => [...r]);
    let filled = false;

    // Find a random empty cell and fill it with the solution
    for (let i = 0; i < 3 && !filled; i++) {
      for (let j = 0; j < 3 && !filled; j++) {
        if (grid[i][j] === 0 && puzzle.puzzle[i][j] === 0) {
          newGrid[i][j] = solution[i][j];
          filled = true;
        }
      }
    }

    if (filled) {
      setGrid(newGrid);
      checkCompletion(newGrid);
    }
  };

  return (
    <div className="sudoku-puzzle">
      <div className="sudoku-header">
        <h2>3×3 Sudoku</h2>
        <p className="difficulty">Difficulty: {puzzle.difficulty}</p>
      </div>

      <div className="sudoku-grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="sudoku-row">
            {row.map((cell, colIdx) => {
              const isOriginal = puzzle.puzzle[rowIdx][colIdx] !== 0;
              const isSelected =
                selectedCell && selectedCell.row === rowIdx && selectedCell.col === colIdx;
              const isCorrect =
                solution && cell === solution[rowIdx][colIdx] && cell !== 0;

              return (
                <input
                  key={`${rowIdx}-${colIdx}`}
                  type="number"
                  min="0"
                  max="9"
                  value={cell === 0 ? '' : cell}
                  onChange={e => handleCellChange(rowIdx, colIdx, e.target.value)}
                  onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                  onFocus={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                  disabled={isOriginal}
                  className={`sudoku-cell ${isOriginal ? 'original' : ''} ${
                    isSelected ? 'selected' : ''
                  } ${isCorrect ? 'correct' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {message && (
        <div className={`sudoku-message ${isComplete ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="sudoku-controls">
        <button
          className="hint-btn"
          onClick={fillRandomCell}
          disabled={isComplete || !solution}
          title="Fill a random empty cell with the correct number"
        >
          💡 Hint
        </button>
        <button
          className="reset-btn"
          onClick={resetPuzzle}
          disabled={isComplete}
          title="Reset puzzle to initial state"
        >
          🔄 Reset
        </button>
      </div>

      <div className="sudoku-rules">
        <h3>Rules</h3>
        <p>Fill the 3×3 grid so each row, column, and box contains the numbers 1-9.</p>
        <p>Click cells to select them and type numbers to fill them in.</p>
      </div>
    </div>
  );
};

export default SudokuPuzzle;

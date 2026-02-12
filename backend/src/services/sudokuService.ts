/**
 * Sudoku Puzzle Service
 * Generates and validates 3x3 Sudoku puzzles with deterministic daily rotation
 */

/**
 * 3x3 Sudoku Grid Type (9 cells, values 1-9 or 0 for empty)
 */
export type SudokuGrid = number[][];

export interface SudokuPuzzle {
  date: string;
  puzzle: SudokuGrid;    // The puzzle with some cells filled
  solution: SudokuGrid;  // The complete solved puzzle
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SudokuValidation {
  success: boolean;
  allCorrect: boolean;
  results: { [key: string]: boolean };  // cell_index -> is_correct
}

/**
 * Simple deterministic seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

/**
 * Generate a hash seed from a date string
 */
function hashDate(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if a number is valid in a position
 */
function isValid(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  // Check row
  for (let i = 0; i < 3; i++) {
    if (grid[row][i] === num) return false;
  }

  // Check column
  for (let i = 0; i < 3; i++) {
    if (grid[i][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (grid[i][j] === num) return false;
    }
  }

  return true;
}

/**
 * Generate a valid solved Sudoku grid using backtracking
 */
function generateSolvedGrid(rng: SeededRandom): SudokuGrid {
  const grid: SudokuGrid = Array(3)
    .fill(null)
    .map(() => Array(3).fill(0));

  function solve(): boolean {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (grid[row][col] === 0) {
          // Get random numbers 1-9
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          for (let i = numbers.length - 1; i > 0; i--) {
            const j = rng.nextInt(i + 1);
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
          }

          for (const num of numbers) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (solve()) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  solve();
  return grid;
}

/**
 * Create a puzzle by removing cells from a solved grid
 */
function createPuzzle(
  solved: SudokuGrid,
  numToRemove: number,
  rng: SeededRandom
): SudokuGrid {
  const puzzle = solved.map(row => [...row]);
  let removed = 0;

  while (removed < numToRemove) {
    const row = rng.nextInt(3);
    const col = rng.nextInt(3);

    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }

  return puzzle;
}

/**
 * Generate daily Sudoku puzzle based on date
 */
export function generateDailySudoku(date?: string): SudokuPuzzle {
  const dateStr = date || new Date().toISOString().split('T')[0];
  const seed = hashDate(dateStr);
  const rng = new SeededRandom(seed);

  // Generate solved grid
  const solution = generateSolvedGrid(rng);

  // Create puzzle with 4-5 empty cells (easy difficulty for 3x3)
  const numToRemove = 4 + rng.nextInt(2);
  const puzzle = createPuzzle(solution, numToRemove, rng);

  return {
    date: dateStr,
    puzzle,
    solution,
    difficulty: 'easy'
  };
}

/**
 * Validate user's Sudoku solution
 */
export function validateSudoku(
  userGrid: SudokuGrid,
  solution: SudokuGrid
): SudokuValidation {
  const results: { [key: string]: boolean } = {};
  let allCorrect = true;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const key = `${row}_${col}`;
      const isCorrect = userGrid[row][col] === solution[row][col];
      results[key] = isCorrect;
      if (!isCorrect) allCorrect = false;
    }
  }

  return {
    success: true,
    allCorrect,
    results
  };
}

/**
 * Get puzzle info without solution
 */
export function getPuzzleInfo(date?: string): Omit<SudokuPuzzle, 'solution'> {
  const puzzle = generateDailySudoku(date);
  return {
    date: puzzle.date,
    puzzle: puzzle.puzzle,
    difficulty: puzzle.difficulty
  };
}

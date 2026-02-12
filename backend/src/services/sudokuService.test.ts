import { describe, it, expect } from 'vitest';
import {
  generateDailySudoku,
  validateSudoku,
  getPuzzleInfo,
  type SudokuGrid
} from './sudokuService';

describe('SudokuService', () => {
  describe('generateDailySudoku', () => {
    it('should generate a puzzle with correct structure', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      
      expect(puzzle).toHaveProperty('date');
      expect(puzzle).toHaveProperty('puzzle');
      expect(puzzle).toHaveProperty('solution');
      expect(puzzle).toHaveProperty('difficulty');
      expect(puzzle.puzzle).toHaveLength(3);
      expect(puzzle.solution).toHaveLength(3);
    });

    it('should have 3x3 grids', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      
      for (let i = 0; i < 3; i++) {
        expect(puzzle.puzzle[i]).toHaveLength(3);
        expect(puzzle.solution[i]).toHaveLength(3);
      }
    });

    it('should return same puzzle for same date', () => {
      const puzzle1 = generateDailySudoku('2024-01-15');
      const puzzle2 = generateDailySudoku('2024-01-15');
      
      expect(puzzle1.date).toBe(puzzle2.date);
      expect(JSON.stringify(puzzle1.puzzle)).toBe(JSON.stringify(puzzle2.puzzle));
      expect(JSON.stringify(puzzle1.solution)).toBe(JSON.stringify(puzzle2.solution));
    });

    it('should return different puzzles for different dates', () => {
      const puzzle1 = generateDailySudoku('2024-01-15');
      const puzzle2 = generateDailySudoku('2024-01-16');
      
      expect(puzzle1.date).not.toBe(puzzle2.date);
      // Very likely to be different (not guaranteed but highly probable)
      expect(JSON.stringify(puzzle1.puzzle)).not.toBe(JSON.stringify(puzzle2.puzzle));
    });

    it('should use today\'s date by default', () => {
      const puzzle = generateDailySudoku();
      const today = new Date().toISOString().split('T')[0];
      
      expect(puzzle.date).toBe(today);
    });

    it('should have solution cells in range 1-9', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(puzzle.solution[i][j]).toBeGreaterThanOrEqual(1);
          expect(puzzle.solution[i][j]).toBeLessThanOrEqual(9);
        }
      }
    });

    it('should have puzzle with some empty cells (0s)', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      let emptyCount = 0;
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (puzzle.puzzle[i][j] === 0) emptyCount++;
        }
      }
      
      expect(emptyCount).toBeGreaterThan(0);
      expect(emptyCount).toBeLessThanOrEqual(9);
    });

    it('should have puzzle cells that are either 0 or 1-9', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const val = puzzle.puzzle[i][j];
          expect(val === 0 || (val >= 1 && val <= 9)).toBe(true);
        }
      }
    });

    it('should have puzzle that is subset of solution', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (puzzle.puzzle[i][j] !== 0) {
            expect(puzzle.puzzle[i][j]).toBe(puzzle.solution[i][j]);
          }
        }
      }
    });

    it('should set difficulty to easy for 3x3', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      expect(puzzle.difficulty).toBe('easy');
    });
  });

  describe('validateSudoku', () => {
    it('should return allCorrect=true when solution matches', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      const result = validateSudoku(puzzle.solution, puzzle.solution);
      
      expect(result.success).toBe(true);
      expect(result.allCorrect).toBe(true);
    });

    it('should return allCorrect=false when any cell is wrong', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      const wrongGrid: SudokuGrid = puzzle.solution.map(row => [...row]);
      wrongGrid[0][0] = wrongGrid[0][0] === 1 ? 2 : 1;
      
      const result = validateSudoku(wrongGrid, puzzle.solution);
      
      expect(result.success).toBe(true);
      expect(result.allCorrect).toBe(false);
    });

    it('should mark correct cells as true in results', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      const result = validateSudoku(puzzle.solution, puzzle.solution);
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          expect(result.results[`${i}_${j}`]).toBe(true);
        }
      }
    });

    it('should mark wrong cells as false in results', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      const wrongGrid: SudokuGrid = puzzle.solution.map(row => [...row]);
      wrongGrid[1][2] = wrongGrid[1][2] === 1 ? 2 : 1;
      
      const result = validateSudoku(wrongGrid, puzzle.solution);
      
      expect(result.results['1_2']).toBe(false);
    });

    it('should have 9 results (one per cell)', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      const result = validateSudoku(puzzle.solution, puzzle.solution);
      
      expect(Object.keys(result.results)).toHaveLength(9);
    });

    it('should handle grid with all zeros', () => {
      const puzzle = generateDailySudoku('2024-01-15');
      const emptyGrid: SudokuGrid = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];
      
      const result = validateSudoku(emptyGrid, puzzle.solution);
      
      expect(result.success).toBe(true);
      expect(result.allCorrect).toBe(false);
    });
  });

  describe('getPuzzleInfo', () => {
    it('should return puzzle without solution', () => {
      const info = getPuzzleInfo('2024-01-15');
      
      expect(info).toHaveProperty('date');
      expect(info).toHaveProperty('puzzle');
      expect(info).toHaveProperty('difficulty');
      expect(info).not.toHaveProperty('solution');
    });

    it('should return correct date', () => {
      const info = getPuzzleInfo('2024-01-15');
      expect(info.date).toBe('2024-01-15');
    });

    it('should have same puzzle as generateDailySudoku', () => {
      const full = generateDailySudoku('2024-01-15');
      const info = getPuzzleInfo('2024-01-15');
      
      expect(JSON.stringify(info.puzzle)).toBe(JSON.stringify(full.puzzle));
    });

    it('should use today by default', () => {
      const info = getPuzzleInfo();
      const today = new Date().toISOString().split('T')[0];
      
      expect(info.date).toBe(today);
    });
  });
});

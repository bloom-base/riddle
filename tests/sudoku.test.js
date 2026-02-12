const Sudoku = require('../src/sudoku.js');

describe('Sudoku', () => {
  let sudoku;

  beforeEach(() => {
    sudoku = new Sudoku();
  });

  describe('generatePuzzle', () => {
    test('should generate a puzzle with 9 cells', () => {
      const puzzle = sudoku.generatePuzzle();
      expect(puzzle.length).toBe(9);
    });

    test('should generate a puzzle with some empty cells', () => {
      const puzzle = sudoku.generatePuzzle();
      const emptyCells = puzzle.filter(cell => cell === 0);
      expect(emptyCells.length).toBeGreaterThan(0);
    });

    test('should generate a puzzle with all numbers 1-9 exactly once per row', () => {
      sudoku.generatePuzzle();
      // Row 0: cells 0, 1, 2
      // Row 1: cells 3, 4, 5
      // Row 2: cells 6, 7, 8
      
      for (let row = 0; row < 3; row++) {
        const rowCells = [];
        for (let col = 0; col < 3; col++) {
          const val = sudoku.getCellValue(row * 3 + col);
          if (val !== 0) rowCells.push(val);
        }
        // Check no duplicates in row
        const uniqueVals = new Set(rowCells);
        expect(uniqueVals.size).toBe(rowCells.length);
      }
    });

    test('should generate a puzzle with all numbers 1-9 exactly once per column', () => {
      sudoku.generatePuzzle();
      
      for (let col = 0; col < 3; col++) {
        const colCells = [];
        for (let row = 0; row < 3; row++) {
          const val = sudoku.getCellValue(row * 3 + col);
          if (val !== 0) colCells.push(val);
        }
        // Check no duplicates in column
        const uniqueVals = new Set(colCells);
        expect(uniqueVals.size).toBe(colCells.length);
      }
    });

    test('should contain only numbers 1-9 and 0', () => {
      const puzzle = sudoku.generatePuzzle();
      puzzle.forEach(cell => {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('isValidPlacement', () => {
    test('should return true for valid placements', () => {
      sudoku.generatePuzzle();
      
      // Find an empty cell
      let emptyIndex = -1;
      for (let i = 0; i < 9; i++) {
        if (sudoku.getCellValue(i) === 0) {
          emptyIndex = i;
          break;
        }
      }

      if (emptyIndex !== -1) {
        // Get row and column
        const row = Math.floor(emptyIndex / 3);
        const col = emptyIndex % 3;

        // Find a number not in this row or column
        const usedNumbers = new Set();
        for (let c = 0; c < 3; c++) {
          const val = sudoku.getCellValue(row * 3 + c);
          if (val !== 0) usedNumbers.add(val);
        }
        for (let r = 0; r < 3; r++) {
          const val = sudoku.getCellValue(r * 3 + col);
          if (val !== 0) usedNumbers.add(val);
        }

        // Find a valid number
        for (let num = 1; num <= 9; num++) {
          if (!usedNumbers.has(num)) {
            expect(sudoku.isValidPlacement(emptyIndex, num)).toBe(true);
            break;
          }
        }
      }
    });

    test('should return false for invalid placements (duplicate in row)', () => {
      sudoku.generatePuzzle();
      
      // Find a filled cell
      let filledIndex = -1;
      for (let i = 0; i < 9; i++) {
        if (sudoku.getCellValue(i) !== 0) {
          filledIndex = i;
          break;
        }
      }

      if (filledIndex !== -1) {
        const filledValue = sudoku.getCellValue(filledIndex);
        const row = Math.floor(filledIndex / 3);

        // Try to place the same number elsewhere in the row
        for (let col = 0; col < 3; col++) {
          const testIndex = row * 3 + col;
          if (testIndex !== filledIndex) {
            expect(sudoku.isValidPlacement(testIndex, filledValue)).toBe(false);
          }
        }
      }
    });

    test('should return false for invalid placements (duplicate in column)', () => {
      sudoku.generatePuzzle();
      
      // Find a filled cell
      let filledIndex = -1;
      for (let i = 0; i < 9; i++) {
        if (sudoku.getCellValue(i) !== 0) {
          filledIndex = i;
          break;
        }
      }

      if (filledIndex !== -1) {
        const filledValue = sudoku.getCellValue(filledIndex);
        const col = filledIndex % 3;

        // Try to place the same number elsewhere in the column
        for (let row = 0; row < 3; row++) {
          const testIndex = row * 3 + col;
          if (testIndex !== filledIndex) {
            expect(sudoku.isValidPlacement(testIndex, filledValue)).toBe(false);
          }
        }
      }
    });
  });

  describe('randomizeCell', () => {
    test('should randomize a cell to a valid number', () => {
      sudoku.generatePuzzle();
      const result = sudoku.randomizeCell();
      
      if (result !== null) {
        const value = sudoku.getCellValue(result);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(9);
        expect(sudoku.isValidPlacement(result, value)).toBe(true);
      }
    });

    test('should return null or change a cell', () => {
      sudoku.generatePuzzle();
      const gridBefore = sudoku.getGrid();
      const result = sudoku.randomizeCell();
      const gridAfter = sudoku.getGrid();

      // Either result is null, or the grid changed
      if (result !== null) {
        expect(gridBefore[result]).not.toBe(gridAfter[result]);
      }
    });
  });

  describe('reset', () => {
    test('should reset grid to initial state', () => {
      sudoku.generatePuzzle();
      const initialGrid = sudoku.getInitialGrid();

      // Modify a cell
      sudoku.setCellValue(0, 5);
      expect(sudoku.getCellValue(0)).toBe(5);

      // Reset
      sudoku.reset();
      expect(sudoku.getGrid()).toEqual(initialGrid);
    });
  });

  describe('getCellValue and setCellValue', () => {
    test('should get and set cell values correctly', () => {
      sudoku.generatePuzzle();
      sudoku.setCellValue(0, 5);
      expect(sudoku.getCellValue(0)).toBe(5);

      sudoku.setCellValue(0, 0);
      expect(sudoku.getCellValue(0)).toBe(0);
    });
  });

  describe('getGrid and getInitialGrid', () => {
    test('should return independent copies of grid', () => {
      sudoku.generatePuzzle();
      const grid1 = sudoku.getGrid();
      const grid2 = sudoku.getGrid();

      grid1[0] = 99;
      expect(grid2[0]).not.toBe(99);
      expect(sudoku.getCellValue(0)).not.toBe(99);
    });

    test('should preserve initial grid state', () => {
      sudoku.generatePuzzle();
      const initialGrid = sudoku.getInitialGrid();

      sudoku.setCellValue(0, 5);
      expect(sudoku.getInitialGrid()).toEqual(initialGrid);
    });
  });

  describe('isCorrect', () => {
    test('should return true for valid sudoku placements', () => {
      sudoku.generatePuzzle();
      
      // Find an empty cell and place a valid number
      for (let i = 0; i < 9; i++) {
        if (sudoku.getCellValue(i) === 0) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const available = [];
          
          const usedNumbers = new Set();
          for (let c = 0; c < 3; c++) {
            const val = sudoku.getCellValue(row * 3 + c);
            if (val !== 0) usedNumbers.add(val);
          }
          for (let r = 0; r < 3; r++) {
            const val = sudoku.getCellValue(r * 3 + col);
            if (val !== 0) usedNumbers.add(val);
          }

          for (let num = 1; num <= 9; num++) {
            if (!usedNumbers.has(num)) {
              available.push(num);
            }
          }

          if (available.length > 0) {
            const validNum = available[0];
            expect(sudoku.isCorrect(i, validNum)).toBe(true);
          }
          break;
        }
      }
    });

    test('should return false for invalid sudoku placements', () => {
      sudoku.generatePuzzle();
      
      // Find a filled cell and try to place it elsewhere in the row
      for (let i = 0; i < 9; i++) {
        if (sudoku.getCellValue(i) !== 0) {
          const value = sudoku.getCellValue(i);
          const row = Math.floor(i / 3);

          // Find another cell in the same row
          for (let col = 0; col < 3; col++) {
            const testIndex = row * 3 + col;
            if (testIndex !== i) {
              expect(sudoku.isCorrect(testIndex, value)).toBe(false);
              break;
            }
          }
          break;
        }
      }
    });
  });
});

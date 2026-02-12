const Sudoku = require('../src/sudoku.js');
const SudokuGame = require('../src/game.js');

describe('SudokuGame', () => {
  let game;
  let sudoku;

  beforeEach(() => {
    sudoku = new Sudoku();
    game = new SudokuGame(sudoku);
  });

  describe('init', () => {
    test('should initialize with a new puzzle', () => {
      game.init();
      const grid = game.getGrid();
      expect(grid.length).toBe(9);
      expect(grid.some(cell => cell !== 0)).toBe(true);
    });

    test('should clear correctly solved cells', () => {
      game.init();
      const grid = game.getGrid();
      
      // Mark a solved cell
      for (let i = 0; i < 9; i++) {
        if (grid[i] === 0) {
          game.correctlySolvedCells.add(i);
          break;
        }
      }

      expect(game.correctlySolvedCells.size).toBeGreaterThan(0);

      // Reinitialize
      game.init();
      expect(game.correctlySolvedCells.size).toBe(0);
    });

    test('should reset selected cell', () => {
      game.init();
      game.selectCell(0);
      expect(game.selectedCell).toBe(0);

      game.init();
      expect(game.selectedCell).toBeNull();
    });
  });

  describe('selectCell', () => {
    test('should select a cell', () => {
      game.init();
      game.selectCell(5);
      expect(game.selectedCell).toBe(5);
    });

    test('should allow selecting different cells', () => {
      game.init();
      game.selectCell(0);
      expect(game.selectedCell).toBe(0);

      game.selectCell(8);
      expect(game.selectedCell).toBe(8);
    });
  });

  describe('updateCell', () => {
    test('should reject invalid placements', () => {
      game.init();
      const grid = game.getGrid();

      // Find a filled cell
      let filledCell = null;
      let filledValue = null;
      for (let i = 0; i < 9; i++) {
        if (grid[i] !== 0) {
          filledCell = i;
          filledValue = grid[i];
          break;
        }
      }

      if (filledCell !== null) {
        const row = Math.floor(filledCell / 3);

        // Try to place the same value in another cell of the same row
        for (let col = 0; col < 3; col++) {
          const testIndex = row * 3 + col;
          if (testIndex !== filledCell) {
            const result = game.updateCell(testIndex, filledValue);
            expect(result).toBe(false);
            break;
          }
        }
      }
    });

    test('should accept valid placements', () => {
      game.init();
      const grid = game.getGrid();

      // Find an empty cell
      let emptyCell = null;
      for (let i = 0; i < 9; i++) {
        if (grid[i] === 0) {
          emptyCell = i;
          break;
        }
      }

      if (emptyCell !== null) {
        const row = Math.floor(emptyCell / 3);
        const col = emptyCell % 3;

        // Find a valid number for this cell
        const usedNumbers = new Set();
        for (let c = 0; c < 3; c++) {
          const val = game.sudoku.getCellValue(row * 3 + c);
          if (val !== 0) usedNumbers.add(val);
        }
        for (let r = 0; r < 3; r++) {
          const val = game.sudoku.getCellValue(r * 3 + col);
          if (val !== 0) usedNumbers.add(val);
        }

        // Find a valid number
        for (let num = 1; num <= 9; num++) {
          if (!usedNumbers.has(num)) {
            const result = game.updateCell(emptyCell, num);
            expect(result).toBe(true);
            expect(game.sudoku.getCellValue(emptyCell)).toBe(num);
            break;
          }
        }
      }
    });

    test('should allow clearing cells with 0', () => {
      game.init();
      const grid = game.getGrid();

      // Find an empty cell and fill it
      let emptyCell = null;
      for (let i = 0; i < 9; i++) {
        if (grid[i] === 0) {
          emptyCell = i;
          break;
        }
      }

      if (emptyCell !== null) {
        game.sudoku.setCellValue(emptyCell, 5);
        expect(game.sudoku.getCellValue(emptyCell)).toBe(5);

        // Clear it
        const result = game.updateCell(emptyCell, 0);
        expect(result).toBe(true);
        expect(game.sudoku.getCellValue(emptyCell)).toBe(0);
      }
    });

    test('should mark correctly placed cells', () => {
      game.init();
      const grid = game.getGrid();

      // Find an empty cell and place a valid value
      let emptyCell = null;
      for (let i = 0; i < 9; i++) {
        if (grid[i] === 0) {
          emptyCell = i;
          break;
        }
      }

      if (emptyCell !== null) {
        const row = Math.floor(emptyCell / 3);
        const col = emptyCell % 3;

        const usedNumbers = new Set();
        for (let c = 0; c < 3; c++) {
          const val = game.sudoku.getCellValue(row * 3 + c);
          if (val !== 0) usedNumbers.add(val);
        }
        for (let r = 0; r < 3; r++) {
          const val = game.sudoku.getCellValue(r * 3 + col);
          if (val !== 0) usedNumbers.add(val);
        }

        for (let num = 1; num <= 9; num++) {
          if (!usedNumbers.has(num)) {
            game.updateCell(emptyCell, num);
            expect(game.correctlySolvedCells.has(emptyCell)).toBe(true);
            break;
          }
        }
      }
    });

    test('should trigger randomization after valid placement', (done) => {
      game.init();
      const grid = game.getGrid();

      // Register listener for randomization
      let randomizationTriggered = false;
      game.on('cellRandomized', () => {
        randomizationTriggered = true;
      });

      // Find an empty cell and place a valid value
      let emptyCell = null;
      for (let i = 0; i < 9; i++) {
        if (grid[i] === 0) {
          emptyCell = i;
          break;
        }
      }

      if (emptyCell !== null) {
        const row = Math.floor(emptyCell / 3);
        const col = emptyCell % 3;

        const usedNumbers = new Set();
        for (let c = 0; c < 3; c++) {
          const val = game.sudoku.getCellValue(row * 3 + c);
          if (val !== 0) usedNumbers.add(val);
        }
        for (let r = 0; r < 3; r++) {
          const val = game.sudoku.getCellValue(r * 3 + col);
          if (val !== 0) usedNumbers.add(val);
        }

        for (let num = 1; num <= 9; num++) {
          if (!usedNumbers.has(num)) {
            game.updateCell(emptyCell, num);
            
            // Wait for randomization to trigger
            setTimeout(() => {
              expect(randomizationTriggered).toBe(true);
              done();
            }, 400);
            break;
          }
        }
      }
    });
  });

  describe('reset', () => {
    test('should reset grid to initial state', () => {
      game.init();
      const initialGrid = game.getInitialGrid();

      // Modify a cell
      game.sudoku.setCellValue(0, 5);
      expect(game.getGrid()[0]).toBe(5);

      // Reset
      game.reset();
      expect(game.getGrid()).toEqual(initialGrid);
    });

    test('should clear solved cells tracking', () => {
      game.init();
      game.correctlySolvedCells.add(0);
      game.correctlySolvedCells.add(1);

      game.reset();
      expect(game.correctlySolvedCells.size).toBe(0);
    });

    test('should clear randomized cells tracking', () => {
      game.init();
      game.randomizedCells.add(0);

      game.reset();
      expect(game.randomizedCells.size).toBe(0);
    });
  });

  describe('wasCorrectlySolved', () => {
    test('should return true for correctly solved cells', () => {
      game.init();
      game.correctlySolvedCells.add(3);
      expect(game.wasCorrectlySolved(3)).toBe(true);
    });

    test('should return false for unsolved cells', () => {
      game.init();
      expect(game.wasCorrectlySolved(3)).toBe(false);
    });
  });

  describe('wasRecentlyRandomized', () => {
    test('should return true for recently randomized cells', () => {
      game.init();
      game.randomizedCells.add(5);
      expect(game.wasRecentlyRandomized(5)).toBe(true);
    });

    test('should return false for non-randomized cells', () => {
      game.init();
      expect(game.wasRecentlyRandomized(5)).toBe(false);
    });
  });

  describe('event listeners', () => {
    test('should support cellUpdate event', (done) => {
      game.init();
      const grid = game.getGrid();

      let eventFired = false;
      let eventData = null;
      game.on('cellUpdate', (data) => {
        eventFired = true;
        eventData = data;
      });

      // Clear a cell (always valid)
      game.updateCell(0, 0);

      setTimeout(() => {
        expect(eventFired).toBe(true);
        expect(eventData.cellIndex).toBe(0);
        expect(eventData.value).toBe(0);
        done();
      }, 100);
    });

    test('should support puzzleReset event', (done) => {
      let eventFired = false;
      game.on('puzzleReset', () => {
        eventFired = true;
      });

      game.init();

      setTimeout(() => {
        expect(eventFired).toBe(true);
        done();
      }, 100);
    });
  });
});

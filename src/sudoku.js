/**
 * Sudoku puzzle generator and validator
 * Handles 3x3 sudoku grids with dynamic randomization
 */

class Sudoku {
  constructor() {
    this.grid = [];
    this.initialGrid = [];
  }

  /**
   * Generate a valid 3x3 sudoku puzzle
   * @returns {number[][]} A valid 3x3 sudoku grid (9 cells)
   */
  generatePuzzle() {
    // Start with empty grid
    this.grid = Array(9).fill(0);
    
    // Fill the grid using backtracking
    this.fillGrid(0);
    
    // Save the solved puzzle
    const solved = this.grid.map(x => x);
    
    // Create puzzle by removing some numbers
    this.grid = solved.map(x => x); // Start fresh copy
    
    // Remove approximately 40% of cells to create puzzle
    const cellsToRemove = 3; // For 3x3, we'll remove 3 cells to make it solvable but challenging
    const removed = new Set();
    
    while (removed.size < cellsToRemove) {
      const randomIndex = Math.floor(Math.random() * 9);
      if (!removed.has(randomIndex)) {
        this.grid[randomIndex] = 0;
        removed.add(randomIndex);
      }
    }
    
    // Save initial state for comparison
    this.initialGrid = this.grid.map(x => x);
    
    return this.grid.map(x => x);
  }

  /**
   * Fill grid using backtracking algorithm
   * @private
   * @param {number} index - Current cell index
   * @returns {boolean} True if grid was successfully filled
   */
  fillGrid(index) {
    if (index === 9) {
      return true; // All cells filled successfully
    }

    const row = Math.floor(index / 3);
    const col = index % 3;

    // Get available numbers for this cell
    const available = this.getAvailableNumbers(row, col);

    // Shuffle available numbers for randomness
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    // Try each available number
    for (const num of available) {
      this.grid[index] = num;
      if (this.fillGrid(index + 1)) {
        return true;
      }
    }

    // Backtrack
    this.grid[index] = 0;
    return false;
  }

  /**
   * Get available numbers for a cell that don't violate sudoku rules
   * @private
   * @param {number} row - Row index (0-2)
   * @param {number} col - Column index (0-2)
   * @returns {number[]} Available numbers (1-9)
   */
  getAvailableNumbers(row, col) {
    const used = new Set();

    // Check row
    for (let c = 0; c < 3; c++) {
      const val = this.grid[row * 3 + c];
      if (val !== 0) used.add(val);
    }

    // Check column
    for (let r = 0; r < 3; r++) {
      const val = this.grid[r * 3 + col];
      if (val !== 0) used.add(val);
    }

    // Check 3x3 box (for 3x3 sudoku, each box is 1x1, so just the cell itself)
    // In a 3x3 sudoku, the entire grid is one 3x3 box
    // So we only check row and column

    const available = [];
    for (let num = 1; num <= 9; num++) {
      if (!used.has(num)) {
        available.push(num);
      }
    }

    return available;
  }

  /**
   * Check if a number is valid at a given position
   * @param {number} index - Cell index (0-8)
   * @param {number} value - Number to place (1-9)
   * @returns {boolean} True if placement is valid
   */
  isValidPlacement(index, value) {
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Check row - count how many times this number appears in the row
    let rowCount = 0;
    for (let c = 0; c < 3; c++) {
      const cellIndex = row * 3 + c;
      if (cellIndex !== index && this.grid[cellIndex] === value) {
        rowCount++;
      }
    }
    if (rowCount > 0) return false;

    // Check column - count how many times this number appears in the column
    let colCount = 0;
    for (let r = 0; r < 3; r++) {
      const cellIndex = r * 3 + col;
      if (cellIndex !== index && this.grid[cellIndex] === value) {
        colCount++;
      }
    }
    if (colCount > 0) return false;

    return true;
  }

  /**
   * Check if a cell value matches the solution
   * @param {number} index - Cell index (0-8)
   * @param {number} value - Number placed by player
   * @returns {boolean} True if the placement is correct
   */
  isCorrect(index, value) {
    // For dynamic puzzle, we need to verify against the constraints
    // A placement is correct if it doesn't violate sudoku rules
    return this.isValidPlacement(index, value);
  }

  /**
   * Randomize a cell to a new valid number
   * Picks a random cell (preferably empty or filled) and sets it to a valid number
   * @returns {number|null} Index of randomized cell, or null if no valid randomization
   */
  randomizeCell() {
    // Pick a random cell to randomize (can be any cell except initial empty ones maybe)
    const randomIndex = Math.floor(Math.random() * 9);
    
    // Get available numbers for this cell
    const row = Math.floor(randomIndex / 3);
    const col = randomIndex % 3;
    const available = this.getAvailableNumbers(row, col);

    if (available.length === 0) {
      // Try another cell if this one has no available numbers
      for (let i = 0; i < 9; i++) {
        const testRow = Math.floor(i / 3);
        const testCol = i % 3;
        const testAvailable = this.getAvailableNumbers(testRow, testCol);
        if (testAvailable.length > 0) {
          const newValue = testAvailable[Math.floor(Math.random() * testAvailable.length)];
          this.grid[i] = newValue;
          return i;
        }
      }
      return null; // No valid randomization possible
    }

    // Pick a random available number
    const newValue = available[Math.floor(Math.random() * available.length)];
    this.grid[randomIndex] = newValue;
    return randomIndex;
  }

  /**
   * Get the current grid state
   * @returns {number[]} Current grid
   */
  getGrid() {
    return this.grid.map(x => x);
  }

  /**
   * Get the initial puzzle state
   * @returns {number[]} Initial grid
   */
  getInitialGrid() {
    return this.initialGrid.map(x => x);
  }

  /**
   * Reset grid to initial state
   */
  reset() {
    this.grid = this.initialGrid.map(x => x);
  }

  /**
   * Get cell value at index
   * @param {number} index - Cell index (0-8)
   * @returns {number} Cell value (0 if empty)
   */
  getCellValue(index) {
    return this.grid[index];
  }

  /**
   * Set cell value at index
   * @param {number} index - Cell index (0-8)
   * @param {number} value - Cell value (1-9, or 0 for empty)
   */
  setCellValue(index, value) {
    this.grid[index] = value;
  }
}

// Export for use in tests and main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sudoku;
}

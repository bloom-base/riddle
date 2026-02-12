/**
 * Game logic for the dynamic sudoku puzzle
 * Manages the UI interactions and game state
 */

class SudokuGame {
  constructor(sudokuInstance) {
    this.sudoku = sudokuInstance;
    this.selectedCell = null;
    this.correctlySolvedCells = new Set();
    this.randomizedCells = new Set();
    this.listeners = {
      cellUpdate: [],
      cellRandomized: [],
      puzzleReset: []
    };
  }

  /**
   * Initialize the game with a new puzzle
   */
  init() {
    this.sudoku.generatePuzzle();
    this.correctlySolvedCells.clear();
    this.randomizedCells.clear();
    this.selectedCell = null;
    this.notifyListeners('puzzleReset');
  }

  /**
   * Handle cell click/selection
   * @param {number} cellIndex - Index of clicked cell (0-8)
   */
  selectCell(cellIndex) {
    this.selectedCell = cellIndex;
  }

  /**
   * Handle cell input (player enters a number)
   * @param {number} cellIndex - Index of cell being updated
   * @param {number} value - Number being placed (1-9, or 0 for clear)
   * @returns {boolean} True if update was successful
   */
  updateCell(cellIndex, value) {
    if (value === 0) {
      // Clearing a cell - always allowed
      this.sudoku.setCellValue(cellIndex, 0);
      this.notifyListeners('cellUpdate', { cellIndex, value, isCorrect: false });
      return true;
    }

    // Check if placement is valid
    if (!this.sudoku.isValidPlacement(cellIndex, value)) {
      this.notifyListeners('cellUpdate', { cellIndex, value, isCorrect: false });
      return false;
    }

    // Valid placement - set it
    this.sudoku.setCellValue(cellIndex, value);
    this.correctlySolvedCells.add(cellIndex);

    // Notify listeners about correct placement
    this.notifyListeners('cellUpdate', { cellIndex, value, isCorrect: true });

    // Trigger randomization of another cell after a short delay
    setTimeout(() => this.triggerRandomization(), 300);

    return true;
  }

  /**
   * Trigger randomization of a random cell
   * @private
   */
  triggerRandomization() {
    const randomizedIndex = this.sudoku.randomizeCell();
    
    if (randomizedIndex !== null) {
      const newValue = this.sudoku.getCellValue(randomizedIndex);
      this.randomizedCells.add(randomizedIndex);

      // Clear the correct marking for randomized cell if it had one
      this.correctlySolvedCells.delete(randomizedIndex);

      this.notifyListeners('cellRandomized', { 
        cellIndex: randomizedIndex, 
        newValue 
      });

      // Remove randomized marking after animation completes
      setTimeout(() => {
        this.randomizedCells.delete(randomizedIndex);
      }, 600);
    }
  }

  /**
   * Check if a cell was correctly solved
   * @param {number} cellIndex - Index to check
   * @returns {boolean} True if cell was correctly solved
   */
  wasCorrectlySolved(cellIndex) {
    return this.correctlySolvedCells.has(cellIndex);
  }

  /**
   * Check if a cell was recently randomized
   * @param {number} cellIndex - Index to check
   * @returns {boolean} True if cell was recently randomized
   */
  wasRecentlyRandomized(cellIndex) {
    return this.randomizedCells.has(cellIndex);
  }

  /**
   * Reset the game
   */
  reset() {
    this.sudoku.reset();
    this.correctlySolvedCells.clear();
    this.randomizedCells.clear();
    this.selectedCell = null;
    this.notifyListeners('puzzleReset');
  }

  /**
   * Register a listener for game events
   * @param {string} event - Event name ('cellUpdate', 'cellRandomized', 'puzzleReset')
   * @param {function} callback - Callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Notify all listeners of an event
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get current grid state
   * @returns {number[]} Current grid
   */
  getGrid() {
    return this.sudoku.getGrid();
  }

  /**
   * Get initial grid state
   * @returns {number[]} Initial grid
   */
  getInitialGrid() {
    return this.sudoku.getInitialGrid();
  }
}

// Export for use in tests and main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SudokuGame;
}

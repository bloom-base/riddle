/**
 * Main game UI controller
 * Handles DOM interactions and connects the game logic to the UI
 */

class SudokuUI {
  constructor() {
    this.sudoku = new Sudoku();
    this.game = new SudokuGame(this.sudoku);
    this.gridElement = document.getElementById('sudokuGrid');
    this.solvedCountElement = document.getElementById('solvedCount');
    this.cellElements = [];
    this.setupEventListeners();
    this.init();
  }

  /**
   * Initialize the UI
   */
  init() {
    this.game.init();
    this.renderGrid();
    this.updateStats();
  }

  /**
   * Render the sudoku grid in the DOM
   */
  renderGrid() {
    this.gridElement.innerHTML = '';
    this.cellElements = [];

    const grid = this.game.getGrid();
    const initialGrid = this.game.getInitialGrid();

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.index = i;
      
      const value = grid[i];
      cell.textContent = value !== 0 ? value : '';

      // Mark initial cells (from puzzle generation)
      if (initialGrid[i] !== 0) {
        cell.classList.add('initial');
        cell.disabled = true;
      }

      // Add click handler
      cell.addEventListener('click', () => this.selectCell(i));

      this.cellElements.push(cell);
      this.gridElement.appendChild(cell);
    }
  }

  /**
   * Handle cell selection
   * @param {number} index - Cell index
   */
  selectCell(index) {
    // Clear previous selection
    this.cellElements.forEach(cell => cell.classList.remove('selected'));

    // Don't allow selecting initial/locked cells for input
    const initialGrid = this.game.getInitialGrid();
    if (initialGrid[index] !== 0) {
      return;
    }

    // Select the cell
    this.cellElements[index].classList.add('selected');
    this.game.selectCell(index);
  }

  /**
   * Place a number in the selected cell
   * @param {number} value - Value to place (1-9 or 0 for clear)
   */
  placeNumber(value) {
    if (this.game.selectedCell === null) {
      return;
    }

    const cellIndex = this.game.selectedCell;
    const result = this.game.updateCell(cellIndex, value);

    if (result) {
      this.updateCellDisplay(cellIndex, value);
    } else {
      // Visual feedback for invalid move
      this.flashCell(cellIndex, 'error');
    }

    this.updateStats();
  }

  /**
   * Update cell display
   * @param {number} cellIndex - Cell to update
   * @param {number} value - Value to display
   */
  updateCellDisplay(cellIndex, value) {
    const cell = this.cellElements[cellIndex];
    cell.textContent = value !== 0 ? value : '';
    
    if (value !== 0) {
      // Flash success animation
      cell.classList.add('solved');
      setTimeout(() => cell.classList.remove('solved'), 600);
    }
  }

  /**
   * Flash a cell with a specific color/class
   * @param {number} cellIndex - Cell to flash
   * @param {string} type - Animation type ('error', 'success', etc.)
   */
  flashCell(cellIndex, type) {
    const cell = this.cellElements[cellIndex];
    cell.style.background = type === 'error' ? '#fee2e2' : '#d1fae5';
    
    setTimeout(() => {
      cell.style.background = '';
    }, 200);
  }

  /**
   * Setup event listeners for game events
   */
  setupEventListeners() {
    // Game event listeners
    this.game.on('cellUpdate', (data) => {
      // Update already handled in placeNumber
    });

    this.game.on('cellRandomized', (data) => {
      this.handleCellRandomized(data);
    });

    this.game.on('puzzleReset', () => {
      this.renderGrid();
      this.updateStats();
    });

    // Button listeners
    document.getElementById('newPuzzleBtn').addEventListener('click', () => {
      this.init();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      this.game.reset();
      this.renderGrid();
      this.updateStats();
    });

    // Number pad listeners
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const num = parseInt(e.target.dataset.num);
        this.placeNumber(num);
      });
    });

    // Keyboard listeners
    document.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') {
        this.placeNumber(parseInt(e.key));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        this.placeNumber(0);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                 e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.handleArrowKey(e);
      }
    });
  }

  /**
   * Handle arrow key navigation
   * @param {KeyboardEvent} event
   */
  handleArrowKey(event) {
    if (this.game.selectedCell === null) return;

    const currentIndex = this.game.selectedCell;
    const row = Math.floor(currentIndex / 3);
    const col = currentIndex % 3;
    let newIndex = currentIndex;

    if (event.key === 'ArrowLeft' && col > 0) {
      newIndex = currentIndex - 1;
    } else if (event.key === 'ArrowRight' && col < 2) {
      newIndex = currentIndex + 1;
    } else if (event.key === 'ArrowUp' && row > 0) {
      newIndex = currentIndex - 3;
    } else if (event.key === 'ArrowDown' && row < 2) {
      newIndex = currentIndex + 3;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      this.selectCell(newIndex);
    }
  }

  /**
   * Handle cell randomization event
   * @param {Object} data - Event data with cellIndex and newValue
   */
  handleCellRandomized(data) {
    const { cellIndex, newValue } = data;
    const cell = this.cellElements[cellIndex];

    // Add randomized animation
    cell.classList.add('randomized');
    cell.textContent = newValue;

    setTimeout(() => {
      cell.classList.remove('randomized');
    }, 600);
  }

  /**
   * Update statistics display
   */
  updateStats() {
    const grid = this.game.getGrid();
    const initialGrid = this.game.getInitialGrid();
    
    // Count filled cells that are not from the initial puzzle
    let solvedCount = 0;
    for (let i = 0; i < 9; i++) {
      if (grid[i] !== 0 && initialGrid[i] === 0) {
        solvedCount++;
      }
    }

    this.solvedCountElement.textContent = solvedCount;
  }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SudokuUI();
});

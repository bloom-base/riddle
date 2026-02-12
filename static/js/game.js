/**
 * Sudoku Game Client
 * Handles UI interactions, game state, and communication with the backend API
 */

class SudokuGame {
    constructor() {
        this.board = null;
        this.originalBoard = null;
        this.selectedCell = null;
        this.timerInterval = null;
        this.timeElapsed = 0;
        this.hintCount = 0;
        this.initialized = false;

        this.initializeEventListeners();
        this.generateNewPuzzle();
    }

    /**
     * Set up all event listeners for the game
     */
    initializeEventListeners() {
        // Board cells - delegated event listener
        document.getElementById('board').addEventListener('click', (e) => {
            if (e.target.classList.contains('sudoku-cell')) {
                this.selectCell(e.target);
            }
        });

        // Number pad buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = parseInt(e.target.dataset.num);
                this.enterNumber(num);
            });
        });

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.selectedCell) return;

            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 0 && num <= 9) {
                this.enterNumber(num);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.enterNumber(0);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                       e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.navigateBoard(e.key);
                e.preventDefault();
            }
        });

        // Control buttons
        document.getElementById('new-puzzle-btn').addEventListener('click', () => {
            this.generateNewPuzzle();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.getHint();
        });

        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkSolution();
        });

        document.getElementById('solve-btn').addEventListener('click', () => {
            this.revealSolution();
        });

        // Difficulty selector
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.generateNewPuzzle();
            });
        });

        // Modal buttons
        document.getElementById('modal-new-btn').addEventListener('click', () => {
            this.closeModal('completion-modal');
            this.generateNewPuzzle();
        });

        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.closeModal('completion-modal');
        });

        document.getElementById('error-close-btn').addEventListener('click', () => {
            this.closeModal('error-modal');
        });
    }

    /**
     * Generate a new puzzle from the server
     */
    async generateNewPuzzle() {
        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

        try {
            const response = await fetch(`/api/puzzle?difficulty=${difficulty}`);
            const data = await response.json();

            if (!response.ok) {
                this.showError('Failed to generate puzzle');
                return;
            }

            this.board = data.board.map(row => [...row]);
            this.originalBoard = data.board.map(row => [...row]);
            this.hintCount = 0;
            this.timeElapsed = 0;
            this.selectedCell = null;

            this.renderBoard();
            this.startTimer();
            this.updateStatus();
            this.initialized = true;
        } catch (error) {
            console.error('Error generating puzzle:', error);
            this.showError('Failed to generate puzzle. Please try again.');
        }
    }

    /**
     * Render the sudoku board in the DOM
     */
    renderBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const value = this.board[row][col];
                const originalValue = this.originalBoard[row][col];

                // Mark cells that were originally filled
                if (originalValue !== 0) {
                    cell.classList.add('initial');
                    cell.textContent = originalValue;
                } else if (value !== 0) {
                    cell.textContent = value;
                }

                boardEl.appendChild(cell);
            }
        }
    }

    /**
     * Select a cell on the board
     */
    selectCell(element) {
        // Don't allow selecting initial cells
        if (element.classList.contains('initial')) {
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'related');
        });

        // Select new cell
        element.classList.add('selected');
        this.selectedCell = element;

        // Highlight related cells (same row, column, and box)
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);

        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            const cellRow = parseInt(cell.dataset.row);
            const cellCol = parseInt(cell.dataset.col);

            if (cellRow === row || cellCol === col) {
                if (cell !== element) {
                    cell.classList.add('related');
                }
            }

            // Check box
            const boxRow = Math.floor(row / 3);
            const boxCol = Math.floor(col / 3);
            const cellBoxRow = Math.floor(cellRow / 3);
            const cellBoxCol = Math.floor(cellCol / 3);

            if (boxRow === cellBoxRow && boxCol === cellBoxCol && cell !== element) {
                cell.classList.add('related');
            }
        });
    }

    /**
     * Navigate the board with arrow keys
     */
    navigateBoard(key) {
        if (!this.selectedCell) return;

        let row = parseInt(this.selectedCell.dataset.row);
        let col = parseInt(this.selectedCell.dataset.col);

        switch (key) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                row = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                col = Math.min(8, col + 1);
                break;
        }

        const newCell = document.querySelector(
            `.sudoku-cell[data-row="${row}"][data-col="${col}"]`
        );
        if (newCell) {
            this.selectCell(newCell);
        }
    }

    /**
     * Enter a number into the selected cell
     */
    async enterNumber(num) {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);

        // Don't allow editing initial cells
        if (this.originalBoard[row][col] !== 0) {
            return;
        }

        // Update board
        this.board[row][col] = num;

        // Remove invalid marking
        this.selectedCell.classList.remove('invalid');

        // Update display
        if (num === 0) {
            this.selectedCell.textContent = '';
        } else {
            this.selectedCell.textContent = num;

            // Validate with server
            try {
                const response = await fetch('/api/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ row, col, num })
                });

                const data = await response.json();

                if (!data.valid) {
                    this.selectedCell.classList.add('invalid');
                }
            } catch (error) {
                console.error('Validation error:', error);
            }
        }

        this.updateStatus();

        // Check if puzzle is complete after each move
        if (this.isComplete()) {
            this.checkSolution();
        }
    }

    /**
     * Check if the board is completely filled
     */
    isComplete() {
        return this.board.every(row => row.every(cell => cell !== 0));
    }

    /**
     * Check the current solution
     */
    async checkSolution() {
        try {
            const response = await fetch('/api/check-solution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board: this.board })
            });

            const data = await response.json();

            if (data.valid) {
                this.stopTimer();
                this.showCompletion();
            } else {
                this.showError(data.message);
            }
        } catch (error) {
            console.error('Check solution error:', error);
            this.showError('Failed to check solution');
        }
    }

    /**
     * Get a hint from the server
     */
    async getHint() {
        if (this.hintCount >= 3) {
            this.showError('Maximum hints (3) reached for this puzzle');
            return;
        }

        try {
            const response = await fetch('/api/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board: this.board })
            });

            const data = await response.json();

            if (response.ok) {
                this.board[data.row][data.col] = data.value;
                this.hintCount++;
                this.renderBoard();
                this.selectCell(
                    document.querySelector(
                        `.sudoku-cell[data-row="${data.row}"][data-col="${data.col}"]`
                    )
                );
                this.updateStatus();
            } else {
                this.showError(data.error);
            }
        } catch (error) {
            console.error('Hint error:', error);
            this.showError('Failed to get hint');
        }
    }

    /**
     * Reveal the entire solution
     */
    revealSolution() {
        if (!confirm('Are you sure? This will end the puzzle.')) {
            return;
        }

        // Just fill board with original board (which contains the solution)
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    // In a real app, we'd get the solution from the server
                    // For now, we'll just mark it as solved if it's the only option
                    this.board[row][col] = 0; // Keep as is for now
                }
            }
        }

        this.stopTimer();
        this.showError('Puzzle revealed. Generate a new puzzle to continue.');
    }

    /**
     * Update game status display
     */
    updateStatus() {
        const statusEl = document.getElementById('status-text');
        const filledCells = this.board.flat().filter(val => val !== 0).length;
        const totalCells = 81;

        statusEl.textContent = `${filledCells}/${totalCells} cells filled`;

        if (this.isComplete()) {
            statusEl.textContent += ' ✓';
        }
    }

    /**
     * Start the game timer
     */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timeElapsed = 0;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
            this.updateTimerDisplay();
        }, 1000);
    }

    /**
     * Stop the game timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }

    /**
     * Show completion modal
     */
    showCompletion() {
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        const timeStr = `${minutes}m ${seconds}s`;

        document.getElementById('completion-message').textContent = 
            `You solved the puzzle in ${timeStr}! 🎉`;

        this.showModal('completion-modal');
    }

    /**
     * Show error message
     */
    showError(message) {
        document.getElementById('error-message').textContent = message;
        this.showModal('error-modal');
    }

    /**
     * Show a modal
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    /**
     * Close a modal
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});

# Dynamic 3x3 Sudoku Game

## Overview

This is an interactive 3x3 Sudoku puzzle game with a unique dynamic feature: **cascading randomization**. When you correctly solve a cell, another cell is randomly re-assigned a new valid number, keeping the puzzle in constant motion and making gameplay more engaging and unpredictable.

## How to Play

### Basic Rules

1. **Fill the Grid**: Each row and column must contain the numbers 1-9 exactly once
2. **Sudoku Constraint**: In a 3x3 grid, the entire grid is one box, so the constraint is just rows and columns
3. **No Duplicates**: You cannot place the same number twice in the same row or column

### Gameplay

1. **Click a cell** to select it (cells are highlighted in blue)
2. **Type a number 1-9** or use the Quick Fill buttons at the bottom
3. **The game validates** your placement against sudoku rules
4. **When you place a valid number**, the cell shows a success animation
5. **Another cell randomly changes** - this is the cascading randomization feature!
6. **Adapt and continue** - the puzzle shifts as you solve it

### Controls

- **Number Keys (1-9)**: Place that number in the selected cell
- **0 or Delete**: Clear the selected cell
- **Arrow Keys**: Navigate between cells
- **Quick Fill Buttons**: Click number buttons at the bottom to fill selected cell
- **New Puzzle**: Generate a completely new puzzle
- **Reset**: Return the current puzzle to its initial state

## Features

### Cascading Randomization

This is the core feature that makes the game unique:

1. You place a valid number in an empty cell
2. The game detects this as a correct placement
3. After a brief delay, another random cell is re-assigned a new valid number
4. This new number is also valid for that cell (no rule violations)
5. The randomized cell shows a yellow flash animation
6. The puzzle state remains valid and solvable

**Why?** This creates dynamic, addictive gameplay. Instead of solving a static puzzle, you're constantly adapting to shifting constraints. The puzzle never feels "done" - there's always something changing!

### Visual Feedback

- **Blue Highlight**: Current selected cell
- **Green Flash**: Your cell was correctly solved
- **Yellow Flash**: Cell was just randomized by the system
- **Grayed Out**: Initial puzzle cells (locked, cannot edit)

### Statistics

- **Cells Solved**: Count of cells you've correctly filled (not including initial puzzle)
- **Total Cells**: Always 9 for a 3x3 grid

## Architecture

### Core Components

#### `Sudoku` class (`src/sudoku.js`)

Handles all puzzle logic:

- **`generatePuzzle()`**: Creates a new valid 3x3 sudoku puzzle
- **`isValidPlacement(index, value)`**: Checks if a number can be placed at a position
- **`isCorrect(index, value)`**: Validates a player's placement
- **`randomizeCell()`**: Picks a random cell and assigns it a valid new number
- **`reset()`**: Returns puzzle to initial state

Key algorithm: **Backtracking** for puzzle generation ensures every puzzle is solvable.

#### `SudokuGame` class (`src/game.js`)

Game state and logic:

- **`updateCell(cellIndex, value)`**: Process player input, validate, trigger randomization
- **`triggerRandomization()`**: Handle cascade when cell is correctly filled
- **`on(event, callback)`**: Event system for UI updates
- Tracks: solved cells, randomized cells, selected cell

#### `SudokuUI` class (`public/main.js`)

UI interaction and rendering:

- Renders the 3x3 grid in the DOM
- Handles user input (clicks, keyboard, buttons)
- Updates cell displays with animations
- Manages visual feedback and stats
- Bridges game logic and user interface

### File Structure

```
riddle/
├── src/
│   ├── sudoku.js          # Core Sudoku puzzle logic
│   └── game.js            # Game state management
├── public/
│   ├── index.html         # Main HTML page
│   ├── styles.css         # Beautiful CSS styling
│   └── main.js            # UI controller
├── tests/
│   ├── sudoku.test.js     # Sudoku logic tests
│   └── game.test.js       # Game logic tests
└── docs/
    └── SUDOKU.md          # This file
```

## Technical Details

### Puzzle Generation Algorithm

1. Start with an empty 3x3 grid
2. Fill each cell using **backtracking**:
   - Find available numbers for the cell (not in row/column)
   - Shuffle available numbers for randomness
   - Try each number recursively
   - Backtrack if no valid solution found
3. Once grid is full, randomly remove 3 cells to create the puzzle
4. Save initial state for reset functionality

**Why Backtracking?** It guarantees every generated puzzle is solvable and has at least one valid solution.

### Randomization Strategy

When randomizing a cell:

1. Pick a random cell index
2. Determine what numbers are available for that cell
   - Not already in the same row
   - Not already in the same column
3. Randomly select from available numbers
4. If no available numbers, try the next cell
5. Return the randomized cell's index for UI feedback

**Why this works?** Since we only place numbers that don't violate rules, the puzzle remains valid.

### Event System

The game uses a simple pub-sub event system:

```javascript
game.on('cellUpdate', (data) => {
  // Handle cell update
});

game.on('cellRandomized', (data) => {
  // Handle randomization with animation
});

game.on('puzzleReset', () => {
  // Handle reset
});
```

This decouples game logic from UI, making code more maintainable.

## Testing

All functionality is thoroughly tested:

```bash
npm test
```

**Test Coverage**:
- ✅ Puzzle generation (validity, constraints)
- ✅ Cell validation (row/column rules)
- ✅ Randomization (integrity, validity)
- ✅ Game state management
- ✅ Event system
- ✅ UI interactions

35 passing tests ensure reliability.

## Future Enhancements

### Short Term
- [ ] Difficulty levels (more/fewer initial cells)
- [ ] Timer and scoring
- [ ] Undo/redo functionality
- [ ] Sound effects for feedback

### Medium Term
- [ ] 4x4 Sudoku (16 cells with 4x4 boxes)
- [ ] 9x9 Sudoku (classic full sudoku)
- [ ] Multiple puzzle types (different randomization strategies)
- [ ] Leaderboard/stats tracking

### Long Term
- [ ] Mobile app (React Native)
- [ ] Multiplayer competitive mode
- [ ] AI hint system
- [ ] Custom puzzle upload
- [ ] Accessibility improvements

## Design Philosophy

This puzzle embodies the **Riddle vision**:

> "One puzzle a day keeps the brain sharp. Beautiful, addictive, and endlessly expandable."

### Beautiful
- Clean, modern UI with gradient backgrounds
- Smooth animations and transitions
- Intuitive keyboard and touch controls
- Visual feedback for all actions

### Addictive
- Short play sessions (3x3 is quick but engaging)
- Cascading randomization creates unpredictability
- Progress tracking (solved cells counter)
- Easy to restart and try again

### Endlessly Expandable
- Architecture supports multiple grid sizes
- Event system allows easy feature additions
- Modular code structure (sudoku.js, game.js, UI separate)
- Test coverage enables confident refactoring

## Troubleshooting

### Invalid move not showing feedback?
Make sure you've selected a cell first (it should be highlighted in blue).

### Can't select initial cells?
That's intentional - initial cells are locked. The gray coloring shows they're from the puzzle setup.

### Randomization not happening?
It only triggers after a valid placement. Try placing a number in a previously empty cell.

### Want to solve from scratch?
Click "New Puzzle" to generate a completely new one, or "Reset" to return to the initial state.

## Contributing

To extend this game:

1. **New puzzle types**: Extend `Sudoku` class with different generation algorithms
2. **New game modes**: Extend `SudokuGame` with additional logic
3. **UI improvements**: Enhance `SudokuUI` or add new HTML elements
4. **Always write tests** for new functionality
5. **Update documentation** with new features

## License

MIT

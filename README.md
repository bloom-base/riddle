# Riddle

> One puzzle a day keeps the brain sharp. Beautiful, addictive, and endlessly expandable. Every puzzle type you can imagine, from logic grids to cryptic wordplay.

---

## 🎮 Current Puzzles

### Dynamic 3x3 Sudoku ✨ [NEW]

An interactive sudoku game with a unique twist: **cascading randomization**. When you correctly solve a cell, another cell randomly changes to a new valid number, keeping the puzzle in constant motion!

**Features:**
- 🎯 Simple 3x3 grid (9 cells total)
- ✅ Full sudoku rule validation
- 🔄 Cascading randomization system
- 🎨 Beautiful, responsive UI
- ⌨️ Keyboard and touch support
- 🧪 Fully tested (35 passing tests)

**Play:** Open `public/index.html` in your browser

**Learn more:** See [docs/SUDOKU.md](docs/SUDOKU.md) for complete documentation

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repo
git clone https://github.com/bloom-base/riddle.git
cd riddle

# Install dependencies
npm install

# Run tests
npm test

# Play the game
# Open public/index.html in your browser
# Or use a local server: python -m http.server 8000
```

### How to Play Sudoku

1. Click a cell to select it
2. Type 1-9 or use the quick fill buttons
3. Numbers must follow sudoku rules (no duplicates in row/column)
4. When you correctly solve a cell, another cell randomly changes
5. Adapt and keep solving!

### Controls

| Action | Control |
|--------|---------|
| Select cell | Click or arrow keys |
| Place number | Type 1-9 or click number buttons |
| Clear cell | Press 0, Delete, or Backspace |
| New puzzle | Click "New Puzzle" button |
| Reset puzzle | Click "Reset" button |

---

## 🏗️ Architecture

```
riddle/
├── src/
│   ├── sudoku.js          # Core puzzle generation & validation
│   └── game.js            # Game state & logic
├── public/
│   ├── index.html         # UI
│   ├── styles.css         # Styling
│   └── main.js            # UI controller
├── tests/
│   ├── sudoku.test.js     # Sudoku logic tests
│   └── game.test.js       # Game logic tests
└── docs/
    └── SUDOKU.md          # Complete documentation
```

### Key Classes

- **`Sudoku`**: Generates valid puzzles, validates placements, handles randomization
- **`SudokuGame`**: Manages game state, triggers cascade effects, event system
- **`SudokuUI`**: Renders UI, handles user input, displays feedback

---

## 🧪 Testing

```bash
npm test
```

All core functionality is tested:
- ✅ Puzzle generation and validity
- ✅ Sudoku rule validation
- ✅ Cell randomization with integrity
- ✅ Game state management
- ✅ UI event system

**Coverage:** 35 passing tests across sudoku.js and game.js

---

## 🎨 Design Features

### Beautiful UI
- Modern gradient background
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Visual feedback for all actions

### Addictive Gameplay
- Quick play sessions
- Cascading randomization creates unpredictability
- Progress tracking (solved cells counter)
- Easy restart and replay

### Expandable Architecture
- Modular code structure
- Event-driven design
- Easy to add new puzzle types
- Comprehensive test coverage

---

## 🔮 Future Puzzles

Coming soon to Riddle:
- 4x4 Sudoku
- 9x9 Sudoku (classic)
- Logic grids
- Cryptic wordplay
- Pattern matching
- And more!

---

## 📖 Documentation

- **[SUDOKU.md](docs/SUDOKU.md)** - Complete sudoku game documentation
  - How to play
  - Game mechanics explained
  - Technical architecture
  - Algorithm details
  - Future enhancements

---

## 📝 Development

### Adding a New Puzzle Type

1. Create puzzle logic class in `src/`
2. Extend `SudokuGame` pattern with game state management
3. Write comprehensive tests
4. Create UI in `public/` with HTML/CSS/JS
5. Update documentation
6. Submit PR!

See [docs/SUDOKU.md](docs/SUDOKU.md) for architectural patterns to follow.

---

## 📄 License

MIT

---

*This project is maintained by AI agents on [Bloom](https://bloomit.ai). Visit [bloomit.ai/bloom-base/riddle](https://bloomit.ai/bloom-base/riddle) to contribute ideas.*
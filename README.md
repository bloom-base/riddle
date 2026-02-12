# Riddle - Sudoku Puzzle Game

> One puzzle a day keeps the brain sharp. Beautiful, addictive, and endlessly expandable. Every puzzle type you can imagine, from logic grids to cryptic wordplay.

## 🎮 Live Demo

Play the Sudoku game immediately: **[Live Sudoku Demo](https://riddle-sudoku.fly.dev/)**

## Features

- 🎯 **Dynamic Puzzle Generation** - Generates unique Sudoku puzzles on demand
- 🎨 **Beautiful UI** - Polished, responsive interface optimized for all devices
- ✨ **Interactive Gameplay** - Click cells, enter numbers, clear entries with ease
- 🔍 **Smart Validation** - Real-time feedback on valid/invalid moves
- 💡 **Hints System** - Get up to 3 hints per puzzle
- ⏱️ **Timer** - Track how fast you solve puzzles
- 🎓 **Difficulty Levels** - Easy, Medium, and Hard puzzles
- ✅ **Completion Detection** - Automatic detection when you solve the puzzle
- 📱 **Fully Responsive** - Works great on desktop, tablet, and mobile

## Architecture

The project consists of three main components:

### Backend (Python/Flask)
- **`sudoku.py`** - Core Sudoku game logic
  - Puzzle generation with difficulty levels
  - Move validation
  - Solution solving
  - Board state management

- **`app.py`** - REST API server
  - `/api/puzzle` - Generate new puzzles
  - `/api/validate` - Validate moves
  - `/api/check-solution` - Check if puzzle is solved
  - `/api/hint` - Get hints

### Frontend (HTML/CSS/JavaScript)
- **`templates/index.html`** - Game interface
- **`static/css/style.css`** - Beautiful, responsive styling
- **`static/js/game.js`** - Game logic and interactivity

## Installation & Setup

### Prerequisites
- Python 3.11+
- `uv` package manager (for dependency management)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/bloom-base/riddle.git
   cd riddle
   ```

2. **Create virtual environment**
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   uv add -r requirements.txt
   ```

4. **Run the application**
   ```bash
   uv run python app.py
   ```

5. **Open in browser**
   Navigate to `http://localhost:5000`

## Running Tests

Run the comprehensive test suite:

```bash
uv run pytest test_sudoku.py -v
```

Tests cover:
- Move validation (rows, columns, 3x3 boxes)
- Completion detection
- Solution validation
- Puzzle generation at different difficulty levels
- Board serialization/deserialization
- Sudoku solving algorithm

All 18 tests pass ✅

## API Documentation

### Generate Puzzle
```
GET /api/puzzle?difficulty=40
```
- **Parameters**: `difficulty` (30-56, default 40)
- **Response**: 
  ```json
  {
    "board": [[5, 3, 4, ...], ...],
    "difficulty": 40,
    "message": "Puzzle generated successfully"
  }
  ```

### Validate Move
```
POST /api/validate
Content-Type: application/json

{
  "row": 0,
  "col": 0,
  "num": 5
}
```
- **Response**:
  ```json
  {
    "valid": true,
    "message": "Valid move"
  }
  ```

### Check Solution
```
POST /api/check-solution
Content-Type: application/json

{
  "board": [[5, 3, 4, ...], ...]
}
```
- **Response**:
  ```json
  {
    "complete": true,
    "valid": true,
    "message": "Congratulations! Puzzle solved!"
  }
  ```

### Get Hint
```
POST /api/hint
Content-Type: application/json

{
  "board": [[5, 3, 4, ...], ...]
}
```
- **Response**:
  ```json
  {
    "row": 2,
    "col": 5,
    "value": 7,
    "message": "Hint: Cell (3, 6) is 7"
  }
  ```

## Gameplay

### Basic Controls
- **Click a cell** to select it
- **Click a number** or **press 1-9** to enter a number
- **Click Clear** or **press Delete/Backspace** to clear a cell
- **Arrow keys** to navigate between cells

### Game Features
- **New Puzzle** - Generate a fresh puzzle (keeps same difficulty)
- **Hint** - Reveals one cell from the solution (max 3 per puzzle)
- **Check** - Manually check if your solution is correct
- **Solve** - Reveal the complete solution
- **Timer** - Tracks time spent on current puzzle
- **Difficulty Selector** - Choose puzzle difficulty before generating

## Deployment

The application is deployed to Fly.io and accessible at: https://riddle-sudoku.fly.dev/

To deploy your own version:

```bash
# Build the Docker image
docker build -t riddle-sudoku .

# Deploy with Fly CLI
flyctl deploy
```

## Technical Details

### Sudoku Generation Algorithm
1. Fill diagonal 3x3 boxes with random numbers
2. Use backtracking to fill remaining cells
3. Save the complete solution
4. Randomly remove numbers while ensuring exactly one solution exists
5. Return puzzle with specified difficulty level

### Validation Algorithm
Validates moves by checking:
- No duplicates in the same row
- No duplicates in the same column
- No duplicates in the same 3x3 box
- Efficient O(1) per move validation

### Solving Algorithm
Uses backtracking with constraints:
- Attempts numbers 1-9 in random order for variety
- Recursively solves remaining empty cells
- Backtracks when no valid number exists

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Puzzle generation: ~500ms-2s (depends on difficulty)
- Move validation: <10ms
- Solution checking: <50ms
- Hint retrieval: <5ms

## Future Enhancements

- [ ] Multiple puzzle types (Killer Sudoku, Samurai, Jigsaw)
- [ ] Leaderboard system
- [ ] User accounts and save progress
- [ ] Daily challenge puzzles
- [ ] Multiplayer mode
- [ ] Advanced solving strategies display
- [ ] Puzzle sharing feature
- [ ] Statistics and achievements

## Contributing

Contributions are welcome! This project is maintained on [Bloom](https://bloomit.ai). 

To contribute:
1. Create a new branch
2. Make your changes
3. Add tests for new features
4. Submit a pull request

## License

MIT License - See LICENSE file for details

---

*This project is maintained by AI agents on [Bloom](https://bloomit.ai). Visit [bloomit.ai/bloom-base/riddle](https://bloomit.ai/bloom-base/riddle) to contribute ideas.*
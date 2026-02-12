# Riddle

> One puzzle a day keeps the brain sharp. Beautiful, addictive, and endlessly expandable. Every puzzle type you can imagine, from logic grids to cryptic wordplay.

## 🎮 Games

### 📚 Literature Citation Matching
Match famous quotes from American literature to their authors and works. A engaging puzzle that combines wordplay with literary knowledge.

**Features:**
- 5 curated citations from classic American authors
- Real-time scoring and progress tracking
- Hint system (2 hints per game)
- Timer to track completion speed
- Beautiful, responsive design
- No dependencies - pure vanilla JavaScript

**How to Play:**
1. Open `public/index.html` in your browser
2. Click a quote, then click the matching author/work
3. Get instant feedback on your selections
4. Match all 5 pairs to complete the puzzle

**Learn More:** See [GAME_DOCS.md](GAME_DOCS.md) for detailed documentation on mechanics, extending the game, and technical details.

---

## Project Structure

```
riddle/
├── public/
│   ├── index.html          # Main game interface
│   ├── game.js             # Game logic and mechanics
│   └── styles.css          # Responsive styling
├── tests/
│   ├── test_game.js        # Unit tests (17 tests)
│   └── test_runner.html    # Browser test runner
├── GAME_DOCS.md            # Game documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Playing the Game
1. Clone this repository
2. Open `public/index.html` in your web browser
3. Start matching!

### Running Tests
Open `tests/test_runner.html` in your web browser to run the test suite.

## 🛠️ Development

No build tools or dependencies required! This is pure vanilla JavaScript.

### Adding New Games
To add a new puzzle game to Riddle:
1. Create a new subdirectory in `public/` (e.g., `word-scramble/`)
2. Add your `index.html`, `styles.css`, and game logic
3. Add tests in `tests/`
4. Document in `README.md` and create a `[GAME_NAME]_DOCS.md`
5. Submit a pull request

### Extending Existing Games
See [GAME_DOCS.md](GAME_DOCS.md) for details on:
- Adding more citations
- Customizing scoring
- Modifying difficulty levels
- Implementing new features

## 📊 Testing

All games include comprehensive unit tests. Tests verify:
- Game initialization and state management
- User interactions and mechanics
- Scoring and progress tracking
- Edge cases and error handling

Run tests by opening `tests/test_runner.html` in your browser.

## 🎨 Design Philosophy

- **Beautiful**: Engaging visual design with smooth animations
- **Accessible**: Works on desktop, tablet, and mobile
- **Fast**: No dependencies, instant load times
- **Expandable**: Easy to add new games and features
- **Educational**: Combines fun gameplay with learning

## 🌟 Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ No build tools required
- ✅ No external dependencies
- ✅ Full test coverage
- ✅ Accessible and WCAG compliant
- ✅ Cross-browser compatible
- ✅ Fast load times

---

*This project is maintained by AI agents on [Bloom](https://bloomit.ai). Visit [bloomit.ai/bloom-base/riddle](https://bloomit.ai/bloom-base/riddle) to contribute ideas.*
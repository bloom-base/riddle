# Riddle 🎭

> One puzzle a day keeps the brain sharp. Beautiful, addictive, and endlessly expandable. Every puzzle type you can imagine, from logic grids to cryptic wordplay.

---

## Current Puzzle: Quote Fragment Matching

Match opening and closing fragments from famous U.S. literature quotes to complete the lines. One beautiful puzzle per day!

### Features

- **Daily Puzzle Rotation**: Same puzzle for all users on a given day
- **Beautiful UI**: Clean, high-contrast design for optimal readability
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Matching**: Drag-and-drop on desktop, tap-based on mobile
- **Real-time Validation**: Immediate feedback on correct/incorrect matches
- **Famous Literature**: Curated quotes from Twain, Fitzgerald, Steinbeck, Hawthorne, Morrison, and more
- **Accessible Difficulty**: Targets high school senior level - recognizable but not trivial
- **Twitch Integration**: Live leaderboards, OBS overlays, and community engagement
- **Countdown Timer**: Shows time until next daily puzzle reset
- **Global Leaderboard**: Compete with other players, track fastest solvers

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript + Node.js
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS3 with responsive design

## Project Structure

```
riddle/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuoteMatchingPuzzle.tsx
│   │   │   └── QuoteMatchingPuzzle.css
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── App.test.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/               # Express API server
│   ├── src/
│   │   ├── index.ts
│   │   ├── services/
│   │   │   ├── puzzleService.ts
│   │   │   └── puzzleService.test.ts
│   │   └── data/
│   │       └── quotes.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── vitest.config.ts
├── package.json           # Root workspace config
└── README.md
```

## API Endpoints

### GET /api/puzzle/:date?

Get a puzzle for a specific date or today (default).

**Parameters:**
- `date` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "date": "2024-01-15",
  "openings": [
    { "id": "opening_twain_1", "text": "You don't know about me" },
    { "id": "opening_fitzgerald_1", "text": "In my younger and more vulnerable years," }
  ],
  "closings": [
    { "id": "closing_steinbeck_1", "text": "boats against the current, borne back ceaselessly into the past." },
    { "id": "closing_twain_1", "text": "without you have read a book called The Adventures of Tom Sawyer" }
  ],
  "correctMatches": [
    { "id": "twain_1", "openingId": "opening_twain_1", "closingId": "closing_twain_1" }
  ]
}
```

### POST /api/validate

Validate user's match attempts.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "matches": [
    { "id": "twain_1", "openingId": "opening_twain_1", "closingId": "closing_twain_1" },
    { "id": "fitzgerald_1", "openingId": "opening_fitzgerald_1", "closingId": "closing_fitzgerald_1" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "allCorrect": true,
  "results": {
    "opening_twain_1": true,
    "opening_fitzgerald_1": true
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bloom-base/riddle.git
cd riddle
```

2. Install dependencies:
```bash
npm install
```

### Development

Start both frontend and backend with hot reload:

```bash
npm run dev
```

This runs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Individual Development

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

### Building

Build both frontend and backend:

```bash
npm run build
```

Build frontend only:
```bash
npm run build:frontend
```

Build backend only:
```bash
npm run build:backend
```

### Testing

Run all tests:

```bash
npm test
```

Run specific test suite:

```bash
npm run test:backend
npm run test:frontend
```

Run tests with coverage:

```bash
npm run test:run
```

## Game Mechanics

1. **Display**: Two columns show opening and closing fragments
2. **Matching**: Users drag opening fragments to closing fragments (desktop) or tap to match (mobile)
3. **Visual Feedback**: Matched items are highlighted, showing the complete quote
4. **Validation**: Users can submit when all matches are made
5. **Results**: Immediate feedback on correctness with celebration screen on success

## Quotes & Content

The puzzle includes 10+ famous U.S. literature quotes from:
- Mark Twain
- F. Scott Fitzgerald
- John Steinbeck
- Nathaniel Hawthorne
- Herman Melville
- Henry David Thoreau
- Toni Morrison
- William Faulkner
- And more!

Each day rotates through the quote collection with a deterministic daily seed.

## Quote Data Structure

Quotes are stored in `backend/src/data/quotes.ts`:

```typescript
interface Quote {
  id: string;                    // Unique quote identifier
  author: string;                // Author name
  book: string;                  // Source book
  openingFragment: string;       // First part of quote
  closingFragment: string;       // Second part of quote
  fullQuote: string;            // Complete quote
}
```

## Customization

### Adding New Quotes

1. Open `backend/src/data/quotes.ts`
2. Add new Quote objects to the `QUOTES` array
3. Ensure each quote has unique `id` and accurate fragments
4. The daily rotation will automatically include new quotes

### Styling

Modify colors and appearance in:
- `frontend/src/App.css` - Main layout
- `frontend/src/components/QuoteMatchingPuzzle.css` - Puzzle styling

CSS variables defined at root:
```css
--primary-color: #2c3e50;
--secondary-color: #3498db;
--success-color: #27ae60;
--error-color: #e74c3c;
```

## Performance Notes

- Daily puzzle generation is O(n) where n is number of quotes
- Deterministic shuffling ensures same puzzle for same date
- Frontend uses efficient React rendering with proper memoization
- Validation is instant on client side (optional server validation)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

## Twitch Integration 🎬

Riddle is built for streamers! Perfect for community engagement and live gaming sessions.

### OBS Overlay
Add a browser source to your OBS with the `/demo` page to show:
- Live leaderboard with top 5 solvers
- Countdown timer for next puzzle
- Daily stats (total solvers, fastest time)
- Beautiful dark theme optimized for streams

### Live Leaderboard
- Real-time updates as viewers complete the puzzle
- Players enter their username to compete
- Tracks fastest times and personal records
- Shareable results on social media

### Chat Integration
Easily integrate with Twitch bots (Nightbot, Streamlabs, etc.):
- `!riddle` - Share puzzle link
- `!stats` - Show today's statistics
- `!leaderboard` - Display top solvers

### For Streamers
See [TWITCH_INTEGRATION.md](./TWITCH_INTEGRATION.md) for:
- Complete setup guide
- API endpoints for custom bots
- Stream overlay examples
- Community engagement ideas
- Troubleshooting

## Contributing

Contributions are welcome! Areas for expansion:

- [ ] More puzzle types (anagrams, word chains, etc.)
- [ ] User accounts and streak tracking
- [ ] Difficulty levels
- [ ] Share puzzle results with sharable images
- [ ] Dark mode
- [ ] Internationalization
- [ ] Database persistence for leaderboards
- [ ] Twitch OAuth integration
- [ ] Channel points rewards

---

*This project is maintained by AI agents on [Bloom](https://bloomit.ai). Visit [bloomit.ai/bloom-base/riddle](https://bloomit.ai/bloom-base/riddle) to contribute ideas.*
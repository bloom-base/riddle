# Twitch Integration Guide for Riddle

Complete guide for Twitch streamers to integrate the daily quote matching puzzle into their streams.

## Quick Start

### 1. Main Puzzle Page
Share this URL with your chat:
```
https://riddle.streamers.local
```

Or use the embed:
```html
<iframe src="https://riddle.streamers.local" width="800" height="600"></iframe>
```

### 2. OBS Browser Source (Live Leaderboard Overlay)
Add a Browser Source to your OBS scene with this URL:
```
https://riddle.streamers.local/demo
```

**Recommended settings:**
- Width: 400px
- Height: 800px
- Position: Right side of screen
- Enable: "Shutdown source when not visible"
- Refresh rate: 10 seconds

This will show:
- Countdown timer to next daily puzzle
- Total solvers today
- Fastest time
- Top 5 live solvers with their times

## Features for Streamers

### Daily Puzzle System
- **One puzzle per day**: Everyone sees the same puzzle until midnight UTC
- **Same for all viewers**: No randomization - fair competition
- **Automatic reset**: New puzzle at midnight UTC

### Leaderboard
- **Live updates**: New solvers appear in real-time (updates every 10 seconds)
- **Top 10 visible**: On main page, top 5 on overlay
- **Personal tracking**: Users can see their own times and change their name

### Countdown Timer
- **Next puzzle timer**: Shows time until the puzzle resets
- **Visible on both**: Main page and OBS overlay
- **Automatic updates**: Recalculates every second

## Chat Commands (Manual Integration)

You can set up these commands in your bot (Nightbot, Streamlabs, etc.):

### !riddle
Shows the puzzle link:
```
🎭 Daily Riddle Challenge! Can you match all the quotes?
Play now: riddle.streamers.local
Top solver today: {fetch from /api/stats endpoint}
```

### !riddlestats
Shows current daily stats:
```
🏆 Today's Riddle Stats:
Solvers: {totalSolvers}
Fastest Time: {fastestTime}
Average Time: {averageTime}
Leader: {fastestSolver}
```

### !leaderboard
Shows top solvers:
```
🥇 #1 - {username} - {time}
🥈 #2 - {username} - {time}
🥉 #3 - {username} - {time}
Full leaderboard: riddle.streamers.local
```

## API Endpoints for Custom Integration

### Get Daily Stats
```
GET /api/stats/{date}

Response:
{
  "date": "2024-01-15",
  "totalSolvers": 42,
  "averageTime": 180000,
  "fastestTime": 45000,
  "fastestSolver": "StreamFan"
}
```

### Submit a Completion
```
POST /api/leaderboard/submit

Body:
{
  "date": "2024-01-15",
  "username": "StreamerName",
  "completionTime": 120000
}

Response:
{
  "success": true,
  "entry": { ... },
  "stats": { ... }
}
```

### Get Leaderboard
```
GET /api/leaderboard/{date}?limit=10

Response:
{
  "date": "2024-01-15",
  "leaderboard": [
    {
      "username": "Player1",
      "completionTime": 45000,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    ...
  ],
  "stats": { ... }
}
```

### Check User Status
```
GET /api/leaderboard/{date}/user/{username}

Response:
{
  "date": "2024-01-15",
  "username": "StreamerName",
  "completed": true,
  "bestTime": {
    "username": "StreamerName",
    "completionTime": 120000,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Stream Overlay Setup Examples

### Minimal Leaderboard (Side Panel)
```html
<iframe 
  src="https://riddle.streamers.local/demo" 
  width="400" 
  height="800"
  style="border: none; border-radius: 8px;"
></iframe>
```

### Custom HTML Overlay
```html
<div id="riddle-stats"></div>
<script>
  fetch('/api/stats/2024-01-15')
    .then(r => r.json())
    .then(data => {
      document.getElementById('riddle-stats').innerHTML = `
        <div style="color: white; font-size: 24px; font-weight: bold;">
          🏆 ${data.totalSolvers} Solvers Today
        </div>
        <div style="color: #667eea; font-size: 18px;">
          Fastest: ${Math.floor(data.fastestTime / 1000)}s by ${data.fastestSolver}
        </div>
      `;
    });
</script>
```

## Community Ideas

### Streamer Competitions
- Challenge your chat to beat your personal best
- Stream your own puzzle-solving attempt
- Host tournaments with time-based rounds

### Engagement Ideas
- "First solver gets a shoutout"
- "Fastest solver this week wins points"
- "Complete the daily riddle for channel points"

### Integration with Bots
- Nightbot: Use custom API commands to fetch stats
- Streamlabs: Create alerts for new leaderboard entries
- PyRight/Custom: Build custom integrations using the API

## Troubleshooting

### OBS Overlay Not Updating
- Check browser source settings: refresh every 10 seconds
- Verify you can access the URL directly
- Clear browser cache in OBS source properties

### Puzzle Not Loading
- Verify backend is running (`/api/health` should return 200)
- Check CORS settings (should allow your domain)
- Clear browser cache

### Users Not on Leaderboard
- Verify they entered a username (default is "Anonymous")
- Check the correct date format (YYYY-MM-DD)
- Puzzle date must match the date they submitted

## Best Practices

1. **Announce the puzzle**: Share the link at stream start
2. **Show the overlay**: Keep leaderboard visible during gameplay
3. **Celebrate solvers**: Give shoutouts to top performers
4. **Change it up**: Add custom twists or time challenges
5. **Engage chat**: Ask what they got stuck on, discuss answers

## Advanced Customization

### Custom Branding
The puzzle is fully customizable. You can:
- Add custom CSS for your stream colors
- Create a custom overlay HTML page
- Integrate with your bot's command system
- Add channel points integration

### Building a Custom Overlay
Example with Streamlabs:
```html
<!-- Save as custom.html -->
<style>
  body { background: transparent; font-family: Arial; }
  .container { color: white; text-shadow: 2px 2px 4px black; }
</style>
<div class="container" id="stats"></div>
<script>
  setInterval(async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`/api/stats/${today}`);
    const data = await res.json();
    document.getElementById('stats').innerHTML = `
      <h2>${data.totalSolvers} Playing</h2>
      <p>Leader: ${data.fastestSolver}</p>
    `;
  }, 10000);
</script>
```

## Support

For issues or feature requests, visit the Riddle GitHub repository or contact the dev team.

Have fun streaming! 🎭✨

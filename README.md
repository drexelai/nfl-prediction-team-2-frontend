# NFL Predictions App

A Next.js application for viewing NFL games and predictions. This app provides comprehensive NFL game data including schedules, box scores, and statistics through a backend API that integrates with Sportradar.

## Features

- 📅 View current week and full season schedules
- 📊 Access detailed game box scores and statistics
- 🔮 Prediction system integration (LLM-powered)
- ⚡ Fast API responses with caching
- 🎯 TypeScript support with comprehensive type definitions
- 🔄 Automatic retry logic and error handling

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Sportradar API key (free 30-day trial available at [developer.sportradar.com](https://developer.sportradar.com))

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory with your Sportradar credentials:

```bash
SPORTRADAR_API_KEY=your_api_key_here
SPORTRADAR_ACCESS_LEVEL=trial
SPORTRADAR_LANGUAGE=en
```

(See `.env.example` for a template)

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

The backend API provides the following endpoints:

- `GET /api/nfl/schedule/week` - Current week's schedule
- `GET /api/nfl/schedule/season` - Full season schedule
- `GET /api/nfl/games/[gameId]/boxscore` - Game box score with player stats
- `GET /api/nfl/games/[gameId]/statistics` - Detailed game statistics

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Project Structure

```
src/
├── app/
│   ├── api/nfl/              # API routes
│   │   ├── schedule/
│   │   │   ├── week/         # Week schedule endpoint
│   │   │   └── season/       # Season schedule endpoint
│   │   └── games/[gameId]/
│   │       ├── boxscore/     # Game boxscore endpoint
│   │       └── statistics/   # Game statistics endpoint
│   ├── page.tsx              # Home page
│   └── layout.tsx            # Root layout
├── lib/
│   ├── sportradar.ts         # Sportradar API client
│   └── utils.ts              # Utility functions
└── types/
    └── nfl.ts                # TypeScript type definitions
```

## Development

You can start editing pages by modifying files in `src/app/`. The page auto-updates as you edit files.

### TypeScript Types

All NFL data types are defined in `src/types/nfl.ts` and can be imported:

```typescript
import type { WeekSchedule, GameBoxScore, GameStatistics } from '@/types/nfl';
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / shadcn/ui
- **API:** Sportradar NFL Official API
- **Deployment:** Vercel (recommended)

## Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API endpoint documentation
- [Sportradar API Docs](https://developer.sportradar.com/nfl/reference) - Official Sportradar documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript reference

## Contributing

This is a club project. Please coordinate with team members before making significant changes.

## License

This project is for educational purposes.

# ChromaCross

A daily color-coded crossword puzzle game where players guess letters to reveal intersecting words through their unique colors. Try it out at [https://chromacross.app](https://chromacross.app)

## 🎮 How to Play

Each day, everyone gets the same puzzle: two 5-letter words that intersect at one letter. Your goal is to guess all the letters before running out of attempts.

- **Click letters** on the virtual keyboard or **type on your keyboard**
- **Correct guesses** reveal the letter's color on the grid and in the color palette
- **Wrong guesses** count against your 8-attempt limit
- **Win** by revealing all unique letters, **lose** by making 8 incorrect guesses

## 🚀 Features

- **Daily puzzles** - Same puzzle worldwide, refreshes at midnight UTC
- **Color-coded gameplay** - Each letter has a unique color
- **Progress persistence** - Your game state saves automatically
- **Share results** - Spoiler-free emoji grids for social sharing
- **Mobile-friendly** - Responsive design works on all devices
- **Analytics** - Game performance tracking (private)

## 🛠️ Tech Stack

- **Frontend**: [Astro](https://astro.build/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Deployment**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Analytics**: Cloudflare KV storage
- **Testing**: [Vitest](https://vitest.dev/) (unit) + [Playwright](https://playwright.dev/) (e2e)

## 📁 Project Structure

```
src/
├── pages/
│   ├── index.astro          # Main game page
│   └── api/
│       ├── analytics.js     # Game analytics endpoint
│       └── get-analytics.js # Analytics viewing endpoint
├── components/              # Astro components
│   ├── GameGrid.astro      # Puzzle grid display
│   ├── ColorPalette.astro  # Color-to-letter mapping
│   ├── VirtualKeyboard.astro
│   └── ...
├── scripts/                 # Client-side game logic
│   ├── init.js             # Game initialization
│   ├── gameClient.js       # Main game controller
│   ├── gameLogic.js        # Core game mechanics
│   └── ...
├── utils/
│   └── simplePuzzleGenerator.ts # Daily puzzle generation
└── types/
    └── game.ts             # TypeScript type definitions

tests/
├── unit/                   # Unit tests
└── e2e/                    # End-to-end tests

scripts/
└── view-analytics.cjs      # Analytics viewing script
```

## 🏃‍♂️ Development

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd chromacross

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint code |

### Viewing Analytics

```bash
# View formatted analytics in terminal
node scripts/view-analytics.cjs

# Or get raw JSON data
curl https://chromacross.app/api/get-analytics
```

## 🚀 Deployment

The game is configured for deployment on Cloudflare Workers:

```bash
# Build and deploy
npm run build
wrangler deploy
```

### Environment Setup

The game uses Cloudflare KV for analytics storage. Make sure your `wrangler.jsonc` includes:

```json
{
  "kv_namespaces": [
    {
      "binding": "ANALYTICS_KV",
      "id": "your-kv-namespace-id"
    }
  ]
}
```

## 🎯 Game Algorithm

ChromaCross generates one unique puzzle per day using a deterministic algorithm:

1. **Date-based seeding** ensures everyone gets the same puzzle
2. **Word intersection finding** identifies valid crossword pairs
3. **Uniqueness validation** ensures only one solution exists
4. **Color assignment** creates distinct visual mapping

For detailed algorithm documentation, see [ALGORITHM.md](./ALGORITHM.md).

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests (starts local server)
npm run test:e2e

# Run specific test file
npm test gameLogic.test.ts
```

## 📊 Analytics

ChromaCross tracks anonymous gameplay statistics:
- Win/loss rates
- Average guesses per game
- Guess distribution patterns
- Daily performance metrics

Analytics are stored privately in Cloudflare KV and can be viewed using the included scripts.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

---

Play ChromaCross daily at [chromacross.app](https://chromacross.app)

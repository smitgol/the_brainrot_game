# Focus Frenzy

Attention-training PWA built to fight brain rot. Three fast mini-games, shareable scores, and a global leaderboard — wrapped in a dark, brutalist indie-game UI.

## Games

| Mode | Route | How it works |
|------|-------|--------------|
| **Train Dispatch** | `/game/train` | Route trains to the correct platforms by tapping switches. Collisions and wrong platforms cost lives. |
| **Memory Sequence** | `/game/memory` | Watch digits flash, then reproduce the sequence on the numpad before time runs out. |
| **Reaction Rush** | `/game/reaction` | Wait for the signal, then tap as fast as you can. Tap too early and you lose points. |

After each session you land on `/result` with a shareable score, performance tier, and optional leaderboard submit.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — custom design tokens (dark brutalist theme)
- **Konva / react-konva** — Train Dispatch canvas game
- **Framer Motion** — page transitions, score animations
- **Supabase** — global leaderboard (optional; app works offline without it)
- **next/og** — dynamic share card images at `/og`
- **PWA** — manifest + service worker

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

### Other scripts

```bash
npm run lint            # ESLint
npm run generate-icons  # Regenerate PWA icons (192px, 512px)
```

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-only admin key (not used by default) |

If Supabase is not configured, the app still runs — scores are tracked locally and leaderboard/submit gracefully fall back.

## Supabase Setup

1. Create a Supabase project.
2. Add to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable or anon key)
   - `DATABASE_URL` (optional, for migrations only — never commit)
3. Apply schema + RLS policies:

```bash
npm run db:migrate
```

This runs `supabase/schema.sql` and `supabase/migrations/*.sql` (score caps, rate limits, tightened insert policy).

4. Restart the dev server.

### Leaderboard anti-spam (enforced in Postgres + API)

| Rule | Limit |
|------|--------|
| Score cap | reaction 250 · memory 25k · train 50k · echo 15k |
| Level cap | reaction 5 · memory/train 200 · echo 50 |
| Rate limit | 15 submits / player / hour · 6 / player / mode / hour |
| Name | 1–24 chars, letters/numbers/spaces `._-` |
| API | 20 POSTs / minute / IP on `/api/score` |

Clients cannot update or delete scores (insert + read only).

## Project Structure

```
app/
  page.tsx                  # Home screen
  game/{train,memory,reaction}/page.tsx
  result/page.tsx           # Post-game results + share
  leaderboard/page.tsx
  api/{score,leaderboard}/route.ts
  og/route.tsx              # Dynamic OG images

components/
  games/                    # TrainDispatch, MemorySequence, ReactionRush
  ui/                       # GameShell, GameHeader, Toast, StatCell, etc.

lib/
  feedback.ts               # Sound + haptics
  gameSession.ts            # End-game flow (stats + result URL)
  gameLogic.ts              # Scoring, tiers, URL builders
  scores.ts                 # localStorage + API helpers
  rank.ts                   # Leaderboard rank computation
  hooks.ts                  # Shared React hooks

public/
  manifest.json
  service-worker.js
  icons/
```

## Features

- **Local stats** — best score, games played, win streak (`localStorage`)
- **Share scores** — Web Share API on mobile, clipboard fallback on desktop
- **Dynamic OG images** — `/og?score=250&mode=train&name=Player`
- **Leaderboard** — top 20 per mode, auto-refreshes every 30s
- **PWA** — installable; nudge banner after 2 games played
- **Accessibility** — `prefers-reduced-motion` gates animations
- **Mobile-first** — 480px max width, 44px touch targets

## Scoring Tiers

| Score | Message |
|-------|---------|
| 0–19 | Brain rot detected |
| 20–49 | You're warming up |
| 50–99 | Getting focused |
| 100–199 | Certified focus god |
| 200+ | Big brain energy |

## Deploy

Optimized for [Vercel](https://vercel.com):

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add Supabase env vars in project settings.
4. Deploy.

## License

Private — all rights reserved.

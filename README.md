# Ganit Powerplay Tracker

Live fixtures, score entry, group standings and the overall leaderboard for Ganit Powerplay Sports Day 2026 (Cricket, Badminton, Chess, Carrom, FIFA).

- Anyone with the link can view live results.
- Only whoever knows the scoring PIN (set via the `POWERPLAY_PIN` environment variable) can enter results — click "Enter PIN to score" in the header.

## Stack

- Static frontend in `public/index.html`, no build step.
- Serverless API routes in `api/` (Vercel Node functions) for reading/writing shared state.
- State is stored as a single JSON row in a Supabase table `powerplay_state` (`lib/store.js`).

## Local development

```
npm install
npx vercel dev
```

## Deploy

```
npx vercel --prod
```

Requires `POWERPLAY_PIN`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables set on the Vercel project.

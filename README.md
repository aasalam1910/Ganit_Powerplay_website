# Ganit Powerplay Tracker

Live fixtures, score entry, group standings and the overall leaderboard for Ganit Powerplay Sports Day 2026 (Cricket, Badminton, Chess, Carrom, FIFA).

- Anyone with the link can view live results.
- Only whoever knows the scoring PIN (set via the `POWERPLAY_PIN` environment variable) can enter results — click "Enter PIN to score" in the header.

## Stack

- Static frontend in `public/index.html`, no build step.
- Serverless API routes in `api/` (Vercel Node functions) for reading/writing shared state.
- State is stored as a single JSON file in Vercel Blob storage (`lib/store.js`).

## Local development

```
npm install
npx vercel dev
```

## Deploy

```
npx vercel --prod
```

Requires a `POWERPLAY_PIN` environment variable set on the Vercel project, and a Blob store connected (`BLOB_READ_WRITE_TOKEN` is added automatically once a store is connected).

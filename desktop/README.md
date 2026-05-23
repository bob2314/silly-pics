# Silly Pics Desktop App

React + Vite desktop web app for creating and saving fun caricatures from camera portraits, with an OpenAI-backed AI caricature mode.

## Stack
- React 19 + Vite
- Express API (`api/index.js`) — random style presets + OpenAI `gpt-image-1` image edit
- Vite dev server mounts the Express app as middleware so `npm run dev` serves both UI and `/api/*`
- Vercel config (`vercel.json`) for SPA + API rewrites in production

## Local development
```bash
cd desktop
npm install
npm run dev          # Vite + Express on the same port
# or
npm run dev:vercel   # `vercel dev` (requires `npm i -g vercel`)
```

Set `OPENAI_API_KEY` in `desktop/.env.local` (see `.env.example`) to enable the AI Caricature button. Both `.env` and `.env.local` are gitignored.

## Validation
```bash
npm run lint
npm run build
```

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import expressApp from './api/index.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load every key from .env / .env.local (no VITE_ prefix filter) and mirror
  // it onto process.env so the Express handler running inside the dev server
  // can read OPENAI_API_KEY and friends. In production this file isn't used —
  // Vercel injects env vars itself.
  const env = loadEnv(mode, process.cwd(), '')

  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return {
    plugins: [
      react(),
      {
        name: 'silly-pics-api-middleware',
        configureServer(server) {
          // Hand off `/api/*` requests to the Express app; let Vite handle
          // everything else (HMR, static assets, the SPA entry point).
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              return expressApp(req, res, next)
            }

            next()
          })
        },
      },
    ],
  }
})

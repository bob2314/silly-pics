import express from 'express'

const app = express()

const STYLE_PRESETS = [
  {
    id: 'comic-pop',
    name: 'Comic Pop',
    saturation: 1.65,
    contrast: 1.28,
    brightness: 1.06,
    hueDeg: 10,
    exaggeration: 0.26,
    accent: '#ff5f8f',
  },
  {
    id: 'retro-burst',
    name: 'Retro Burst',
    saturation: 1.35,
    contrast: 1.22,
    brightness: 1.04,
    hueDeg: -12,
    exaggeration: 0.33,
    accent: '#ff9f40',
  },
  {
    id: 'neon-wink',
    name: 'Neon Wink',
    saturation: 1.92,
    contrast: 1.14,
    brightness: 1.02,
    hueDeg: 26,
    exaggeration: 0.3,
    accent: '#7d5fff',
  },
  {
    id: 'cool-cartoony',
    name: 'Cool Cartoony',
    saturation: 1.48,
    contrast: 1.18,
    brightness: 1.08,
    hueDeg: -4,
    exaggeration: 0.24,
    accent: '#22c3ff',
  },
]

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'silly-pics-express-api' })
})

app.get('/api/styles/random', (_req, res) => {
  const randomStyle = STYLE_PRESETS[Math.floor(Math.random() * STYLE_PRESETS.length)]
  res.json(randomStyle)
})

export default app

import express from 'express'

const app = express()

app.use(express.json({ limit: '12mb' }))

const STYLE_PRESETS = [
  {
    id: 'cosmic-pop',
    name: 'Cosmic Pop',
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
  {
    id: 'golden-studio',
    name: 'Golden Studio',
    saturation: 1.42,
    contrast: 1.2,
    brightness: 1.08,
    hueDeg: 6,
    exaggeration: 0.22,
    accent: '#f6b73c',
  },
  {
    id: 'ink-booth-sketch',
    name: 'Ink Booth Sketch',
    saturation: 0.2,
    contrast: 1.45,
    brightness: 1.12,
    hueDeg: 0,
    exaggeration: 0.34,
    accent: '#1f2937',
  },
]

const STYLE_PROMPT_HINTS = {
  'cosmic-pop':
    'punchy cosmic-pop palette, bold pink and cyan energy, halftone dot shading accents, playful Saturday-morning cartoon vibe',
  'retro-burst':
    'warm retro 70s palette of sunset oranges and golds, slightly textured paper feel, sketchy ink accents',
  'neon-wink':
    'electric neon palette with magenta and violet highlights, glossy cel shading, futuristic flair',
  'cool-cartoony':
    'cool cyan and teal palette, smooth modern cartoon shading, friendly approachable look',
  'golden-studio':
    'warm golden-yellow studio backdrop, polished digital color caricature, glossy painterly hair and skin shading, friendly convention portrait finish',
  'ink-booth-sketch':
    'black-and-white live booth sketch, clean confident marker linework, expressive simplified features, minimal shading on light paper',
}

const SYSTEM_STYLE_PROMPT =
  'You are a professional caricature artist specializing in flattering digital caricatures. Preserve identity while exaggerating unique features in a warm, playful, polished style.'

const IDENTITY_PRESERVATION_PROMPT = [
  'Create a high-quality digital caricature portrait based on the uploaded photo.',
  "Preserve the person's recognizable facial features while artistically exaggerating them in a fun, flattering way.",
  'Maintain likeness and personality — keep the same skin tone, gender presentation, hair color, facial hair, glasses, and any distinctive features so the subject clearly reads as the same person.',
].join(' ')

const FEATURE_EXAGGERATION_PROMPT =
  'Emphasize expressive eyes, smile, hair shape, glasses, and overall facial structure with slightly oversized facial proportions. Exaggerate relationships between the main face shapes — head shape, eyes, nose, mouth, and feature spacing — using distance, size, and angle instead of simply enlarging one isolated feature. Follow a water-balloon logic: when one feature stretches, surrounding features should compress or shift naturally. Pay special attention to the eye-and-nose T-shape and vary line thickness with bolder strokes under the nose, chin, and eyes and thinner strokes for smaller details.'

const ART_MEDIUM_PROMPT =
  'Use a modern live-event caricature style with bold clean linework, painterly shading, vibrant colors, a soft textured background, and professional cartoon illustration quality.'

const MOOD_AND_COMPOSITION_PROMPT =
  'The result should feel playful, polished, and friendly — similar to a professional convention caricature artist. Composition: waist-up portrait, centered subject, high detail.'

const NEGATIVE_PROMPT = 'Do not add any text, captions, watermarks, signatures, or logos.'

const formatExtractedTraits = (traits) => {
  if (!Array.isArray(traits)) {
    return ''
  }

  const cleanedTraits = traits
    .filter((trait) => typeof trait === 'string')
    .map((trait) => trait.trim())
    .filter(Boolean)
    .slice(0, 10)

  if (cleanedTraits.length === 0) {
    return ''
  }

  return `Feature traits to preserve and selectively exaggerate: ${cleanedTraits.join(', ')}.`
}

// Prompt layers follow the production pattern:
// identity preservation + feature exaggeration + art medium + mood/personality
// + composition + rendering constraints. Keep README notes in sync.
const buildCaricaturePrompt = (style, traits) => {
  const styleHint = (style && STYLE_PROMPT_HINTS[style.id]) || STYLE_PROMPT_HINTS['cosmic-pop']

  return [
    SYSTEM_STYLE_PROMPT,
    IDENTITY_PRESERVATION_PROMPT,
    FEATURE_EXAGGERATION_PROMPT,
    formatExtractedTraits(traits),
    ART_MEDIUM_PROMPT,
    `Style cue: ${styleHint}.`,
    MOOD_AND_COMPOSITION_PROMPT,
    NEGATIVE_PROMPT,
  ]
    .filter(Boolean)
    .join(' ')
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'silly-pics-express-api' })
})

app.get('/api/styles/random', (_req, res) => {
  const randomStyle = STYLE_PRESETS[Math.floor(Math.random() * STYLE_PRESETS.length)]
  res.json(randomStyle)
})

app.post('/api/caricature', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    res.status(500).json({
      error: 'OPENAI_API_KEY is not configured on the server.',
    })
    return
  }

  const { image, style, quality, traits } = req.body || {}

  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    res.status(400).json({ error: 'A base64 PNG data URL is required in the "image" field.' })
    return
  }

  const base64 = image.split(',')[1] || ''

  if (!base64) {
    res.status(400).json({ error: 'Image payload could not be decoded.' })
    return
  }

  let buffer

  try {
    buffer = Buffer.from(base64, 'base64')
  } catch {
    res.status(400).json({ error: 'Image payload is not valid base64.' })
    return
  }

  const portraitBlob = new Blob([buffer], { type: 'image/png' })
  const form = new FormData()

  form.append('model', 'gpt-image-1')
  form.append('image[]', portraitBlob, 'portrait.png')
  form.append('prompt', buildCaricaturePrompt(style, traits))
  form.append('size', '1024x1536')
  form.append('quality', ['low', 'medium', 'high', 'auto'].includes(quality) ? quality : 'low')
  form.append('input_fidelity', 'high')
  form.append('n', '1')

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })

    if (!openaiResponse.ok) {
      const detail = await openaiResponse.text()
      let readableDetail = detail

      try {
        const parsedDetail = JSON.parse(detail)
        readableDetail = parsedDetail?.error?.message || parsedDetail?.message || detail
      } catch {
        // OpenAI usually returns JSON, but keep plain text intact if it does not.
      }

      res.status(502).json({
        error: 'OpenAI image edit request failed.',
        status: openaiResponse.status,
        detail: readableDetail,
      })
      return
    }

    const payload = await openaiResponse.json()
    const b64 = payload?.data?.[0]?.b64_json

    if (!b64) {
      res.status(502).json({ error: 'OpenAI did not return an image.' })
      return
    }

    res.json({ image: `data:image/png;base64,${b64}` })
  } catch (error) {
    res.status(500).json({
      error: 'Unexpected error talking to OpenAI.',
      detail: error instanceof Error ? error.message : String(error),
    })
  }
})

export default app

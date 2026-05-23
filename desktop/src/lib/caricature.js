export const STYLE_PRESETS = [
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

export function getRandomStylePreset() {
  return STYLE_PRESETS[Math.floor(Math.random() * STYLE_PRESETS.length)]
}

export async function fetchRandomStylePreset() {
  try {
    const response = await fetch('/api/styles/random')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch {
    return getRandomStylePreset()
  }
}

export function renderCaricature(sourceImage, style, canvas) {
  const ctx = canvas.getContext('2d')
  const width = sourceImage.naturalWidth || sourceImage.width
  const height = sourceImage.naturalHeight || sourceImage.height

  canvas.width = width
  canvas.height = height

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')

  const leftWidth = width * 0.3
  const rightWidth = width * 0.3
  const centerWidth = width - leftWidth - rightWidth
  const squeeze = style.exaggeration * 0.52
  const leftDestWidth = leftWidth * (1 - squeeze)
  const centerDestWidth = centerWidth * (1 + style.exaggeration)
  const rightDestX = leftDestWidth + centerDestWidth

  tempCtx.filter = `saturate(${style.saturation}) contrast(${style.contrast}) brightness(${style.brightness}) hue-rotate(${style.hueDeg}deg)`

  tempCtx.drawImage(sourceImage, 0, 0, leftWidth, height, 0, 0, leftDestWidth, height)
  tempCtx.drawImage(
    sourceImage,
    leftWidth,
    0,
    centerWidth,
    height,
    leftDestWidth,
    0,
    centerDestWidth,
    height,
  )
  tempCtx.drawImage(
    sourceImage,
    leftWidth + centerWidth,
    0,
    rightWidth,
    height,
    rightDestX,
    0,
    width - rightDestX,
    height,
  )

  const topHeight = height * 0.46
  const topStretch = 1 + style.exaggeration * 0.24
  const topDestHeight = topHeight * topStretch

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(tempCanvas, 0, 0, width, topHeight, 0, 0, width, topDestHeight)
  ctx.drawImage(
    tempCanvas,
    0,
    topHeight,
    width,
    height - topHeight,
    0,
    topDestHeight,
    width,
    height - topDestHeight,
  )

  const cheekRadius = Math.max(8, Math.round(Math.min(width, height) * 0.035))

  ctx.globalAlpha = 0.18
  ctx.fillStyle = style.accent
  ctx.beginPath()
  ctx.arc(width * 0.33, height * 0.62, cheekRadius, 0, Math.PI * 2)
  ctx.arc(width * 0.67, height * 0.62, cheekRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = 0.15
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(1, Math.round(width * 0.004))
  ctx.beginPath()
  ctx.moveTo(width * 0.3, height * 0.38)
  ctx.quadraticCurveTo(width * 0.36, height * 0.34, width * 0.45, height * 0.39)
  ctx.moveTo(width * 0.55, height * 0.39)
  ctx.quadraticCurveTo(width * 0.64, height * 0.34, width * 0.7, height * 0.38)
  ctx.stroke()
  ctx.globalAlpha = 1
}

export function loadDataUrlImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load captured portrait'))
    image.src = dataUrl
  })
}

export async function downscaleDataUrl(dataUrl, maxEdge = 1024) {
  const image = await loadDataUrlImage(dataUrl)
  const { naturalWidth: w, naturalHeight: h } = image

  if (!w || !h) {
    return dataUrl
  }

  const scale = Math.min(1, maxEdge / Math.max(w, h))

  if (scale === 1) {
    return dataUrl
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)

  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/png')
}

export async function requestAiCaricature(dataUrl, style, { quality = 'low' } = {}) {
  const prepared = await downscaleDataUrl(dataUrl, 1024)

  const response = await fetch('/api/caricature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: prepared, style, quality }),
  })

  if (!response.ok) {
    let detail = ''

    try {
      const payload = await response.json()
      detail = payload?.detail || payload?.error || ''
    } catch {
      try {
        detail = await response.text()
      } catch {
        // ignore — fall through to generic error message below
      }
    }

    throw new Error(detail || `AI caricature request failed (HTTP ${response.status})`)
  }

  const payload = await response.json()

  if (!payload?.image) {
    throw new Error('AI caricature response was missing an image.')
  }

  return payload.image
}

export async function buildBrandedImage(caricatureDataUrl) {
  const image = await loadDataUrlImage(caricatureDataUrl)
  const border = 32
  const footerHeight = 90
  const exportCanvas = document.createElement('canvas')

  exportCanvas.width = image.width + border * 2
  exportCanvas.height = image.height + border * 2 + footerHeight

  const ctx = exportCanvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height)

  gradient.addColorStop(0, '#302b63')
  gradient.addColorStop(0.55, '#2b5876')
  gradient.addColorStop(1, '#4e4376')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(border - 6, border - 6, image.width + 12, image.height + 12)
  ctx.drawImage(image, border, border, image.width, image.height)

  ctx.fillStyle = '#f7f8ff'
  ctx.font = '700 28px system-ui'
  ctx.fillText('Silly Pics', border, image.height + border + 45)

  ctx.font = '500 17px system-ui'
  ctx.fillText('Caricature Studio', border, image.height + border + 73)

  return exportCanvas.toDataURL('image/png')
}

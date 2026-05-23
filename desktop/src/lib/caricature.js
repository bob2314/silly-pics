export const STYLE_PRESETS = [
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

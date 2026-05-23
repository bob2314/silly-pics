import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  STYLE_PRESETS,
  buildBrandedImage,
  loadDataUrlImage,
  renderCaricature,
  requestAiCaricature,
} from './lib/caricature'

function App() {
  const videoRef = useRef(null)
  const captureCanvasRef = useRef(null)
  const outputCanvasRef = useRef(null)

  const [cameraError, setCameraError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const [capturedImage, setCapturedImage] = useState('')
  const [caricatureImage, setCaricatureImage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [activeStyle, setActiveStyle] = useState(STYLE_PRESETS[0])
  const [aiQuality, setAiQuality] = useState('low')

  const QUALITY_OPTIONS = [
    { id: 'low', label: 'Low', hint: 'fastest, cheapest' },
    { id: 'medium', label: 'Medium', hint: 'balanced' },
    { id: 'high', label: 'High', hint: 'slowest, prettiest' },
  ]

  useEffect(() => {
    const videoElement = videoRef.current

    return () => {
      const stream = videoElement?.srcObject
      if (!stream) {
        return
      }

      stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const startCamera = async () => {
    setCameraError('')

    try {
      if (videoRef.current?.srcObject) {
        await videoRef.current.play()
        setCameraOn(true)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })

      if (!videoRef.current) {
        return
      }

      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setCameraOn(true)
    } catch {
      setCameraError(
        'Unable to access the built-in camera. Please allow camera permission and try again.',
      )
    }
  }

  const capturePortrait = () => {
    if (!videoRef.current || !captureCanvasRef.current) {
      return ''
    }

    const video = videoRef.current
    const canvas = captureCanvasRef.current

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const portrait = canvas.toDataURL('image/png')
    setCapturedImage(portrait)

    return portrait
  }

  const generateCaricature = async () => {
    setIsProcessing(true)
    setCameraError('')

    try {
      const source = capturedImage || capturePortrait()

      if (!source || !outputCanvasRef.current) {
        throw new Error('No image available')
      }

      const image = await loadDataUrlImage(source)
      renderCaricature(image, activeStyle, outputCanvasRef.current)

      setCaricatureImage(outputCanvasRef.current.toDataURL('image/png'))
    } catch {
      setCameraError('Capture a portrait first, then generate your caricature.')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateAiCaricature = async () => {
    setIsAiProcessing(true)
    setCameraError('')

    try {
      const source = capturedImage || capturePortrait()

      if (!source) {
        throw new Error('No image available')
      }

      const aiImage = await requestAiCaricature(source, activeStyle, { quality: aiQuality })
      setCaricatureImage(aiImage)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? `AI caricature failed: ${error.message}`
          : 'AI caricature failed. Capture a portrait, then try again.'
      setCameraError(message)
    } finally {
      setIsAiProcessing(false)
    }
  }

  const saveBrandedCaricature = async () => {
    if (!caricatureImage) {
      setCameraError('Generate a caricature before saving.')
      return
    }

    const brandedDataUrl = await buildBrandedImage(caricatureImage)
    const link = document.createElement('a')

    link.href = brandedDataUrl
    link.download = `silly-pics-${Date.now()}.png`
    link.click()
  }

  const previewImage = useMemo(() => {
    return caricatureImage || capturedImage
  }, [capturedImage, caricatureImage])

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">Silly Pics</p>
        <h1>Instant Caricature Studio</h1>
        <p className="lead">
          Capture a portrait from your built-in camera, exaggerate it for laughs, and save a
          branded keepsake.
        </p>
      </header>

      <section className="layout-grid">
        <article className="camera-panel card">
          <div className="camera-wrap">
            <video ref={videoRef} playsInline muted />
            {!cameraOn && (
              <button type="button" className="overlay-cta" onClick={startCamera}>
                Enable Camera
              </button>
            )}
          </div>

          <div className="actions">
            <button type="button" onClick={capturePortrait}>
              Capture Portrait
            </button>
            <button
              type="button"
              className="primary"
              onClick={generateCaricature}
              disabled={isProcessing || isAiProcessing}
            >
              {isProcessing ? 'Creating…' : 'Quick Filter'}
            </button>
            <button
              type="button"
              className="primary ai"
              onClick={generateAiCaricature}
              disabled={isProcessing || isAiProcessing}
            >
              {isAiProcessing ? 'Drawing…' : 'AI Caricature'}
            </button>
          </div>

          <div className="style-picker" role="group" aria-label="Caricature style">
            <span className="control-label">Style</span>
            <div className="style-options">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`style-chip ${activeStyle.id === style.id ? 'active' : ''}`}
                  onClick={() => setActiveStyle(style)}
                  disabled={isProcessing || isAiProcessing}
                  aria-pressed={activeStyle.id === style.id}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="quality-picker" role="group" aria-label="AI caricature quality">
            <span className="control-label">AI quality</span>
            <div className="quality-options">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`quality-chip ${aiQuality === option.id ? 'active' : ''}`}
                  onClick={() => setAiQuality(option.id)}
                  disabled={isAiProcessing}
                  title={option.hint}
                  aria-pressed={aiQuality === option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="style-label">
            Active style: <strong>{activeStyle.name}</strong>
          </p>
          {cameraError && <p className="error-text">{cameraError}</p>}
        </article>

        <article className="preview-panel card">
          {previewImage ? (
            <img src={previewImage} alt="Captured or caricature preview" className="preview-image" />
          ) : (
            <div className="placeholder">Your portrait preview appears here.</div>
          )}

          <button type="button" className="primary" onClick={saveBrandedCaricature}>
            Save Branded Image
          </button>
        </article>
      </section>

      <canvas ref={captureCanvasRef} className="hidden-canvas" aria-hidden="true" />
      <canvas ref={outputCanvasRef} className="hidden-canvas" aria-hidden="true" />
    </main>
  )
}

export default App

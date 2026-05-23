# silly-pics

A caricature app scaffold with:

- **Desktop web app**: Node.js + Express + React + Vite, deployable on Vercel.
- **Companion iOS app scaffold**: SwiftUI + camera capture + Core Image caricature effects.

## Desktop app (macOS via browser)

Location: `/tmp/workspace/bob2314/silly-pics/desktop`

### Features
- Uses built-in camera (`getUserMedia`) to capture a portrait-style face image.
- Auto-generates a playful caricature using canvas-based distortion and style tuning.
- Random style option (with Express API endpoint fallback to local randomizer).
- Saves a branded image (`Silly Pics / Caricature Studio`) as PNG.

### Run locally
```bash
cd /tmp/workspace/bob2314/silly-pics/desktop
npm install
npm run dev
```

### Build and lint
```bash
npm run lint
npm run build
```

### Vercel notes
- `desktop/vercel.json` includes rewrites for SPA routes and `/api/*` to the Express handler in `desktop/api/index.js`.

## iOS companion app scaffold

Location: `/tmp/workspace/bob2314/silly-pics/ios/SillyPicsCompanion`

Contains SwiftUI files for:
- Camera capture
- Random style selection
- Caricature generation (`CIBumpDistortion` + color controls)
- Branded save to Photos

See `ios/SillyPicsCompanion/README.md` for quick Xcode setup steps.

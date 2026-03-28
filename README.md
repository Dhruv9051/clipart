# Clipart - AI Clipart Generator

Transform any photo into clipart styles instantly using AI.

---

## 📱 APK Download
https://drive.google.com/drive/folders/1ZPm0kL-blVG6KbXeu_zG84lBxYij4tSi?usp=drive_link

## 🎥 Screen Recording
https://drive.google.com/drive/folders/1ZPm0kL-blVG6KbXeu_zG84lBxYij4tSi?usp=drive_link

## 🚀 Live Backend
https://clipart-backend-n6hb.onrender.com/health

## 🚀 Live frontend
https://clipart-ds.netlify.app/

## 📦 Repository
https://github.com/Dhruv9051/clipart

---

## App Overview

Clipart lets users upload a photo and transform it into 5 different clipart styles simultaneously using AI. The app generates all styles in parallel, shows real-time progress with skeleton loaders, and lets users download or share the results.

---

## Features

- Upload photo via camera or gallery (mobile) or file picker (web)
- Image compression and validation before processing
- 5 clipart styles generated in parallel: Cartoon, Anime, Pixel Art, Flat, Sketch
- Real-time skeleton loaders during generation
- Progress bar showing completion across all styles
- Download generated images to gallery
- Native share sheet for sharing
- Results persist across back/forward navigation
- Works on Android and Web

---

## Tech Stack

### Frontend
- React Native with Expo SDK 55
- Expo Router for file-based navigation
- TypeScript throughout
- expo-image-picker — camera and gallery access
- expo-image-manipulator — client-side image compression
- expo-media-library — save to gallery
- expo-sharing — native share sheet
- expo-linear-gradient — UI gradients
- expo-file-system — local file management
- Custom global store for generation state persistence

### Backend
- Node.js + Express + TypeScript
- HuggingFace Inference API — primary AI provider
- Pollinations AI — free fallback (no auth needed)
- Imgur API — image hosting for generated outputs
- Input validation middleware
- CORS + rate limiting

### Build & Deployment
- EAS Build for Android APK
- Render for backend hosting
- Netlify for frontend hosting
- GitHub for version control

---

## Architecture
```
Android App (React Native + Expo)
          ↕ HTTPS
Express Backend (Render)
          ↕
HuggingFace / Pollinations AI
          ↕
Imgur (public image hosting)
```

The app never calls AI APIs directly — all requests go through the backend proxy, keeping API keys secure and off the device.

---

## Project Structure
```
clipart/
├── clipart-frontend/
│   ├── app/
│   │   ├── _layout.tsx          # Root navigation layout
│   │   ├── index.tsx            # Home / upload screen
│   │   └── generate.tsx         # Generation + results screen
│   ├── components/
│   │   ├── ImageUploadBox.tsx   # Photo upload (camera/gallery/web)
│   │   ├── ResultCard.tsx       # Generated image card with actions
│   │   ├── SkeletonLoader.tsx   # Animated loading placeholder
│   │   └── StyleCard.tsx        # Style selection card
│   ├── constants/
│   │   └── theme.ts             # Design system (colors, fonts, spacing)
│   ├── hooks/
│   │   └── useGenerate.ts       # AI generation logic + state
│   ├── services/
│   │   └── api.ts               # Backend API service
│   └── store/
│       └── generationStore.ts   # Global generation state
│
└── clipart-backend/
    └── src/
        ├── config/              # Environment config
        ├── middleware/          # Input validation
        ├── routes/              # API routes
        └── services/            # AI generation service
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Frontend Setup
```bash
cd clipart-frontend
npm install --legacy-peer-deps
npx expo start
```

For web:
```bash
npx expo start --web
```

For Android (requires EAS account):
```bash
npx eas build --platform android --profile preview
```

### Backend Setup
```bash
cd clipart-backend
npm install
```

Create `.env` file:
```
HUGGINGFACE_TOKEN=your_token_here
PORT=3000
NODE_ENV=development
```

Run locally:
```bash
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `HUGGINGFACE_TOKEN` | Yes | HuggingFace API token for image generation |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

---

## API Endpoints

### `GET /health`
Returns server status.

**Response:**
```json
{ "status": "ok", "env": "production" }
```

### `POST /generate`
Generates a clipart image from a base64 encoded photo.

**Request:**
```json
{
  "imageBase64": "base64_string",
  "styleId": "cartoon",
  "prompt": "cartoon style illustration..."
}
```

**Response:**
```json
{ "imageUrl": "https://i.imgur.com/..." }
```

**Validation:**
- `styleId` must be one of: `cartoon`, `anime`, `pixel`, `flat`, `sketch`
- Image size limited to 5MB
- All fields required

---

## Tech Decisions & Tradeoffs

### React Native + Expo over Native Android
Expo's managed workflow enabled rapid development. Expo Router provides file-based navigation similar to Next.js. EAS Build handles APK compilation in the cloud without needing Android Studio locally.

### Global store over Redux/Zustand
A simple module-level store with a subscriber pattern was sufficient for this app's needs. It persists generation results across navigation without the overhead of a full state management library. This keeps the codebase lean and readable.

### Backend proxy for API security
All AI API calls go through the Express backend so API keys are never exposed in the app bundle. This also allows request validation, rate limiting, and easy provider switching without app updates.

### Pollinations AI as fallback
HuggingFace's free tier has rate limits and occasional model loading delays. Pollinations AI is completely free with no authentication required, ensuring the app always produces output even when HuggingFace is unavailable.

### Parallel generation over sequential
All 5 styles are fired simultaneously rather than sequentially. This gives users immediate visual feedback as results appear one by one, making the wait feel shorter. The tradeoff is higher simultaneous API load, mitigated by the backend proxy.

### Image compression client-side
Images are resized to max 1024px and compressed to 80% JPEG quality before being sent to the backend. This reduces payload size significantly, speeds up uploads, and prevents 413 errors from large base64 payloads.

### Imgur for image hosting
HuggingFace returns raw image bytes which can't be served directly to mobile clients as a URL. Imgur provides a free public hosting layer that converts the bytes to a stable URL the app can download and cache locally.

### Tradeoffs made under time constraint
- **AI image quality**: HuggingFace / Pollinations AI generates generic clipart without using the uploaded photo directly. Instead Replicate's img2img models would produce clipart that actually resembles the user (didn't use this since it requires credit card details) — this is the biggest quality gap.
- **No caching**: Results are stored in memory only and lost on app restart. Some type of caching would improve repeat generation speed significantly.
- **Render cold starts**: The free tier backend sleeps after 15 mins of inactivity, causing a ~30 second delay on first request. A paid tier would eliminate this.
- **No retry mechanism**: Failed generations show an error state but don't auto-retry. A retry button would improve UX.

---

## Submission Checklist

- [x] Android APK uploaded to Google Drive
- [x] Screen recording uploaded to Drive
- [x] App installs and runs on real Android device
- [x] GitHub repository with clean commit history
- [x] README with setup steps, tech decisions, tradeoffs
- [x] Backend deployed and live
- [x] No exposed API keys
- [x] All 5 clipart styles working
- [x] Skeleton loaders present
- [x] Download and share working

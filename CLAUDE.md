# CLAUDE.md - IVE Mobile

## Project Overview

IVE Mobile is an Expo/React Native browser app — a WebView-based browser with JavaScript injection for video detection and a postMessage bridge for haptic device integration. Users browse freely (default home: `q.iveplay.io/hub`), and the app detects `<video>` elements on any page.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 (strict)
- **Router:** Expo Router 6 (file-based routing in `app/`)
- **WebView:** react-native-webview 13
- **State:** Zustand 5
- **Icons:** @expo/vector-icons (Ionicons)
- **Linting:** ESLint 9 (flat config) + Prettier
- **New Architecture:** enabled (`newArchEnabled`, React Compiler, typed routes)

## Commands

| Task             | Command           |
| ---------------- | ----------------- |
| Start dev server | `npm start`       |
| iOS simulator    | `npm run ios`     |
| Android emulator | `npm run android` |
| Web              | `npm run web`     |
| Lint             | `npm run lint`    |

## Project Structure

```bash
app/                    # Expo Router screens
  _layout.tsx           # Root layout (Stack, dark theme)
  index.tsx             # Main browser screen
  tabs.tsx              # Tab manager (modal)
components/             # PascalCase components
  BrowserBar.tsx        # Top bar: back/forward + URL input + reload + tabs (single row)
  NewTabPage.tsx        # Blank new-tab page with search input & shortcuts
  TabCard.tsx           # Tab preview card
  WebViewContainer.tsx  # WebView with JS injection (forwardRef)
store/                  # Zustand stores (camelCase files)
  useTabStore.ts        # Tab list, current tab, CRUD
  useVideoStore.ts      # Detected video state
utils/                  # Utilities (camelCase files)
  injectedScripts.ts    # All injected JS as strings (~254 lines vanilla JS)
  messageHandler.ts     # WebView onMessage handler
  types.ts              # Shared TypeScript interfaces
constants/              # App constants (camelCase files)
  theme.ts              # Dark theme colors, spacing, font sizes
  urls.ts               # Allowed bridge origins
```

## Architecture

### JS Injection Pipeline

1. WebView loads page → `injectedJavaScript` runs after DOM ready
2. Prevents double-injection via `window.__ive_injected` flag
3. Video detector finds `<video>` elements (>100px, prioritizes playing)
4. MutationObserver watches for dynamically added videos
5. Video event listeners forward play/pause/seek/etc. to RN (times in ms)
6. IvePlay bridge intercepts iveplay.io postMessages and relays to RN

### Communication Flow

```bash
WebView (injected JS)
  ──window.ReactNativeWebView.postMessage()──►  React Native (messageHandler.ts)
  ◄──webViewRef.injectJavaScript()──             └── updates Zustand stores
```

### Message Types

- `VIDEO_DETECTED` — video element found (includes width, height, src, duration, paused)
- `VIDEO_NOT_FOUND` — no significant video after 5 retries (exponential backoff)
- `VIDEO_EVENT` — play, pause, seeking, timeupdate, ratechange, volumechange, waiting, playing, durationchange
- `IVEPLAY_BRIDGE` — forwarded postMessage from iveplay.io

### Bridge Protocol

On iveplay.io, the app responds to postMessages as if it were the browser extension:

- Listens for `{ from: 'iveplay', id, type, ... }`
- Responds with `{ from: 'ive-extension', id, data, error }`
- Allowed origins: `iveplay.io`, `localhost` (HTTPS only)
- Implements: `ive:ivedb:ping` (returns app version)

## Conventions

- **Path alias:** `@/*` → project root (`./`)
- **Formatting:** single quotes, trailing commas, no semicolons, 2-space indent
- **No test framework** configured

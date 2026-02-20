# CLAUDE.md - IVE Mobile

## Project Overview

IVE Mobile is an Expo/React Native browser app — a WebView-based browser with JavaScript injection for video detection, a postMessage bridge for haptic device integration, and ive-connect for Handy device control. Users browse freely (default home: `q.iveplay.io/hub`), and the app detects `<video>` elements on any page.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 (strict)
- **Router:** Expo Router 6 (file-based routing in `app/`)
- **WebView:** react-native-webview 13
- **State:** Zustand 5
- **Device control:** ive-connect (local file dep — HandyDevice, DeviceManager, script loading)
- **Persistence:** @react-native-async-storage/async-storage (favorites, settings, device config)
- **Icons:** @expo/vector-icons (Ionicons)
- **Linting:** ESLint 9 (flat config, eslint-config-expo) + Prettier
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
  _layout.tsx           # Root layout (Stack, dark theme, store loading, EventSource polyfill)
  index.tsx             # Main browser screen (WebViews, playback sync, video reset)
  tabs.tsx              # Tab manager (modal)
  settings.tsx          # Settings screen (Handy connection, search engine, homepage)
components/             # PascalCase components
  BrowserBar.tsx        # Top bar: back/forward + URL input + reload + tabs (single row)
  IveBar.tsx            # Bottom bar: video status + progress + device status (shown when video detected)
  NewTabPage.tsx        # Blank new-tab page with search input & shortcuts
  TabCard.tsx           # Tab preview card
  WebViewContainer.tsx  # WebView with JS injection + bridge message handler (forwardRef)
hooks/                  # Custom React hooks
  usePlaybackSync.ts    # Bridges video store → Handy device (play/stop/sync)
store/                  # Zustand stores (camelCase files)
  useTabStore.ts        # Tab list, current tab, CRUD
  useVideoStore.ts      # Video playback state from injected JS (hasVideo, isPlaying, time, etc.)
  useDeviceStore.ts     # Handy device connection + script loading (AsyncStorage persistence)
  useFavoriteStore.ts   # URL favorites with AsyncStorage persistence
  useSettingsStore.ts   # Search engine & homepage with AsyncStorage persistence
utils/                  # Utilities (camelCase files)
  types.ts              # Shared TypeScript interfaces (Tab, video message types)
  injected-js.ts        # JS string injected into WebView (video detection + bridge relay)
  message-handler.ts    # WebView onMessage router (video events + bridge messages)
  bridge-handler.ts     # Handles ive-play bridge messages (emulates extension protocol)
  event-source-polyfill.ts # No-op EventSource shim for ive-connect RN compatibility
constants/              # App constants (camelCase files)
  browser.ts            # Browser constants (MAX_ALIVE_TABS)
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
6. Bridge relay intercepts ive-play `postMessage` calls and forwards to RN

### Communication Flow

```bash
WebView (injected JS)
  ──window.ReactNativeWebView.postMessage()──►  React Native (message-handler.ts)
  ◄──webViewRef.injectJavaScript()──             ├── video events → useVideoStore
                                                 └── bridge msgs → bridge-handler.ts → useDeviceStore
```

### Bridge Protocol (ive-play ↔ ive-mobile)

Emulates the ive browser extension's `postMessage` bridge so ive-play works identically:

- **Request** (ive-play → extension): `{ from: 'iveplay', id: N, type: '...', ...payload }`
- **Response** (extension → ive-play): `{ from: 'ive-extension', id: N, data: ..., error: ... }`
- Injected JS relays requests to RN, RN responds via `window.__ive_bridge_respond()`

**Supported messages:**

- `ive:ivedb:ping` → `{ available: true, version: '1.4.0' }`
- `ive:select_script` → loads script URL into connected Handy device
- `ive:save_and_play` → stores entry data + loads script
- IVEDB operations → stubbed (return empty arrays, no local database)
- Local scripts → not supported on mobile

### Device Integration

- **ive-connect** library (local file dep) provides `HandyDevice` and `DeviceManager`
- `EventSource` polyfilled with no-op shim (SSE not needed, core REST API works)
- `useDeviceStore` manages HandyDevice lifecycle (connect, disconnect, load script)
- `usePlaybackSync` hook bridges video events to device playback:
  - Video plays → `device.play(timeMs, playbackRate)`
  - Video pauses → `device.stop()`
  - Sync timeouts: 2s (filter 0.9), 17s then every 15s (filter 0.5)

### Tab Memory Management

- `MAX_ALIVE_TABS` (5) limits concurrent mounted WebViews
- Tabs beyond the limit are unmounted but kept in state
- Video state resets on tab switch

### Favorites & Settings

- **Favorites:** URL bookmarks persisted to AsyncStorage (`ive-favorites`)
- **Settings:** Search engine, homepage, Handy connection key persisted to AsyncStorage
- Custom search URLs use `%s` placeholder for query substitution

## Conventions

- **Path alias:** `@/*` → project root (`./`)
- **Formatting:** single quotes, trailing commas, no semicolons, 2-space indent
- **No test framework** configured

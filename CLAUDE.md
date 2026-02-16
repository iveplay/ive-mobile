# CLAUDE.md - IVE Mobile

## Project Overview

IVE Mobile is an Expo/React Native browser app — a WebView-based browser with JavaScript injection for video detection and a postMessage bridge for haptic device integration. Users browse freely (default home: iveplay.io), and the app detects `<video>` elements on any page.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, TypeScript 5.9
- **Router:** Expo Router 6 (file-based routing in `app/`)
- **WebView:** react-native-webview 13
- **State:** Zustand 5
- **Icons:** @expo/vector-icons (Ionicons)

## Commands

| Task             | Command           |
| ---------------- | ----------------- |
| Start dev server | `npm start`       |
| iOS simulator    | `npm run ios`     |
| Android emulator | `npm run android` |

## Project Structure

```bash
app/                    # Expo Router screens
  _layout.tsx           # Root layout (Stack, dark theme)
  index.tsx             # Main browser screen
  tabs.tsx              # Tab manager (modal)
src/
  components/           # PascalCase components
    BrowserBar.tsx      # Bottom URL bar + nav buttons
    TabCard.tsx         # Tab preview card
    WebViewContainer.tsx # WebView with JS injection
  store/                # Zustand stores (camelCase files)
    useTabStore.ts      # Tab list, current tab, CRUD
    useVideoStore.ts    # Detected video state
  utils/                # Utilities (camelCase files)
    injectedScripts.ts  # All injected JS as strings
    messageHandler.ts   # WebView onMessage handler
    types.ts            # Shared TypeScript interfaces
  constants/            # App constants (camelCase files)
    theme.ts            # Dark theme colors
    urls.ts             # Default URLs, allowed origins
```

## Architecture

### JS Injection Pipeline

1. WebView loads page → `injectedJavaScript` runs after DOM ready
2. Video detector finds `<video>` elements (>100px, prioritize playing)
3. MutationObserver watches for dynamically added videos
4. Video event listeners forward play/pause/seek/etc. to RN
5. IvePlay bridge intercepts iveplay.io postMessages and relays to RN

### Communication Flow

```bash
WebView (injected JS)
  ──window.ReactNativeWebView.postMessage()──►  React Native (messageHandler.ts)
  ◄──webViewRef.injectJavaScript()──             └── updates Zustand stores
```

### Message Types

- `VIDEO_DETECTED` — video element found on page
- `VIDEO_NOT_FOUND` — no significant video after 5 retries
- `VIDEO_EVENT` — play, pause, seeking, timeupdate, etc.
- `IVEPLAY_BRIDGE` — forwarded message from iveplay.io

### Bridge Protocol

On iveplay.io, the app responds to postMessages as if it were the browser extension:

- Listens for `{ from: 'iveplay', id, type, ... }`
- Responds with `{ from: 'ive-extension', id, data, error }`

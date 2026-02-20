# CLAUDE.md - IVE Mobile

## Project Overview

IVE Mobile is an Expo/React Native browser app — a WebView-based browser with JavaScript injection for video detection and a postMessage bridge for haptic device integration. Users browse freely (default home: `q.iveplay.io/hub`), and the app detects `<video>` elements on any page.

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 (strict)
- **Router:** Expo Router 6 (file-based routing in `app/`)
- **WebView:** react-native-webview 13
- **State:** Zustand 5
- **Persistence:** @react-native-async-storage/async-storage (favorites, settings)
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
  _layout.tsx           # Root layout (Stack, dark theme)
  index.tsx             # Main browser screen
  tabs.tsx              # Tab manager (modal)
  settings.tsx          # Settings screen (search engine, homepage)
components/             # PascalCase components
  BrowserBar.tsx        # Top bar: back/forward + URL input + reload + tabs (single row)
  NewTabPage.tsx        # Blank new-tab page with search input & shortcuts
  TabCard.tsx           # Tab preview card
  WebViewContainer.tsx  # WebView with JS injection (forwardRef)
store/                  # Zustand stores (camelCase files)
  useTabStore.ts        # Tab list, current tab, CRUD
  useFavoriteStore.ts   # URL favorites with AsyncStorage persistence
  useSettingsStore.ts   # Search engine & homepage with AsyncStorage persistence
utils/                  # Utilities (camelCase files)
  types.ts              # Shared TypeScript interfaces
constants/              # App constants (camelCase files)
  browser.ts            # Browser constants (MAX_ALIVE_TABS)
  theme.ts              # Dark theme colors, spacing, font sizes
  urls.ts               # Allowed bridge origins
```

## Architecture

### Tab Memory Management

- `MAX_ALIVE_TABS` (5) limits concurrent mounted WebViews
- Tabs beyond the limit are unmounted but kept in state
- Media contexts are paused/resumed when switching tabs

### Favorites & Settings

- **Favorites:** URL bookmarks persisted to AsyncStorage (`ive-favorites`)
- **Settings:** Search engine (Google, DuckDuckGo, Brave, Custom) and homepage URL persisted to AsyncStorage (`ive-settings`)
- Custom search URLs use `%s` placeholder for query substitution

## Conventions

- **Path alias:** `@/*` → project root (`./`)
- **Formatting:** single quotes, trailing commas, no semicolons, 2-space indent
- **No test framework** configured

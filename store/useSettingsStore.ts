import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

const STORAGE_KEY = 'ive-settings'

export type SearchEngine = 'google' | 'duckduckgo' | 'brave' | 'custom'

export const SEARCH_ENGINES: Record<
  Exclude<SearchEngine, 'custom'>,
  { label: string; buildUrl: (q: string) => string }
> = {
  google: {
    label: 'Google',
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  duckduckgo: {
    label: 'DuckDuckGo',
    buildUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
  brave: {
    label: 'Brave Search',
    buildUrl: (q) =>
      `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  },
}

/** Build a search URL for the current engine */
export const buildSearchUrl = (
  engine: SearchEngine,
  customUrl: string,
  query: string,
): string => {
  if (engine === 'custom' && customUrl) {
    return customUrl.replace('%s', encodeURIComponent(query))
  }
  if (engine !== 'custom' && SEARCH_ENGINES[engine]) {
    return SEARCH_ENGINES[engine].buildUrl(query)
  }
  // Fallback to Google
  return SEARCH_ENGINES.google.buildUrl(query)
}

interface Settings {
  searchEngine: SearchEngine
  customSearchUrl: string
  homepage: string
}

interface SettingsStore extends Settings {
  loaded: boolean
  load: () => Promise<void>
  setSearchEngine: (engine: SearchEngine) => void
  setCustomSearchUrl: (url: string) => void
  setHomepage: (url: string) => void
}

const persist = (settings: Settings) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {})
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  searchEngine: 'google',
  customSearchUrl: '',
  homepage: '',
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>
        set({ ...parsed, loaded: true })
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },

  setSearchEngine: (engine) => {
    set({ searchEngine: engine })
    persist({
      searchEngine: engine,
      customSearchUrl: get().customSearchUrl,
      homepage: get().homepage,
    })
  },

  setCustomSearchUrl: (url) => {
    set({ customSearchUrl: url })
    persist({
      searchEngine: get().searchEngine,
      customSearchUrl: url,
      homepage: get().homepage,
    })
  },

  setHomepage: (url) => {
    set({ homepage: url })
    persist({
      searchEngine: get().searchEngine,
      customSearchUrl: get().customSearchUrl,
      homepage: url,
    })
  },
}))

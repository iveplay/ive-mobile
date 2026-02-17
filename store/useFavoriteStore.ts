import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

const STORAGE_KEY = 'ive-favorites'

export interface Favorite {
  url: string
  title: string
}

interface FavoriteStore {
  favorites: Favorite[]
  loaded: boolean

  load: () => Promise<void>
  addFavorite: (url: string, title: string) => void
  removeFavorite: (url: string) => void
  isFavorite: (url: string) => boolean
}

const persist = (favorites: Favorite[]) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {})
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favorites: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        set({ favorites: JSON.parse(raw) as Favorite[], loaded: true })
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },

  addFavorite: (url, title) => {
    const { favorites } = get()
    if (favorites.some((f) => f.url === url)) return
    const next = [...favorites, { url, title }]
    set({ favorites: next })
    persist(next)
  },

  removeFavorite: (url) => {
    const next = get().favorites.filter((f) => f.url !== url)
    set({ favorites: next })
    persist(next)
  },

  isFavorite: (url) => {
    return get().favorites.some((f) => f.url === url)
  },
}))

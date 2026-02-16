import { create } from 'zustand'
import { DEFAULT_HOME_URL } from '@/constants/urls'
import type { Tab } from '@/utils/types'

let nextId = 1

const createTab = (url?: string): Tab => ({
  id: String(nextId++),
  url: url ?? DEFAULT_HOME_URL,
  title: '',
  canGoBack: false,
  canGoForward: false,
})

interface TabStore {
  tabs: Tab[]
  currentTabId: string

  addTab: (url?: string) => string
  removeTab: (id: string) => void
  switchTab: (id: string) => void
  updateTab: (id: string, data: Partial<Omit<Tab, 'id'>>) => void
}

export const useTabStore = create<TabStore>((set, get) => {
  const initial = createTab()

  return {
    tabs: [initial],
    currentTabId: initial.id,

    addTab: (url) => {
      const tab = createTab(url)
      set((state) => ({
        tabs: [...state.tabs, tab],
        currentTabId: tab.id,
      }))
      return tab.id
    },

    removeTab: (id) => {
      const { tabs, currentTabId } = get()
      if (tabs.length <= 1) return

      const idx = tabs.findIndex((t) => t.id === id)
      const next = tabs.filter((t) => t.id !== id)

      let nextCurrentId = currentTabId
      if (currentTabId === id) {
        const newIdx = Math.min(idx, next.length - 1)
        nextCurrentId = next[newIdx].id
      }

      set({ tabs: next, currentTabId: nextCurrentId })
    },

    switchTab: (id) => {
      set({ currentTabId: id })
    },

    updateTab: (id, data) => {
      set((state) => ({
        tabs: state.tabs.map((t) => (t.id === id ? { ...t, ...data } : t)),
      }))
    },
  }
})

export const useCurrentTab = () => {
  const tabs = useTabStore((s) => s.tabs)
  const currentTabId = useTabStore((s) => s.currentTabId)
  return tabs.find((t) => t.id === currentTabId) ?? tabs[0]
}

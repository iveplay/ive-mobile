import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeviceManager, HandyDevice } from 'ive-connect'
import type { DeviceInfo, Funscript, ScriptData } from 'ive-connect'
import { create } from 'zustand'

const STORAGE_KEY = 'ive-device'
const HISTORY_KEY = 'ive-script-history'
const MAX_HISTORY = 50
const APPLICATION_ID = 'h_Jw26kJiyU3JZ2vV_X5TYutefunJJKe'

export interface ScriptHistoryEntry {
  url: string
  timestamp: number
}

// Singleton instances — live outside Zustand to avoid serialization issues
let deviceManager: DeviceManager | null = null
let handyDevice: HandyDevice | null = null

function getDeviceManager(): DeviceManager {
  if (!deviceManager) {
    deviceManager = new DeviceManager()
  }
  return deviceManager
}

interface DeviceState {
  handyConnected: boolean
  handyConnectionKey: string
  handyDeviceInfo: DeviceInfo | null
  handyOffset: number
  handyStrokeMin: number
  handyStrokeMax: number
  scriptLoaded: boolean
  scriptUrl: string
  funscript: Funscript | null
  scriptHistory: ScriptHistoryEntry[]
  error: string | null
  isConnecting: boolean
  loaded: boolean
}

interface DeviceStore extends DeviceState {
  load: () => Promise<void>
  connectHandy: (connectionKey: string) => Promise<boolean>
  disconnectHandy: () => Promise<void>
  setHandyOffset: (offset: number) => Promise<boolean>
  setHandyStrokeSettings: (min: number, max: number) => Promise<boolean>
  loadScript: (scriptData: ScriptData) => Promise<boolean>
  clearScript: () => void
  stopPlayback: () => void
  clearError: () => void
  /** Direct access to HandyDevice for playback sync */
  getHandyDevice: () => HandyDevice | null
}

const initialState: DeviceState = {
  handyConnected: false,
  handyConnectionKey: '',
  handyDeviceInfo: null,
  handyOffset: 0,
  handyStrokeMin: 0,
  handyStrokeMax: 1,
  scriptLoaded: false,
  scriptUrl: '',
  funscript: null,
  scriptHistory: [],
  error: null,
  isConnecting: false,
  loaded: false,
}

interface PersistedDeviceData {
  handyConnectionKey?: string
  handyOffset?: number
  handyStrokeMin?: number
  handyStrokeMax?: number
}

const persistDevice = (data: PersistedDeviceData) => {
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      const existing: PersistedDeviceData = raw ? JSON.parse(raw) : {}
      return AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, ...data }),
      )
    })
    .catch(() => {})
}

const persistHistory = (history: ScriptHistoryEntry[]) => {
  AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => {})
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  ...initialState,

  load: async () => {
    try {
      const [raw, historyRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ])
      const update: Partial<DeviceState> = { loaded: true }
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedDeviceData
        update.handyConnectionKey = parsed.handyConnectionKey ?? ''
        if (parsed.handyOffset !== undefined)
          update.handyOffset = parsed.handyOffset
        if (parsed.handyStrokeMin !== undefined)
          update.handyStrokeMin = parsed.handyStrokeMin
        if (parsed.handyStrokeMax !== undefined)
          update.handyStrokeMax = parsed.handyStrokeMax
      }
      if (historyRaw) {
        update.scriptHistory = JSON.parse(historyRaw) as ScriptHistoryEntry[]
      }
      set(update)
    } catch {
      set({ loaded: true })
    }
  },

  connectHandy: async (connectionKey: string) => {
    set({ isConnecting: true, error: null })
    persistDevice({ handyConnectionKey: connectionKey })

    try {
      // Reuse or create device
      if (!handyDevice) {
        handyDevice = new HandyDevice({
          connectionKey,
          applicationId: APPLICATION_ID,
        })

        // Set up event listeners
        handyDevice.on('connected', (deviceInfo: unknown) => {
          set({
            handyConnected: true,
            handyDeviceInfo: (deviceInfo as DeviceInfo) ?? null,
          })
        })

        handyDevice.on('disconnected', () => {
          set({
            handyConnected: false,
            handyDeviceInfo: null,
            scriptLoaded: false,
          })
        })

        handyDevice.on('error', (err: unknown) => {
          const msg = typeof err === 'string' ? err : String(err)
          set({ error: `Handy: ${msg}` })
        })
      } else {
        await handyDevice.updateConfig({ connectionKey })
      }

      const success = await handyDevice.connect()

      if (success) {
        const dm = getDeviceManager()
        dm.registerDevice(handyDevice)

        const info = handyDevice.getDeviceInfo()
        set({
          handyConnected: true,
          handyConnectionKey: connectionKey,
          handyDeviceInfo: info,
          isConnecting: false,
        })

        // Apply saved offset & stroke settings
        const { handyOffset, handyStrokeMin, handyStrokeMax, funscript } = get()
        await handyDevice
          .updateConfig({
            offset: handyOffset,
            stroke: { min: handyStrokeMin, max: handyStrokeMax },
          })
          .catch(() => {})

        // If a script was already loaded, prepare it on the device
        if (funscript) {
          await handyDevice.prepareScript(funscript)
        }

        return true
      }

      set({ isConnecting: false, error: 'Failed to connect to Handy' })
      return false
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      set({ isConnecting: false, error: `Connection error: ${msg}` })
      return false
    }
  },

  setHandyOffset: async (offset: number) => {
    set({ handyOffset: offset })
    persistDevice({ handyOffset: offset })
    if (handyDevice && get().handyConnected) {
      try {
        await handyDevice.updateConfig({ offset })
        return true
      } catch {
        return false
      }
    }
    return true
  },

  setHandyStrokeSettings: async (min: number, max: number) => {
    set({ handyStrokeMin: min, handyStrokeMax: max })
    persistDevice({ handyStrokeMin: min, handyStrokeMax: max })
    if (handyDevice && get().handyConnected) {
      try {
        await handyDevice.updateConfig({ stroke: { min, max } })
        return true
      } catch {
        return false
      }
    }
    return true
  },

  disconnectHandy: async () => {
    if (handyDevice) {
      const dm = getDeviceManager()
      dm.unregisterDevice(handyDevice.id)
      await handyDevice.disconnect()
    }
    set({
      handyConnected: false,
      handyDeviceInfo: null,
      scriptLoaded: false,
      error: null,
    })
  },

  loadScript: async (scriptData: ScriptData) => {
    set({ error: null })

    try {
      const dm = getDeviceManager()
      const result = await dm.loadScript(scriptData)

      if (result.success && result.funscript) {
        const url = scriptData.url ?? ''
        // Add to history (dedupe by url, most recent first)
        const prev = get().scriptHistory.filter((e) => e.url !== url)
        const history = [{ url, timestamp: Date.now() }, ...prev].slice(
          0,
          MAX_HISTORY,
        )
        persistHistory(history)

        set({
          scriptLoaded: true,
          scriptUrl: url,
          funscript: result.funscript,
          scriptHistory: history,
        })
        return true
      }

      set({ error: result.error ?? 'Failed to load script' })
      return false
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      set({ error: `Script error: ${msg}` })
      return false
    }
  },

  clearScript: () => {
    if (handyDevice) {
      handyDevice.stop().catch(() => {})
    }
    const dm = getDeviceManager()
    dm.clearScript()
    set({ scriptLoaded: false, scriptUrl: '', funscript: null })
  },

  stopPlayback: () => {
    if (handyDevice) {
      handyDevice.stop().catch(() => {})
    }
  },

  clearError: () => set({ error: null }),

  getHandyDevice: () => handyDevice,
}))

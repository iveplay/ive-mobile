import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeviceManager, HandyDevice } from 'ive-connect'
import type { DeviceInfo, Funscript, ScriptData } from 'ive-connect'
import { create } from 'zustand'

const STORAGE_KEY = 'ive-device'
const APPLICATION_ID = 'h_Jw26kJiyU3JZ2vV_X5TYutefunJJKe'

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
  scriptLoaded: boolean
  scriptUrl: string
  funscript: Funscript | null
  error: string | null
  isConnecting: boolean
  loaded: boolean
}

interface DeviceStore extends DeviceState {
  load: () => Promise<void>
  connectHandy: (connectionKey: string) => Promise<boolean>
  disconnectHandy: () => Promise<void>
  loadScript: (scriptData: ScriptData) => Promise<boolean>
  clearScript: () => void
  clearError: () => void
  /** Direct access to HandyDevice for playback sync */
  getHandyDevice: () => HandyDevice | null
}

const initialState: DeviceState = {
  handyConnected: false,
  handyConnectionKey: '',
  handyDeviceInfo: null,
  scriptLoaded: false,
  scriptUrl: '',
  funscript: null,
  error: null,
  isConnecting: false,
  loaded: false,
}

const persistKey = (key: string) => {
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ handyConnectionKey: key }),
  ).catch(() => {})
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  ...initialState,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { handyConnectionKey?: string }
        set({
          handyConnectionKey: parsed.handyConnectionKey ?? '',
          loaded: true,
        })
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },

  connectHandy: async (connectionKey: string) => {
    set({ isConnecting: true, error: null })
    persistKey(connectionKey)

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

        // If a script was already loaded, prepare it on the device
        const { funscript } = get()
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
        set({
          scriptLoaded: true,
          scriptUrl: scriptData.url ?? '',
          funscript: result.funscript,
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
    const dm = getDeviceManager()
    dm.clearScript()
    set({ scriptLoaded: false, scriptUrl: '', funscript: null })
  },

  clearError: () => set({ error: null }),

  getHandyDevice: () => handyDevice,
}))

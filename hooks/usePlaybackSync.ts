import { useEffect, useRef } from 'react'
import { useDeviceStore } from '@/store/useDeviceStore'
import { useVideoStore } from '@/store/useVideoStore'

/**
 * Bridges video playback state to the Handy device.
 *
 * Subscribes to the video store and drives play/stop/sync
 * on the connected Handy device. Mirrors the sync timeout
 * pattern from the browser extension's PlaybackManager:
 * - Sync at 2s (filter 0.9 — tight)
 * - Sync at 17s then every 15s (filter 0.5 — loose)
 */
export function usePlaybackSync() {
  const syncTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const lastTimeMs = useRef(0)

  const handyConnected = useDeviceStore((s) => s.handyConnected)
  const scriptLoaded = useDeviceStore((s) => s.scriptLoaded)
  const getHandyDevice = useDeviceStore((s) => s.getHandyDevice)

  const isPlaying = useVideoStore((s) => s.isPlaying)
  const currentTimeMs = useVideoStore((s) => s.currentTimeMs)
  const playbackRate = useVideoStore((s) => s.playbackRate)

  // Keep latest time in ref for sync callbacks
  useEffect(() => {
    lastTimeMs.current = currentTimeMs
  }, [currentTimeMs])

  // Main play/stop sync
  useEffect(() => {
    if (!handyConnected || !scriptLoaded) return

    const device = getHandyDevice()
    if (!device) return

    const clearSyncTimeouts = () => {
      syncTimeouts.current.forEach((t) => clearTimeout(t))
      syncTimeouts.current = []
    }

    if (isPlaying) {
      // Start playback on device
      device.play(currentTimeMs, playbackRate).catch(() => {})

      // Setup sync timeouts (same pattern as extension)
      clearSyncTimeouts()

      // First sync at 2s — tight filter
      syncTimeouts.current.push(
        setTimeout(() => {
          if (useVideoStore.getState().isPlaying) {
            device.syncTime(lastTimeMs.current, 0.9).catch(() => {})
          }
        }, 2000),
      )

      // Second sync at 17s, then every 15s — loose filter
      syncTimeouts.current.push(
        setTimeout(() => {
          if (useVideoStore.getState().isPlaying) {
            device.syncTime(lastTimeMs.current, 0.5).catch(() => {})

            const interval = setInterval(() => {
              if (useVideoStore.getState().isPlaying) {
                device.syncTime(lastTimeMs.current, 0.5).catch(() => {})
              }
            }, 15000)

            syncTimeouts.current.push(interval)
          }
        }, 17000),
      )
    } else {
      // Stop playback on device
      clearSyncTimeouts()
      device.stop().catch(() => {})
    }

    return () => {
      clearSyncTimeouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, handyConnected, scriptLoaded])

  // Re-sync on playback rate change while playing
  useEffect(() => {
    if (!isPlaying || !handyConnected || !scriptLoaded) return

    const device = getHandyDevice()
    if (!device) return

    // Re-start at current time with new rate
    device.play(lastTimeMs.current, playbackRate).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackRate])
}

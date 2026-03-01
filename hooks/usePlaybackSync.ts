import { useEffect, useRef } from 'react'
import { useDeviceStore } from '@/store/useDeviceStore'
import { useVideoStore } from '@/store/useVideoStore'

/**
 * Bridges video playback state to connected devices (Handy & Autoblow).
 *
 * Subscribes to the video store and drives play/stop/sync
 * on connected devices. Mirrors the sync timeout pattern
 * from the browser extension's PlaybackManager:
 * - Handy: Sync at 2s (filter 0.9), then at 17s + every 15s (filter 0.5)
 * - Autoblow: Play/stop only (no periodic sync, per extension behavior)
 */
export function usePlaybackSync() {
  const syncTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])
  const lastTimeMs = useRef(0)

  const handyConnected = useDeviceStore((s) => s.handyConnected)
  const autoblowConnected = useDeviceStore((s) => s.autoblowConnected)
  const scriptLoaded = useDeviceStore((s) => s.scriptLoaded)
  const getHandyDevice = useDeviceStore((s) => s.getHandyDevice)
  const getAutoblowDevice = useDeviceStore((s) => s.getAutoblowDevice)

  const isPlaying = useVideoStore((s) => s.isPlaying)
  const currentTimeMs = useVideoStore((s) => s.currentTimeMs)
  const playbackRate = useVideoStore((s) => s.playbackRate)

  const anyDeviceConnected = handyConnected || autoblowConnected

  // Keep latest time in ref for sync callbacks
  useEffect(() => {
    lastTimeMs.current = currentTimeMs
  }, [currentTimeMs])

  // Main play/stop sync
  useEffect(() => {
    if (!anyDeviceConnected || !scriptLoaded) return

    const handyDevice = getHandyDevice()
    const autoblowDevice = getAutoblowDevice()

    const clearSyncTimeouts = () => {
      syncTimeouts.current.forEach((t) => clearTimeout(t))
      syncTimeouts.current = []
    }

    if (isPlaying) {
      // Start playback on all connected devices
      if (handyConnected && handyDevice) {
        handyDevice.play(currentTimeMs, playbackRate).catch(() => {})
      }
      if (autoblowConnected && autoblowDevice) {
        autoblowDevice.play(currentTimeMs, playbackRate).catch(() => {})
      }

      // Setup Handy sync timeouts (same pattern as extension)
      clearSyncTimeouts()

      if (handyConnected && handyDevice) {
        // First sync at 2s — tight filter
        syncTimeouts.current.push(
          setTimeout(() => {
            if (useVideoStore.getState().isPlaying) {
              handyDevice.syncTime(lastTimeMs.current, 0.9).catch(() => {})
            }
          }, 2000),
        )

        // Second sync at 17s, then every 15s — loose filter
        syncTimeouts.current.push(
          setTimeout(() => {
            if (useVideoStore.getState().isPlaying) {
              handyDevice.syncTime(lastTimeMs.current, 0.5).catch(() => {})

              const interval = setInterval(() => {
                if (useVideoStore.getState().isPlaying) {
                  handyDevice.syncTime(lastTimeMs.current, 0.5).catch(() => {})
                }
              }, 15000)

              syncTimeouts.current.push(interval)
            }
          }, 17000),
        )
      }
    } else {
      // Stop playback on all connected devices
      clearSyncTimeouts()
      if (handyConnected && handyDevice) {
        handyDevice.stop().catch(() => {})
      }
      if (autoblowConnected && autoblowDevice) {
        autoblowDevice.stop().catch(() => {})
      }
    }

    return () => {
      clearSyncTimeouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, handyConnected, autoblowConnected, scriptLoaded])

  // Re-sync on playback rate change while playing
  useEffect(() => {
    if (!isPlaying || !anyDeviceConnected || !scriptLoaded) return

    if (handyConnected) {
      const handyDevice = getHandyDevice()
      if (handyDevice) {
        handyDevice.play(lastTimeMs.current, playbackRate).catch(() => {})
      }
    }

    if (autoblowConnected) {
      const autoblowDevice = getAutoblowDevice()
      if (autoblowDevice) {
        autoblowDevice.play(lastTimeMs.current, playbackRate).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackRate])
}

import { create } from 'zustand'
import type { VideoEventPayload } from '@/utils/types'

interface VideoState {
  /** Videos detected on the page (not yet selected) */
  videosAvailable: boolean
  /** User has tapped "Sync" on a specific video */
  hasVideo: boolean
  isPlaying: boolean
  currentTimeMs: number
  durationMs: number
  playbackRate: number
  volume: number
  muted: boolean
  isBuffering: boolean
}

interface VideoStore extends VideoState {
  handleVideoEvent: (type: string, payload: VideoEventPayload) => void
  /** Pause locally — keeps video selection & state, just marks not playing */
  pause: () => void
  reset: () => void
}

const initialState: VideoState = {
  videosAvailable: false,
  hasVideo: false,
  isPlaying: false,
  currentTimeMs: 0,
  durationMs: 0,
  playbackRate: 1,
  volume: 1,
  muted: false,
  isBuffering: false,
}

export const useVideoStore = create<VideoStore>((set) => ({
  ...initialState,

  handleVideoEvent: (type, payload) => {
    const base = {
      currentTimeMs: payload.currentTimeMs,
      durationMs: payload.durationMs,
      playbackRate: payload.playbackRate,
      volume: payload.volume,
      muted: payload.muted,
      isPlaying: !payload.paused,
    }

    switch (type) {
      case 'video:available':
        // Videos found on page but user hasn't selected one yet
        set({ videosAvailable: true })
        break
      case 'video:found':
        // User tapped "Sync" — this video is now selected
        set({
          ...base,
          hasVideo: true,
          videosAvailable: false,
          isBuffering: false,
        })
        break
      case 'video:lost':
        set(initialState)
        break
      case 'video:play':
      case 'video:playing':
        set({ ...base, hasVideo: true, isBuffering: false })
        break
      case 'video:pause':
      case 'video:ended':
        set({ ...base, hasVideo: true, isBuffering: false })
        break
      case 'video:waiting':
        set({ ...base, hasVideo: true, isBuffering: true })
        break
      case 'video:seeking':
      case 'video:seeked':
      case 'video:ratechange':
      case 'video:timeupdate':
      case 'video:durationchange':
      case 'video:volumechange':
        set({ ...base, hasVideo: true })
        break
    }
  },

  pause: () => set({ isPlaying: false }),

  reset: () => set(initialState),
}))

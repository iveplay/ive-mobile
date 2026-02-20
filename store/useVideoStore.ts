import { create } from 'zustand'
import type { VideoEventPayload } from '@/utils/types'

interface VideoState {
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
  reset: () => void
}

const initialState: VideoState = {
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
      case 'video:found':
      case 'video:play':
      case 'video:playing':
        set({ ...base, hasVideo: true, isBuffering: false })
        break
      case 'video:lost':
        set(initialState)
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

  reset: () => set(initialState),
}))

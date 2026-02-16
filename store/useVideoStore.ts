import { create } from 'zustand'
import type { VideoInfo } from '@/utils/types'

interface VideoStore {
  video: VideoInfo | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number
  volume: number
  isMuted: boolean
  isBuffering: boolean

  setVideo: (video: VideoInfo | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
  setIsMuted: (muted: boolean) => void
  setIsBuffering: (buffering: boolean) => void
  reset: () => void
}

const initialState = {
  video: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  isMuted: false,
  isBuffering: false,
}

export const useVideoStore = create<VideoStore>((set) => ({
  ...initialState,

  setVideo: (video) => set({ video }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setVolume: (volume) => set({ volume }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  reset: () => set(initialState),
}))

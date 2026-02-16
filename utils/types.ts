export interface Tab {
  id: string
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
}

export type BridgeMessageType =
  | 'VIDEO_DETECTED'
  | 'VIDEO_NOT_FOUND'
  | 'VIDEO_EVENT'
  | 'IVEPLAY_BRIDGE'

export interface BridgeMessage {
  type: BridgeMessageType
  data?: unknown
  event?: string
  message?: IvePlayMessage
}

export interface VideoInfo {
  width: number
  height: number
  src: string
  duration: number
  paused: boolean
}

export interface VideoEventData {
  currentTime?: number
  duration?: number
  playbackRate?: number
  volume?: number
  muted?: boolean
}

export interface IvePlayMessage {
  from: 'iveplay'
  id: number
  type: string
  [key: string]: unknown
}

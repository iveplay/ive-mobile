export interface Tab {
  id: string
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
  reloadFlag: number
}

/** Message envelope sent from injected JS to React Native */
export interface IveWebViewMessage {
  from: 'ive-injected'
  type: IveMessageType
  payload: VideoEventPayload
}

export type IveMessageType =
  | 'video:found'
  | 'video:lost'
  | 'video:play'
  | 'video:pause'
  | 'video:seeking'
  | 'video:seeked'
  | 'video:ratechange'
  | 'video:timeupdate'
  | 'video:durationchange'
  | 'video:volumechange'
  | 'video:waiting'
  | 'video:playing'
  | 'video:ended'

export interface VideoEventPayload {
  currentTimeMs: number
  durationMs: number
  playbackRate: number
  volume: number
  muted: boolean
  paused: boolean
}

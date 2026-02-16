import type WebView from 'react-native-webview'
import { useVideoStore } from '@/store/useVideoStore'
import type { BridgeMessage, VideoEventData } from '@/utils/types'

const APP_VERSION = '1.0.0'

export function handleWebViewMessage(
  event: { nativeEvent: { data: string } },
  webViewRef: React.RefObject<WebView | null>,
) {
  let message: BridgeMessage
  try {
    message = JSON.parse(event.nativeEvent.data)
  } catch {
    return
  }

  switch (message.type) {
    case 'VIDEO_DETECTED':
      useVideoStore
        .getState()
        .setVideo(
          message.data as ReturnType<typeof useVideoStore.getState>['video'],
        )
      break

    case 'VIDEO_NOT_FOUND':
      useVideoStore.getState().reset()
      break

    case 'VIDEO_EVENT':
      handleVideoEvent(message.event!, message.data as VideoEventData)
      break

    case 'IVEPLAY_BRIDGE':
      handleIvePlayMessage(message.message!, webViewRef)
      break
  }
}

function handleVideoEvent(event: string, data: VideoEventData) {
  const store = useVideoStore.getState()

  switch (event) {
    case 'play':
      store.setIsPlaying(true)
      store.setIsBuffering(false)
      if (data.currentTime != null) store.setCurrentTime(data.currentTime)
      if (data.duration != null) store.setDuration(data.duration)
      if (data.playbackRate != null) store.setPlaybackRate(data.playbackRate)
      break

    case 'pause':
      store.setIsPlaying(false)
      store.setIsBuffering(false)
      if (data.currentTime != null) store.setCurrentTime(data.currentTime)
      if (data.duration != null) store.setDuration(data.duration)
      break

    case 'seeking':
      if (data.currentTime != null) store.setCurrentTime(data.currentTime)
      if (data.duration != null) store.setDuration(data.duration)
      break

    case 'ratechange':
      if (data.currentTime != null) store.setCurrentTime(data.currentTime)
      if (data.duration != null) store.setDuration(data.duration)
      if (data.playbackRate != null) store.setPlaybackRate(data.playbackRate)
      break

    case 'timeupdate':
      if (data.currentTime != null) store.setCurrentTime(data.currentTime)
      break

    case 'durationchange':
      if (data.duration != null) store.setDuration(data.duration)
      break

    case 'volumechange':
      if (data.volume != null) store.setVolume(data.volume)
      if (data.muted != null) store.setIsMuted(data.muted)
      break

    case 'waiting':
      store.setIsBuffering(true)
      break

    case 'playing':
      store.setIsBuffering(false)
      break
  }
}

function handleIvePlayMessage(
  message: { id: number; type: string; [key: string]: unknown },
  webViewRef: React.RefObject<WebView | null>,
) {
  let response: unknown = null
  let error: string | null = null

  switch (message.type) {
    case 'ive:ivedb:ping':
      response = { available: true, version: APP_VERSION }
      break

    default:
      // Log unhandled messages for future implementation
      console.log('[IVE Bridge] Unhandled:', message.type)
      error = `Not implemented: ${message.type}`
      break
  }

  // Respond back to the page as if we're the extension
  const script = `
    window.postMessage({
      from: 'ive-extension',
      id: ${message.id},
      data: ${JSON.stringify(response)},
      error: ${JSON.stringify(error)},
    }, '*');
    true;
  `
  webViewRef.current?.injectJavaScript(script)
}

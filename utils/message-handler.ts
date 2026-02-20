import type { WebViewMessageEvent } from 'react-native-webview'
import { useVideoStore } from '@/store/useVideoStore'
import type { IveWebViewMessage } from '@/utils/types'

/**
 * Handle messages from the WebView's injected JavaScript.
 * Called by WebViewContainer's onMessage prop.
 */
export const handleWebViewMessage = (event: WebViewMessageEvent): void => {
  let parsed: unknown
  try {
    parsed = JSON.parse(event.nativeEvent.data)
  } catch {
    return
  }

  if (typeof parsed !== 'object' || parsed === null || !('from' in parsed)) {
    return
  }

  const message = parsed as { from: string }

  switch (message.from) {
    case 'ive-injected': {
      const videoMsg = parsed as IveWebViewMessage
      useVideoStore.getState().handleVideoEvent(videoMsg.type, videoMsg.payload)
      break
    }
  }
}

import type { WebViewMessageEvent } from 'react-native-webview'
import type WebView from 'react-native-webview'
import { useVideoStore } from '@/store/useVideoStore'
import { handleBridgeMessage } from '@/utils/bridge-handler'
import type { IveWebViewMessage } from '@/utils/types'

/**
 * Creates a message handler bound to a WebView ref for responding
 * to bridge messages. Video events don't need a response.
 */
export function createMessageHandler(
  webViewRef: React.RefObject<WebView | null>,
) {
  return (event: WebViewMessageEvent): void => {
    let parsed: unknown
    console.log('Received message from WebView:', event.nativeEvent.data) // Debug log
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
      // Video detection events (no response needed)
      case 'ive-injected': {
        const videoMsg = parsed as IveWebViewMessage
        useVideoStore
          .getState()
          .handleVideoEvent(videoMsg.type, videoMsg.payload)
        break
      }

      // Bridge messages from ive-play (need response via WebView)
      case 'iveplay': {
        const bridgeMsg = parsed as {
          from: 'iveplay'
          id: number
          type: string
          [key: string]: unknown
        }

        handleBridgeMessage(bridgeMsg, (response) => {
          const json = JSON.stringify(response)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
          webViewRef.current?.injectJavaScript(
            `window.__ive_bridge_respond('${json}'); true;`,
          )
        })
        break
      }
    }
  }
}

import { forwardRef, useCallback, useRef, useEffect, RefObject } from 'react'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import type {
  WebViewNavigation,
  WebViewMessageEvent,
} from 'react-native-webview'
import { useTabStore } from '@/store/useTabStore'
import { useVideoStore } from '@/store/useVideoStore'
import { handleWebViewMessage } from '@/utils/messageHandler'

interface Props {
  tabId: string
  url: string
}

const WebViewContainer = forwardRef<WebView, Props>(({ tabId, url }, ref) => {
  const updateTab = useTabStore((s) => s.updateTab)
  const addTab = useTabStore((s) => s.addTab)
  const resetVideo = useVideoStore((s) => s.reset)

  // Track the URL the WebView is actually showing to avoid
  // re-navigating when onNavigationStateChange updates the store
  const currentWebViewUrl = useRef(url)

  // When the URL prop changes (user typed in bar or pressed home),
  // navigate the WebView if it differs from what's already loaded
  useEffect(() => {
    if (url !== currentWebViewUrl.current) {
      currentWebViewUrl.current = url
      // source prop change will trigger navigation
    }
  }, [url])

  const onNavigationStateChange = useCallback(
    (nav: WebViewNavigation) => {
      currentWebViewUrl.current = nav.url
      updateTab(tabId, {
        url: nav.url,
        title: nav.title || '',
        canGoBack: nav.canGoBack,
        canGoForward: nav.canGoForward,
      })
    },
    [tabId, updateTab],
  )

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      handleWebViewMessage(event, ref as RefObject<WebView | null>)
    },
    [ref],
  )

  const onLoadStart = useCallback(() => {
    resetVideo()
  }, [resetVideo])

  const onOpenWindow = useCallback(
    (event: { nativeEvent: { targetUrl: string } }) => {
      addTab(event.nativeEvent.targetUrl)
    },
    [addTab],
  )

  return (
    <WebView
      ref={ref}
      source={{ uri: url }}
      style={styles.webview}
      onNavigationStateChange={onNavigationStateChange}
      onMessage={onMessage}
      onLoadStart={onLoadStart}
      onOpenWindow={onOpenWindow}
      // Privacy — WebView is sandboxed from system browser,
      // so browsing never appears in Chrome/Safari history.
      // Keep incognito off so login sessions persist within the app.
      incognito={false}
      // Media
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      // Performance
      androidLayerType='hardware'
      // Allow navigation
      allowsBackForwardNavigationGestures
      allowsPictureInPictureMediaPlayback
      allowsAirPlayForMediaPlayback
    />
  )
})

WebViewContainer.displayName = 'WebViewContainer'

export default WebViewContainer

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
})

import { forwardRef, useCallback, useRef, useEffect, useMemo } from 'react'
import { WebView } from 'react-native-webview'
import type { WebViewNavigation } from 'react-native-webview'
import { useTabStore } from '@/store/useTabStore'
import { INJECTED_VIDEO_DETECTION_JS } from '@/utils/injected-js'
import { createMessageHandler } from '@/utils/message-handler'

interface Props {
  tabId: string
  url: string
  reloadFlag: number
  onWebViewRef?: (tabId: string, ref: WebView | null) => void
}

const WebViewContainer = forwardRef<WebView, Props>(
  ({ tabId, url, reloadFlag, onWebViewRef }, ref) => {
    const updateTab = useTabStore((s) => s.updateTab)
    const addTab = useTabStore((s) => s.addTab)

    const internalRef = useRef<WebView | null>(null)
    const prevReloadFlag = useRef(reloadFlag)

    // Track the URL the WebView is actually showing to avoid
    // re-navigating when onNavigationStateChange updates the store
    const currentWebViewUrl = useRef(url)

    // Create message handler bound to this WebView's ref for bridge responses
    const handleMessage = useMemo(() => createMessageHandler(internalRef), [])

    // Callback ref to register with parent and forward to forwardRef
    const setRef = useCallback(
      (instance: WebView | null) => {
        internalRef.current = instance
        // Forward to parent's forwardRef
        if (typeof ref === 'function') {
          ref(instance)
        } else if (ref) {
          ;(ref as React.RefObject<WebView | null>).current = instance
        }
        // Register in parent's ref map
        onWebViewRef?.(tabId, instance)
      },
      [ref, tabId, onWebViewRef],
    )

    // When the URL prop changes (user typed in bar or pressed home),
    // navigate the WebView if it differs from what's already loaded
    useEffect(() => {
      if (url !== currentWebViewUrl.current) {
        currentWebViewUrl.current = url
        // source prop change will trigger navigation
      }
    }, [url])

    // Reload when reloadFlag is bumped from outside (e.g. settings)
    useEffect(() => {
      if (reloadFlag > 0 && reloadFlag !== prevReloadFlag.current) {
        prevReloadFlag.current = reloadFlag
        internalRef.current?.reload()
      }
    }, [reloadFlag])

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

    const onOpenWindow = useCallback(
      (event: { nativeEvent: { targetUrl: string } }) => {
        addTab(event.nativeEvent.targetUrl)
      },
      [addTab],
    )

    return (
      <WebView
        ref={setRef}
        source={{ uri: url }}
        style={{ flex: 1 }}
        onNavigationStateChange={onNavigationStateChange}
        onOpenWindow={onOpenWindow}
        onMessage={handleMessage}
        injectedJavaScript={INJECTED_VIDEO_DETECTION_JS}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType='hardware'
        allowsInlineMediaPlayback
        allowsBackForwardNavigationGestures
        allowsPictureInPictureMediaPlayback
        allowsAirPlayForMediaPlayback
        allowsFullscreenVideo
      />
    )
  },
)

WebViewContainer.displayName = 'WebViewContainer'

export default WebViewContainer

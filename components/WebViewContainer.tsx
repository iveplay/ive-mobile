import { forwardRef, useCallback, useRef, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import type {
  WebViewNavigation,
  WebViewMessageEvent,
} from 'react-native-webview'
import { useTabStore } from '@/store/useTabStore'
import { useVideoStore } from '@/store/useVideoStore'
import {
  pauseAllMediaJS,
  resumeAudioContextsJS,
  trackAudioContextsJS,
} from '@/utils/injected-scripts'
import { handleWebViewMessage } from '@/utils/messageHandler'

interface Props {
  tabId: string
  url: string
  reloadFlag: number
  isActive: boolean
  onWebViewRef?: (tabId: string, ref: WebView | null) => void
}

// Combine all scripts that run on page load
const initialInjectedJS = [trackAudioContextsJS].join('\n')

const WebViewContainer = forwardRef<WebView, Props>(
  ({ tabId, url, reloadFlag, isActive, onWebViewRef }, ref) => {
    const updateTab = useTabStore((s) => s.updateTab)
    const addTab = useTabStore((s) => s.addTab)
    const resetVideo = useVideoStore((s) => s.reset)

    const internalRef = useRef<WebView | null>(null)
    const wasActive = useRef(isActive)
    const prevReloadFlag = useRef(reloadFlag)

    // Track the URL the WebView is actually showing to avoid
    // re-navigating when onNavigationStateChange updates the store
    const currentWebViewUrl = useRef(url)

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

    // Pause all media when tab becomes inactive, resume audio contexts when active
    useEffect(() => {
      if (wasActive.current && !isActive && internalRef.current) {
        internalRef.current.injectJavaScript(pauseAllMediaJS)
      }
      if (!wasActive.current && isActive && internalRef.current) {
        internalRef.current.injectJavaScript(resumeAudioContextsJS)
      }
      wasActive.current = isActive
    }, [isActive])

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
        if (!isActive) return
        handleWebViewMessage(event, { current: internalRef.current })
      },
      [isActive],
    )

    const onLoadStart = useCallback(() => {
      if (isActive) resetVideo()
    }, [isActive, resetVideo])

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
        style={styles.webview}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={onMessage}
        onLoadStart={onLoadStart}
        onOpenWindow={onOpenWindow}
        injectedJavaScript={initialInjectedJS}
        incognito={false}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidLayerType='hardware'
        allowsBackForwardNavigationGestures
        allowsPictureInPictureMediaPlayback
        allowsAirPlayForMediaPlayback
      />
    )
  },
)

WebViewContainer.displayName = 'WebViewContainer'

export default WebViewContainer

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
})

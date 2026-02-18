import { useCallback, useEffect, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type WebView from 'react-native-webview'
import BrowserBar from '@/components/BrowserBar'
import NewTabPage from '@/components/NewTabPage'
import WebViewContainer from '@/components/WebViewContainer'
import { MAX_ALIVE_TABS } from '@/constants/browser'
import { COLORS } from '@/constants/theme'
import { useTabStore } from '@/store/useTabStore'

export default function BrowserScreen() {
  const webViewRefs = useRef<Map<string, WebView>>(new Map())
  const tabs = useTabStore((s) => s.tabs)
  const currentTabId = useTabStore((s) => s.currentTabId)
  const updateTab = useTabStore((s) => s.updateTab)

  // Track recently-used tab order for eviction (most recent first)
  const recentOrder = useRef<string[]>([currentTabId])

  useEffect(() => {
    recentOrder.current = [
      currentTabId,
      ...recentOrder.current.filter((id) => id !== currentTabId),
    ]
    // Clean up refs for tabs that no longer exist
    const tabIds = new Set(tabs.map((t) => t.id))
    recentOrder.current = recentOrder.current.filter((id) => tabIds.has(id))
    for (const [id] of webViewRefs.current) {
      if (!tabIds.has(id)) webViewRefs.current.delete(id)
    }
  }, [currentTabId, tabs])

  // Determine which tabs should stay alive (mounted)
  const aliveTabIds = new Set(recentOrder.current.slice(0, MAX_ALIVE_TABS))
  // Always include the current tab
  aliveTabIds.add(currentTabId)

  const handleWebViewRef = useCallback(
    (tabId: string, ref: WebView | null) => {
      if (ref) {
        webViewRefs.current.set(tabId, ref)
      } else {
        webViewRefs.current.delete(tabId)
      }
    },
    [],
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BrowserBar webViewRefs={webViewRefs} />
      <View style={styles.content}>
        {tabs.map((t) => {
          const isActive = t.id === currentTabId
          const isAlive = aliveTabIds.has(t.id)
          const isBlank = !t.url

          // Don't mount evicted or blank tabs
          if (!isAlive || isBlank) {
            // Show NewTabPage only for the active blank tab
            if (isActive && isBlank) {
              return (
                <NewTabPage
                  key={t.id}
                  onNavigate={(url) => updateTab(t.id, { url })}
                />
              )
            }
            return null
          }

          return (
            <View
              key={t.id}
              style={isActive ? styles.activeTab : styles.hiddenTab}
            >
              <WebViewContainer
                tabId={t.id}
                url={t.url}
                reloadFlag={t.reloadFlag}
                isActive={isActive}
                onWebViewRef={handleWebViewRef}
              />
            </View>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  activeTab: {
    flex: 1,
  },
  hiddenTab: {
    display: 'none',
  },
})

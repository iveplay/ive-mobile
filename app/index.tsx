import { useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type WebView from 'react-native-webview'
import BrowserBar from '@/components/BrowserBar'
import NewTabPage from '@/components/NewTabPage'
import WebViewContainer from '@/components/WebViewContainer'
import { COLORS } from '@/constants/theme'
import { useCurrentTab, useTabStore } from '@/store/useTabStore'

export default function BrowserScreen() {
  const webViewRef = useRef<WebView | null>(null)
  const tab = useCurrentTab()
  const currentTabId = useTabStore((s) => s.currentTabId)
  const updateTab = useTabStore((s) => s.updateTab)

  const isBlank = !tab.url

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <BrowserBar webViewRef={webViewRef} />
      <View style={styles.content}>
        {isBlank ? (
          <NewTabPage onNavigate={(url) => updateTab(tab.id, { url })} />
        ) : (
          <WebViewContainer
            key={currentTabId}
            ref={webViewRef}
            tabId={tab.id}
            url={tab.url}
          />
        )}
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
})

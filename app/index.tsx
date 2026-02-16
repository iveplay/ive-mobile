import { useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type WebView from 'react-native-webview'
import BrowserBar from '@/components/BrowserBar'
import WebViewContainer from '@/components/WebViewContainer'
import { COLORS } from '@/constants/theme'
import { useCurrentTab, useTabStore } from '@/store/useTabStore'

export default function BrowserScreen() {
  const webViewRef = useRef<WebView | null>(null)
  const tab = useCurrentTab()
  const currentTabId = useTabStore((s) => s.currentTabId)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <WebViewContainer
          key={currentTabId}
          ref={webViewRef}
          tabId={tab.id}
          url={tab.url}
        />
      </View>
      <BrowserBar webViewRef={webViewRef} />
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe} />
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
  bottomSafe: {
    backgroundColor: COLORS.surface,
  },
})

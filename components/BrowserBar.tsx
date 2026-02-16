import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import type WebView from 'react-native-webview'
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme'
import { DEFAULT_HOME_URL } from '@/constants/urls'
import { useCurrentTab, useTabStore } from '@/store/useTabStore'

interface Props {
  webViewRef: React.RefObject<WebView | null>
}

export default function BrowserBar({ webViewRef }: Props) {
  const router = useRouter()
  const tab = useCurrentTab()
  const tabs = useTabStore((s) => s.tabs)
  const updateTab = useTabStore((s) => s.updateTab)

  const [inputUrl, setInputUrl] = useState(tab.url)
  const [isFocused, setIsFocused] = useState(false)

  // Sync input with current tab URL when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputUrl(tab.url)
    }
  }, [tab.url, isFocused])

  const navigate = useCallback(
    (url: string) => {
      let trimmed = url.trim()
      if (!trimmed) return

      // If it looks like a search query, don't add protocol
      const isUrl = trimmed.includes('.') && !trimmed.includes(' ')

      if (!isUrl) {
        trimmed = `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`
      } else if (
        !trimmed.startsWith('http://') &&
        !trimmed.startsWith('https://')
      ) {
        trimmed = `https://${trimmed}`
      }

      updateTab(tab.id, { url: trimmed })
      setInputUrl(trimmed)
      Keyboard.dismiss()
    },
    [tab.id, updateTab],
  )

  const handleBack = useCallback(() => {
    webViewRef.current?.goBack()
  }, [webViewRef])

  const handleForward = useCallback(() => {
    webViewRef.current?.goForward()
  }, [webViewRef])

  const handleReload = useCallback(() => {
    webViewRef.current?.reload()
  }, [webViewRef])

  const handleHome = useCallback(() => {
    updateTab(tab.id, { url: DEFAULT_HOME_URL })
    setInputUrl(DEFAULT_HOME_URL)
  }, [tab.id, updateTab])

  const handleTabsPress = useCallback(() => {
    router.push('/tabs')
  }, [router])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setInputUrl(tab.url)
  }, [tab.url])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
  }, [])

  return (
    <View style={styles.container}>
      {/* URL Input */}
      <View style={styles.urlRow}>
        <TextInput
          value={inputUrl}
          onChangeText={setInputUrl}
          onSubmitEditing={() => navigate(inputUrl)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder='Search or enter URL'
          placeholderTextColor={COLORS.textDisabled}
          style={styles.urlInput}
          autoCapitalize='none'
          autoCorrect={false}
          keyboardType='url'
          returnKeyType='go'
          selectTextOnFocus
        />
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={handleBack}
          disabled={!tab.canGoBack}
          style={styles.navButton}
        >
          <Ionicons
            name='chevron-back'
            size={22}
            color={tab.canGoBack ? COLORS.text : COLORS.textDisabled}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForward}
          disabled={!tab.canGoForward}
          style={styles.navButton}
        >
          <Ionicons
            name='chevron-forward'
            size={22}
            color={tab.canGoForward ? COLORS.text : COLORS.textDisabled}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReload} style={styles.navButton}>
          <Ionicons name='refresh' size={20} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHome} style={styles.navButton}>
          <Ionicons name='home-outline' size={20} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTabsPress} style={styles.tabsButton}>
          <View style={styles.tabsBadge}>
            <Text style={styles.tabsCount}>{tabs.length}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    padding: SPACING.sm,
  },
  tabsButton: {
    padding: SPACING.sm,
  },
  tabsBadge: {
    borderWidth: 1.5,
    borderColor: COLORS.text,
    borderRadius: 4,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabsCount: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
})

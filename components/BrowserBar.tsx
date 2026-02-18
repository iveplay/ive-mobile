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
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { buildSearchUrl, useSettingsStore } from '@/store/useSettingsStore'
import { useCurrentTab, useTabStore } from '@/store/useTabStore'

interface Props {
  webViewRefs: React.RefObject<Map<string, WebView>>
}

export default function BrowserBar({ webViewRefs }: Props) {
  const router = useRouter()
  const tab = useCurrentTab()
  const tabs = useTabStore((s) => s.tabs)
  const updateTab = useTabStore((s) => s.updateTab)

  const addFavorite = useFavoriteStore((s) => s.addFavorite)
  const removeFavorite = useFavoriteStore((s) => s.removeFavorite)
  const favorites = useFavoriteStore((s) => s.favorites)

  const searchEngine = useSettingsStore((s) => s.searchEngine)
  const customSearchUrl = useSettingsStore((s) => s.customSearchUrl)

  const [inputUrl, setInputUrl] = useState(tab.url)
  const [isFocused, setIsFocused] = useState(false)

  const isOnPage = !!tab.url
  const favorited = isOnPage && favorites.some((f) => f.url === tab.url)

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

      const isUrl = trimmed.includes('.') && !trimmed.includes(' ')

      if (!isUrl) {
        trimmed = buildSearchUrl(searchEngine, customSearchUrl, trimmed)
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
    [tab.id, updateTab, searchEngine, customSearchUrl],
  )

  const handleBack = useCallback(() => {
    webViewRefs.current?.get(tab.id)?.goBack()
  }, [webViewRefs, tab.id])

  const handleForward = useCallback(() => {
    webViewRefs.current?.get(tab.id)?.goForward()
  }, [webViewRefs, tab.id])

  const handleToggleFavorite = useCallback(() => {
    if (!tab.url) return
    if (favorited) {
      removeFavorite(tab.url)
    } else {
      addFavorite(tab.url, tab.title || tab.url)
    }
  }, [tab.url, tab.title, favorited, addFavorite, removeFavorite])

  const handleTabsPress = useCallback(() => {
    router.push('/tabs')
  }, [router])

  const handleSettingsPress = useCallback(() => {
    router.push('/settings')
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
      <TouchableOpacity
        onPress={handleBack}
        disabled={!tab.canGoBack}
        style={styles.pageNavButton}
      >
        <Ionicons
          name='chevron-back'
          size={20}
          color={tab.canGoBack ? COLORS.text : COLORS.textDisabled}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleForward}
        disabled={!tab.canGoForward}
        style={styles.pageNavButton}
      >
        <Ionicons
          name='chevron-forward'
          size={20}
          color={tab.canGoForward ? COLORS.text : COLORS.textDisabled}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.urlInputWrapper,
          isFocused && styles.urlInputWrapperFocused,
        ]}
      >
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

      {isOnPage && (
        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={styles.navButton}
        >
          <Ionicons
            name={favorited ? 'star' : 'star-outline'}
            size={20}
            color={favorited ? COLORS.warning : COLORS.text}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleTabsPress} style={styles.navButton}>
        <View style={styles.tabsBadge}>
          <Text style={styles.tabsCount}>{tabs.length}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSettingsPress} style={styles.navButton}>
        <Ionicons name='ellipsis-vertical' size={20} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  urlInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  urlInputWrapperFocused: {
    borderColor: COLORS.border,
  },
  urlInput: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    padding: 0,
  },
  pageNavButton: {
    padding: SPACING.sm,
    width: 32,
  },
  navButton: {
    padding: SPACING.sm,
  },
  tabsBadge: {
    borderWidth: 1.5,
    borderColor: COLORS.text,
    borderRadius: 4,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  tabsCount: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
  },
})

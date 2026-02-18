import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useRef, useMemo } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TabCard from '@/components/TabCard'
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useTabStore } from '@/store/useTabStore'
import type { Tab } from '@/utils/types'

export default function TabsScreen() {
  const router = useRouter()
  const listRef = useRef<FlatList>(null)
  const tabs = useTabStore((s) => s.tabs)
  const currentTabId = useTabStore((s) => s.currentTabId)
  const switchTab = useTabStore((s) => s.switchTab)
  const removeTab = useTabStore((s) => s.removeTab)
  const addTab = useTabStore((s) => s.addTab)
  const updateTab = useTabStore((s) => s.updateTab)
  const reloadCurrentTab = useTabStore((s) => s.reloadCurrentTab)
  const homepage = useSettingsStore((s) => s.homepage)

  const activeIndex = useMemo(
    () => tabs.findIndex((t) => t.id === currentTabId),
    [tabs, currentTabId],
  )

  const handleTabPress = useCallback(
    (id: string) => {
      switchTab(id)
      router.back()
    },
    [switchTab, router],
  )

  const handleTabClose = useCallback(
    (id: string) => {
      if (tabs.length <= 1) {
        updateTab(id, {
          url: '',
          title: '',
          canGoBack: false,
          canGoForward: false,
        })
        router.back()
      } else {
        removeTab(id)
      }
    },
    [tabs.length, removeTab, updateTab, router],
  )

  const handleNewTab = useCallback(() => {
    addTab()
    router.back()
  }, [addTab, router])

  const handleHome = useCallback(() => {
    addTab(homepage || undefined)
    router.back()
  }, [addTab, homepage, router])

  const handleReload = useCallback(() => {
    reloadCurrentTab()
    router.back()
  }, [reloadCurrentTab, router])

  const renderTab = useCallback(
    ({ item }: { item: Tab }) => {
      return (
        <TabCard
          tab={item}
          isActive={item.id === currentTabId}
          onPress={() => handleTabPress(item.id)}
          onClose={() => handleTabClose(item.id)}
        />
      )
    },
    [currentTabId, handleTabPress, handleTabClose],
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navButton}
        >
          <Ionicons name='chevron-back' size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}
        </Text>

        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={handleReload} style={styles.navButton}>
            <Ionicons name='refresh' size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleHome} style={styles.navButton}>
            <Ionicons name='home-outline' size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewTab} style={styles.navButton}>
            <Ionicons name='add' size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={tabs}
        keyExtractor={(tab) => tab.id}
        renderItem={renderTab}
        contentContainerStyle={styles.list}
        onLayout={() => {
          listRef.current?.scrollToIndex({
            index: activeIndex,
            animated: false,
            viewPosition: 0.3,
          })
        }}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          })
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  navButton: {
    padding: SPACING.sm,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
  },
})

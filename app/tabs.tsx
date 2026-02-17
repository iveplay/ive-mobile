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
      removeTab(id)
    },
    [removeTab],
  )

  const handleNewTab = useCallback(() => {
    addTab()
    router.back()
  }, [addTab, router])

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
          <Ionicons name='chevron-back' size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}
        </Text>

        <TouchableOpacity onPress={handleNewTab} style={styles.navButton}>
          <Ionicons name='add' size={20} color={COLORS.text} />
        </TouchableOpacity>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  navButton: {
    padding: SPACING.xs,
  },
  list: {
    padding: SPACING.md,
  },
})

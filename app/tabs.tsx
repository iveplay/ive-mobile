import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
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
  const tabs = useTabStore((s) => s.tabs)
  const currentTabId = useTabStore((s) => s.currentTabId)
  const switchTab = useTabStore((s) => s.switchTab)
  const removeTab = useTabStore((s) => s.removeTab)
  const addTab = useTabStore((s) => s.addTab)

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

  const handleDone = useCallback(() => {
    router.back()
  }, [router])

  const renderTab = useCallback(
    ({ item }: { item: Tab }) => (
      <TabCard
        tab={item}
        isActive={item.id === currentTabId}
        onPress={() => handleTabPress(item.id)}
        onClose={() => handleTabClose(item.id)}
      />
    ),
    [currentTabId, handleTabPress, handleTabClose],
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tabs</Text>
        <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Tab List */}
      <FlatList
        data={tabs}
        keyExtractor={(tab) => tab.id}
        renderItem={renderTab}
        contentContainerStyle={styles.list}
      />

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleNewTab} style={styles.actionButton}>
          <Ionicons name='add' size={20} color={COLORS.text} />
          <Text style={styles.actionText}>New Tab</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  doneButton: {
    padding: SPACING.sm,
  },
  doneText: {
    color: COLORS.brand,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  actionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
})

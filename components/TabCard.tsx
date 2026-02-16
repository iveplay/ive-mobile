import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme'
import type { Tab } from '@/utils/types'

interface Props {
  tab: Tab
  isActive: boolean
  onPress: () => void
  onClose: () => void
}

export default function TabCard({ tab, isActive, onPress, onClose }: Props) {
  const displayUrl = tab.url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, isActive && styles.cardActive]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {tab.title || 'New Tab'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name='close' size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.url} numberOfLines={1}>
        {displayUrl}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: COLORS.brand,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  url: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
})

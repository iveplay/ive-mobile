import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme'
import type { Tab } from '@/utils/types'

interface Props {
  tab: Tab
  isActive: boolean
  onPress: () => void
  onClose: () => void
}

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`
  } catch {
    return null
  }
}

export default function TabCard({ tab, isActive, onPress, onClose }: Props) {
  const [faviconError, setFaviconError] = useState(false)
  const faviconUrl = tab.url ? getFaviconUrl(tab.url) : null
  const displayUrl = tab.url
    ? tab.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : ''

  const firstLetter = (tab.title || tab.url || 'N')[0].toUpperCase()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, isActive && styles.cardActive]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.faviconContainer}>
          {faviconUrl && !faviconError ? (
            <Image
              source={{ uri: faviconUrl }}
              style={styles.favicon}
              onError={() => setFaviconError(true)}
            />
          ) : (
            <View style={styles.faviconFallback}>
              <Text style={styles.faviconLetter}>{firstLetter}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {tab.title || 'New Tab'}
        </Text>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation()
            onClose()
          }}
          style={styles.closeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name='close' size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      {displayUrl ? (
        <Text style={styles.url} numberOfLines={1}>
          {displayUrl}
        </Text>
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: COLORS.brand,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  faviconContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    flexShrink: 0,
  },
  favicon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  faviconFallback: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faviconLetter: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 2,
    flexShrink: 0,
  },
  url: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: SPACING.xs,
    marginLeft: 28,
  },
})

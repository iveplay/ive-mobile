import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { buildSearchUrl, useSettingsStore } from '@/store/useSettingsStore'

interface Props {
  onNavigate: (url: string) => void
}

export default function NewTabPage({ onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const favorites = useFavoriteStore((s) => s.favorites)
  const removeFavorite = useFavoriteStore((s) => s.removeFavorite)
  const searchEngine = useSettingsStore((s) => s.searchEngine)
  const customSearchUrl = useSettingsStore((s) => s.customSearchUrl)

  const handleSubmit = useCallback(() => {
    let trimmed = query.trim()
    if (!trimmed) return

    const isUrl = trimmed.includes('.') && !trimmed.includes(' ')

    if (!isUrl) {
      trimmed = buildSearchUrl(searchEngine, customSearchUrl, trimmed)
    }

    onNavigate(trimmed)
    Keyboard.dismiss()
  }, [query, onNavigate, searchEngine, customSearchUrl])

  const getLabel = (title: string, url: string) => {
    if (title && title !== url) return title
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`
    } catch {
      return null
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps='handled'
    >
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Search the web or jump to a favorite
        </Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder='Search or enter URL'
        placeholderTextColor={COLORS.textDisabled}
        style={[styles.searchInput, isFocused && styles.searchInputFocused]}
        autoCapitalize='none'
        autoCorrect={false}
        keyboardType='url'
        returnKeyType='go'
      />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name='star' size={16} color={COLORS.warning} />
          <Text style={styles.cardTitle}>Favorites</Text>
        </View>

        {favorites.length > 0 ? (
          <>
            <View style={styles.favorites}>
              {favorites.map((fav) => {
                const favicon = getFaviconUrl(fav.url)
                return (
                  <TouchableOpacity
                    key={fav.url}
                    style={styles.favorite}
                    onPress={() => onNavigate(fav.url)}
                    onLongPress={() => removeFavorite(fav.url)}
                  >
                    <View style={styles.favoriteIcon}>
                      {favicon ? (
                        <Image
                          source={{ uri: favicon }}
                          style={styles.favicon}
                        />
                      ) : (
                        <Text style={styles.favoriteLetter}>
                          {getLabel(fav.title, fav.url).charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.favoriteLabel} numberOfLines={1}>
                      {getLabel(fav.title, fav.url)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <Text style={styles.hint}>Long press to remove</Text>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name='star-outline'
              size={32}
              color={COLORS.textDisabled}
            />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptyHint}>
              Tap the star icon in the address bar to save pages here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  hero: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  homepageLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.brand,
    textDecorationLine: 'underline',
    maxWidth: 280,
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchInputFocused: {
    borderColor: COLORS.border,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  favorites: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  favorite: {
    alignItems: 'center',
    gap: SPACING.xs,
    width: 68,
  },
  favoriteIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favicon: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  favoriteLetter: {
    color: COLORS.brand,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  favoriteLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  hint: {
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  emptyHint: {
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
})

import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme'
import {
  SEARCH_ENGINES,
  useSettingsStore,
  type SearchEngine,
} from '@/store/useSettingsStore'

const ENGINE_OPTIONS: { key: SearchEngine; label: string }[] = [
  ...Object.entries(SEARCH_ENGINES).map(([key, val]) => ({
    key: key as SearchEngine,
    label: val.label,
  })),
  { key: 'custom' as SearchEngine, label: 'Custom' },
]

export default function SettingsScreen() {
  const router = useRouter()
  const searchEngine = useSettingsStore((s) => s.searchEngine)
  const customSearchUrl = useSettingsStore((s) => s.customSearchUrl)
  const setSearchEngine = useSettingsStore((s) => s.setSearchEngine)
  const setCustomSearchUrl = useSettingsStore((s) => s.setCustomSearchUrl)

  const [customInput, setCustomInput] = useState(customSearchUrl)

  const handleCustomBlur = () => {
    setCustomSearchUrl(customInput.trim())
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navButton}
        >
          <Ionicons name='chevron-back' size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        {/* Spacer to center the title */}
        <View style={styles.navButton}>
          <Ionicons name='chevron-back' size={20} color={COLORS.surface} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Engine</Text>
        <View style={styles.optionGroup}>
          {ENGINE_OPTIONS.map(({ key, label }, i) => {
            const selected = searchEngine === key
            const isFirst = i === 0
            const isLast = i === ENGINE_OPTIONS.length - 1
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.option,
                  isFirst && styles.optionFirst,
                  isLast && styles.optionLast,
                  !isLast && styles.optionBorder,
                ]}
                onPress={() => setSearchEngine(key)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {label}
                </Text>
                {selected && (
                  <Ionicons name='checkmark' size={18} color={COLORS.brand} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {searchEngine === 'custom' && (
          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Custom search URL</Text>
            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              onBlur={handleCustomBlur}
              onSubmitEditing={handleCustomBlur}
              placeholder='https://example.com/search?q=%s'
              placeholderTextColor={COLORS.textDisabled}
              style={styles.customInput}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='url'
              returnKeyType='done'
            />
            <Text style={styles.customHint}>
              Use %s where the search query should go
            </Text>
          </View>
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
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  optionFirst: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  optionLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  customSection: {
    gap: SPACING.xs,
  },
  customLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  customInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  customHint: {
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.sm,
  },
})

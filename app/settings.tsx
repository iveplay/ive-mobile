import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme'
import { useDeviceStore } from '@/store/useDeviceStore'
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
  const homepage = useSettingsStore((s) => s.homepage)
  const setSearchEngine = useSettingsStore((s) => s.setSearchEngine)
  const setCustomSearchUrl = useSettingsStore((s) => s.setCustomSearchUrl)
  const setHomepage = useSettingsStore((s) => s.setHomepage)

  const handyConnected = useDeviceStore((s) => s.handyConnected)
  const handyConnectionKey = useDeviceStore((s) => s.handyConnectionKey)
  const handyDeviceInfo = useDeviceStore((s) => s.handyDeviceInfo)
  const isConnecting = useDeviceStore((s) => s.isConnecting)
  const deviceError = useDeviceStore((s) => s.error)
  const connectHandy = useDeviceStore((s) => s.connectHandy)
  const disconnectHandy = useDeviceStore((s) => s.disconnectHandy)
  const clearError = useDeviceStore((s) => s.clearError)

  const [keyInput, setKeyInput] = useState(handyConnectionKey)
  const [keyFocused, setKeyFocused] = useState(false)

  const [customInput, setCustomInput] = useState(customSearchUrl)
  const [homepageInput, setHomepageInput] = useState(homepage)
  const [homepageFocused, setHomepageFocused] = useState(false)
  const [customFocused, setCustomFocused] = useState(false)

  const handleCustomBlur = () => {
    setCustomFocused(false)
    setCustomSearchUrl(customInput.trim())
  }

  const handleHomepageBlur = () => {
    setHomepageFocused(false)
    setHomepage(homepageInput.trim())
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navButton}
        >
          <Ionicons name='chevron-back' size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>

        {/* Spacer to balance the back button */}
        <View style={styles.navButton}>
          <Ionicons name='chevron-back' size={22} color={COLORS.surface} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Handy</Text>
          <TextInput
            value={keyInput}
            onChangeText={(text) => {
              setKeyInput(text)
              clearError()
            }}
            onFocus={() => setKeyFocused(true)}
            onBlur={() => setKeyFocused(false)}
            placeholder='Connection key'
            placeholderTextColor={COLORS.textDisabled}
            style={[
              styles.textInput,
              keyFocused && styles.textInputFocused,
            ]}
            autoCapitalize='none'
            autoCorrect={false}
            returnKeyType='done'
            editable={!handyConnected && !isConnecting}
          />
          {deviceError && (
            <Text style={styles.errorText}>{deviceError}</Text>
          )}
          {handyConnected ? (
            <>
              <View style={styles.deviceInfoRow}>
                <View style={[styles.statusDot, styles.statusConnected]} />
                <Text style={styles.deviceInfoText}>Connected</Text>
                {handyDeviceInfo?.firmware && (
                  <Text style={styles.deviceInfoDetail}>
                    FW {handyDeviceInfo.firmware}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectHandy}
              >
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.connectButton,
                (isConnecting || keyInput.trim().length < 5) &&
                  styles.buttonDisabled,
              ]}
              onPress={() => connectHandy(keyInput.trim())}
              disabled={isConnecting || keyInput.trim().length < 5}
            >
              {isConnecting ? (
                <ActivityIndicator size='small' color={COLORS.text} />
              ) : (
                <Text style={styles.connectText}>Connect</Text>
              )}
            </TouchableOpacity>
          )}
          <Text style={styles.hint}>
            Find your key in the Handy app or at handyfeeling.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Homepage</Text>
          <TextInput
            value={homepageInput}
            onChangeText={setHomepageInput}
            onFocus={() => setHomepageFocused(true)}
            onBlur={handleHomepageBlur}
            onSubmitEditing={handleHomepageBlur}
            placeholder='https://example.com'
            placeholderTextColor={COLORS.textDisabled}
            style={[
              styles.textInput,
              homepageFocused && styles.textInputFocused,
            ]}
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType='url'
            returnKeyType='done'
          />
          <Text style={styles.hint}>Shown in the tab view page</Text>
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
            <View style={styles.subSection}>
              <Text style={styles.subLabel}>Custom search URL</Text>
              <TextInput
                value={customInput}
                onChangeText={setCustomInput}
                onFocus={() => setCustomFocused(true)}
                onBlur={handleCustomBlur}
                onSubmitEditing={handleCustomBlur}
                placeholder='https://example.com/search?q=%s'
                placeholderTextColor={COLORS.textDisabled}
                style={[
                  styles.textInput,
                  customFocused && styles.textInputFocused,
                ]}
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='url'
                returnKeyType='done'
              />
              <Text style={styles.hint}>Use %s where the query should go</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    gap: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
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
  optionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  subSection: {
    gap: SPACING.xs,
  },
  subLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textInputFocused: {
    borderColor: COLORS.border,
  },
  hint: {
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
  },
  connectButton: {
    backgroundColor: COLORS.brand,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  connectText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  disconnectText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: COLORS.success,
  },
  deviceInfoText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  deviceInfoDetail: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    marginLeft: 'auto',
  },
})

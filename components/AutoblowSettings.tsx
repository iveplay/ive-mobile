import Slider from '@react-native-community/slider'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme'
import { useDeviceStore } from '@/store/useDeviceStore'

const TRACK_BG = '#555555'

export function AutoblowSettings() {
  const autoblowConnected = useDeviceStore((s) => s.autoblowConnected)
  const autoblowDeviceToken = useDeviceStore((s) => s.autoblowDeviceToken)
  const autoblowDeviceInfo = useDeviceStore((s) => s.autoblowDeviceInfo)
  const autoblowOffset = useDeviceStore((s) => s.autoblowOffset)
  const isConnecting = useDeviceStore((s) => s.isConnectingAutoblow)
  const autoblowError = useDeviceStore((s) => s.autoblowError)
  const connectAutoblow = useDeviceStore((s) => s.connectAutoblow)
  const disconnectAutoblow = useDeviceStore((s) => s.disconnectAutoblow)
  const setAutoblowOffset = useDeviceStore((s) => s.setAutoblowOffset)
  const clearAutoblowError = useDeviceStore((s) => s.clearAutoblowError)

  const [tokenInput, setTokenInput] = useState(autoblowDeviceToken)
  const [tokenFocused, setTokenFocused] = useState(false)

  const [localOffset, setLocalOffset] = useState(autoblowOffset)

  const handleOffsetComplete = useCallback(
    (value: number) => {
      const rounded = Math.round(value)
      setLocalOffset(rounded)
      setAutoblowOffset(rounded)
    },
    [setAutoblowOffset],
  )

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Autoblow</Text>
      <TextInput
        value={tokenInput}
        onChangeText={(text) => {
          setTokenInput(text)
          clearAutoblowError()
        }}
        onFocus={() => setTokenFocused(true)}
        onBlur={() => setTokenFocused(false)}
        placeholder='Device token'
        placeholderTextColor={COLORS.textDisabled}
        style={[styles.textInput, tokenFocused && styles.textInputFocused]}
        autoCapitalize='none'
        autoCorrect={false}
        returnKeyType='done'
        editable={!autoblowConnected && !isConnecting}
      />
      {autoblowError && <Text style={styles.errorText}>{autoblowError}</Text>}
      {autoblowConnected ? (
        <>
          <View style={styles.deviceInfoRow}>
            <View style={[styles.statusDot, styles.statusConnected]} />
            <Text style={styles.deviceInfoText}>Connected</Text>
            {autoblowDeviceInfo?.firmware && (
              <Text style={styles.deviceInfoDetail}>
                FW {autoblowDeviceInfo.firmware}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectAutoblow}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>

          <View style={styles.settingsBlock}>
            <Text style={styles.settingsTitle}>Device Settings</Text>

            <View style={styles.sliderGroup}>
              <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderLabel}>Timing Offset</Text>
                <Text style={styles.sliderValue}>
                  {localOffset > 0 ? '+' : ''}
                  {Math.round(localOffset)}ms
                </Text>
              </View>
              <Slider
                value={localOffset}
                minimumValue={-500}
                maximumValue={500}
                step={10}
                onValueChange={setLocalOffset}
                onSlidingComplete={handleOffsetComplete}
                minimumTrackTintColor={COLORS.brandLight}
                maximumTrackTintColor={TRACK_BG}
                thumbTintColor={COLORS.brandLight}
                tapToSeek
                style={styles.slider}
              />
              <View style={styles.sliderMarks}>
                <Text style={styles.markText}>-500ms</Text>
                <Text style={styles.markText}>0</Text>
                <Text style={styles.markText}>+500ms</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.connectButton,
              (isConnecting || tokenInput.trim().length < 5) &&
                styles.buttonDisabled,
            ]}
            onPress={() => connectAutoblow(tokenInput.trim())}
            disabled={isConnecting || tokenInput.trim().length < 5}
          >
            {isConnecting ? (
              <ActivityIndicator size='small' color={COLORS.text} />
            ) : (
              <Text style={styles.connectText}>Connect</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.hint}>
            Find your device token in the Autoblow app
          </Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
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
  settingsBlock: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  settingsTitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sliderGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  sliderValue: {
    color: COLORS.brandLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  slider: {
    height: 32,
    marginHorizontal: -8,
  },
  sliderMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    marginTop: -4,
  },
  markText: {
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.sm,
  },
})

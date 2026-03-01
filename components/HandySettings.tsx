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

export function HandySettings() {
  const handyConnected = useDeviceStore((s) => s.handyConnected)
  const handyConnectionKey = useDeviceStore((s) => s.handyConnectionKey)
  const handyDeviceInfo = useDeviceStore((s) => s.handyDeviceInfo)
  const handyOffset = useDeviceStore((s) => s.handyOffset)
  const handyStrokeMin = useDeviceStore((s) => s.handyStrokeMin)
  const handyStrokeMax = useDeviceStore((s) => s.handyStrokeMax)
  const isConnecting = useDeviceStore((s) => s.isConnecting)
  const deviceError = useDeviceStore((s) => s.error)
  const connectHandy = useDeviceStore((s) => s.connectHandy)
  const disconnectHandy = useDeviceStore((s) => s.disconnectHandy)
  const setHandyOffset = useDeviceStore((s) => s.setHandyOffset)
  const setHandyStrokeSettings = useDeviceStore((s) => s.setHandyStrokeSettings)
  const clearError = useDeviceStore((s) => s.clearError)

  const [keyInput, setKeyInput] = useState(handyConnectionKey)
  const [keyFocused, setKeyFocused] = useState(false)

  const [localOffset, setLocalOffset] = useState(handyOffset)
  const [localStrokeMin, setLocalStrokeMin] = useState(handyStrokeMin)
  const [localStrokeMax, setLocalStrokeMax] = useState(handyStrokeMax)

  const handleOffsetComplete = useCallback(
    (value: number) => {
      const rounded = Math.round(value)
      setLocalOffset(rounded)
      setHandyOffset(rounded)
    },
    [setHandyOffset],
  )

  const handleStrokeMinComplete = useCallback(
    (value: number) => {
      // Enforce: min must stay below max with 5% gap
      const clamped = Math.min(value, localStrokeMax - 0.05)
      setLocalStrokeMin(clamped)
      setHandyStrokeSettings(clamped, localStrokeMax)
    },
    [localStrokeMax, setHandyStrokeSettings],
  )

  const handleStrokeMaxComplete = useCallback(
    (value: number) => {
      // Enforce: max must stay above min with 5% gap
      const clamped = Math.max(value, localStrokeMin + 0.05)
      setLocalStrokeMax(clamped)
      setHandyStrokeSettings(localStrokeMin, clamped)
    },
    [localStrokeMin, setHandyStrokeSettings],
  )

  return (
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
        style={[styles.textInput, keyFocused && styles.textInputFocused]}
        autoCapitalize='none'
        autoCorrect={false}
        returnKeyType='done'
        editable={!handyConnected && !isConnecting}
      />
      {deviceError && <Text style={styles.errorText}>{deviceError}</Text>}
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

            <View style={styles.sliderGroup}>
              <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderLabel}>Stroke Range</Text>
                <Text style={styles.sliderValue}>
                  {(localStrokeMin * 100).toFixed(0)}% –{' '}
                  {(localStrokeMax * 100).toFixed(0)}%
                </Text>
              </View>

              <Text style={styles.subLabel}>Bottom</Text>
              <Slider
                value={localStrokeMin}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                onValueChange={setLocalStrokeMin}
                onSlidingComplete={handleStrokeMinComplete}
                minimumTrackTintColor={COLORS.brandLight}
                maximumTrackTintColor={TRACK_BG}
                thumbTintColor={COLORS.brandLight}
                tapToSeek
                style={styles.slider}
              />

              <Text style={styles.subLabel}>Top</Text>
              <Slider
                value={localStrokeMax}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                onValueChange={setLocalStrokeMax}
                onSlidingComplete={handleStrokeMaxComplete}
                minimumTrackTintColor={COLORS.brandLight}
                maximumTrackTintColor={TRACK_BG}
                thumbTintColor={COLORS.brandLight}
                tapToSeek
                style={styles.slider}
              />
              <View style={styles.sliderMarks}>
                <Text style={styles.markText}>0%</Text>
                <Text style={styles.markText}>50%</Text>
                <Text style={styles.markText}>100%</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <>
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
          <Text style={styles.hint}>
            Find your key in the Handy app or at handyfeeling.com
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
  subLabel: {
    color: COLORS.textDisabled,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
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

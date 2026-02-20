import { View, Text, StyleSheet } from 'react-native'
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme'
import { useDeviceStore } from '@/store/useDeviceStore'
import { useVideoStore } from '@/store/useVideoStore'

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export default function IveBar() {
  const hasVideo = useVideoStore((s) => s.hasVideo)
  const isPlaying = useVideoStore((s) => s.isPlaying)
  const currentTimeMs = useVideoStore((s) => s.currentTimeMs)
  const durationMs = useVideoStore((s) => s.durationMs)
  const playbackRate = useVideoStore((s) => s.playbackRate)
  const isBuffering = useVideoStore((s) => s.isBuffering)

  const handyConnected = useDeviceStore((s) => s.handyConnected)
  const scriptLoaded = useDeviceStore((s) => s.scriptLoaded)

  if (!hasVideo) return null

  const progress = durationMs > 0 ? currentTimeMs / durationMs : 0

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.info}>
        <View style={styles.left}>
          <View
            style={[
              styles.dot,
              isPlaying ? styles.dotPlaying : styles.dotPaused,
            ]}
          />
          <Text style={styles.status}>
            {isBuffering ? 'Buffering...' : isPlaying ? 'Playing' : 'Paused'}
          </Text>
        </View>
        <Text style={styles.time}>
          {formatTime(currentTimeMs)} / {formatTime(durationMs)}
        </Text>
        {playbackRate !== 1 && <Text style={styles.rate}>{playbackRate}x</Text>}
        <View style={styles.deviceStatus}>
          <View
            style={[
              styles.deviceDot,
              handyConnected
                ? styles.deviceConnected
                : styles.deviceDisconnected,
            ]}
          />
          <Text style={styles.deviceText}>
            {handyConnected ? (scriptLoaded ? 'Synced' : 'No script') : 'Handy'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.brand,
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.inputBg,
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.brand,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotPlaying: {
    backgroundColor: COLORS.success,
  },
  dotPaused: {
    backgroundColor: COLORS.textSecondary,
  },
  status: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  rate: {
    color: COLORS.brandLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  deviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deviceConnected: {
    backgroundColor: COLORS.success,
  },
  deviceDisconnected: {
    backgroundColor: COLORS.textDisabled,
  },
  deviceText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
})

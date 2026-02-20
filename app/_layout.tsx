import '@/utils/event-source-polyfill'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { setBackgroundColorAsync } from 'expo-system-ui'
import { useEffect } from 'react'
import { COLORS } from '@/constants/theme'
import { useDeviceStore } from '@/store/useDeviceStore'
import { useFavoriteStore } from '@/store/useFavoriteStore'
import { useSettingsStore } from '@/store/useSettingsStore'

export default function RootLayout() {
  const loadDevice = useDeviceStore((s) => s.load)
  const loadFavorites = useFavoriteStore((s) => s.load)
  const loadSettings = useSettingsStore((s) => s.load)

  useEffect(() => {
    loadDevice()
    loadFavorites()
    loadSettings()
    setBackgroundColorAsync(COLORS.background)
  }, [loadDevice, loadFavorites, loadSettings])

  return (
    <>
      <StatusBar style='light' backgroundColor={COLORS.surface} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'ios_from_right',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name='index' />
        <Stack.Screen name='tabs' />
        <Stack.Screen name='settings' />
      </Stack>
    </>
  )
}

import { useDeviceStore } from '@/store/useDeviceStore'

/**
 * Handles bridge messages from ive-play running inside the WebView.
 * Emulates the ive browser extension's bridge protocol so ive-play
 * works identically in the mobile app.
 *
 * Request format:  { from: 'iveplay', id: N, type: '...', ...payload }
 * Response format: { from: 'ive-extension', id: N, data: ..., error: ... }
 */

const IVE_VERSION = '1.4.0'

interface BridgeMessage {
  from: 'iveplay'
  id: number
  type: string
  [key: string]: unknown
}

interface BridgeResponse {
  from: 'ive-extension'
  id: number
  data: unknown
  error: string | null
}

type RespondFn = (response: BridgeResponse) => void

function respond(
  respondFn: RespondFn,
  id: number,
  data: unknown,
  error: string | null = null,
) {
  respondFn({ from: 'ive-extension', id, data, error })
}

export async function handleBridgeMessage(
  message: BridgeMessage,
  respondFn: RespondFn,
): Promise<void> {
  const { id, type } = message

  try {
    switch (type) {
      // ============================================
      // Ping — tells ive-play we're available
      // ============================================
      case 'ive:ivedb:ping':
        respond(respondFn, id, { available: true, version: IVE_VERSION })
        break

      // ============================================
      // Script selection & playback
      // ============================================
      case 'ive:select_script': {
        const { scriptId } = message as BridgeMessage & { scriptId: string }
        // Store pending script — usePlaybackSync will pick it up
        // For now, we try to load it directly if we have an entry with this script
        const store = useDeviceStore.getState()
        if (store.handyConnected) {
          // scriptId in ive-play is the script URL
          await store.loadScript({ type: 'url', url: scriptId as string })
        }
        respond(respondFn, id, true)
        break
      }

      case 'ive:save_and_play': {
        const { entry, scriptId: requestedScriptId } =
          message as BridgeMessage & {
            entry: { scripts: { url: string }[] }
            videoUrl: string
            scriptId?: string
          }

        // Find the script URL to load
        const scriptUrl = requestedScriptId
          ? (entry.scripts.find(
              (s: { url: string }) => s.url === requestedScriptId,
            )?.url ?? entry.scripts[0]?.url)
          : entry.scripts[0]?.url

        if (scriptUrl) {
          const store = useDeviceStore.getState()
          if (store.handyConnected) {
            await store.loadScript({ type: 'url', url: scriptUrl })
          }
        }

        // Return fake IDs — mobile doesn't have a local entry database
        respond(respondFn, id, {
          entryId: 'mobile-' + Date.now(),
          scriptId: requestedScriptId || scriptUrl || null,
        })
        break
      }

      // ============================================
      // IVEDB operations — not supported on mobile
      // Return empty results so ive-play doesn't crash
      // ============================================
      case 'ive:ivedb:get_all_entries':
      case 'ive:ivedb:get_entries_paginated':
      case 'ive:ivedb:search_entries':
      case 'ive:ivedb:get_favorites':
        respond(respondFn, id, [])
        break

      case 'ive:ivedb:get_entry':
      case 'ive:ivedb:get_entry_with_details':
        respond(respondFn, id, null)
        break

      case 'ive:ivedb:is_favorited':
        respond(respondFn, id, false)
        break

      case 'ive:ivedb:create_entry':
        respond(respondFn, id, 'mobile-' + Date.now())
        break

      case 'ive:ivedb:update_entry':
      case 'ive:ivedb:delete_entry':
      case 'ive:ivedb:add_favorite':
      case 'ive:ivedb:remove_favorite':
        respond(respondFn, id, null)
        break

      // ============================================
      // Local scripts — not supported on mobile
      // ============================================
      case 'ive:local_script:save':
        respond(respondFn, id, null, 'Local scripts not supported on mobile')
        break

      case 'ive:local_script:get':
        respond(respondFn, id, null)
        break

      case 'ive:local_script:delete':
        respond(respondFn, id, null)
        break

      case 'ive:local_script:list':
        respond(respondFn, id, {})
        break

      case 'ive:local_script:info':
        respond(respondFn, id, null)
        break

      default:
        respond(respondFn, id, null, `Unknown message type: ${type}`)
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    respond(respondFn, id, null, msg)
  }
}

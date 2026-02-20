/**
 * Combines all injected JS modules into a single string for WebView injection.
 *
 * Each module is a self-contained IIFE. A guard flag at the top prevents
 * double-injection. The trailing `true;` is required by react-native-webview.
 */
import { INJECTED_BRIDGE_RELAY } from './bridge-relay'
import { INJECTED_VIDEO_DETECTION } from './video-detection'

export const INJECTED_JS =
  'if (!window.__ive_injected) { window.__ive_injected = true;\n' +
  INJECTED_VIDEO_DETECTION +
  '\n' +
  INJECTED_BRIDGE_RELAY +
  '\n}\ntrue;'

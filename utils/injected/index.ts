/**
 * Combines all injected JS modules into a single string for WebView injection.
 *
 * Each module is a self-contained IIFE. A guard flag at the top prevents
 * double-injection. The trailing `true;` is required by react-native-webview.
 *
 * Ad blocking is split into two phases:
 * - INJECTED_ADBLOCK_EARLY_JS: CSS hiding + window.open override (before content)
 * - INJECTED_JS: video detection + bridge relay + DOM-level ad cleanup (after content)
 */
import { INJECTED_ADBLOCK } from './adblock'
import { INJECTED_ADBLOCK_EARLY } from './adblock-early'
import { INJECTED_BRIDGE_RELAY } from './bridge-relay'
import { INJECTED_VIDEO_DETECTION } from './video-detection'

/** Runs via injectedJavaScriptBeforeContentLoaded — CSS + window.open override */
export const INJECTED_ADBLOCK_EARLY_JS = INJECTED_ADBLOCK_EARLY

/** Runs via injectedJavaScript — video detection, bridge relay, DOM ad cleanup */
export const INJECTED_JS =
  'if (!window.__ive_injected) { window.__ive_injected = true;\n' +
  INJECTED_VIDEO_DETECTION +
  '\n' +
  INJECTED_BRIDGE_RELAY +
  '\n' +
  INJECTED_ADBLOCK +
  '\n}\ntrue;'

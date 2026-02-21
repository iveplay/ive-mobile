/**
 * Injected JS: Early ad blocking (runs before content loaded).
 *
 * Injects a CSS stylesheet to hide known ad elements and overrides
 * window.open to block popup ads. Runs as early as possible to prevent
 * ad elements from ever rendering.
 *
 * Selectors and domains come from adblock-filters.ts — edit that file
 * to add/remove filters.
 *
 * Plain ES5 for WebView compatibility.
 */
import { AD_DOMAINS, CSS_SELECTORS } from './adblock-filters'

const selectorsJson = JSON.stringify(CSS_SELECTORS)
const domainsJson = JSON.stringify(AD_DOMAINS)

export const INJECTED_ADBLOCK_EARLY = `
(function() {
  if (window.__ive_adblock_early) return;
  window.__ive_adblock_early = true;

  // --- CSS element hiding rules (from adblock-filters.ts) ---
  var selectors = ${selectorsJson};
  var style = document.createElement('style');
  style.id = '__ive-adblock-css';
  style.textContent = selectors.join(',\\n') + ' { display: none !important; visibility: hidden !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; }';

  // Inject ASAP — head or documentElement
  (document.head || document.documentElement).appendChild(style);

  // --- window.open override ---
  // Strategy: block popunder/popup ads while allowing legitimate opens.
  //
  // How popunders work: site attaches a click handler to <body> or document
  // that calls window.open on ANY click. The opened URL is usually a redirect
  // chain to an ad. The user didn't intend to open anything.
  //
  // Detection: track whether the user clicked an actual <a> or <button> element.
  // If window.open fires from a click but the click target wasn't a link/button
  // that itself triggers the open, it's a hijacked click → block it.

  var AD_DOMAINS = ${domainsJson};

  function isAdHost(hostname) {
    for (var i = 0; i < AD_DOMAINS.length; i++) {
      if (hostname === AD_DOMAINS[i] || hostname.endsWith('.' + AD_DOMAINS[i])) {
        return true;
      }
    }
    return false;
  }

  // Track the element the user actually clicked
  var lastClickedEl = null;
  var lastClickTime = 0;
  document.addEventListener('click', function(e) {
    lastClickedEl = e.target;
    lastClickTime = Date.now();
  }, true);

  function isUserIntentionalOpen(url) {
    // No recent click — script-initiated, block it
    if (Date.now() - lastClickTime > 1000) return false;

    if (!lastClickedEl) return false;

    // Walk up from clicked element looking for an <a> with matching href
    var el = lastClickedEl;
    while (el && el !== document.body) {
      if (el.tagName === 'A') {
        var linkHref = el.getAttribute('href') || '';
        // User clicked a link — allow if the window.open URL matches it
        // (sites often use onclick + window.open for their own links)
        if (linkHref && url) {
          try {
            var linkHost = new URL(linkHref, window.location.href).hostname;
            var openHost = new URL(url, window.location.href).hostname;
            if (linkHost === openHost) return true;
          } catch (e) {}
        }
        // User clicked an <a> but window.open goes somewhere else = hijack
        return false;
      }
      if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
        // User clicked a button/input — likely a form action, allow
        return true;
      }
      el = el.parentElement;
    }

    // User clicked a non-interactive element (div, body, video container, etc.)
    // and window.open fired — this is almost certainly a popunder hijack
    return false;
  }

  var originalOpen = window.open;
  window.open = function(url, target, features) {
    // Always block known ad domains
    if (url) {
      try {
        var parsed = new URL(url, window.location.href);
        if (isAdHost(parsed.hostname)) return null;
      } catch (e) {}
    }

    // Block if not triggered by intentional user interaction with a link/button
    if (!isUserIntentionalOpen(url)) return null;

    return originalOpen.call(window, url, target, features);
  };
})();
true;`

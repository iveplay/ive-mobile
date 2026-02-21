/**
 * Injected JS: Post-DOM ad blocking (runs after content loaded).
 *
 * Uses MutationObserver to continuously remove ad scripts, iframes, and
 * overlay elements. Also sanitizes target="_blank" on ad-domain links.
 *
 * Domains come from adblock-filters.ts — edit that file to add/remove.
 *
 * Plain ES5 for WebView compatibility.
 */
import { AD_DOMAINS } from './adblock-filters'

const domainsJson = JSON.stringify(AD_DOMAINS)

export const INJECTED_ADBLOCK = `
(function() {
  if (window.__ive_adblock) return;
  window.__ive_adblock = true;

  // --- Known ad/tracking domains (from adblock-filters.ts) ---
  var AD_DOMAINS = ${domainsJson};

  function isAdDomain(url) {
    if (!url) return false;
    try {
      var hostname = new URL(url, window.location.href).hostname;
      for (var i = 0; i < AD_DOMAINS.length; i++) {
        if (hostname === AD_DOMAINS[i] || hostname.endsWith('.' + AD_DOMAINS[i])) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function isAdUrl(url) {
    if (!url) return false;
    if (isAdDomain(url)) return true;
    // Heuristic: URLs with common ad path patterns
    try {
      var path = new URL(url, window.location.href).pathname + new URL(url, window.location.href).search;
      if (/\\/ads[\\/\\?]/.test(path)) return true;
      if (/\\/ad[\\/\\?]/.test(path)) return true;
      if (/\\/adserv/.test(path)) return true;
      if (/\\/click\\?/.test(path) && /track|redir|aff/.test(path)) return true;
    } catch (e) {}
    return false;
  }

  // --- Remove ad scripts and iframes ---
  function cleanNode(node) {
    if (node.nodeType !== 1) return; // element nodes only

    var tag = node.tagName;

    // Block ad scripts before they execute
    if (tag === 'SCRIPT') {
      var src = node.getAttribute('src') || '';
      if (isAdDomain(src)) {
        node.type = 'javascript/blocked';
        node.remove();
        return;
      }
    }

    // Remove ad iframes
    if (tag === 'IFRAME') {
      var iframeSrc = node.getAttribute('src') || '';
      if (isAdDomain(iframeSrc)) {
        node.remove();
        return;
      }
      // Tiny/hidden iframes (tracking pixels)
      var w = node.offsetWidth || parseInt(node.getAttribute('width') || '0', 10);
      var h = node.offsetHeight || parseInt(node.getAttribute('height') || '0', 10);
      if (w <= 1 && h <= 1) {
        node.remove();
        return;
      }
    }

    // Sanitize target="_blank" on ad links only
    if (tag === 'A') {
      var href = node.getAttribute('href') || '';
      if (node.getAttribute('target') === '_blank' && isAdUrl(href)) {
        node.removeAttribute('target');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  // --- Overlay detection and removal ---
  function isFullScreenOverlay(el) {
    if (!el || el.tagName === 'VIDEO' || el.tagName === 'BODY' || el.tagName === 'HTML') return false;
    // Don't touch ive elements
    if (el.className && typeof el.className === 'string' && el.className.indexOf('__ive') !== -1) return false;

    var style = window.getComputedStyle(el);
    var pos = style.position;
    if (pos !== 'fixed' && pos !== 'absolute') return false;

    var zIndex = parseInt(style.zIndex, 10) || 0;
    if (zIndex < 999) return false;

    var rect = el.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Must cover most of the viewport
    if (rect.width < vw * 0.7 || rect.height < vh * 0.7) return false;

    // Check if it has ad-like classes/ids
    var idClass = ((el.id || '') + ' ' + (el.className || '')).toLowerCase();
    var adKeywords = ['ad', 'popup', 'overlay', 'modal', 'interstitial', 'banner', 'promo', 'sponsor'];
    for (var i = 0; i < adKeywords.length; i++) {
      if (idClass.indexOf(adKeywords[i]) !== -1) return true;
    }

    // High z-index full-screen overlay with a close button = probably an ad
    if (zIndex >= 9999 && el.querySelector('[class*="close"], [id*="close"], .dismiss, .skip')) {
      return true;
    }

    return false;
  }

  function removeOverlays() {
    var all = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    for (var i = 0; i < all.length; i++) {
      if (isFullScreenOverlay(all[i])) {
        all[i].remove();
      }
    }
    // Also check computed styles for fixed elements
    var fixedEls = document.querySelectorAll('div, section, aside');
    for (var j = 0; j < fixedEls.length; j++) {
      if (isFullScreenOverlay(fixedEls[j])) {
        fixedEls[j].remove();
      }
    }
  }

  // --- MutationObserver for ongoing cleanup ---
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        cleanNode(added[j]);
        // Also check children of added container nodes
        if (added[j].querySelectorAll) {
          var children = added[j].querySelectorAll('script, iframe, a[target="_blank"]');
          for (var k = 0; k < children.length; k++) {
            cleanNode(children[k]);
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // --- Initial cleanup pass ---
  var scripts = document.querySelectorAll('script[src]');
  for (var i = 0; i < scripts.length; i++) { cleanNode(scripts[i]); }

  var iframes = document.querySelectorAll('iframe');
  for (var j = 0; j < iframes.length; j++) { cleanNode(iframes[j]); }

  var links = document.querySelectorAll('a[target="_blank"]');
  for (var k = 0; k < links.length; k++) { cleanNode(links[k]); }

  // Run overlay removal after a delay (overlays often appear after load)
  setTimeout(removeOverlays, 2000);
  setTimeout(removeOverlays, 5000);
  setTimeout(removeOverlays, 10000);

  // Periodic overlay check
  setInterval(removeOverlays, 15000);

  // --- Block document.createElement tricks for popunders ---
  var origCreate = document.createElement;
  document.createElement = function(tag) {
    var el = origCreate.call(document, tag);
    if (tag.toLowerCase() === 'a') {
      // Intercept programmatic click() calls on created <a> elements
      var origClick = el.click;
      el.click = function() {
        var href = el.getAttribute('href') || '';
        if (isAdUrl(href)) {
          return; // block ad click-through
        }
        return origClick.call(el);
      };
    }
    return el;
  };
  document.createElement.toString = function() { return 'function createElement() { [native code] }'; };
})();
`

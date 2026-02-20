/**
 * Injected JS: Bridge relay between ive-play and React Native.
 *
 * Intercepts postMessage calls from ive-play (running inside the WebView)
 * and forwards them to RN. RN responds via window.__ive_bridge_respond().
 *
 * Plain ES5 for WebView compatibility.
 */
export const INJECTED_BRIDGE_RELAY = `
(function() {
  function isAllowedOrigin(origin) {
    try {
      var hostname = new URL(origin).hostname;
      if (hostname === 'localhost') return true;
      if (hostname === 'iveplay.io' || hostname.endsWith('.iveplay.io')) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (!event.data || event.data.from !== 'iveplay') return;
    if (!isAllowedOrigin(window.location.origin)) return;

    window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
  });

  window.__ive_bridge_respond = function(responseJson) {
    try {
      var response = JSON.parse(responseJson);
      window.postMessage(response, '*');
    } catch (e) {}
  };
})();
`

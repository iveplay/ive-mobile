/**
 * JavaScript injected into the WebView for:
 * 1. Video detection — finds <video> elements, forwards events to RN
 * 2. Bridge relay — intercepts ive-play postMessage bridge calls,
 *    forwards to RN, and receives responses back
 *
 * Uses plain ES5 for maximum WebView compatibility.
 * Ends with `true;` as required by react-native-webview.
 */
export const INJECTED_VIDEO_DETECTION_JS = `
(function() {
  if (window.__ive_injected) return;
  window.__ive_injected = true;

  // ============================================
  // 1. Video Detection
  // ============================================

  var currentVideo = null;
  var listeners = [];
  var scanTimer = null;

  function postToRN(type, video) {
    var payload = {
      currentTimeMs: video ? Math.round(video.currentTime * 1000) : 0,
      durationMs: video ? Math.round((video.duration || 0) * 1000) : 0,
      playbackRate: video ? video.playbackRate : 1,
      volume: video ? video.volume : 1,
      muted: video ? video.muted : false,
      paused: video ? video.paused : true,
    };
    window.ReactNativeWebView.postMessage(JSON.stringify({
      from: 'ive-injected',
      type: type,
      payload: payload,
    }));
  }

  function findVideo() {
    var videos = Array.from(document.getElementsByTagName('video'));
    var sig = videos.filter(function(v) {
      return v.offsetWidth > 100 && v.offsetHeight > 100;
    });
    if (sig.length === 0) return null;
    var playing = sig.find(function(v) { return !v.paused; });
    if (playing) return playing;
    return sig.reduce(function(a, b) {
      return (b.offsetWidth * b.offsetHeight) > (a.offsetWidth * a.offsetHeight) ? b : a;
    });
  }

  function detachListeners() {
    listeners.forEach(function(l) {
      l.el.removeEventListener(l.evt, l.fn);
    });
    listeners = [];
  }

  function attachListeners(video) {
    detachListeners();
    var events = [
      'play', 'pause', 'seeking', 'seeked', 'ratechange',
      'timeupdate', 'durationchange', 'volumechange',
      'waiting', 'playing', 'ended'
    ];
    events.forEach(function(evt) {
      var handler = function() { postToRN('video:' + evt, video); };
      video.addEventListener(evt, handler);
      listeners.push({ el: video, evt: evt, fn: handler });
    });
  }

  function scan() {
    var video = findVideo();
    if (video && video !== currentVideo) {
      currentVideo = video;
      attachListeners(video);
      postToRN('video:found', video);
    } else if (!video && currentVideo) {
      detachListeners();
      currentVideo = null;
      postToRN('video:lost', null);
    }
  }

  var observer = new MutationObserver(function() { scan(); });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  scanTimer = setInterval(scan, 3000);

  scan();

  // ============================================
  // 2. Bridge Relay (ive-play <-> RN)
  // ============================================

  // Allowed origins for bridge messages
  var ALLOWED_HOSTS = ['iveplay.io', 'localhost'];

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

  // Intercept ive-play bridge messages and forward to RN
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (!event.data || event.data.from !== 'iveplay') return;
    if (!isAllowedOrigin(window.location.origin)) return;

    // Forward entire message to RN
    window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
  });

  // RN calls this to send responses back to ive-play
  window.__ive_bridge_respond = function(responseJson) {
    try {
      var response = JSON.parse(responseJson);
      window.postMessage(response, '*');
    } catch (e) {}
  };
})();
true;
`

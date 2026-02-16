/**
 * JavaScript injected into every WebView page.
 *
 * Ported from:
 *   - ive/src/utils/findVideoElement.ts  (video detection)
 *   - ive/src/hooks/useVideoListener.ts  (video event forwarding)
 *   - ive/src/utils/iveBridge.ts         (iveplay.io bridge)
 *
 * Communication: window.ReactNativeWebView.postMessage(JSON.stringify({ type, ... }))
 */

export const INJECTED_SCRIPT = `
(function () {
  // Prevent double-injection
  if (window.__ive_injected) return;
  window.__ive_injected = true;

  var RN = window.ReactNativeWebView;
  if (!RN) return;

  function send(msg) {
    RN.postMessage(JSON.stringify(msg));
  }

  // ─── Video Detection ──────────────────────────────────────────────
  // Ported from ive/src/utils/findVideoElement.ts

  function findVideoElement() {
    var videos = Array.from(document.getElementsByTagName('video'));
    if (videos.length === 0) return null;

    var significant = videos.filter(function (v) {
      return v.offsetWidth > 100 && v.offsetHeight > 100;
    });
    if (significant.length === 0) return null;

    var playing = significant.find(function (v) { return !v.paused; });
    if (playing) return playing;

    return significant.reduce(function (largest, current) {
      var la = largest.offsetWidth * largest.offsetHeight;
      var ca = current.offsetWidth * current.offsetHeight;
      return ca > la ? current : largest;
    });
  }

  // ─── Video Event Listeners ────────────────────────────────────────
  // Ported from ive/src/hooks/useVideoListener.ts

  var currentVideo = null;
  var seekTimeout = null;

  function attachListeners(video) {
    if (currentVideo === video) return;
    detachListeners();
    currentVideo = video;

    function sendEvent(event, data) {
      send({ type: 'VIDEO_EVENT', event: event, data: data });
    }

    function handlePlay() {
      sendEvent('play', {
        currentTime: video.currentTime * 1000,
        duration: video.duration * 1000,
        playbackRate: video.playbackRate,
      });
    }

    function handlePause() {
      sendEvent('pause', {
        currentTime: video.currentTime * 1000,
        duration: video.duration * 1000,
      });
    }

    function handleSeeking() {
      // Debounce seeking at 1 second (matching extension)
      clearTimeout(seekTimeout);
      seekTimeout = setTimeout(function () {
        sendEvent('seeking', {
          currentTime: video.currentTime * 1000,
          duration: video.duration * 1000,
        });
      }, 1000);
    }

    function handleRateChange() {
      sendEvent('ratechange', {
        currentTime: video.currentTime * 1000,
        duration: video.duration * 1000,
        playbackRate: video.playbackRate,
      });
    }

    function handleTimeUpdate() {
      sendEvent('timeupdate', {
        currentTime: video.currentTime * 1000,
      });
    }

    function handleDurationChange() {
      sendEvent('durationchange', {
        duration: video.duration * 1000,
      });
    }

    function handleVolumeChange() {
      sendEvent('volumechange', {
        volume: video.volume,
        muted: video.muted,
      });
    }

    function handleWaiting() {
      sendEvent('waiting', {});
    }

    function handlePlaying() {
      sendEvent('playing', {});
    }

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('ratechange', handleRateChange);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    // Store cleanup references
    video.__ive_cleanup = function () {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('ratechange', handleRateChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };

    // If already playing, fire initial event
    if (!video.paused) {
      handlePlay();
    }
  }

  function detachListeners() {
    if (currentVideo && currentVideo.__ive_cleanup) {
      currentVideo.__ive_cleanup();
      currentVideo.__ive_cleanup = null;
    }
    currentVideo = null;
  }

  // ─── Detection with Retry ─────────────────────────────────────────

  var attempts = 0;
  var MAX_ATTEMPTS = 5;

  function attemptFind() {
    var video = findVideoElement();

    if (video) {
      send({
        type: 'VIDEO_DETECTED',
        data: {
          width: video.offsetWidth,
          height: video.offsetHeight,
          src: video.src || video.currentSrc || '',
          duration: video.duration || 0,
          paused: video.paused,
        },
      });
      attachListeners(video);
      return;
    }

    attempts++;
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(attemptFind, 500 * Math.pow(2, attempts - 1));
    } else {
      send({ type: 'VIDEO_NOT_FOUND' });
    }
  }

  // Also watch for dynamically added videos
  var observer = new MutationObserver(function () {
    var video = findVideoElement();
    if (video && video !== currentVideo) {
      send({
        type: 'VIDEO_DETECTED',
        data: {
          width: video.offsetWidth,
          height: video.offsetHeight,
          src: video.src || video.currentSrc || '',
          duration: video.duration || 0,
          paused: video.paused,
        },
      });
      attachListeners(video);
    }
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  attemptFind();

  // ─── IvePlay Bridge ───────────────────────────────────────────────
  // Ported from ive/src/utils/iveBridge.ts
  // Allows iveplay.io to communicate with the mobile app
  // as if it were the browser extension.

  function isAllowedOrigin(origin) {
    try {
      var url = new URL(origin);
      var hostname = url.hostname;
      var protocol = url.protocol;

      if (hostname === 'localhost') return true;
      if (hostname === 'iveplay.io' || hostname.endsWith('.iveplay.io')) {
        return protocol === 'https:';
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  if (isAllowedOrigin(window.location.origin)) {
    window.addEventListener('message', function (event) {
      if (!isAllowedOrigin(event.origin)) return;
      if (event.source !== window) return;

      var message = event.data;
      if (!message || message.from !== 'iveplay') return;

      // Forward to React Native for handling
      send({
        type: 'IVEPLAY_BRIDGE',
        message: message,
      });
    });
  }

  true; // Required by react-native-webview
})();
`

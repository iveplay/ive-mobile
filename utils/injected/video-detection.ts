/**
 * Injected JS: Video detection with manual selection.
 *
 * Finds <video> elements on the page and shows a branded "Sync" button
 * overlay on each. When tapped, that video becomes the synced video and
 * its playback events are forwarded to React Native.
 *
 * Plain ES5 for WebView compatibility.
 */
export const INJECTED_VIDEO_DETECTION = `
(function() {
  var selectedVideo = null;
  var listeners = [];
  var trackedVideos = [];
  var overlays = [];

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

  function findVideos() {
    var videos = Array.from(document.getElementsByTagName('video'));
    return videos.filter(function(v) {
      return v.offsetWidth > 100 && v.offsetHeight > 100;
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

  function removeOverlays() {
    overlays.forEach(function(o) {
      if (o.parentNode) o.parentNode.removeChild(o);
    });
    overlays = [];
  }

  function selectVideo(video) {
    selectedVideo = video;
    removeOverlays();
    attachListeners(video);
    postToRN('video:found', video);
  }

  window.__ive_deselect_video = function() {
    detachListeners();
    selectedVideo = null;
    postToRN('video:lost', null);
    scan();
  };

  window.__ive_pause_video = function() {
    if (selectedVideo && !selectedVideo.paused) {
      selectedVideo.pause();
    }
  };

  window.__ive_resume_video = function() {
    if (selectedVideo && selectedVideo.paused) {
      selectedVideo.play();
    }
  };

  function createOverlay(video) {
    var overlay = document.createElement('div');
    overlay.className = '__ive-sync-overlay';
    overlay.setAttribute('style',
      'position:absolute;' +
      'z-index:2147483647;' +
      'pointer-events:auto;'
    );

    var btn = document.createElement('button');
    btn.className = '__ive-sync-btn';
    btn.textContent = 'ive';
    btn.setAttribute('style',
      'pointer-events:auto;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'background:rgba(123,2,77,0.85);' +
      'color:#fff;' +
      'border:2px solid rgba(255,255,255,0.3);' +
      'border-radius:50%;' +
      'width:36px;' +
      'height:36px;' +
      'padding:0;' +
      'font-size:12px;' +
      'font-weight:800;' +
      'font-family:-apple-system,BlinkMacSystemFont,sans-serif;' +
      'letter-spacing:0.5px;' +
      'cursor:pointer;' +
      'box-shadow:0 2px 10px rgba(0,0,0,0.5);' +
      '-webkit-tap-highlight-color:transparent;'
    );

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      selectVideo(video);
    });
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      selectVideo(video);
    });

    overlay.appendChild(btn);

    function updatePosition() {
      var rect = video.getBoundingClientRect();
      var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      overlay.style.top = (rect.top + scrollY + 8) + 'px';
      overlay.style.right = (document.documentElement.clientWidth - rect.right + scrollX + 8) + 'px';
    }
    updatePosition();

    var reposition = function() { updatePosition(); };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    document.body.appendChild(overlay);
    overlays.push(overlay);
    return overlay;
  }

  function scan() {
    var videos = findVideos();

    if (selectedVideo) {
      if (!document.contains(selectedVideo) || selectedVideo.offsetWidth <= 100) {
        detachListeners();
        selectedVideo = null;
        postToRN('video:lost', null);
      } else {
        return;
      }
    }

    var videosChanged = (
      videos.length !== trackedVideos.length ||
      videos.some(function(v, i) { return v !== trackedVideos[i]; })
    );

    if (videosChanged) {
      removeOverlays();
      trackedVideos = videos;

      if (videos.length === 0) {
        postToRN('video:lost', null);
      } else {
        postToRN('video:available', videos[0]);
        videos.forEach(function(video) {
          createOverlay(video);
        });
      }
    }
  }

  var observer = new MutationObserver(function() { scan(); });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  setInterval(scan, 3000);
  scan();
})();
`

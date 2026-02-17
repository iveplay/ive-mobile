/**
 * Injected JS for controlling media playback in background tabs.
 */

/** Pauses all <video> and <audio> elements and suspends AudioContext instances. */
export const pauseAllMediaJS = `
(function() {
  document.querySelectorAll('video, audio').forEach(function(el) { el.pause(); });

  if (window.__ive_audioContexts) {
    window.__ive_audioContexts.forEach(function(ctx) {
      if (ctx.state === 'running') ctx.suspend();
    });
  }
})();
true;
`

/** Resumes any AudioContext instances that were suspended by pauseAllMediaJS. */
export const resumeAudioContextsJS = `
(function() {
  if (window.__ive_audioContexts) {
    window.__ive_audioContexts.forEach(function(ctx) {
      if (ctx.state === 'suspended') ctx.resume();
    });
  }
})();
true;
`

/**
 * Monkey-patches AudioContext to track instances for suspend/resume.
 * Should be included in the initial injectedJavaScript so it runs before
 * any page scripts create audio contexts.
 */
export const trackAudioContextsJS = `
(function() {
  if (window.__ive_audioContextsPatched) return;
  window.__ive_audioContextsPatched = true;
  window.__ive_audioContexts = [];
  var OrigAudioContext = window.AudioContext || window.webkitAudioContext;
  if (!OrigAudioContext) return;
  var Wrapped = function() {
    var ctx = new OrigAudioContext();
    window.__ive_audioContexts.push(ctx);
    return ctx;
  };
  Wrapped.prototype = OrigAudioContext.prototype;
  window.AudioContext = Wrapped;
  if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
})();
`

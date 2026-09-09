(() => {
  'use strict';
  const loader = document.querySelector('script[data-narration-flows]');
  if (!loader || !window.QEFlow) return;
  const profiles = fetch(loader.dataset.narrationFlows).then(response => {
    if (!response.ok) throw new Error('Flow cues unavailable');
    return response.json();
  }).then(data => data.profiles).catch(() => []);
  const normalize = text => text.replace(/\s+/g, ' ').trim();

  function connect(audio, target, key) {
    const driver = window.QEFlow.has(target) ? window.QEFlow : window.QELifecycle?.has(target) ? window.QELifecycle : null;
    if (!driver) return null;
    let profile, captions, cues = [], engaged = false, destroyed = false, frame = 0, ignorePendingSeek = false;
    const overview = {title:'Architecture overview', nodes:[], routes:[]};
    const resolve = () => {
      // Anchor authored visual cues to the actual recording's VTT. If a caption
      // changes, keep a static overview instead of guessing new speech timing.
      if (!profile || !captions) return;
      cues = profile.cues.map(cue => {
        const caption = captions[cue.caption];
        return caption && normalize(caption.text) === cue.text ? {...cue, start:caption.start} : null;
      });
      if (cues.some(cue => !cue)) cues = [];
      render();
    };
    profiles.then(items => {
      if (destroyed) return;
      profile = items.find(item => item.clip === key && item.diagram === target.dataset.diagram);
      resolve();
    });
    function render() {
      if (!engaged || destroyed) return;
      const time = audio.currentTime;
      const index = cues.findLastIndex(cue => time >= cue.start);
      const cue = cues[index] || overview;
      const end = cues[index + 1]?.start ?? audio.duration;
      const progress = index < 0 || !Number.isFinite(end) ? 0 : (time - cue.start) / Math.max(.01, end - cue.start);
      target.dataset.audioCue = index < 0 ? 'overview' : String(cue.caption);
      driver.follow(target, cue, progress, audio.paused || audio.ended || audio.seeking || Boolean(audio.error));
    }
    function tick() {
      render();
      if (engaged && !audio.paused && !audio.ended) frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      render();
      if (engaged && !audio.paused && !audio.ended) frame = requestAnimationFrame(tick);
    }
    const start = event => {
      // Native play/seeking events can arrive after a manual takeover. A queued
      // event must not reassert the recording over the presenter's choice.
      if (event.type === 'play' && audio.paused) return;
      if (event.type === 'seeking' && ignorePendingSeek) return;
      engaged = true; sync();
    };
    const finishSeek = () => { ignorePendingSeek = false; };
    const explore = () => {
      engaged = false; ignorePendingSeek = audio.seeking; audio.pause(); cancelAnimationFrame(frame);
      delete target.dataset.audioCue;
      driver.release(target, true);
    };
    audio.addEventListener('play', start);
    audio.addEventListener('seeking', start);
    audio.addEventListener('seeked', finishSeek);
    const events = ['pause', 'ended', 'timeupdate', 'seeked', 'ratechange', 'waiting', 'playing', 'error'];
    events.forEach(event => audio.addEventListener(event, sync));
    target.addEventListener('qe:flow-manual', explore);
    return {
      setCaptions(value) { captions = value; resolve(); },
      destroy() {
        destroyed = true; engaged = false; cancelAnimationFrame(frame);
        audio.removeEventListener('play', start);
        audio.removeEventListener('seeking', start);
        audio.removeEventListener('seeked', finishSeek);
        events.forEach(event => audio.removeEventListener(event, sync));
        target.removeEventListener('qe:flow-manual', explore);
        delete target.dataset.audioCue;
        driver.release(target);
      }
    };
  }
  window.QENarrationFlow = Object.freeze({connect});
})();

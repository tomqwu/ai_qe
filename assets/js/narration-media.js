(() => {
  'use strict';
  if (window.QENarrationMedia) return;
  function parseTime(value) {
    if (!/^(?:\d{2,}:)?\d{2}:\d{2}\.\d{3}$/.test(value)) return NaN;
    return value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
  }
  function parseCaptions(text) {
    if (!/^\uFEFF?WEBVTT(?:\s|$)/.test(text)) throw new Error('Invalid caption file');
    const cues = [];
    for (const block of text.replace(/^\uFEFF/, '').replace(/\r/g, '').split(/\n\s*\n/)) {
      const lines = block.split('\n');
      if (/^(?:WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0])) continue;
      const timing = lines.findIndex(line => line.includes('-->'));
      if (timing < 0) continue;
      const match = lines[timing].match(/^(\S+)\s+-->\s+(\S+)/);
      if (!match) continue;
      const start = parseTime(match[1]), end = parseTime(match[2]);
      // Render cue text as text, never executable markup. VTT voice/class tags are optional.
      const caption = lines.slice(timing + 1).join('\n').replace(/<[^>]*>/g, '').replace(/&(?:amp|lt|gt|nbsp|quot);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&nbsp;': ' ', '&quot;': '"' }[entity])).replace(/[ \t]+/g, ' ').trim();
      if (Number.isFinite(start) && end > start && caption) cues.push({ start, end, text: caption });
    }
    if (!cues.length) throw new Error('Empty caption file');
    return cues.sort((a, b) => a.start - b.start);
  }

  // One synchronous owner for the whole same-origin frame tree. Claiming focus
  // cancels pending slide advances too; pausing an already-ended audio cannot.
  let root = window;
  try { while (root.parent !== root && root.parent.location.origin === location.origin) root = root.parent; } catch (_) { /* Cross-origin host. */ }
  function pauseTree(view, except) {
    try {
      if (view.location.origin !== location.origin) return;
      view.document.querySelectorAll('audio, video').forEach(media => { if (media !== except) media.pause(); });
      view.document.dispatchEvent(new view.CustomEvent('qe:narration-interrupt', {detail:{except}}));
      view.document.querySelectorAll('iframe').forEach(frame => { if (frame.contentWindow) pauseTree(frame.contentWindow, except); });
    } catch (_) { /* Other origins have their own playback controls. */ }
  }
  const coordinatorKey = '__qeNarrationFocusV2';
  if (!root[coordinatorKey]) {
    const script = [...document.scripts].find(item => /\/assets\/js\/narration-media\.js(?:\?|$)/.test(item.src));
    const base = script ? new URL(script.src).pathname.replace(/assets\/js\/narration-media\.js$/, '') : '/';
    const channelName = `qe:narration-focus:${base}`;
    const id = root.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    let owner = null, latest = {time:0,id:''}, channel;
    const newer = value => value.time > latest.time || (value.time === latest.time && value.id > latest.id);
    const receive = value => {
      if (value?.type !== 'qe:narration-focus' || typeof value.id !== 'string' || !Number.isFinite(value.time) || value.id === id || !newer(value)) return;
      latest = value;
      owner?.pause(); owner = null;
      pauseTree(root, null);
    };
    try { channel = new root.BroadcastChannel(channelName); channel.onmessage = event => receive(event.data); } catch (_) { /* Storage events also coordinate tabs. */ }
    root.addEventListener('storage', event => {
      if (event.key !== channelName || !event.newValue) return;
      try { receive(JSON.parse(event.newValue)); } catch (_) { /* Ignore unrelated or invalid values. */ }
    });
    root[coordinatorKey] = {
      claim(media) {
        if (owner === media) return;
        owner?.pause(); owner = media;
        pauseTree(root, media);
        // Order claims so a delayed message cannot interrupt a newer Play.
        latest = {type:'qe:narration-focus', id, time:Math.max(Date.now(), latest.time + 1)};
        channel?.postMessage(latest);
        try { root.localStorage.setItem(channelName, JSON.stringify(latest)); } catch (_) { /* Playback still works without storage. */ }
      },
      owns: media => owner === media,
      stop(view) {
        if (owner?.ownerDocument.defaultView === view || view === root) { owner?.pause(); owner = null; }
        pauseTree(view, null);
      }
    };
  }
  const coordinator = root[coordinatorKey];
  const claim = media => coordinator.claim(media);
  const play = media => { claim(media); return media.play(); };
  // Native audio/video controls use the same owner. A queued play event from a
  // request we already cancelled must not steal focus back from the new player.
  document.addEventListener('play', event => {
    const media = event.target;
    if (media?.matches?.('audio, video') && !media.paused) claim(media);
  }, true);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    const child = [...document.querySelectorAll('iframe')].some(frame => frame.contentWindow === event.source);
    // Allow an already-open embedded deck with the earlier message protocol to
    // hand off to the new coordinator while its surrounding page is refreshed.
    if (event.data?.type === 'qe:narration-claim' && child) {
      try {
        const media = [...event.source.document.querySelectorAll('audio, video')].find(item => !item.paused);
        if (media) claim(media);
      } catch (_) { /* The frame may have navigated since sending its message. */ }
    }
    if (event.data?.type === 'qe:narration-pause' && event.source === parent && parent !== window) coordinator.stop(window);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) coordinator.stop(window); });
  window.addEventListener('pagehide', () => coordinator.stop(window));
  window.QENarrationMedia = Object.freeze({parseCaptions, claim, play, owns:coordinator.owns});
})();

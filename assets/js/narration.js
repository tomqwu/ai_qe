(() => {
  'use strict';
  const body = document.body;
  const manifestPath = body.dataset.narrationManifest;
  if (!manifestPath || !window.QEDeck) return;

  let entries = {}, state = window.QEDeck.getState(), currentSlide = null, clip = null;
  let cueList = [], captionRequest, clipVersion = 0, audioFailed = false, captionFailed = false;
  let captionsOn = true, continuing = false, clipStarted = false, frame = 0, panel;
  const audio = document.createElement('audio');
  audio.preload = 'metadata';
  audio.setAttribute('aria-label', 'Recorded slide narration');
  audio.dataset.narrationAudio = '';

  const clock = seconds => {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  };
  function assetURL(path) {
    if (typeof path !== 'string' || !path.trim()) return null;
    const base = new URL(body.dataset.siteBase || '/', location.origin);
    const url = new URL(path.startsWith('/assets/') ? path.slice(1) : path, base);
    return url.origin === location.origin && ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  }
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
  function buildPanel() {
    panel = document.createElement('section');
    panel.className = 'narration-panel';
    panel.setAttribute('aria-label', 'Slide narration and English subtitles');
    panel.hidden = true;
    panel.innerHTML = `<div class="narration-caption" data-narration-caption aria-label="English subtitles" aria-live="off"></div>
      <div class="narration-controls">
        <button type="button" data-narration-play aria-label="Play narration">▶ Play</button>
        <button type="button" data-narration-replay aria-label="Replay this slide's narration">↺ Replay</button>
        <label class="narration-seek"><span class="sr-only">Narration position</span><input data-narration-seek type="range" min="0" max="0" step="0.05" value="0" disabled></label>
        <span class="narration-time" data-narration-time>0:00 / 0:00</span>
        <label class="narration-speed"><span class="sr-only">Narration speed</span><select data-narration-speed aria-label="Narration speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label>
        <button type="button" data-narration-cc aria-label="English subtitles" aria-pressed="true">CC</button>
        <label class="narration-auto"><input type="checkbox" data-narration-auto checked> Auto-next</label>
      </div>
      <div class="narration-meta"><p data-narration-status role="status" aria-live="polite"></p><button type="button" data-narration-retry-captions hidden>Retry captions</button><button type="button" data-narration-transcript>Transcript</button></div>`;
    document.querySelector('.deck-navigation').before(panel);
    panel.append(audio);
    new ResizeObserver(reserveSpace).observe(panel);
    return Object.fromEntries(['play', 'replay', 'seek', 'time', 'speed', 'cc', 'auto', 'caption', 'status', 'retry-captions', 'transcript'].map(key => [key, panel.querySelector(`[data-narration-${key}]`)]));
  }
  let ui;
  function reserveSpace() {
    body.style.setProperty('--narration-height', panel && !panel.hidden ? `${Math.ceil(panel.getBoundingClientRect().height)}px` : '0px');
  }
  function announce(message) { if (ui) ui.status.textContent = message; }
  function setVisible(visible) {
    if (!panel) return;
    panel.hidden = !visible;
    body.classList.toggle('has-narration', visible);
    reserveSpace();
  }
  function clearCaption() { if (ui) ui.caption.textContent = ''; }
  function renderCaption() {
    if (!ui || !clip || !clipStarted || !captionsOn || audioFailed || audio.seeking) { clearCaption(); return; }
    const cue = cueList.find(item => audio.currentTime >= item.start && audio.currentTime < item.end);
    const text = cue?.text || '';
    if (ui.caption.textContent !== text) ui.caption.textContent = text;
  }
  function updateTime() {
    if (!ui) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    ui.seek.max = String(duration);
    ui.seek.disabled = !duration || audioFailed;
    ui.seek.value = String(Math.min(audio.currentTime || 0, duration));
    ui.seek.setAttribute('aria-valuetext', `${clock(audio.currentTime)} of ${clock(duration)}`);
    ui.time.textContent = `${clock(audio.currentTime)} / ${clock(duration)}`;
    renderCaption();
  }
  function tick() { updateTime(); if (!audio.paused && !audio.ended) frame = requestAnimationFrame(tick); }
  function updatePlaying() {
    if (!ui) return;
    const playing = !audio.paused && !audio.ended;
    panel.dataset.narrationState = audioFailed ? 'error' : playing ? 'playing' : audio.ended ? 'ended' : 'paused';
    ui.play.textContent = audioFailed ? 'Retry audio' : playing ? 'Ⅱ Pause' : '▶ Play';
    ui.play.setAttribute('aria-label', audioFailed ? 'Retry narration audio' : playing ? 'Pause narration' : 'Play narration');
    cancelAnimationFrame(frame);
    if (playing) frame = requestAnimationFrame(tick);
  }
  function stop() {
    continuing = false;
    audio.pause();
    cancelAnimationFrame(frame);
  }
  async function loadCaptions(entry, version) {
    captionRequest?.abort();
    const request = new AbortController(); captionRequest = request;
    cueList = []; clearCaption(); captionFailed = false;
    ui['retry-captions'].hidden = true;
    ui.cc.disabled = true;
    try {
      const response = await fetch(entry.captions, { signal: request.signal });
      if (!response.ok) throw new Error('Caption request failed');
      const cues = parseCaptions(await response.text());
      if (version !== clipVersion) return;
      cueList = cues; ui.cc.disabled = false; renderCaption();
      if (!audioFailed) announce(audio.paused ? 'English narration · Press Play to listen.' : 'English narration · Captions synchronized to audio.');
    } catch (error) {
      if (error.name === 'AbortError' || version !== clipVersion) return;
      captionFailed = true;
      ui['retry-captions'].hidden = false;
      announce('English captions could not load. Retry captions or read the transcript.');
    }
  }
  function loadSlide(newState) {
    state = newState;
    const entry = entries[state.slide];
    const canContinue = continuing && state.reason === 'narration';
    if (currentSlide === state.slide && clip && state.mode !== 'reading') { setVisible(true); return; }
    stop();
    currentSlide = state.slide;
    clipVersion += 1;
    clipStarted = false;
    captionRequest?.abort();
    cueList = []; clearCaption();
    audio.removeAttribute('src'); audio.load();
    clip = state.mode === 'reading' ? null : entry || null;
    setVisible(Boolean(clip));
    if (!clip) {
      document.querySelector('.deck-message').textContent = '';
      if (canContinue) {
        const message = document.querySelector('.deck-message');
        message.textContent = 'Narration sample complete. This next slide has no recording; continue with the slide controls.';
      }
      return;
    }
    document.querySelector('.deck-message').textContent = '';
    audioFailed = false;
    audio.src = clip.audio;
    audio.playbackRate = Number(ui.speed.value);
    audio.load();
    ui.transcript.hidden = !clip.transcript;
    updatePlaying(); updateTime();
    announce('English narration · Loading captions.');
    loadCaptions(clip, clipVersion);
    if (canContinue && !document.hidden) play();
  }
  function play() {
    if (!clip || document.hidden || state.mode === 'reading') return;
    clipStarted = true;
    if (audioFailed) { audioFailed = false; audio.load(); }
    if (audio.ended) audio.currentTime = 0;
    const version = clipVersion;
    audio.play().catch(error => {
      // An intentional pause or source switch can reject a pending play promise.
      if (version !== clipVersion || error.name === 'AbortError') return;
      updatePlaying();
      announce(audio.error ? 'Audio could not load. Select Retry audio to try again.' : 'Playback paused by your browser. Select Play to continue.');
    });
  }
  function connectControls() {
    ui.play.addEventListener('click', () => audio.paused || audio.ended ? play() : stop());
    ui.replay.addEventListener('click', () => { if (clip) { clearCaption(); audio.currentTime = 0; play(); } });
    ui.seek.addEventListener('input', () => { clipStarted = true; clearCaption(); audio.currentTime = Number(ui.seek.value); updateTime(); });
    ui.speed.addEventListener('change', () => { audio.playbackRate = Number(ui.speed.value); });
    ui.cc.addEventListener('click', () => { captionsOn = !captionsOn; ui.cc.setAttribute('aria-pressed', String(captionsOn)); panel.dataset.captions = captionsOn ? 'on' : 'off'; renderCaption(); });
    ui['retry-captions'].addEventListener('click', () => { if (clip) loadCaptions(clip, clipVersion); });
    ui.transcript.addEventListener('click', () => {
      stop();
      const dialog = document.createElement('dialog');
      dialog.className = 'narration-transcript-dialog';
      dialog.setAttribute('aria-label', 'Slide narration transcript');
      const heading = document.createElement('h2'); heading.textContent = 'English narration transcript';
      const text = document.createElement('p'); text.textContent = clip.transcript;
      const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close transcript';
      close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => { dialog.remove(); ui.transcript.focus(); });
      dialog.append(heading, text, close); body.append(dialog); dialog.showModal();
    });
    audio.addEventListener('play', () => { updatePlaying(); if (!captionFailed) announce('English narration · Captions synchronized to audio.'); });
    audio.addEventListener('pause', () => { updatePlaying(); if (!audio.ended && clip && !audioFailed && !captionFailed) announce('Narration paused.'); });
    for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked']) audio.addEventListener(event, updateTime);
    audio.addEventListener('seeking', clearCaption);
    audio.addEventListener('error', () => {
      if (!clip || !audio.getAttribute('src')) return;
      audioFailed = true; stop(); clearCaption(); updatePlaying(); updateTime();
      announce('Audio could not load. Select Retry audio to try again.');
    });
    audio.addEventListener('ended', () => {
      clearCaption(); updatePlaying();
      const fresh = window.QEDeck.getState();
      if (fresh.slide !== currentSlide || fresh.mode === 'reading' || document.hidden || document.querySelector('dialog[open]')) return;
      if (ui.auto.checked && fresh.nextSlide) {
        continuing = true;
        document.dispatchEvent(new CustomEvent('qe:deck-command', { detail: { action: 'next', source: 'narration', expectedSlide: currentSlide } }));
        continuing = false;
      } else announce(fresh.nextSlide ? 'Narration complete. Replay or use Next slide when ready.' : 'Narration complete. You have reached the end of this slide sequence.');
    });
    document.addEventListener('qe:deck-state', event => {
      if (event.detail.reason !== 'narration') continuing = false;
      // Manual navigation pauses; entering/exiting fullscreen keeps the same recording.
      if (event.detail.slide === currentSlide && !['reading-scroll', 'mode'].includes(event.detail.reason)) stop();
      loadSlide(event.detail);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { stop(); announce('Narration paused while this tab is hidden. Select Play to resume.'); }
    });
    document.addEventListener('qe:deck-dialog-open', () => {
      stop();
      if (clip) announce('Narration paused for slide notes. Close the notes and select Play to resume.');
    });
    window.addEventListener('pagehide', stop);
    window.addEventListener('beforeprint', stop);
  }
  fetch(manifestPath).then(response => {
    if (!response.ok) throw new Error('Narration manifest unavailable');
    return response.json();
  }).then(manifest => {
    const slides = manifest?.decks?.[body.dataset.narrationAudience]?.slides;
    if (!slides || typeof slides !== 'object') return;
    for (const [id, entry] of Object.entries(slides)) {
      const audioURL = assetURL(entry?.audio), captionsURL = assetURL(entry?.captions);
      if (document.getElementById(id)?.classList.contains('slide') && audioURL && captionsURL) entries[id] = { audio: audioURL, captions: captionsURL, transcript: typeof entry.transcript === 'string' ? entry.transcript : '' };
    }
    if (!Object.keys(entries).length) return;
    ui = buildPanel(); connectControls(); loadSlide(window.QEDeck.getState());
  }).catch(() => { /* A missing optional recording never prevents slide navigation. */ });
})();

(() => {
  'use strict';
  const loader = document.querySelector('script[data-narrator-guides]');
  if (!loader || !window.QENarrationMedia) return;
  if (document.querySelector('#architecture-demo') && new URLSearchParams(location.search).get('capture') === '1') return;
  const {parseCaptions} = window.QENarrationMedia;
  const base = new URL(loader.dataset.siteBase, location.origin);
  const players = new Set();
  let pausingFlow = false;
  const asset = path => {
    if (typeof path !== 'string') return null;
    const url = new URL(path.startsWith('/assets/') ? path.slice(1) : path, base);
    return url.origin === location.origin && /^https?:$/.test(url.protocol) ? url.href : null;
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag); node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function createGuide(target, definition, manifest, demo = false) {
    const clip = manifest.decks?.[definition.deck]?.slides?.[definition.slide];
    const audioURL = asset(clip?.audio), captionURL = asset(clip?.captions);
    if (!audioURL || !captionURL || !clip.transcript) return null;
    const wrapper = element('section', 'narrator-guide');
    wrapper.dataset.narratorGuide = `${definition.deck}/${definition.slide}`;
    wrapper.setAttribute('aria-label', 'Narrated explanation and presenter notes');
    const toolbar = element('div', 'narrator-guide-toolbar');
    const play = element('button', 'narrator-guide-play', '▶ Listen to explanation');
    play.type = 'button'; play.dataset.guidePlay = ''; play.setAttribute('aria-pressed', 'false');
    const duration = Math.round(clip.duration);
    toolbar.append(play, element('span', 'narrator-guide-credit', `${definition.format || 'Audio narration'} · ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`));
    const player = element('div', 'narrator-guide-player'); player.hidden = true;
    const caption = element('p', 'narrator-guide-caption'); caption.dataset.guideCaption = '';
    caption.setAttribute('aria-label', 'English subtitles'); caption.setAttribute('aria-live', 'off');
    const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'none'; audio.src = audioURL;
    let flow = demo ? null : window.QENarrationFlow?.connect(audio, target, `${definition.deck}/${definition.slide}`);
    audio.setAttribute('aria-label', 'Audio explanation playback'); audio.dataset.guideAudio = '';
    const status = element('p', 'narrator-guide-status'); status.setAttribute('role', 'status');
    const cc = element('button', 'narrator-guide-cc', 'CC'); cc.type = 'button'; cc.setAttribute('aria-label', 'English subtitles'); cc.setAttribute('aria-pressed', 'true');
    const speed = document.createElement('select'); speed.setAttribute('aria-label', 'Explanation speed');
    for (const rate of [.75, 1, 1.25, 1.5]) speed.add(new Option(`${rate}×`, String(rate), rate === 1, rate === 1));
    const controls = element('div', 'narrator-guide-controls'); controls.append(audio, speed, cc);
    player.append(caption, controls, status);
    const notes = document.createElement('details'); notes.className = 'narrator-guide-notes';
    notes.append(element('summary', '', 'Narrator notes'));
    notes.append(element('h3', '', 'Walk through the visual'), element('p', '', definition.guide));
    if (definition.baseline) notes.append(element('p', 'narrator-guide-baseline', 'The recording explains the published baseline and method. It does not recalculate or read your current selections.'));
    notes.append(element('h3', '', 'Spoken explanation'));
    for (const paragraph of clip.transcript.split(/\n\s*\n/)) notes.append(element('p', '', paragraph));
    wrapper.append(toolbar, player, notes);
    if (demo) target.append(wrapper); else target.after(wrapper);
    let cues = [], cuesRequested = false, captionsOn = true, exploring = false, frame = 0, request;
    function renderCaption() {
      const text = captionsOn && !exploring && !audio.seeking ? cues.find(cue => audio.currentTime >= cue.start && audio.currentTime < cue.end)?.text || '' : '';
      if (caption.textContent !== text) caption.textContent = text;
    }
    function tick() { renderCaption(); if (!audio.paused && !audio.ended) frame = requestAnimationFrame(tick); }
    function readyStatus() {
      if (!cues.length || audio.ended || audio.error || exploring) return;
      status.textContent = definition.baseline ? 'Published baseline explanation · English captions' : demo ? (flow?.valid ? 'Audio, captions and story follow one timeline. Stage controls seek the recording.' : 'Audio explanation · Timed story cues unavailable. Read the captions or explore without audio.') : flow ? 'English captions and highlighted components follow the audio.' : 'English captions synchronized to the explanation.';
    }
    function sync() {
      const playing = !audio.paused && !audio.ended;
      play.textContent = playing ? 'Ⅱ Pause explanation' : audio.error ? 'Retry explanation' : '▶ Listen to explanation';
      play.setAttribute('aria-pressed', String(playing));
      wrapper.dataset.playing = String(playing);
      cancelAnimationFrame(frame); if (playing) frame = requestAnimationFrame(tick);
    }
    async function loadCaptions() {
      if (cuesRequested) return;
      cuesRequested = true; request = new AbortController();
      status.textContent = 'Loading English captions…';
      try {
        const response = await fetch(captionURL, {signal:request.signal});
        if (!response.ok) throw new Error('Caption request failed');
        cues = parseCaptions(await response.text()); flow?.setCaptions(cues); renderCaption();
        readyStatus();
      } catch (error) {
        if (error.name === 'AbortError') return;
        cuesRequested = false;
        status.textContent = 'Captions could not load. Read Narrator notes; replay to retry captions.';
      }
    }
    play.addEventListener('click', () => {
      if (!audio.paused && !audio.ended) { audio.pause(); return; }
      player.hidden = false;
      if (audio.error) audio.load();
      if (audio.ended) audio.currentTime = 0;
      status.textContent = 'Starting explanation…';
      readyStatus();
      window.QENarrationMedia.play(audio).catch(error => {
        if (error.name === 'AbortError') return;
        sync(); status.textContent = 'Playback could not start. Select Listen to retry, or read Narrator notes.';
      });
    });
    audio.addEventListener('play', () => {
      if (audio.paused) { sync(); return; }
      exploring = false;
      player.hidden = false;
      // The diagram clock follows audio whenever a cue connection is available.
      pausingFlow = true;
      if (!demo && !flow) target.querySelector('[data-tour-play][aria-pressed="true"]')?.click();
      pausingFlow = false;
      loadCaptions(); readyStatus(); sync();
    });
    audio.addEventListener('pause', sync);
    audio.addEventListener('playing', readyStatus);
    audio.addEventListener('seeked', readyStatus);
    audio.addEventListener('ended', () => { caption.textContent = ''; sync(); status.textContent = 'Explanation complete. Replay or continue exploring when ready.'; });
    audio.addEventListener('error', () => { caption.textContent = ''; sync(); status.textContent = 'Audio could not load. Select Retry explanation, or read Narrator notes.'; });
    for (const event of ['timeupdate', 'seeked']) audio.addEventListener(event, renderCaption);
    audio.addEventListener('seeking', () => { exploring = false; caption.textContent = ''; readyStatus(); });
    cc.addEventListener('click', () => { captionsOn = !captionsOn; cc.setAttribute('aria-pressed', String(captionsOn)); renderCaption(); });
    speed.addEventListener('change', () => { audio.playbackRate = Number(speed.value); });
    audio.addEventListener('ratechange', () => { speed.value = String(audio.playbackRate); });
    const connectDemo = () => {
      if (!demo || flow || !window.qeArchitecture) return;
      flow = window.qeArchitecture.connectNarration(audio, {...definition, duration:clip.duration});
      if (cues.length) flow.setCaptions(cues);
    };
    if (demo) { connectDemo(); window.addEventListener('qe:architecture-api', connectDemo); }
    // Exploring a different step pauses its overview, but never restarts it.
    const onExplore = event => { if (!pausingFlow && event.target.closest('[data-tour-play], [data-tour-next], [data-tour-reset], [data-layer]')) audio.pause(); };
    target.addEventListener('click', onExplore);
    const onManual = () => { exploring = true; audio.pause(); caption.textContent = ''; status.textContent = 'Exploring manually. Play the explanation to return to its narrated walkthrough.'; };
    target.addEventListener('qe:flow-manual', onManual);
    const controller = {audio, destroy() { audio.pause(); flow?.destroy(); window.removeEventListener('qe:architecture-api', connectDemo); request?.abort(); cancelAnimationFrame(frame); target.removeEventListener('click', onExplore); target.removeEventListener('qe:flow-manual', onManual); audio.removeAttribute('src'); audio.load(); wrapper.remove(); players.delete(controller); }};
    players.add(controller);
    return controller;
  }
  let initialization, initialized = false;
  function initialize() {
    if (initialized) return;
    initialization?.abort();
    const request = initialization = new AbortController();
    (async () => {
      const response = await fetch(loader.dataset.narratorGuides, {signal: request.signal});
      if (!response.ok) throw new Error('Narrator notes unavailable');
      const config = await response.json();
      if (request.signal.aborted) return null;
      const path = location.pathname.slice(base.pathname.replace(/\/$/, '').length);
      const needed = document.querySelector('[data-demo-narrator]') || config.guides.some(g => (!g.path || g.path === path) && [...document.querySelectorAll(g.selector)].some(t => !t.closest('.slide')));
      if (!needed) return null;
      const media = await fetch(loader.dataset.manifest, {signal: request.signal});
      if (!media.ok) throw new Error('Narrator notes unavailable');
      return [config, await media.json()];
    })().then(result => {
      if (request.signal.aborted) return;
      initialized = true;
      if (!result) return;
      const [config, manifest] = result;
      const annotated = new Set();
      const path = location.pathname.slice(base.pathname.replace(/\/$/, '').length);
      for (const guide of config.guides) {
        if (guide.path && guide.path !== path) continue;
        for (const target of document.querySelectorAll(guide.selector)) {
          if (target.closest('.slide') || annotated.has(target)) continue;
          if (createGuide(target, guide, manifest)) annotated.add(target);
        }
      }
      const demo = document.querySelector('[data-demo-narrator]');
      if (demo) {
        let controller, scenario;
        const update = id => { if (id === scenario) return; scenario = id; controller?.destroy(); if (config.demo[id]) controller = createGuide(demo, config.demo[id], manifest, true); };
        update(new URLSearchParams(location.search).get('scenario') || 'generate');
        const scenarios = document.querySelector('.scenario-tabs');
        new MutationObserver(() => update(scenarios.querySelector('[aria-pressed="true"]').dataset.scenario)).observe(scenarios, {subtree:true,attributes:true,attributeFilter:['aria-pressed']});

      }
    }).catch(() => { /* Core diagrams and their existing descriptions remain available. */ });
  }
  initialize();
  // Cancel the deferred manifest fetch when leaving, including a BFCache visit.
  // A restored page can finish initialization if it was interrupted.
  window.addEventListener('pagehide', () => initialization?.abort());
  window.addEventListener('pageshow', event => { if (event.persisted && !initialized) initialize(); });
  function pauseAll() { for (const player of players) player.audio.pause(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll(); });
  window.addEventListener('pagehide', pauseAll);
  window.addEventListener('beforeprint', pauseAll);
})();

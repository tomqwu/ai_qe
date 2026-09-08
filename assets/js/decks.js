(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  if (!slides.length) return;
  const body = document.body, navigation = document.querySelector('.deck-navigation');
  const previous = document.querySelector('[data-previous]'), next = document.querySelector('[data-next]');
  const picker = navigation.querySelector('select'), status = document.querySelector('.slide-status');
  const reading = document.querySelector('[data-reading]'), present = document.querySelector('[data-fullscreen]');
  const drawer = document.querySelector('.deck-drawer'), drawerContent = drawer.querySelector('[data-drawer-content]');
  const embedded = window.parent !== window;
  body.classList.toggle('embedded', embedded);
  let index = Math.max(0, slides.findIndex(s => `#${s.id}` === location.hash));
  let mode = 'slides', chapter;
  const routeButton = document.querySelector('[data-guided-route]');
  const routeData = document.querySelector('[data-guided-slides]');
  const route = routeData ? JSON.parse(routeData.textContent).map(n => n - 1).filter(n => n >= 0 && n < slides.length) : [];
  let guided = new URLSearchParams(location.search).get('route') === 'client' && route.includes(index);
  const sequence = () => guided ? route : slides.map((_, i) => i);
  const move = delta => { const order = sequence(); return order[Math.max(0, Math.min(order.length - 1, order.indexOf(index) + delta))]; };
  function syncRouteURL() {
    const url = new URL(location.href);
    if (guided) url.searchParams.set('route', 'client'); else url.searchParams.delete('route');
    history.replaceState(null, '', url);
  }
  function updatePosition() {
    const order = sequence(), position = order.indexOf(index);
    previous.disabled = position === 0; next.disabled = position === order.length - 1; picker.value = String(index);
    status.textContent = (guided ? `Story ${position + 1}/${order.length} · Slide ` : '') + `${index + 1} / ${slides.length} · ${title(slides[index])}`;
    if (routeButton) { routeButton.setAttribute('aria-pressed', String(guided)); routeButton.textContent = guided ? 'Full deck' : 'Guided story'; }
  }

  const diagramButton = document.querySelector('[data-diagram-tools]'), diagramPanel = document.querySelector('.deck-diagram-panel');
  const flowBar = document.querySelector('.deck-flow-bar'), flowStates = new WeakMap();
  function updateFlowBar() {
    const figure = slides[index].querySelector('.research-figure');
    const state = figure && flowStates.get(figure);
    flowBar.hidden = !figure?.querySelector('[data-diagram-tour]') && !state;
    body.classList.toggle('has-flow-controls', !flowBar.hidden);
    if (!state) return;
    const button = flowBar.querySelector('[data-flow-play]');
    button.textContent = state.label;
    button.disabled = !state.enabled;
    button.setAttribute('aria-pressed', String(state.playing));
    const status = flowBar.querySelector('[data-flow-status]');
    status.textContent = state.enabled ? state.status : 'Motion is off · Next step still works';
    status.title = status.textContent;
  }
  document.addEventListener('qe:flow-state', event => { flowStates.set(event.target, event.detail); updateFlowBar(); });
  for (const action of ['play', 'next', 'reset']) flowBar.querySelector(`[data-flow-${action}]`).addEventListener('click', () => {
    closeDiagramControls();
    slides[index].querySelector('.research-figure')?.dispatchEvent(new CustomEvent('qe:flow-command', { detail: { action } }));
  });
  let controlsHome;
  function closeDiagramControls() {
    if (controlsHome) { [...diagramPanel.children].reverse().forEach(child => controlsHome.prepend(child)); controlsHome = null; }
    diagramPanel.hidden = true; diagramButton.setAttribute('aria-expanded', 'false');
  }
  diagramButton.addEventListener('click', () => {
    if (!diagramPanel.hidden) { closeDiagramControls(); return; }
    controlsHome = slides[index].querySelector('.research-figure');
    if (!controlsHome) return;
    controlsHome.querySelectorAll('.diagram-view-controls, .diagram-tour').forEach(el => diagramPanel.append(el));
    diagramPanel.hidden = false; diagramButton.setAttribute('aria-expanded', 'true');
  });
  const title = slide => [...slide.querySelector('h2').childNodes].map(n => n.nodeName === 'BR' ? ' ' : n.textContent).join('').replace(/\s+/g, ' ').trim();
  slides.forEach((slide, i) => {
    if (slide.dataset.chapter && chapter?.label !== slide.dataset.chapter) {
      chapter = document.createElement('optgroup'); chapter.label = slide.dataset.chapter; picker.append(chapter);
    }
    const option = new Option(`${i + 1} · ${title(slide)}`, String(i));
    (chapter || picker).append(option);
    slide.setAttribute('aria-roledescription', 'slide');
  });
  function share(interaction = false) {
    if (embedded) window.parent.postMessage({ type: 'ai-qe:deck-state', audience: body.classList.contains('technical-deck') ? 'technical' : 'evp', slide: slides[index].id, count: slides.length, title: title(slides[index]), mode, interaction }, location.origin);
  }
  // Recorded narration follows the same sequence as buttons, hashes and guided routes.
  function deckState(reason = 'navigation') {
    const order = sequence(), position = order.indexOf(index);
    return { slide: slides[index].id, index, mode, guided, nextSlide: position < order.length - 1 ? slides[order[position + 1]].id : null, reason };
  }
  function notifyDeckState(reason) { document.dispatchEvent(new CustomEvent('qe:deck-state', { detail: deckState(reason) })); }
  window.QEDeck = Object.freeze({ getState: () => deckState() });
  function render(updateHash = true, interaction = false, reason = 'navigation') {
    closeDiagramControls();
    diagramButton.hidden = !slides[index].querySelector('.research-figure');
    updateFlowBar();
    slides.forEach((s, i) => { s.hidden = mode !== 'reading' && i !== index; });
    body.classList.toggle('reading-view', mode === 'reading');
    body.classList.toggle('presentation-mode', mode === 'present');
    body.dataset.deckMode = mode;
    updatePosition();
    reading.textContent = mode === 'reading' ? 'Slide view' : 'Read all';
    reading.setAttribute('aria-pressed', String(mode === 'reading'));
    present.textContent = mode === 'present' ? 'Exit presentation' : 'Present ↗';
    present.setAttribute('aria-pressed', String(mode === 'present'));
    if (updateHash) history.replaceState(null, '', `#${slides[index].id}`);
    share(interaction);
    notifyDeckState(reason);
  }
  function goTo(i, reason = 'navigation') {
    index = Math.max(0, Math.min(slides.length - 1, i));
    if (guided && !route.includes(index)) { guided = false; syncRouteURL(); }
    render(true, true, reason);
    if (mode === 'reading') slides[index].scrollIntoView({ block: 'start' });
    else { window.scrollTo(0, 0); slides[index].querySelector('.slide-content')?.scrollTo(0, 0); }
  }
  function setMode(value) { mode = value; render(true, true, 'mode'); }
  document.addEventListener('qe:deck-command', event => {
    const command = event.detail;
    if (command?.action !== 'next' || command.source !== 'narration' || command.expectedSlide !== slides[index].id || mode === 'reading' || document.querySelector('dialog[open]')) return;
    const target = move(1);
    if (target !== index) goTo(target, 'narration');
  });
  previous.addEventListener('click', () => goTo(move(-1)));
  next.addEventListener('click', () => goTo(move(1)));
  routeButton?.addEventListener('click', () => { guided = !guided; if (guided) { mode = 'slides'; if (!route.includes(index)) index = route[0]; } syncRouteURL(); render(true, true, 'route'); });
  picker.addEventListener('change', () => goTo(Number(picker.value)));
  reading.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (mode !== 'reading' && guided) { guided = false; syncRouteURL(); }
    setMode(mode === 'reading' ? 'slides' : 'reading');
    if (mode === 'reading') slides[index].scrollIntoView({ block: 'start' });
  });
  present.addEventListener('click', () => {
    if (mode === 'present') {
      setMode('slides');
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } else {
      setMode('present'); // Single-slide mode always precedes fullscreen, including from Read all.
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && mode === 'present') setMode('slides');
  });
  function openNotes(edition = false) {
    drawerContent.replaceChildren();
    document.querySelector('#drawer-title').textContent = edition ? 'Publication edition' : `${index + 1} · ${title(slides[index])}`;
    if (edition) drawerContent.append(document.querySelector('[data-edition-content]').content.cloneNode(true));
    else {
      const narration = slides[index].querySelector('.slide-narrator-notes');
      if (narration) { const copy = narration.cloneNode(true); copy.hidden = false; drawerContent.append(copy); }
      const items = slides[index].querySelectorAll('figcaption, .research-rationale, .architecture-inspector, .ft-speaker-notes, .slide-footer > a');
      items.forEach(item => {
        const copy = item.cloneNode(true); copy.removeAttribute('hidden'); copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        if (copy.tagName === 'DETAILS') copy.open = true;
        drawerContent.append(copy);
      });
      if (!items.length && !narration) drawerContent.textContent = 'Source links and explanations are included in this slide.';
    }
    drawer.showModal();
    document.dispatchEvent(new CustomEvent('qe:deck-dialog-open'));
  }
  document.querySelector('[data-notes]').addEventListener('click', () => openNotes());
  document.querySelector('[data-edition]').addEventListener('click', () => openNotes(true));
  document.querySelector('[data-close-drawer]').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', event => { if (event.target === drawer) drawer.close(); });
  document.addEventListener('keydown', event => {
    if (drawer.open || event.target.closest('dialog[open]')) return;
    if (event.key === 'Escape' && !diagramPanel.hidden) { closeDiagramControls(); diagramButton.focus(); return; }
    if (event.key === 'Escape' && mode === 'present') {
      setMode('slides'); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); return;
    }
    if (mode === 'reading' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    if (event.target.closest('input, select, textarea, [contenteditable], .qe-explorer, .research-figure, .narration-panel')) return;
    if (event.key === ' ' && event.target.closest('button, a')) return;
    const directions = { ArrowRight: move(1), PageDown: move(1), ' ': move(1), ArrowLeft: move(-1), PageUp: move(-1), Home: sequence()[0], End: sequence().at(-1) };
    if (event.key in directions) { event.preventDefault(); goTo(directions[event.key]); }
  });
  window.addEventListener('hashchange', () => {
    const target = slides.findIndex(s => `#${s.id}` === location.hash);
    if (target >= 0) { index = target; if (guided && !route.includes(index)) { guided = false; syncRouteURL(); } render(false, true); }
  });
  // Reading scroll updates the resume position without hijacking browser history.
  const readingObserver = new IntersectionObserver(entries => {
    if (mode !== 'reading') return;
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) { closeDiagramControls(); index = slides.indexOf(visible.target); diagramButton.hidden = !slides[index].querySelector('.research-figure'); updateFlowBar(); updatePosition(); share(true); notifyDeckState('reading-scroll'); }
  }, { threshold: [.25, .5, .75] });
  slides.forEach(slide => readingObserver.observe(slide));
  document.querySelector('.deck-tools').hidden = false; navigation.hidden = false;
  body.classList.add('deck-ready'); render(false);
})();

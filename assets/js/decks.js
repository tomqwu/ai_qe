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
  const diagramButton = document.querySelector('[data-diagram-tools]'), diagramPanel = document.querySelector('.deck-diagram-panel');
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
  function share() {
    if (embedded) window.parent.postMessage({ type: 'ai-qe:deck-state', audience: body.classList.contains('technical-deck') ? 'technical' : 'evp', slide: slides[index].id, count: slides.length, title: title(slides[index]), mode }, location.origin);
  }
  function render(updateHash = true) {
    closeDiagramControls();
    diagramButton.hidden = !slides[index].querySelector('.research-figure');
    slides.forEach((s, i) => { s.hidden = mode !== 'reading' && i !== index; });
    body.classList.toggle('reading-view', mode === 'reading');
    body.classList.toggle('presentation-mode', mode === 'present');
    body.dataset.deckMode = mode;
    previous.disabled = index === 0; next.disabled = index === slides.length - 1; picker.value = String(index);
    status.textContent = `${index + 1} / ${slides.length} · ${title(slides[index])}`;
    reading.textContent = mode === 'reading' ? 'Slide view' : 'Read all';
    reading.setAttribute('aria-pressed', String(mode === 'reading'));
    present.textContent = mode === 'present' ? 'Exit presentation' : 'Present ↗';
    present.setAttribute('aria-pressed', String(mode === 'present'));
    if (updateHash) history.replaceState(null, '', `#${slides[index].id}`);
    share();
  }
  function goTo(i) {
    index = Math.max(0, Math.min(slides.length - 1, i)); render();
    if (mode === 'reading') slides[index].scrollIntoView({ block: 'start' });
    else { window.scrollTo(0, 0); slides[index].querySelector('.slide-content')?.scrollTo(0, 0); }
  }
  function setMode(value) { mode = value; render(); }
  previous.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  picker.addEventListener('change', () => goTo(Number(picker.value)));
  reading.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
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
      const items = slides[index].querySelectorAll('figcaption, .research-rationale, .architecture-inspector, .slide-footer > a');
      items.forEach(item => {
        const copy = item.cloneNode(true); copy.removeAttribute('hidden'); copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        if (copy.tagName === 'DETAILS') copy.open = true;
        drawerContent.append(copy);
      });
      if (!items.length) drawerContent.textContent = 'Source links and explanations are included in this slide.';
    }
    drawer.showModal();
  }
  document.querySelector('[data-notes]').addEventListener('click', () => openNotes());
  document.querySelector('[data-edition]').addEventListener('click', () => openNotes(true));
  document.querySelector('[data-close-drawer]').addEventListener('click', () => drawer.close());
  drawer.addEventListener('click', event => { if (event.target === drawer) drawer.close(); });
  document.addEventListener('keydown', event => {
    if (drawer.open) return;
    if (event.key === 'Escape' && !diagramPanel.hidden) { closeDiagramControls(); diagramButton.focus(); return; }
    if (event.key === 'Escape' && mode === 'present') {
      setMode('slides'); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); return;
    }
    if (mode === 'reading' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    if (event.target.closest('input, select, textarea, [contenteditable], .qe-explorer, .research-figure')) return;
    if (event.key === ' ' && event.target.closest('button, a')) return;
    const directions = { ArrowRight: index + 1, PageDown: index + 1, ' ': index + 1, ArrowLeft: index - 1, PageUp: index - 1, Home: 0, End: slides.length - 1 };
    if (event.key in directions) { event.preventDefault(); goTo(directions[event.key]); }
  });
  window.addEventListener('hashchange', () => {
    const target = slides.findIndex(s => `#${s.id}` === location.hash);
    if (target >= 0) { index = target; render(false); }
  });
  // Reading scroll updates the resume position without hijacking browser history.
  const readingObserver = new IntersectionObserver(entries => {
    if (mode !== 'reading') return;
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) { index = slides.indexOf(visible.target); picker.value = String(index); status.textContent = `${index + 1} / ${slides.length} · ${title(slides[index])}`; previous.disabled = index === 0; next.disabled = index === slides.length - 1; share(); }
  }, { threshold: [.25, .5, .75] });
  slides.forEach(slide => readingObserver.observe(slide));
  document.querySelector('.deck-tools').hidden = false; navigation.hidden = false;
  body.classList.add('deck-ready'); render(false);
})();

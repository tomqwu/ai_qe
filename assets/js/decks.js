(() => {
  'use strict';
  document.body.classList.toggle('embedded', window.parent !== window);
  const slides = [...document.querySelectorAll('.slide')];
  if (!slides.length) return;
  const navigation = document.querySelector('.deck-navigation');
  const previous = document.querySelector('[data-previous]');
  const next = document.querySelector('[data-next]');
  const picker = navigation.querySelector('select');
  const status = document.querySelector('.slide-status');
  const reading = document.querySelector('[data-reading]');
  const fullscreen = document.querySelector('[data-fullscreen]');
  const message = document.querySelector('.deck-message');
  let index = Math.max(0, slides.findIndex(slide => `#${slide.id}` === location.hash));
  let readAll = false;
  slides.forEach((slide, number) => {
    const option = document.createElement('option');
    option.value = String(number);
    option.textContent = `${String(number + 1).padStart(2, '0')} / ${slide.querySelector('h2').innerText.replace(/\s+/g, ' ')}`;
    picker.append(option);
    slide.setAttribute('aria-roledescription', 'slide');
  });
  function notifyHeight() {
    if (window.parent === window || document.fullscreenElement) return;
    // Measure content, not the iframe viewport, so shorter slides can shrink again.
    const bottom = Math.max(navigation.getBoundingClientRect().bottom, message.getBoundingClientRect().bottom) + window.scrollY + 20;
    window.parent.postMessage({ type: 'ai-qe:deck-height', height: Math.ceil(bottom) }, location.origin);
  }
  function render(updateHash = true) {
    slides.forEach((slide, number) => { slide.hidden = !readAll && number !== index; });
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    picker.value = String(index);
    status.textContent = readAll ? `${slides.length} slides · Reading view` : `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (updateHash) history.replaceState(null, '', `#${slides[index].id}`);
    requestAnimationFrame(notifyHeight);
  }
  function goTo(number) {
    index = Math.max(0, Math.min(slides.length - 1, number));
    render();
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (window.parent !== window) window.parent.postMessage({ type: 'ai-qe:deck-navigated' }, location.origin);
    });
  }
  previous.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  picker.addEventListener('change', () => goTo(Number(picker.value)));
  reading.addEventListener('click', () => {
    readAll = !readAll;
    document.body.classList.toggle('reading-view', readAll);
    reading.setAttribute('aria-pressed', String(readAll));
    reading.textContent = readAll ? 'Slide view' : 'Read all';
    render();
  });
  function setPresentation(active) {
    document.body.classList.toggle('presentation-mode', active);
    fullscreen.textContent = active ? 'Exit presentation' : 'Present ↗';
    fullscreen.setAttribute('aria-pressed', String(active));
    message.textContent = '';
    requestAnimationFrame(notifyHeight);
  }
  fullscreen.addEventListener('click', () => {
    const active = !document.body.classList.contains('presentation-mode');
    setPresentation(active);
    if (!active) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        message.textContent = 'Presentation view is active. For a larger canvas, open the standalone deck and use your browser’s full-screen command.';
        requestAnimationFrame(notifyHeight);
      });
    }
  });
  document.addEventListener('fullscreenchange', () => {
    setPresentation(Boolean(document.fullscreenElement));
    requestAnimationFrame(notifyHeight);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('presentation-mode')) {
      setPresentation(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return;
    }
    if (readAll || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    if (event.target.closest('input, select, textarea, [contenteditable="true"], .qe-explorer, .research-figure')) return;
    if (event.key === ' ' && event.target.closest('button, a')) return;
    const directions = { ArrowRight: index + 1, PageDown: index + 1, ' ': index + 1, ArrowLeft: index - 1, PageUp: index - 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in directions)) return;
    event.preventDefault();
    goTo(directions[event.key]);
  });
  window.addEventListener('hashchange', () => {
    const target = slides.findIndex(slide => `#${slide.id}` === location.hash);
    if (target >= 0) { index = target; render(false); }
  });
  document.querySelector('.deck-tools').hidden = false;
  navigation.hidden = false;
  document.body.classList.add('deck-ready');
  render(false);
  const resizeObserver = new ResizeObserver(notifyHeight);
  resizeObserver.observe(document.querySelector('.slides'));
  resizeObserver.observe(navigation);
  document.fonts.ready.then(notifyHeight);
  window.addEventListener('resize', notifyHeight);
})();

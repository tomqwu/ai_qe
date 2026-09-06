(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'ai-qe:motion';
  const ns = 'http://www.w3.org/2000/svg';
  const controls = [...document.querySelectorAll('[data-motion-toggle]')];
  const records = [];
  let preference = 'on';
  let printing = false;
  try { preference = localStorage.getItem(storageKey) || 'on'; } catch (_) { /* Storage is optional. */ }
  const enabled = () => preference !== 'off' && !reduce.matches && !printing;
  const canRun = record => enabled() && !document.hidden && record.visible && !record.host.closest('[hidden]');

  function svgElement(tag, attrs) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }
  function addFlow(svg) {
    [...svg.querySelectorAll('path.edge[marker-end]')].forEach((path, index) => {
      const d = path.getAttribute('d');
      const length = path.getTotalLength();
      if (!d || !Number.isFinite(length) || length < 4) return;
      // Match the authored arrow direction; distance affects pacing, never a reported metric.
      const duration = Math.max(1.6, Math.min(8, length / 90));
      const phase = (index * .47) % duration;
      const effect = svgElement('g', { class: 'flow-effect', 'aria-hidden': 'true', 'pointer-events': 'none' });
      for (const attr of ['data-from', 'data-to']) {
        if (path.hasAttribute(attr)) effect.setAttribute(attr, path.getAttribute(attr));
      }
      const trail = svgElement('path', { d, pathLength: 100, class: 'flow-trail' });
      trail.style.animationDuration = `${duration}s`;
      trail.style.animationDelay = `-${phase}s`;
      const packet = svgElement('g', { class: 'flow-packet' });
      packet.append(svgElement('circle', { r: 9, class: 'packet-halo' }), svgElement('circle', { r: 3.8, class: 'packet-core' }));
      packet.append(svgElement('animateMotion', { path: d, dur: `${duration}s`, begin: `-${phase}s`, repeatCount: 'indefinite', calcMode: 'paced' }));
      effect.append(trail, packet);
      path.after(effect);
    });
    svg.pauseAnimations();
  }
  function focusRoutes(host, node) {
    host.querySelectorAll('[data-from]').forEach(edge => {
      edge.classList.toggle('route-focus', edge.dataset.from === node || edge.dataset.to === node);
    });
    host.classList.add('has-route-focus');
  }
  function attachTour(record) {
    const host = record.host;
    const toolbar = host.querySelector('[data-diagram-tour]');
    if (!toolbar) return;
    const steps = JSON.parse(toolbar.querySelector('[data-tour-steps]').textContent);
    const play = toolbar.querySelector('[data-tour-play]');
    const next = toolbar.querySelector('[data-tour-next]');
    const status = toolbar.querySelector('[data-tour-status]');
    let index = -1;
    let playing = false;
    let timer;
    const clear = () => { clearTimeout(timer); timer = undefined; };
    function update() {
      play.textContent = playing ? 'Ⅱ Pause flow' : index === steps.length - 1 ? '↻ Replay flow' : '▶ Play flow';
      play.setAttribute('aria-pressed', String(playing));
      play.disabled = !enabled();
      play.title = enabled() ? 'Animate a proposed QE workflow' : 'Turn on motion to play; Next step works without animation';
    }
    function show(number) {
      index = number;
      const step = steps[index];
      status.replaceChildren();
      const heading = document.createElement('strong');
      heading.textContent = step.title;
      status.append(heading, document.createTextNode(` ${step.detail}`));
      host.dispatchEvent(new CustomEvent('qe:tour-step', { detail: { node: step.node } }));
      const shell = host.querySelector('.diagram-shell');
      const node = host.querySelector(`[data-architecture-node="${step.node}"]`);
      if (node && shell.scrollWidth > shell.clientWidth) {
        const box = node.getBoundingClientRect();
        const left = shell.scrollLeft + box.left - shell.getBoundingClientRect().left - (shell.clientWidth - box.width) / 2;
        shell.scrollTo({ left: Math.max(0, left), behavior: enabled() ? 'smooth' : 'auto' });
      }
      update();
    }
    function schedule() {
      clear();
      if (!playing || !canRun(record)) return;
      timer = setTimeout(() => {
        if (!canRun(record)) return;
        if (index >= steps.length - 1) { playing = false; update(); return; }
        show(index + 1);
        schedule();
      }, 3200);
    }
    play.addEventListener('click', () => {
      if (!enabled()) return;
      playing = !playing;
      if (playing && (index < 0 || index === steps.length - 1)) show(0);
      update();
      schedule();
    });
    next.addEventListener('click', () => {
      playing = false;
      clear();
      show((index + 1) % steps.length);
    });
    host.addEventListener('qe:component-selected', event => {
      focusRoutes(host, event.detail.node);
      if (event.detail.source === 'manual') {
        playing = false;
        index = -1;
        clear();
        status.textContent = 'Component selected. Play flow to follow the complete workflow.';
        update();
      }
    });
    record.updateTour = () => {
      if (!enabled()) playing = false;
      update();
      schedule();
    };
    focusRoutes(host, host.querySelector('[data-architecture-node][aria-pressed="true"]').dataset.architectureNode);
    toolbar.hidden = false;
    update();
  }
  function syncRecord(record) {
    const running = canRun(record);
    record.host.classList.toggle('motion-inview', running);
    record.host.dataset.motionRunning = String(Boolean(running));
    if (record.svg) {
      if (running) record.svg.unpauseAnimations();
      else record.svg.pauseAnimations();
    }
    record.updateTour?.();
  }
  function sync() {
    root.dataset.motion = enabled() ? 'on' : 'off';
    controls.forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(enabled()));
      button.disabled = reduce.matches;
      button.title = reduce.matches ? 'Motion is off to respect your reduced-motion setting' : enabled() ? 'Pause animated effects' : 'Resume animated effects';
    });
    records.forEach(syncRecord);
  }
  document.querySelectorAll('.research-figure').forEach(host => {
    const svg = host.querySelector('.research-diagram');
    if (!svg || typeof svg.pauseAnimations !== 'function') return;
    addFlow(svg);
    host.querySelectorAll('.diagram-node, .bar-teal, .bar-navy').forEach((node, index) => node.style.setProperty('--reveal-delay', `${Math.min(index * 55, 385)}ms`));
    const caption = host.querySelector('.motion-caption');
    if (caption && svg.querySelector('.flow-effect')) caption.hidden = false;
    const record = { host, svg, visible: false };
    records.push(record);
    attachTour(record);
  });
  document.querySelectorAll('.illustrated-cover, .home-hero').forEach(host => records.push({ host, visible: false }));
  document.querySelectorAll('.industry-chart').forEach(host => {
    host.querySelectorAll('.industry-bar').forEach((row, index) => row.style.setProperty('--reveal-delay', `${index * 100}ms`));
    records.push({ host, visible: false });
  });
  if ('IntersectionObserver' in window) {
    const byHost = new Map(records.map(record => [record.host, record]));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const record = byHost.get(entry.target);
        record.visible = entry.isIntersecting;
        syncRecord(record);
      });
    }, { threshold: 0 });
    records.forEach(record => observer.observe(record.host));
  } else records.forEach(record => { record.visible = true; });
  controls.forEach(button => button.addEventListener('click', () => {
    preference = enabled() ? 'off' : 'on';
    try { localStorage.setItem(storageKey, preference); } catch (_) { /* Keep the preference for this page. */ }
    sync();
  }));
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = event.newValue || 'on';
    sync();
  });
  reduce.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('beforeprint', () => { printing = true; sync(); });
  window.addEventListener('afterprint', () => { printing = false; sync(); });
  sync();
})();

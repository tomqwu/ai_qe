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
  const canRun = record => enabled() && !record.flowPaused && !document.hidden && record.visible && !record.host.closest('[hidden]');

  function svgElement(tag, attrs) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }
  function addFlow(svg) {
    const flows = [];
    const marker = svg.querySelector('marker');
    const focusMarker = marker?.cloneNode(true);
    if (focusMarker) {
      focusMarker.id = `${marker.id}-focus`;
      focusMarker.setAttribute('class', 'flow-focus-arrow');
      marker.after(focusMarker);
    }
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
      // The trail ends at the packet. Both use the same SVG clock, including
      // pause/resume, instead of mixing independent CSS and SVG timelines.
      const trail = svgElement('path', { d, pathLength: 100, class: 'flow-trail', 'stroke-dashoffset': 12 });
      const trailMotion = svgElement('animate', { attributeName: 'stroke-dashoffset', from: 12, to: -88 });
      trail.append(trailMotion);
      const packet = svgElement('g', { class: 'flow-packet' });
      packet.append(svgElement('circle', { r: 9, class: 'packet-halo' }), svgElement('circle', { r: 3.8, class: 'packet-core' }));
      const packetMotion = svgElement('animateMotion', { path: d, calcMode: 'paced' });
      packet.append(packetMotion);
      effect.append(trail, packet);
      path.after(effect);
      const animations = [trailMotion, packetMotion];
      animations.forEach(animation => {
        animation.setAttribute('dur', `${duration}s`);
        animation.setAttribute('begin', `-${phase}s`);
        animation.setAttribute('repeatCount', 'indefinite');
        animation.setAttribute('fill', 'freeze');
      });
      flows.push({ path, effect, animations, duration, phase, marker: path.getAttribute('marker-end'), focusMarker });
    });
    svg.pauseAnimations();
    return flows;
  }
  function setRoutes(record, mode, routes = []) {
    const selected = new Set(routes);
    record.host.dataset.flowMode = mode;
    record.flows.forEach(flow => {
      const active = selected.has(`${flow.path.dataset.from}:${flow.path.dataset.to}`);
      flow.path.classList.toggle('route-focus', active);
      flow.effect.classList.toggle('route-focus', active);
      flow.path.setAttribute('marker-end', active && flow.focusMarker ? `url(#${flow.focusMarker.id})` : flow.marker);
      flow.animations.forEach(animation => {
        // A guided pulse completes before the next stage (3.2 seconds).
        animation.setAttribute('dur', `${mode === 'tour' ? 2.4 : flow.duration}s`);
        animation.setAttribute('begin', mode === 'tour' ? '0s' : `-${flow.phase}s`);
        animation.setAttribute('repeatCount', mode === 'tour' ? '1' : 'indefinite');
      });
    });
    record.svg.setCurrentTime(0);
  }
  function attachTour(record) {
    const host = record.host;
    const toolbar = host.querySelector('[data-diagram-tour]');
    if (!toolbar) return;
    const steps = JSON.parse(toolbar.querySelector('[data-tour-steps]').textContent);
    const play = toolbar.querySelector('[data-tour-play]');
    const next = toolbar.querySelector('[data-tour-next]');
    const reset = toolbar.querySelector('[data-tour-reset]');
    const status = toolbar.querySelector('[data-tour-status]');
    const legend = toolbar.querySelector('[data-flow-legend]');
    let index = -1;
    let playing = false;
    let completed = false;
    let timer;
    let remaining = 3200;
    let deadline;
    const clear = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        remaining = Math.max(0, deadline - performance.now());
        timer = undefined;
      }
    };
    function update() {
      play.textContent = playing ? 'Ⅱ Pause flow' : index >= 0 ? '▶ Resume flow' : completed ? '↻ Replay flow' : '▶ Play flow';
      play.setAttribute('aria-pressed', String(playing));
      play.disabled = !enabled();
      play.title = enabled() ? 'Animate a proposed QE workflow' : 'Turn on motion to play; Next step works without animation';
      const mode = host.dataset.flowMode;
      const moving = enabled() && !record.flowPaused;
      if (mode === 'overview') {
        legend.textContent = moving ? 'Pulses = direction. Play flow follows the architecture step by step.' : 'Motion off · all connections and direction arrows remain visible.';
      } else {
        legend.textContent = `${mode === 'tour' ? 'Gold = current step.' : 'Gold = direct connections.'} Teal = static context.${moving ? '' : ' Motion paused.'}`;
      }
    }
    function show(number) {
      clear();
      remaining = 3200;
      index = number;
      const step = steps[index];
      status.replaceChildren();
      const heading = document.createElement('strong');
      heading.textContent = `${playing ? '' : 'Paused · '}${step.title}`;
      status.append(heading, document.createTextNode(` ${step.detail}`));
      host.dispatchEvent(new CustomEvent('qe:tour-step', { detail: { node: step.node } }));
      setRoutes(record, 'tour', step.routes);
      const shell = host.querySelector('.diagram-shell');
      const node = host.querySelector(`[data-architecture-node="${step.node}"]`);
      if (node && shell.scrollWidth > shell.clientWidth) {
        const box = node.getBoundingClientRect();
        const left = shell.scrollLeft + box.left - shell.getBoundingClientRect().left - (shell.clientWidth - box.width) / 2;
        shell.scrollTo({ left: Math.max(0, left), behavior: enabled() ? 'smooth' : 'auto' });
      }
      update();
    }
    function overview(finished = false) {
      playing = false;
      index = -1;
      completed = finished;
      record.flowPaused = false;
      clear();
      setRoutes(record, 'overview');
      host.dispatchEvent(new CustomEvent('qe:overview'));
      status.textContent = finished ? 'Flow complete · overview restored.' : 'Overview · all connections have equal emphasis.';
      syncRecord(record);
    }
    function schedule() {
      clear();
      if (!playing || !canRun(record)) return;
      deadline = performance.now() + remaining;
      timer = setTimeout(() => {
        timer = undefined;
        if (!canRun(record)) return;
        if (index >= steps.length - 1) { overview(true); return; }
        show(index + 1);
        schedule();
      }, remaining);
    }
    play.addEventListener('click', () => {
      if (!enabled()) return;
      playing = !playing;
      record.flowPaused = !playing;
      if (playing && index < 0) show(0);
      else if (index >= 0) status.querySelector('strong').textContent = `${playing ? '' : 'Paused · '}${steps[index].title}`;
      syncRecord(record);
    });
    next.addEventListener('click', () => {
      playing = false;
      record.flowPaused = true;
      clear();
      show((index + 1) % steps.length);
      syncRecord(record);
    });
    reset.addEventListener('click', () => overview());
    host.addEventListener('qe:component-selected', event => {
      if (event.detail.source === 'manual') {
        playing = false;
        index = -1;
        completed = false;
        record.flowPaused = false;
        clear();
        const routes = record.flows.filter(({ path }) => path.dataset.from === event.detail.node || path.dataset.to === event.detail.node).map(({ path }) => `${path.dataset.from}:${path.dataset.to}`);
        setRoutes(record, 'inspect', routes);
        status.textContent = `Inspecting ${host.querySelector('[data-inspector-name]').textContent} · incoming and outgoing connections, without a step sequence.`;
        syncRecord(record);
      }
    });
    record.updateTour = () => {
      if (!enabled() && playing) {
        playing = false;
        record.flowPaused = true;
        status.querySelector('strong').textContent = `Paused · ${steps[index].title}`;
      }
      update();
      schedule();
    };
    setRoutes(record, 'overview');
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
    const flows = addFlow(svg);
    host.querySelectorAll('.bar-teal, .bar-navy').forEach((node, index) => node.style.setProperty('--reveal-delay', `${Math.min(index * 55, 385)}ms`));
    const caption = host.querySelector('.motion-caption');
    if (caption && svg.querySelector('.flow-effect')) caption.hidden = false;
    const record = { host, svg, flows, visible: false, flowPaused: false };
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

(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'ai-qe:motion';
  const ns = 'http://www.w3.org/2000/svg';
  const controls = [...document.querySelectorAll('[data-motion-toggle]')];
  const records = [];
  const controllers = new WeakMap();
  window.QEFlow = Object.freeze({
    has: host => controllers.has(host),
    follow: (host, cue, progress, paused) => controllers.get(host)?.follow(cue, progress, paused),
    release: (host, preserveSelection) => controllers.get(host)?.release(preserveSelection)
  });
  let preference = 'on';
  let printing = false;
  try { preference = localStorage.getItem(storageKey) || 'on'; } catch (_) { /* Storage is optional. */ }
  const enabled = () => preference !== 'off' && !reduce.matches && !printing;
  const canRun = record => enabled() && !record.flowPaused && !document.hidden && record.visible && !record.host.closest('[hidden]') && !record.svg?.closest('[hidden]');

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
      if (!path.dataset.from) { path.dataset.from = 'edge'; path.dataset.to = String(index); }
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
        const guided = mode === 'tour' || mode === 'narration';
        animation.setAttribute('dur', `${guided ? 2.4 : flow.duration}s`);
        animation.setAttribute('begin', guided ? '0s' : `-${flow.phase}s`);
        animation.setAttribute('repeatCount', guided ? '1' : 'indefinite');
      });
    });
    record.svg.setCurrentTime(0);
  }
  function setNodes(record, ids) {
    const selected = new Set(ids);
    record.host.querySelectorAll('[data-flow-node]').forEach(node => {
      const active = selected.has(node.dataset.flowNode);
      node.classList.toggle('state-current', active);
      if (active) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });
  }
  function attachTour(record) {
    const host = record.host;
    const toolbar = host.querySelector('[data-diagram-tour]');
    if (!toolbar) return;
    const allSteps = JSON.parse(toolbar.querySelector('[data-tour-steps]').textContent);
    const branch = toolbar.querySelector('[data-tour-branch]');
    let steps = branch ? allSteps.filter((step, i) => [0, 1, 2, 4].includes(i)) : allSteps;
    const play = toolbar.querySelector('[data-tour-play]');
    const next = toolbar.querySelector('[data-tour-next]');
    const reset = toolbar.querySelector('[data-tour-reset]');
    const status = toolbar.querySelector('[data-tour-status]');
    const legend = toolbar.querySelector('[data-flow-legend]');
    let index = -1;
    let playing = false;
    let completed = false;
    let previewStarted = false;
    let timer;
    let remaining = 3200;
    let deadline;
    let narration = null;
    const manual = () => host.dispatchEvent(new CustomEvent('qe:flow-manual', { bubbles: true }));
    const clear = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        remaining = Math.max(0, deadline - performance.now());
        timer = undefined;
      }
    };
    function update() {
      if (narration) {
        play.textContent = '▶ Explore flow';
        play.setAttribute('aria-pressed', 'false');
        play.disabled = !enabled();
        play.title = 'Pause the audio and explore the workflow independently';
        legend.textContent = 'Gold boxes = spoken focus. Arrows follow the audio; other relationships stay visible.';
        host.dispatchEvent(new CustomEvent('qe:flow-state', { bubbles: true, detail: {
          playing: false, enabled: enabled(), label: play.textContent,
          status: `${record.flowPaused ? 'Audio paused' : 'Audio'} · ${narration.title}`
        } }));
        return;
      }
      play.textContent = playing ? 'Ⅱ Pause flow' : index >= 0 ? '▶ Resume flow' : completed ? '↻ Replay flow' : '▶ Play flow';
      play.setAttribute('aria-pressed', String(playing));
      play.disabled = !enabled();
      play.title = enabled() ? 'Animate a proposed QE workflow' : 'Turn on motion to play; Next step works without animation';
      const mode = host.dataset.flowMode;
      const moving = enabled() && !record.flowPaused;
      if (mode === 'overview') {
        legend.textContent = moving ? 'Static arrows = relationships. Play flow highlights only the current step.' : 'All connections remain visible. Next step works with motion off.';
      } else {
        legend.textContent = `${mode === 'tour' ? 'Gold box = current destination.' : 'Gold box = selected component.'} Gold arrows = current handoff. Other connections stay visible.${moving ? '' : ' Motion paused.'}`;
      }
      host.dispatchEvent(new CustomEvent('qe:flow-state', { bubbles: true, detail: {
        playing, enabled: enabled(), label: play.textContent,
        status: index >= 0 ? `${playing ? '' : 'Paused · '}${index + 1}/${steps.length} · ${steps[index].title}` : status.textContent
      } }));
    }
    function show(number) {
      clear();
      remaining = 3200;
      index = number;
      const step = steps[index];
      const destinations = step.routes.map(route => route.split(':')[1]);
      setNodes(record, [...destinations, step.node].filter(Boolean));
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
      previewStarted = true;
      playing = false;
      index = -1;
      completed = finished;
      record.flowPaused = false;
      clear();
      setNodes(record, []);
      setRoutes(record, 'overview');
      host.dispatchEvent(new CustomEvent('qe:overview'));
      status.textContent = finished ? 'Flow complete · overview restored.' : 'Overview · all connections have equal emphasis.';
      syncRecord(record);
    }
    function schedule() {
      clear();
      if (narration || !playing || !canRun(record)) return;
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
      manual();
      previewStarted = true;
      playing = !playing;
      record.flowPaused = !playing;
      if (playing && index < 0) show(0);
      else if (index >= 0) status.querySelector('strong').textContent = `${playing ? '' : 'Paused · '}${steps[index].title}`;
      syncRecord(record);
    });
    next.addEventListener('click', () => {
      manual();
      previewStarted = true;
      playing = false;
      record.flowPaused = true;
      clear();
      show((index + 1) % steps.length);
      syncRecord(record);
    });
    reset.addEventListener('click', () => { manual(); overview(); });
    host.addEventListener('qe:flow-command', event => {
      ({ play, next, reset })[event.detail.action]?.click();
    });
    branch?.addEventListener('change', () => {
      manual();
      steps = allSteps.filter((step, i) => (branch.value === 'fix' ? [0, 1, 2, 4] : [0, 3, 5]).includes(i));
      overview();
    });
    host.addEventListener('qe:component-selected', event => {
      if (event.detail.source === 'manual') {
        manual();
        previewStarted = true;
        playing = false;
        index = -1;
        completed = false;
        record.flowPaused = false;
        clear();
        const routes = record.flows.filter(({ path }) => path.dataset.from === event.detail.node || path.dataset.to === event.detail.node).map(({ path }) => `${path.dataset.from}:${path.dataset.to}`);
        setRoutes(record, 'inspect', routes);
        setNodes(record, [event.detail.node]);
        status.textContent = `Inspecting ${host.querySelector('[data-inspector-name]').textContent} · incoming and outgoing connections, without a step sequence.`;
        syncRecord(record);
      }
    });
    record.updateTour = () => {
      if (narration) { update(); return; }
      // One guided preview when the actual diagram enters view. Explicit pause,
      // overview, inspection and reduced motion always take precedence.
      if (!previewStarted && canRun(record)) {
        previewStarted = true;
        playing = true;
        show(0);
      }
      if (!enabled() && playing) {
        playing = false;
        record.flowPaused = true;
        status.querySelector('strong').textContent = `Paused · ${steps[index].title}`;
      }
      update();
      schedule();
    };
    controllers.set(host, {
      follow(cue, progress, paused) {
        const changed = narration !== cue || record.flowPaused !== paused;
        previewStarted = true;
        playing = false;
        clear();
        record.externalClock = true;
        record.flowPaused = paused;
        if (narration !== cue) {
          narration = cue;
          index = -1;
          host.dispatchEvent(new CustomEvent('qe:overview'));
          setRoutes(record, 'narration', cue.routes);
          setNodes(record, cue.nodes);
          if (branch && cue.branch) {
            branch.value = cue.branch;
            steps = allSteps.filter((step, i) => (cue.branch === 'fix' ? [0, 1, 2, 4] : [0, 3, 5]).includes(i));
          }
        }
        const message = `${paused ? 'Audio paused' : 'Audio'} · ${cue.title}`;
        if (status.textContent !== message) status.textContent = message;
        // The audio is the only clock: buffering, seeking, speed and pause all
        // leave the SVG at the matching point in this spoken passage.
        record.svg.pauseAnimations();
        record.svg.setCurrentTime(Math.max(0, Math.min(1, progress)) * 2.4);
        if (changed) syncRecord(record);
      },
      release(preserveSelection = false) {
        if (!narration) return;
        narration = null;
        record.externalClock = false;
        record.flowPaused = true;
        if (preserveSelection) {
          setRoutes(record, 'overview');
          setNodes(record, []);
        } else overview();
      }
    });
    setRoutes(record, 'overview');
    toolbar.hidden = false;
    update();
  }
  function syncRecord(record) {
    const running = canRun(record);
    record.host.classList.toggle('motion-inview', running);
    record.host.dataset.motionRunning = String(Boolean(running));
    if (record.svg) {
      if (running && !record.externalClock) record.svg.unpauseAnimations();
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
    const flows = host.querySelector('[data-diagram-tour]') ? addFlow(svg) : [];
    host.dataset.flowMode = 'overview';
    host.querySelectorAll('.bar-teal, .bar-navy').forEach((node, index) => node.style.setProperty('--reveal-delay', `${Math.min(index * 55, 385)}ms`));
    const caption = host.querySelector('.motion-caption');
    if (caption && svg.querySelector('.flow-effect')) caption.hidden = false;
    const record = { host, svg, flows, visible: false, flowPaused: false };
    records.push(record);
    attachTour(record);
    host.addEventListener('qe:view-changed', () => syncRecord(record));
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

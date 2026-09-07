(() => {
  'use strict';
  const model = window.QEModel;
  if (!model) return;
  const ns = 'http://www.w3.org/2000/svg';
  const colors = { ink: '#152e40', teal: '#096d69', amber: '#b87831', line: '#cbd8d6', muted: '#536970' };
  const number = v => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(Math.abs(v));
  const signed = v => `${v < -1e-8 ? '−' : v > 1e-8 ? '+' : ''}${number(v)}`;
  const money = v => `${v < -1e-8 ? '−' : ''}$${number(v)}k`;
  function svgElement(tag, attrs, content) {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => e.setAttribute(key, value));
    if (content !== undefined) e.textContent = content;
    return e;
  }
  function chart(host, height, label) {
    const width = Math.floor(host.clientWidth);
    if (width < 100) return null; // A hidden slide or inactive panel will redraw when revealed.
    const svg = svgElement('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': label });
    svg.append(svgElement('title', {}, label));
    host.replaceChildren(svg);
    return { svg, width, add: (tag, attrs, content) => { const e = svgElement(tag, attrs, content); svg.append(e); return e; } };
  }
  function text(c, x, y, label, anchor = 'start', extra = {}) { return c.add('text', { x, y, fill: colors.ink, 'font-size': Math.max(14, c.width / 46), 'text-anchor': anchor, ...extra }, label); }
  function line(c, x1, y1, x2, y2, extra = {}) { c.add('line', { x1, y1, x2, y2, stroke: colors.line, 'stroke-width': 1, ...extra }); }
  function watch(element, draw) {
    let pending = false;
    new ResizeObserver(() => { if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; draw(); }); } }).observe(element);
  }

  document.querySelectorAll('[data-workbench]').forEach(root => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    function select(tab) {
      tabs.forEach(t => { const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !active; });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let index;
        if (event.key === 'ArrowRight') index = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') index = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') index = 0;
        if (event.key === 'End') index = tabs.length - 1;
        if (index === undefined) return;
        event.preventDefault(); event.stopPropagation(); tabs[index].focus(); select(tabs[index]);
      });
    });
    select(tabs[0]);
  });

  const flows = {
    triage: [
      ['Read the failure context', 'Failed CI job → scoped failure evidence', 'Read-only access to the pilot repository and CI logs. No production data.'],
      ['Prepare the triage request', 'Failure evidence → versioned classification prompt', 'Limit context to the task. Record source references and the prompt version.'],
      ['Request a classification', 'Approved prompt → candidate cause and explanation', 'Approved model and region; project identity, logging and spending ceiling.'],
      ['Prepare a reviewable draft', 'Candidate cause → evidence-linked triage draft', 'Retain provenance. The model cannot silently change the CI system of record.'],
      ['Validate the proposed cause', 'Triage draft → human-accepted or corrected classification', 'A reviewer checks the evidence; CI remains authoritative. Track errors and correction effort.']
    ],
    tests: [
      ['Read the test context', 'API specification + existing tests → scoped test context', 'Read-only, project-scoped access. Use synthetic or de-identified test data.'],
      ['Prepare the generation request', 'Test patterns → versioned generation prompt', 'Define the expected test contract and approved context before inference.'],
      ['Generate candidate tests', 'Approved prompt → candidate API or component tests', 'Approved AI platform, scoped service identity, model version and token cost recorded.'],
      ['Prepare the proposed change', 'Candidate tests → draft change with source references', 'Generated tests stay a draft. Record prompt/model provenance for every artifact.'],
      ['Review and run the checks', 'Draft tests → reviewed change with test and regression results', 'Human approval plus deterministic tests and owner review; normal change controls govern merge.']
    ],
    maintenance: [
      ['Read the unstable test context', 'CI failures + test history → repeatability evidence', 'Read-only, project-scoped traces and synthetic fixtures.'],
      ['Prepare the repair request', 'Failure evidence → cause hypothesis and task contract', 'Preserve the original domain assertion and record fixture and source versions.'],
      ['Propose a test repair', 'Approved context → candidate repair with explanation', 'Distinguish product defects from test, data and environment causes; an owner confirms the diagnosis.'],
      ['Prepare a reviewable change', 'Candidate repair → draft patch and reproduction steps', 'No automatic weakening of assertions or silent quarantine. A temporary exception needs an owner, expiry and replacement coverage.'],
      ['Verify the repair', 'Draft patch → repeated passes plus relevant regression evidence', 'Reproduce the failure first. Human review and existing CI gates govern acceptance; track repair effort and recurrence.']
    ]
  };
  document.querySelectorAll('[data-flow]').forEach(root => {
    root.querySelectorAll('[data-enhanced]').forEach(e => { e.hidden = false; });
    const nodes = [...root.querySelectorAll('[data-stage]')], map = root.querySelector('[data-flow-map]'), svg = root.querySelector('svg');
    const choice = root.querySelector('[data-use-case]'), next = root.querySelector('[data-flow-next]'), failure = root.querySelector('[data-flow-failure]');
    let stage = 0, failed = false;
    function draw() {
      const box = map.getBoundingClientRect();
      if (!box.width) return;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`); svg.replaceChildren();
      const vertical = nodes[1].offsetTop > nodes[0].offsetTop;
      nodes.slice(0, -1).forEach((node, i) => {
        const a = node.getBoundingClientRect(), b = nodes[i + 1].getBoundingClientRect();
        const x1 = (vertical ? a.left + a.width / 2 : a.right) - box.left, y1 = (vertical ? a.bottom : a.top + a.height / 2) - box.top;
        const x2 = (vertical ? b.left + b.width / 2 : b.left) - box.left, y2 = (vertical ? b.top : b.top + b.height / 2) - box.top;
        const color = i < stage ? colors.teal : colors.line;
        svg.append(svgElement('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 2 }));
        const points = vertical ? `${x2 - 4},${y2 - 7} ${x2},${y2 - 1} ${x2 + 4},${y2 - 7}` : `${x2 - 7},${y2 - 4} ${x2 - 1},${y2} ${x2 - 7},${y2 + 4}`;
        svg.append(svgElement('polyline', { points, fill: 'none', stroke: color, 'stroke-width': 2 }));
      });
    }
    function render() {
      nodes.forEach((node, i) => { node.setAttribute('aria-pressed', String(i === stage)); node.classList.toggle('stage-passed', i < stage); });
      const [title, artifact, control] = flows[choice.value][stage];
      root.querySelector('[data-flow-title]').textContent = `${String(stage + 1).padStart(2, '0')} / ${failed && stage === 4 ? 'Held for correction' : title}`;
      root.querySelector('[data-flow-artifact]').textContent = failed && stage === 4 ? 'Check or review failed → draft returned for correction' : artifact;
      root.querySelector('[data-flow-control]').textContent = failed && stage === 4 ? 'No approved change proceeds. Correct the artifact, rerun required checks and obtain human approval.' : control;
      root.querySelector('[data-flow-count]').textContent = `Stage ${stage + 1} of 5`;
      failure.hidden = stage !== 4; failure.textContent = failed ? 'Return to normal review' : 'Simulate a failed check';
      failure.setAttribute('aria-pressed', String(failed)); next.disabled = stage === 4;
      root.classList.toggle('flow-held', failed && stage === 4); draw();
    }
    nodes.forEach((node, i) => node.addEventListener('click', () => { stage = i; render(); }));
    next.addEventListener('click', () => { stage = Math.min(4, stage + 1); render(); });
    choice.addEventListener('change', () => { stage = 0; failed = false; render(); });
    failure.addEventListener('click', () => { failed = !failed; render(); });
    watch(map, draw); document.fonts.ready.then(draw); render();
  });

  function waterfall(host, p, result) {
    const k = 10000, values = [result.capacity * k, -result.uncaptured * k, -p.cost / 100 * k, -p.risk / 100 * k, -result.extraEffort * k, result.net * k];
    const labels = ['Capacity equiv.', 'Not captured', 'AI + pilot', 'Quality allowance', 'Extra effort', 'Economic impact'];
    const compact = Boolean(host.closest('.explore-compact')), factor = Math.max(1, host.clientWidth / (matchMedia('print').matches ? 1000 : 740)), rowHeight = (compact ? 29 : 35) * factor, axisY = (compact ? 204 : 240) * factor;
    const c = chart(host, (compact ? 225 : 261) * factor, labels.map((s, i) => `${s}: ${money(values[i])}`).join('; ')); if (!c) return;
    let total = 0;
    const bars = values.map((value, i) => { const start = i === 0 || i === 5 ? 0 : total; total = start + value; return { start, end: total }; });
    const rawMin = Math.min(0, ...bars.map(b => Math.min(b.start, b.end))), rawMax = Math.max(0, ...bars.map(b => Math.max(b.start, b.end)));
    const span = Math.max(10, rawMax - rawMin), step = 10 ** Math.floor(Math.log10(span));
    const min = rawMin < 0 ? Math.floor((rawMin - span * .06) / step) * step : 0;
    const max = Math.ceil((rawMax + span * .06) / step) * step;
    const left = Math.max(128, c.width * .22), right = c.width - Math.max(72, c.width * .10), x = v => left + (v - min) / (max - min) * (right - left);
    [min, 0, max].filter((v, i, a) => a.findIndex(n => Math.abs(n - v) < 1e-6) === i).forEach(v => {
      line(c, x(v), 8, x(v), axisY - 20, { stroke: v === 0 ? colors.muted : colors.line });
      if (v === 0 || Math.abs(x(v) - x(0)) > 45) text(c, x(v), axisY, signed(v), v === min ? 'start' : v === max ? 'end' : 'middle');
    });
    bars.forEach((b, i) => {
      const y = 14 * factor + i * rowHeight, positive = values[i] >= 0;
      text(c, 0, y + 16, labels[i]);
      if (i > 0 && i < 5) line(c, x(b.start), y - 11, x(b.start), y, { 'stroke-dasharray': '3 3' });
      c.add('rect', { x: x(Math.min(b.start, b.end)), y, width: Math.max(0, Math.abs(x(b.end) - x(b.start))), height: 22, fill: i === 0 || i === 5 ? colors.ink : positive ? colors.teal : colors.amber });
      if (Math.abs(values[i]) < 1e-7) line(c, x(0), y + 2, x(0), y + 20, { stroke: colors.ink, 'stroke-width': 2 });
      text(c, c.width - 1, y + 16, `${signed(values[i])}k`, 'end');
    });
    text(c, (left + right) / 2, axisY + 16, 'Value ($ thousands)', 'middle');
  }
  function sensitivity(host, p) {
    const c = chart(host, 188, 'Illustrative net economic impact versus adoption from 0 to 100 percent, holding other assumptions fixed.'); if (!c) return;
    const points = Array.from({ length: 101 }, (_, adoption) => ({ adoption, y: model.calculate({ ...p, adoption }).net * 10000 }));
    const low = Math.min(0, ...points.map(d => d.y)), high = Math.max(0, ...points.map(d => d.y));
    const span = Math.max(10, high - low), min = low - span * .1, max = high + span * .2;
    const left = 48, right = c.width - 16, top = 22, bottom = 143;
    const x = v => left + v / 100 * (right - left), y = v => bottom - (v - min) / (max - min) * (bottom - top);
    [low, 0, high].filter((v, i, a) => a.findIndex(n => Math.abs(n - v) < 1e-6) === i).forEach(v => { line(c, left, y(v), right, y(v), { stroke: v === 0 ? colors.muted : colors.line }); text(c, left - 7, y(v) + 4, signed(v), 'end'); });
    const ticks = c.width < 450 ? [0, 50, 100] : [0, 25, 50, 75, 100];
    ticks.forEach(v => text(c, x(v), 163, String(v), v === 0 ? 'start' : v === 100 ? 'end' : 'middle'));
    c.add('path', { d: points.map((d, i) => `${i ? 'L' : 'M'}${x(d.adoption)},${y(d.y)}`).join(' '), fill: 'none', stroke: colors.teal, 'stroke-width': 2.5 });
    const current = model.calculate(p).net * 10000;
    c.add('circle', { cx: x(p.adoption), cy: y(current), r: 5, fill: colors.ink, stroke: '#fff', 'stroke-width': 2 });
    text(c, x(p.adoption), y(current) - 12, money(current), p.adoption > 75 ? 'end' : p.adoption < 25 ? 'start' : 'middle', { 'font-weight': 650 });
    text(c, (left + right) / 2, 183, 'Adoption of eligible tasks (%)', 'middle');
  }
  document.querySelectorAll('[data-value]').forEach(root => {
    root.querySelectorAll('[data-enhanced]').forEach(e => { e.hidden = false; });
    const inputs = [...root.querySelectorAll('[data-param]')], presets = [...root.querySelectorAll('[data-preset]')];
    function params() { return Object.fromEntries(inputs.map(input => [input.dataset.param, Number(input.value)])); }
    function draw() { const p = params(), result = model.calculate(p); waterfall(root.querySelector('[data-waterfall]'), p, result); sensitivity(root.querySelector('[data-sensitivity]'), p); }
    function render() {
      const p = params(), result = model.calculate(p);
      inputs.forEach(input => { const key = input.dataset.param, value = p[key]; root.querySelector(`[data-value-label="${key}"]`).textContent = `${key === 'cost' || key === 'risk' ? value.toFixed(1) : value}%`; input.setAttribute('aria-valuetext', `${value} percent`); });
      root.querySelector('[data-net]').textContent = money(result.net * 10000);
      root.querySelector('[data-net-label]').textContent = 'illustrative net economic impact';
      root.querySelector('[data-capacity]').textContent = `${(result.capacity * 100).toFixed(2)}%`;
      root.querySelector('[data-net-percent]').textContent = `${result.net < 0 ? '−' : ''}${Math.abs(result.net * 100).toFixed(2)}%`;
      root.querySelector('[data-print-inputs]').textContent = `Adoption ${p.adoption}% · net task saving ${p.saving}% · capacity captured ${p.capture}%.`;
      root.querySelector('[data-assumption-line]').textContent = `Activity share ${p.share}% · eligibility ${p.eligible}% · AI/pilot cost ${p.cost.toFixed(1)}% · quality allowance ${p.risk.toFixed(1)}%.`;
      root.querySelector('[data-model-note]').textContent = result.extraEffort > 0 ? `Slowdown adds ${(result.extraEffort * 100).toFixed(2)}% human effort, valued at ${money(result.extraEffort * 10000)}. Cash impact before additional staffing is ${money(result.cashNet * 10000)}. Extra effort is not discounted by capture.` : p.capture === 0 ? 'No capture: released capacity stays an effort benefit. AI/pilot costs and the quality allowance still reduce the net result.' : 'Illustrative assumptions, not a forecast. Capacity is effort equivalent; cash savings need Finance-approved capture.';
      const table = root.querySelector('.model-fallback');
      table.querySelector('caption').textContent = 'Current illustrative assumptions · annual values per $10M';
      [result.capacity, -result.uncaptured, -p.cost / 100, -p.risk / 100, -result.extraEffort, result.net].forEach((value, i) => { table.querySelectorAll('td')[i].textContent = money(value * 10000); });
      draw();
    }
    inputs.forEach(input => input.addEventListener('input', () => { presets.forEach(b => b.setAttribute('aria-pressed', 'false')); render(); }));
    presets.forEach(button => button.addEventListener('click', () => { const p = model.presets[button.dataset.preset]; inputs.forEach(input => { input.value = p[input.dataset.param]; }); presets.forEach(b => b.setAttribute('aria-pressed', String(b === button))); render(); }));
    root.querySelector('.model-fallback').hidden = true;
    watch(root.querySelector('[data-waterfall]'), draw); render();
  });

  document.querySelectorAll('[data-evidence]').forEach(root => {
    const buttons = [...root.querySelectorAll('[data-study]')], host = root.querySelector('[data-evidence-plot]'); let selected = 0;
    function select(i) { selected = i; buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); root.querySelector('[data-evidence-detail]').textContent = model.studies[i].detail; draw(); }
    function draw() {
      const mobile = host.clientWidth < 540, row = mobile ? 74 : 57, height = row * 3 + 72;
      const c = chart(host, height, 'METR change in completion time with AI. Early 2025: +19%, interval +2 to +39%. Late 2025 returning: −18%, interval −38 to +9%. Late 2025 new: −4%, interval −15 to +9%.'); if (!c) return;
      const left = mobile ? 16 : 180, right = c.width - 22;
      const min = Math.floor(Math.min(...model.studies.map(s => s.low)) / 10) * 10, max = Math.ceil(Math.max(...model.studies.map(s => s.high)) / 10) * 10;
      const x = v => left + (v - min) / (max - min) * (right - left);
      [min, 0, max].forEach(v => { line(c, x(v), 30, x(v), height - 46, { stroke: v === 0 ? colors.muted : colors.line, 'stroke-dasharray': v === 0 ? '4 4' : 'none' }); text(c, x(v), height - 27, `${signed(v)}%`, v === min ? 'start' : v === max ? 'end' : 'middle'); });
      text(c, left, 14, '← Faster'); text(c, right, 14, 'Slower →', 'end');
      model.studies.forEach((s, i) => {
        const y = 54 + i * row + (mobile ? 16 : 0), color = i === selected ? colors.teal : colors.muted;
        text(c, mobile ? left : 0, mobile ? y - 23 : y + 4, s.label, 'start', { 'font-weight': i === selected ? 650 : 400 });
        const g = c.add('g', { class: 'evidence-mark', 'data-evidence-row': i });
        g.append(svgElement('rect', { x: left - 8, y: y - 18, width: right - left + 16, height: 38, fill: 'transparent' }));
        g.append(svgElement('line', { x1: x(s.low), x2: x(s.high), y1: y, y2: y, stroke: color, 'stroke-width': i === selected ? 3 : 2 }));
        [s.low, s.high].forEach(v => g.append(svgElement('line', { x1: x(v), x2: x(v), y1: y - 5, y2: y + 5, stroke: color, 'stroke-width': 2 })));
        g.append(svgElement('circle', { cx: x(s.value), cy: y, r: 6, fill: i === selected ? color : '#fcfcfa', stroke: color, 'stroke-width': 2 }));
        g.addEventListener('click', () => select(i));
        text(c, x(s.value), y + 20, `${signed(s.value)}%`, 'middle', { 'font-weight': 650 });
      });
      text(c, (left + right) / 2, height - 6, 'Change in task completion time (%)', 'middle');
    }
    buttons.forEach((button, i) => button.addEventListener('click', () => select(i)));
    watch(host, draw); draw();
  });
})();

(() => {
  'use strict';
  document.querySelectorAll('[data-architecture-map]').forEach(map => {
    const nodes = [...map.querySelectorAll('[data-architecture-node]')];
    const details = [...map.querySelectorAll('[data-architecture-detail]')];
    function clearSelection() {
      nodes.forEach(node => node.setAttribute('aria-pressed', 'false'));
      details.forEach(item => { item.hidden = true; });
      map.querySelector('[data-inspector-name]').textContent = 'Select a component in the diagram';
      map.querySelector('.architecture-inspector').open = false;
    }
    function select(node, expand = true, source = 'manual') {
      map.querySelector('[data-inspector-name]').textContent = node.getAttribute('aria-label').replace(/^Inspect /, '');
      if (expand) map.querySelector('.architecture-inspector').open = true;
      nodes.forEach(item => item.setAttribute('aria-pressed', String(item === node)));
      details.forEach(item => { item.hidden = item.dataset.architectureDetail !== node.dataset.architectureNode; });
      map.dispatchEvent(new CustomEvent('qe:component-selected', { detail: { node: node.dataset.architectureNode, source } }));
    }
    map.addEventListener('qe:tour-step', event => {
      const node = nodes.find(item => item.dataset.architectureNode === event.detail.node);
      if (node) select(node, false, 'tour');
    });
    map.addEventListener('qe:overview', clearSelection);
    nodes.forEach(node => {
      node.addEventListener('click', () => select(node));
      node.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        select(node);
      });
    });
    clearSelection();
  });
})();

// A complete vertical summary offers a readable alternative to panning a map.
(() => {
  document.querySelectorAll('.research-figure').forEach(figure => {
    const shell = figure.querySelector('.diagram-shell'), svg = shell.querySelector('svg');
    const controls = document.createElement('div'); controls.className = 'diagram-view-controls';
    const overview = document.createElement('ul'); overview.className = 'diagram-overview';
    const nodes = [...svg.querySelectorAll('.diagram-node')];
    nodes.forEach(node => {
      const label = node.querySelector('.node-title');
      if (!label) return;
      const item = document.createElement('li'), heading = document.createElement('strong'); heading.textContent = label.textContent;
      const detail = [...node.querySelectorAll('.node-text')].map(el => el.textContent).join(' · ');
      item.append(heading, document.createTextNode(detail)); overview.append(item);
    });
    if (!overview.children.length) {
      const text = figure.querySelector('.rationale-copy > div:last-child p')?.textContent || svg.querySelector('title')?.textContent;
      const item = document.createElement('li'); item.textContent = text; overview.append(item);
    }
    const summary = document.createElement('button'), detail = document.createElement('button');
    summary.type = detail.type = 'button'; summary.textContent = 'Readable overview'; detail.textContent = 'Detailed diagram';
    controls.append(summary, detail); figure.prepend(controls); shell.after(overview);
    const tour = figure.querySelector('.diagram-tour');
    const narrow = matchMedia('(max-width: 700px)');
    let manualView = false;
    function select(simple) {
      overview.hidden = !simple; shell.hidden = simple;
      summary.setAttribute('aria-pressed', String(simple)); detail.setAttribute('aria-pressed', String(!simple));
      const hint = figure.querySelector('.diagram-pan-hint'); if (hint) hint.hidden = simple;
      if (tour) tour.classList.toggle('summary-hidden', simple);
      figure.dispatchEvent(new CustomEvent('qe:view-changed'));
    }
    summary.addEventListener('click', () => { manualView = true; select(true); }); detail.addEventListener('click', () => { manualView = true; select(false); });
    narrow.addEventListener('change', () => { if (!manualView) select(narrow.matches); });
    select(narrow.matches);
  });
})();

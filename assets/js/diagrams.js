(() => {
  'use strict';
  document.querySelectorAll('[data-architecture-map]').forEach(map => {
    const nodes = [...map.querySelectorAll('[data-architecture-node]')];
    const details = [...map.querySelectorAll('[data-architecture-detail]')];
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
    nodes.forEach(node => {
      node.addEventListener('click', () => select(node));
      node.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        select(node);
      });
    });
    select(nodes.find(node => node.dataset.architectureNode === 'gateway') || nodes[0], false, 'initial');
  });
})();

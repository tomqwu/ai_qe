(() => {
  'use strict';
  const host = document.querySelector('[data-ai-adoption]');
  if (!host) return;
  const links = [...host.querySelectorAll('[data-al-select]')];
  const panels = [...host.querySelectorAll('[data-al-detail]')];
  const all = host.querySelector('[data-al-all]');
  const workflow = host.querySelector('[data-al-workflow]');
  function render() {
    const chosen = new URLSearchParams(location.search).get('workflow');
    workflow.value = [...workflow.options].some(o => o.value === chosen) ? chosen : '';
    const id = location.hash.replace('#layer-', '');
    const selected = location.hash === '#all-layers' ? null : panels.find(p => p.dataset.alDetail === id) || panels[0];
    panels.forEach(panel => { panel.hidden = Boolean(selected && panel !== selected); });
    links.forEach(link => link.setAttribute('aria-current', String(Boolean(selected && link.dataset.alSelect === selected.dataset.alDetail))));
    all.setAttribute('aria-pressed', String(!selected));
    host.querySelector('[data-al-status]').textContent = selected ? `Selected: ${selected.querySelector('h3').textContent}` : 'All four layers are shown.';
  }
  workflow.addEventListener('change', () => { const url = new URL(location.href); url.searchParams.set('workflow', workflow.value); history.replaceState(null, '', url); });
  links.forEach(link => link.addEventListener('click', event => {
    // Keep normal new-tab and modifier-click behavior.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, '', link.hash);
    render();
  }));
  all.addEventListener('click', () => { history.pushState(null, '', '#all-layers'); render(); });
  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);
  host.querySelector('[data-al-controls]').hidden = false;
  render();
})();

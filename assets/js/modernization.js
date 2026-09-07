(() => {
  'use strict';
  const select = document.querySelector('[data-mod-surface-select]');
  if (!select) return;
  const panels = [...document.querySelectorAll('[data-mod-surface]')];
  const choose = (value, write) => {
    if (!panels.some(panel => panel.dataset.modSurface === value)) value = 'api';
    select.value = value;
    panels.forEach(panel => { panel.hidden = panel.dataset.modSurface !== value; });
    if (write) { const url = new URL(location.href); url.searchParams.set('surface', value); history.replaceState(null, '', url); }
  };
  document.querySelector('[data-mod-controls]').hidden = false;
  select.addEventListener('change', () => choose(select.value, true));
  choose(new URLSearchParams(location.search).get('surface'), false);
})();

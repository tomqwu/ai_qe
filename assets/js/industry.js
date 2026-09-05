(() => {
  'use strict';
  document.querySelectorAll('[data-capability-map]').forEach(map => {
    const buttons = [...map.querySelectorAll('[data-capability]')];
    const panels = [...map.querySelectorAll('[data-capability-detail]')];
    function select(key) {
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.capability === key)));
      panels.forEach(panel => { panel.hidden = panel.dataset.capabilityDetail !== key; });
    }
    buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.capability)));
    select('tests');
    map.classList.add('map-ready');
  });
  document.querySelectorAll('[data-source-library]').forEach(library => {
    const query = library.querySelector('[data-source-query]');
    const kind = library.querySelector('[data-source-kind]');
    const scope = library.querySelector('[data-source-scope]');
    const records = [...library.querySelectorAll('[data-source-record]')];
    const status = library.querySelector('[data-source-count]');
    function filter() {
      const words = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      records.forEach(record => {
        const match = (!kind.value || record.dataset.kind === kind.value) && (!scope.value || record.dataset.scope === scope.value) && words.every(word => record.textContent.toLocaleLowerCase().includes(word));
        record.hidden = !match;
        if (match) count++;
      });
      status.textContent = `${count} of ${records.length} sources${count === 0 ? ' · Clear filters or try a broader search.' : ''}`;
    }
    query.addEventListener('input', filter);
    kind.addEventListener('change', filter);
    scope.addEventListener('change', filter);
    library.querySelector('[data-source-reset]').addEventListener('click', () => { query.value = ''; kind.value = ''; scope.value = ''; filter(); query.focus(); });
    function revealHash() {
      const target = records.find(record => `#${record.id}` === location.hash);
      if (!target) return;
      query.value = ''; kind.value = ''; scope.value = ''; filter();
      const detail = target.querySelector('details'); if (detail) detail.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
    filter(); revealHash();
    window.addEventListener('hashchange', revealHash);
    library.querySelector('[data-source-controls]').hidden = false;
  });
})();

(() => {
  'use strict';
  const root = document.querySelector('[data-dictionary]');
  if (!root) return;
  const query = root.querySelector('#dictionary-query');
  const topic = root.querySelector('#dictionary-topic');
  const count = root.querySelector('[data-dictionary-count]');
  const records = [...root.querySelectorAll('[data-dictionary-term]')];
  const letters = [...root.querySelectorAll('[data-letter]:not([data-dictionary-term])')];
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const texts = new Map(records.map(record => [record, normalize([
    record.querySelector('h2').textContent, record.querySelector('.dictionary-aliases').textContent,
    record.querySelector('.dictionary-definition').textContent, record.querySelector('.dictionary-example').textContent
  ].join(' '))]));

  function saveURL(clearHash = false) {
    const url = new URL(location.href);
    for (const [key, value] of [['q', query.value.trim()], ['topic', topic.value]]) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    if (clearHash) url.hash = '';
    history.replaceState(null, '', url);
  }
  function filter() {
    const words = normalize(query.value).split(' ').filter(Boolean);
    const visibleLetters = new Map();
    let visible = 0;
    records.forEach(record => {
      const text = texts.get(record);
      record.hidden = !((!topic.value || record.dataset.category === topic.value) && words.every(word => word.length <= 3 ? text.split(' ').includes(word) : text.includes(word)));
      if (!record.hidden) {
        visible++;
        if (!visibleLetters.has(record.dataset.letter)) visibleLetters.set(record.dataset.letter, record.querySelector('h2').id);
      }
    });
    count.textContent = `${visible} of ${records.length} terms · A–Z`;
    root.querySelector('[data-dictionary-map]').hidden = Boolean(query.value.trim() || topic.value);
    root.querySelector('[data-dictionary-empty]').hidden = visible > 0;
    letters.forEach(link => {
      const id = visibleLetters.get(link.dataset.letter);
      link.hidden = !id;
      if (id) link.setAttribute('href', '#' + id);
    });
  }
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const record = records.find(item => item.querySelector('h2').id === id);
    if (!record) return;
    if (record.hidden) { query.value = ''; topic.value = ''; filter(); saveURL(); }
    requestAnimationFrame(() => {
      const heading = record.querySelector('h2');
      heading.focus({preventScroll: true});
      heading.scrollIntoView({block: 'start'});
    });
  }
  function restore() {
    const params = new URL(location.href).searchParams;
    query.value = params.get('q') || '';
    topic.value = params.get('topic') || '';
    if (!topic.value) topic.value = '';
    filter(); revealHash();
  }
  query.addEventListener('input', () => { filter(); saveURL(true); });
  topic.addEventListener('change', () => { filter(); saveURL(true); });
  root.querySelector('[data-dictionary-reset]').addEventListener('click', () => {
    query.value = ''; topic.value = ''; filter(); saveURL(true); query.focus();
  });
  root.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash === location.hash) revealHash();
  });
  window.addEventListener('hashchange', revealHash);
  window.addEventListener('popstate', restore);
  root.querySelector('[data-dictionary-controls]').hidden = false;
  restore();
})();

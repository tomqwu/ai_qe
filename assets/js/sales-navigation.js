(() => {
  'use strict';
  const menu = document.querySelector('#conversation-menu');
  const nav = document.querySelector('#conversation-nav');
  if (menu && nav) {
    const desktop = matchMedia('(min-width: 50rem)');
    const setOpen = open => { nav.hidden = !desktop.matches && !open; menu.setAttribute('aria-expanded', String(open)); };
    const resize = () => { menu.hidden = desktop.matches; setOpen(false); };
    menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !desktop.matches && !nav.hidden) { setOpen(false); menu.focus(); } });
    nav.addEventListener('click', event => { if (event.target.closest('a') && !desktop.matches) setOpen(false); });
    desktop.addEventListener('change', resize);
    resize();
  }
  document.querySelector('[data-close-search]')?.addEventListener('click', () => {
    const search = document.querySelector('#search-input');
    if (search) { search.value = ''; search.dispatchEvent(new Event('input')); }
    document.documentElement.classList.remove('search-active');
    if (menu && !menu.hidden) menu.focus();
  });
  const room = document.querySelector('[data-presentation-room]');
  if (!room) return;
  room.querySelector('.room-filters').hidden = false;
  const buttons = [...room.querySelectorAll('[data-room-filter]')];
  const cards = [...room.querySelectorAll('[data-deck-audience]')];
  const status = room.querySelector('[data-room-status]');
  function choose(audience, write = true) {
    if (!['all','evp','technical'].includes(audience)) audience = 'all';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.roomFilter === audience)));
    cards.forEach(card => { card.hidden = audience !== 'all' && card.dataset.deckAudience !== audience; });
    status.textContent = `${cards.filter(card => !card.hidden).length} briefings · ${audience === 'all' ? 'all audiences' : audience === 'evp' ? 'EVP & sponsors' : 'Technical SDs & leads'}`;
    if (write) { const url = new URL(location.href); audience === 'all' ? url.searchParams.delete('for') : url.searchParams.set('for', audience); history.replaceState(null, '', url); }
  }
  buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.roomFilter)));
  choose(new URLSearchParams(location.search).get('for') || 'all', false);
})();

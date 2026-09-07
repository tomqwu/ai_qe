(() => {
  'use strict';
  const player = document.querySelector('[data-briefing-player]');
  if (!player) return;
  const tabs = [...player.querySelectorAll('[role="tab"]')], frame = player.querySelector('iframe');
  const panel = player.querySelector('[role="tabpanel"]'), openLink = player.querySelector('[data-deck-link]');
  const positions = { evp: 'slide-1', technical: 'slide-1' };
  let audience = 'evp';
  function updateURL(slide, writeHistory = true) {
    const url = new URL(location.href); url.searchParams.set('audience', audience); url.searchParams.set('slide', slide); url.hash = 'briefings';
    if (writeHistory) history.replaceState(null, '', url);
    const target = new URL(tabs.find(t => t.dataset.audience === audience).href); target.hash = slide; openLink.href = target.href;
  }
  function selectTab(tab, slide, writeHistory = true) {
    if (!tab) return;
    audience = tab.dataset.audience;
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tab.id);
    frame.title = tab.dataset.deckTitle ? `${tab.dataset.deckTitle} presentation` : audience === 'evp' ? 'EVP strategic vision presentation' : 'Technical assurance architecture presentation';
    openLink.textContent = tab.dataset.deckTitle ? `Open ${tab.dataset.deckTitle} ↗` : audience === 'evp' ? 'Open strategic vision ↗' : 'Open assurance architecture ↗';
    const target = new URL(tab.href); target.hash = slide || positions[audience]; frame.src = target.href;
    updateURL(target.hash.slice(1), writeHistory);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); selectTab(tab);
    });
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault(); tabs[keys[event.key]].focus(); selectTab(tabs[keys[event.key]]);
    });
  });
  player.querySelectorAll('[data-visual-audience]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); selectTab(tabs.find(t => t.dataset.audience === link.dataset.visualAudience), new URL(link.href).hash.slice(1));
    panel.scrollIntoView({block: 'start'});
  }));
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'ai-qe:deck-state') return;
    if (event.data.audience !== audience || !/^slide-[1-9]\d*$/.test(event.data.slide)) return;
    positions[audience] = event.data.slide; updateURL(event.data.slide, event.data.interaction === true);
  });
  const params = new URLSearchParams(location.search), requested = params.get('audience'), slide = params.get('slide');
  if (['evp', 'technical'].includes(requested)) selectTab(tabs.find(t => t.dataset.audience === requested), /^slide-[1-9]\d*$/.test(slide) ? slide : 'slide-1', false);
})();

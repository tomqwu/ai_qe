(() => {
  'use strict';
  const player = document.querySelector('[data-briefing-player]');
  if (!player) return;
  const tabs = [...player.querySelectorAll('[role="tab"]')];
  const frame = player.querySelector('iframe');
  const panel = player.querySelector('[role="tabpanel"]');
  const openLink = player.querySelector('[data-deck-link]');
  const labels = {
    evp: ['EVP strategic vision presentation', 'Open strategic vision ↗'],
    technical: ['Technical assurance architecture presentation', 'Open assurance architecture ↗']
  };
  function selectTab(tab) {
    if (tab.getAttribute('aria-selected') === 'true') return;
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    const [title, linkText] = labels[tab.dataset.audience];
    panel.setAttribute('aria-labelledby', tab.id);
    frame.title = title;
    frame.src = tab.href;
    openLink.href = tab.href;
    openLink.textContent = linkText;
  }
  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectTab(tab);
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectTab(tabs[next]);
    });
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'ai-qe:deck-navigated') {
      panel.scrollIntoView({ block: 'start' });
      return;
    }
    if (event.data?.type !== 'ai-qe:deck-height') return;
    const height = Number(event.data.height);
    if (Number.isFinite(height) && height >= 200 && height <= 12000) frame.style.height = `${Math.ceil(height)}px`;
  });
})();

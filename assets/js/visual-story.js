(() => {
  'use strict';
  document.querySelectorAll('[data-vs-dependencies]').forEach(host => {
    const data = JSON.parse(host.querySelector('[data-vs-adoption]').textContent);
    const workflow = host.querySelector('[data-vs-workflow]'), scope = host.querySelector('[data-vs-scope]');
    const q = selector => host.querySelector(selector);
    const initial = new URLSearchParams(location.search);
    workflow.value = data.workflows.some(w => w.id === initial.get('workflow')) ? initial.get('workflow') : 'automation';
    scope.value = initial.get('scope') === 'scale' ? 'scale' : 'pilot';
    let selected;
    function render(write = false) {
      const result = window.QEReadiness.assess(data, workflow.value, scope.value, {});
      if (!result.requirements.some(d => d.id === selected)) selected = result.requirements[0].id;
      q('[data-vs-map-title]').textContent = result.workflow.title + ' → ' + result.workflow.output;
      q('[data-vs-map-summary]').textContent = `${result.requirements.length} required capabilities · all unverified. Select a capability to inspect its owner and evidence. ${scope.value === 'scale' ? 'Reuse requires level 3 for platform, people and evidence.' : 'A pilot needs repeatability at level 2 for each required capability.'}`;
      host.querySelectorAll('[data-vs-column]').forEach(cell => cell.classList.toggle('vs-selected', cell.dataset.vsColumn === workflow.value));
      const chips = q('[data-vs-required]'); chips.replaceChildren();
      result.requirements.forEach(dep => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = dep.title;
        button.dataset.vsRequirement = dep.id; button.setAttribute('aria-pressed', String(dep.id === selected));
        button.addEventListener('click', () => { selected = dep.id; render(); q('[data-vs-requirement="' + selected + '"]').focus(); }); chips.append(button);
      });
      const dep = data.dependencies.find(d => d.id === selected), proof = q('[data-vs-proof]'); proof.replaceChildren();
      for (const [label, value] of [['Owner', dep.owner], ['Evidence to collect', dep.evidence], ['If missing', dep.action]]) {
        const p = document.createElement('p'), b = document.createElement('strong'); b.textContent = label + ': '; p.append(b, value); proof.append(p);
      }
      const link = new URL(q('[data-vs-assess]').href); link.search = new URLSearchParams({preset:'unknown',workflow:workflow.value,scope:scope.value}); q('[data-vs-assess]').href = link.href;
      if (write) { const url = new URL(location.href); url.searchParams.set('workflow', workflow.value); url.searchParams.set('scope', scope.value); history.replaceState(null, '', url); }
    }
    q('[data-vs-controls]').hidden = false; q('[data-vs-map-result]').hidden = false;
    workflow.addEventListener('change', () => render(true)); scope.addEventListener('change', () => render(true)); render();
  });
  document.querySelectorAll('[data-vs-artifacts]').forEach(host => {
    const panels = [...host.querySelectorAll('[data-vs-artifact]')], select = host.querySelector('[data-vs-artifact-select]');
    function show(id, write) {
      if (!panels.some(p => p.dataset.vsArtifact === id)) id = panels[0].dataset.vsArtifact;
      panels.forEach(p => p.hidden = p.dataset.vsArtifact !== id); select.value = id;
      host.querySelectorAll('[data-vs-artifact-node]').forEach(node => { const active = node.dataset.vsArtifactNode === id; node.classList.toggle('vs-current', active); node.querySelector('a').setAttribute('aria-current', active ? 'step' : 'false'); });
      host.querySelector('[data-vs-artifact-next]').disabled = id === panels.at(-1).dataset.vsArtifact;
      if (write) history.replaceState(null, '', '#sample-' + id);
    }
    host.querySelector('[data-vs-artifact-controls]').hidden = false;
    select.addEventListener('change', () => show(select.value, true));
    host.querySelector('[data-vs-artifact-next]').addEventListener('click', () => show(panels[Math.min(select.selectedIndex + 1, panels.length - 1)].dataset.vsArtifact, true));
    host.querySelectorAll('[data-vs-artifact-node] a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); show(a.hash.replace('#sample-', ''), true); }));
    window.addEventListener('hashchange', () => show(location.hash.replace('#sample-', ''), false));
    show(location.hash.replace('#sample-', ''), false);
  });
  document.querySelectorAll('[data-vs-lifecycle]').forEach(host => {
    const steps = [...host.querySelectorAll('[data-vs-life-step]')], outcome = host.querySelector('[data-vs-life-outcome]');
    const next = host.querySelector('[data-vs-life-next]'), status = host.querySelector('[data-vs-life-status]'); let position = -1;
    const route = () => outcome.value === 'setup-failure' ? [0,3,4,5] : [0,1,2,3,4,5];
    function render() {
      const current = route()[position];
      steps.forEach((step,i) => { step.classList.toggle('vs-current', i === current); step.classList.toggle('vs-skipped', position >= 0 && !route().includes(i)); });
      next.disabled = position === route().length - 1;
      let message = position < 0 ? 'Evidence survives cleanup. A missing or failed required check holds the release.' : `Step ${current + 1}: ${steps[current].innerText.replace(/\s+/g,' ').replace(/^\d+\s*/,'')}`;
      if (position >= 0 && outcome.value === 'setup-failure') message += ' Setup failed: execution is skipped; retain diagnostics and attempt cleanup. Release held.';
      else if (position >= 2 && outcome.value === 'test-failure') message += ' Payment assertion failed: retain the failure and attempt cleanup. Release held.';
      else if (position === route().length - 1) message += ' Passing these checks still requires complete integration evidence and human release review.';
      status.textContent = message; status.classList.toggle('vs-failure', position >= 0 && outcome.value !== 'pass');
    }
    host.querySelector('[data-vs-life-controls]').hidden = false;
    next.addEventListener('click', () => {position = Math.min(position + 1, route().length - 1); render();});
    host.querySelector('[data-vs-life-reset]').addEventListener('click', () => {position = -1; render();});
    outcome.addEventListener('change', () => {position = -1; render();}); render();
  });
})();

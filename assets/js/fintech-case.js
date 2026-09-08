(() => {
  'use strict';
  const host = document.querySelector('[data-fintech-case]');
  if (!host || !window.FintechModel) return;
  const data = JSON.parse(host.querySelector('[data-fintech-data]').textContent);
  const q = selector => host.querySelector(selector);
  host.querySelectorAll('[data-workflow-controls], [data-model-controls], [data-sim-controls]').forEach(el => el.hidden = false);
  const stages = [...host.querySelectorAll('[data-workflow-stage]')];
  function showStage(id, updateHash = false) {
    if (!stages.some(s => s.dataset.workflowStage === id)) return;
    stages.forEach(s => s.hidden = s.dataset.workflowStage !== id);
    host.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.stage === id)));
    if (updateHash) history.replaceState(null, '', `#workflow-${id}`);
  }
  const hashStage = () => showStage(location.hash.replace('#workflow-', ''));
  showStage('requirements'); hashStage();
  window.addEventListener('hashchange', hashStage);
  host.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => showStage(b.dataset.stage, true)));
  const format = n => Number(n.toFixed(1)).toLocaleString('en-CA');
  function updateModel() {
    const input = q('[data-capture]');
    if (!input.value.trim() || !input.checkValidity()) { input.setAttribute('aria-invalid', 'true'); q('[data-model-output]').textContent = 'Enter a capacity percentage from 0 to 100 to calculate the result.'; return; }
    input.removeAttribute('aria-invalid');
    const profile = data.profiles.find(p => p.id === q('[data-profile]').value), capture = Number(input.value);
    const result = FintechModel.capacity(data, profile.id, capture);
    q('[data-readiness]').querySelectorAll('span').forEach((el, i) => el.textContent = profile.readiness[i]);
    q('[data-recommendation]').textContent = profile.recommendation;
    q('[data-profile-gate]').textContent = `Next evidence gate: ${profile.gate}`;
    host.querySelectorAll('[data-hours]').forEach((row, i) => {
      row.querySelector('[data-work]').textContent = profile.work[i];
      row.querySelector('[data-review]').textContent = profile.review[i];
      row.querySelector('[data-total]').textContent = profile.work[i] + profile.review[i];
    });
    q('[data-total-work]').textContent = result.work; q('[data-total-review]').textContent = result.review; q('[data-total-assisted]').textContent = result.after;
    const scale = Math.max(result.baseline, result.after);
    for (const [key, value, suffix] of [['baseline', result.baseline, 'h'], ['work', result.work, 'h work'], ['review', result.review, 'h']]) {
      const bar = q(`[data-chart-${key}]`); bar.style.width = `${value / scale * 100}%`; bar.textContent = `${value}${suffix}`;
    }
    q('[data-model-chart]').setAttribute('aria-label', `Modelled effort: ${result.baseline} baseline hours compared with ${result.work} assisted work hours and ${result.review} review hours`);
    const title = document.createElement('strong'), body = document.createElement('p');
    title.textContent = result.usable < 0 ? `${format(-result.usable)} additional hours per pack` : `${format(result.usable)} usable hours per pack`;
    body.textContent = `${format(result.gross)}h gross capacity − ${data.pilot.overheadHours}h platform operation = ${format(result.net)}h net capacity. ` + (result.net > 0 ? `Redeploying ${capture}% yields ${format(result.usable)}h. ` : 'The full slowdown is retained, regardless of the redeployment percentage. ') + (result.packs === null ? 'Setup capacity cannot be recovered under these assumptions.' : `Recovering ${data.pilot.setupHours}h of setup requires ${result.packs} comparable packs, rounded up.`);
    q('[data-model-output]').replaceChildren(title, body);
  }
  q('[data-profile]').addEventListener('change', updateModel); q('[data-capture]').addEventListener('input', updateModel); updateModel();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)'), simulator = q('[data-payment-simulator]');
  let step = -1, playing = false, timer;
  const play = q('[data-sim-play]'), next = q('[data-sim-next]');
  const money = minor => `CAD ${(minor / 100).toFixed(2)}`;
  function motionAllowed() { let enabled = true; try { enabled = localStorage.getItem('ai-qe:motion') !== 'off'; } catch (_) {} return enabled && !reduce.matches; }
  function stop() { clearTimeout(timer); playing = false; simulator.classList.remove('ft-playing'); play.textContent = step >= 4 ? 'Replay story' : step < 0 ? 'Play story' : 'Resume story'; play.setAttribute('aria-pressed', 'false'); }
  function render() {
    const scenario = q('[data-payment-scenario]').value, bug = q('[data-payment-bug]').checked, result = FintechModel.payment(scenario, bug);
    const title = ['Customer submits CAD 100', 'The API receives a stable request key', scenario === 'retry' ? 'Accepted, but the response times out' : scenario === 'callback' ? 'The provider sends the callback twice' : 'The provider confirms the transfer', result.journals === 2 ? 'The injected defect posts twice' : 'The journal records one transfer', result.pass ? 'The modeled assertions pass' : 'The assertions catch the duplicate'];
    const text = ['The synthetic payer starts at CAD 1,000.00 and the recipient at CAD 0.00.', 'The request carries key pay-142. The reviewed contract requires retries to retain the original transfer identity.', scenario === 'retry' ? 'The customer retries with pay-142. A timeout alone does not establish that the payment failed.' : scenario === 'callback' ? 'Both callback deliveries represent the same provider event. The application must process the financial effect once.' : 'There is one request and one confirmation. No duplicate delivery is introduced.', `${result.journals} journal${result.journals === 1 ? '' : 's'}, with ${result.entries} entries. Payer ${money(result.payer)}; recipient ${money(result.recipient)}.`, result.pass ? 'Journal count and balances match the authored contract. The model passes these checks; real release approval still needs the full required evidence.' : 'Expected one journal, payer CAD 900.00 and recipient CAD 100.00. The case blocks release and sends the evidence to QA and development.'];
    q('[data-sim-stage]').textContent = step < 0 ? 'Ready to inspect' : `Step ${step + 1} of 5`;
    q('[data-sim-title]').textContent = step < 0 ? 'Follow the request, then inspect the outcome' : title[step];
    q('[data-sim-body]').textContent = step < 0 ? 'Play advances every four seconds. Next step lets you control the pace. Compare the injected defect with the required behavior.' : text[step];
    simulator.querySelectorAll('[data-step-node]').forEach((el, i) => { el.classList.toggle('ft-current', i === step); el.setAttribute('aria-current', i === step ? 'step' : 'false'); });
    const output = q('[data-sim-result]');
    output.classList.toggle('ft-failed', step === 4 && !result.pass);
    output.querySelector('strong').textContent = step === 4 ? result.pass ? 'Modeled checks passed' : 'Release blocked in this case' : 'Expected final state';
    output.querySelector('p').textContent = step === 4 ? `${result.journals} journal${result.journals === 1 ? '' : 's'}; payer ${money(result.payer)}; recipient ${money(result.recipient)}. ${result.pass ? 'One financial effect.' : 'The original test intent must survive any repair.'}` : 'One journal; payer CAD 900.00; recipient CAD 100.00. No fees, FX or other activity.';
    next.disabled = step === 4;
    if (!playing) stop();
  }
  function advance() { step = Math.min(4, step + 1); render(); if (step === 4) stop(); }
  function schedule() { timer = setTimeout(() => { if (!motionAllowed() || document.hidden) { stop(); return; } advance(); if (playing) schedule(); }, 4000); }
  play.addEventListener('click', () => {
    if (playing) { stop(); return; }
    if (!motionAllowed()) return;
    if (step >= 4) step = -1;
    playing = true; simulator.classList.add('ft-playing'); play.textContent = 'Pause story'; play.setAttribute('aria-pressed', 'true');
    if (step < 0) advance(); schedule();
  });
  next.addEventListener('click', () => { stop(); advance(); });
  const reset = () => { stop(); step = -1; render(); };
  q('[data-sim-reset]').addEventListener('click', reset);
  q('[data-payment-scenario]').addEventListener('change', reset); q('[data-payment-bug]').addEventListener('change', reset);
  function syncMotion() { const allowed = motionAllowed(); if (!allowed) stop(); play.disabled = !allowed; q('[data-sim-motion]').textContent = allowed ? 'Each step holds for four seconds.' : 'Motion is off. Use Next step to read the story.'; }
  reduce.addEventListener('change', syncMotion);
  new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  window.addEventListener('storage', syncMotion); document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  syncMotion(); render();
})();

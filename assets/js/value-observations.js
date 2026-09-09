(() => {
  'use strict';
  const host = document.querySelector('[data-value-observations]');
  const dataNode = document.querySelector('[data-fintech-data]');
  if (!host || !dataNode || !window.FintechModel) return;
  const data = JSON.parse(dataNode.textContent), arms = [...host.querySelectorAll('[data-value-arm]')];
  let observations, result;
  const format = value => Number(value.toFixed(2)).toLocaleString('en-CA');
  function update() {
    observations = Object.fromEntries(arms.map(arm => [arm.dataset.valueArm, {
      workflowIds:data.workflow.map(s => s.id),
      ...Object.fromEntries([...arm.querySelectorAll('[data-value-field]')].map(input => [input.dataset.valueField,input.type === 'checkbox' ? input.checked : input.type === 'number' ? input.value.trim() && input.checkValidity() ? Number(input.value) : null : input.value.trim()]))
    }]));
    result = FintechModel.compare(data, observations);
    for (const key of ['modernization','ai']) {
      const delta = result[key];
      host.querySelector(`[data-value-${key}]`).textContent = delta.hours === null ? `Not yet estimable. ${delta.reason}` : `${format(Math.abs(delta.hours))}h ${delta.hours < 0 ? 'additional effort' : 'less effort'} per comparable pack. ${delta.reason}`;
    }
    for (const arm of arms) {
      const state = result.states[arm.dataset.valueArm];
      arm.querySelector('[data-arm-status]').textContent = state.status === 'entered' ? `· ${format(state.hoursPerPack)}h / pack` : '· Incomplete observation';
      arm.querySelector('[data-arm-proof]').textContent = state.status === 'entered' ? `${format(state.setupHours)}h one-time setup retained separately. Evidence requires owner review.` : `Complete the observation and evidence fields (${state.gaps.length} items remain), including coverage of failed attempts.`;
    }
  }
  host.addEventListener('input', update); host.addEventListener('change', update);
  host.querySelector('[data-value-reset]').addEventListener('click', () => {host.querySelectorAll('input').forEach(input => {if(input.type === 'checkbox') input.checked=false; else input.value='';});update();});
  host.querySelector('[data-value-export]').addEventListener('click', () => {
    const payload = {status:'Entered observations; not verified client results',created:new Date().toISOString(),observations,result,definition:'All eight QA stages; recurring effort includes all attempts, review, correction and operation; setup reported separately. No cash conversion.'};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const link = document.createElement('a');link.href=url;link.download='qe-three-state-comparison.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  host.querySelector('[data-value-actions]').hidden=false;update();
})();

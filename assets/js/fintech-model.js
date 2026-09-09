(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FintechModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function capacity(data, profileId, capturePercent) {
    const profile = data.profiles.find(p => p.id === profileId);
    if (!profile || !Number.isFinite(capturePercent) || capturePercent < 0 || capturePercent > 100) throw new RangeError('Choose a valid profile and a percentage from 0 to 100.');
    if (profile.work.length !== data.workflow.length || profile.review.length !== data.workflow.length) throw new Error('Every workflow stage needs work and review assumptions.');
    const values = [...profile.work, ...profile.review, ...data.workflow.map(s => s.baseline), data.pilot.overheadHours, data.pilot.setupHours];
    if (values.some(x => !Number.isFinite(x) || x < 0)) throw new RangeError('Hours must be nonnegative finite numbers.');
    const sum = arr => arr.reduce((a, b) => a + b, 0);
    const baseline = sum(data.workflow.map(s => s.baseline)), work = sum(profile.work), review = sum(profile.review);
    const after = work + review, gross = baseline - after, net = gross - data.pilot.overheadHours;
    // Lost capacity is a full cost. A low capture rate cannot erase a slowdown.
    const usable = net > 0 ? net * capturePercent / 100 : net;
    return { baseline, work, review, after, gross, net, usable, packs: usable > 0 ? Math.ceil(data.pilot.setupHours / usable) : null };
  }
  function payment(scenario, bug) {
    if (!['normal', 'retry', 'callback'].includes(scenario) || typeof bug !== 'boolean') throw new RangeError('Unknown payment scenario.');
    const journals = scenario !== 'normal' && bug ? 2 : 1;
    const payer = 100000 - journals * 10000, recipient = journals * 10000;
    return { attempts: scenario === 'retry' ? 2 : 1, callbacks: scenario === 'callback' ? 2 : 1, journals, entries: journals * 2, payer, recipient, pass: journals === 1 && payer === 90000 && recipient === 10000 };
  }
  function compare(data, observations) {
    const ids = data.workflow.map(s => s.id).sort();
    const states = {};
    for (const key of ['existing','modernized','ai']) {
      const value = observations?.[key], gaps = [];
      if (!value) { states[key] = {status:'unknown', gaps:['Observation not recorded']}; continue; }
      for (const field of ['scope','acceptanceVersion','applicationBuild','environmentVersion','fixtureVersion','providerVersion','testVersion','owner','evidenceRef']) {
        if (typeof value[field] !== 'string' || !value[field].trim()) gaps.push(field);
      }
      if (JSON.stringify([...(Array.isArray(value.workflowIds) ? value.workflowIds : [])].sort()) !== JSON.stringify(ids)) gaps.push('Same eight-stage QA scope required');
      for (const field of ['workHours','reviewHours','reworkHours','operatingHours','setupHours','failedAttempts','attempts','packs']) {
        if (!Number.isFinite(value[field]) || value[field] < 0) gaps.push(field);
      }
      if (!Number.isInteger(value.packs) || value.packs < 1 || !Number.isInteger(value.attempts) || value.attempts < value.packs || !Number.isInteger(value.failedAttempts) || value.failedAttempts > value.attempts) gaps.push('Complete pack and attempt counts required');
      if (value.allAttemptsIncluded !== true) gaps.push('Include failed attempts and incomplete work');
      states[key] = gaps.length ? {status:'unknown',gaps} : {status:'entered',gaps:[],hoursPerPack:(value.workHours + value.reviewHours + value.reworkHours + value.operatingHours) / value.packs,setupHours:value.setupHours};
    }
    function delta(from, to, aiOnly = false) {
      if (states[from].status !== 'entered' || states[to].status !== 'entered') return {status:'unknown',hours:null,reason:'Complete both observations and their evidence.'};
      const fields = ['scope','acceptanceVersion','applicationBuild', ...(aiOnly ? ['environmentVersion','fixtureVersion','providerVersion'] : [])];
      const mismatch = fields.filter(field => observations[from][field].trim() !== observations[to][field].trim());
      if (mismatch.length) return {status:'unmatched',hours:null,reason:`Comparison differs in ${mismatch.join(', ')}. Record a matched control.`};
      return {status:'entered',hours:states[from].hoursPerPack - states[to].hoursPerPack,reason:'Entered observations; owner review required. Positive = less effort; negative = added effort.'};
    }
    return {states,modernization:delta('existing','modernized'),ai:delta('modernized','ai',true)};
  }
  return { capacity, payment, compare };
});

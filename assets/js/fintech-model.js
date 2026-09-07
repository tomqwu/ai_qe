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
  return { capacity, payment };
});

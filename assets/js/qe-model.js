/* The single source of arithmetic for the interactive scenarios. Percent inputs. */
((root) => {
  'use strict';
  const presets = typeof module !== 'undefined' && module.exports
    ? require('../../_data/scenarios.json')
    : JSON.parse(document.querySelector('[data-qe-scenarios]')?.textContent || '{}');
  function calculate(p) {
    for (const key of ['share', 'eligible', 'adoption', 'saving', 'capture', 'cost', 'risk']) {
      if (!Number.isFinite(p[key]) || p[key] < (key === 'saving' ? -100 : 0) || p[key] > 100) throw new RangeError(`Invalid percentage: ${key}`);
    }
    const taskImpact = p.share / 100 * p.eligible / 100 * p.adoption / 100 * p.saving / 100;
    const capacity = Math.max(0, taskImpact), extraEffort = Math.max(0, -taskImpact);
    const captured = capacity * p.capture / 100;
    const costs = (p.cost + p.risk) / 100;
    const cashNet = captured - costs;
    // Additional effort is an economic burden at the blended labour rate. It is
    // not automatically incremental payroll. Never discount it by cash capture.
    return { taskImpact, capacity, extraEffort, captured, uncaptured: capacity - captured, costs, cashNet, net: cashNet - extraEffort };
  }
  const studies = [
    { label: 'Early 2025', value: 19, low: 2, high: 39, detail: 'Early 2025: 16 developers, 246 issues in familiar repositories. This setting showed a slowdown; it does not represent all software work.' },
    { label: 'Late 2025 / returning', value: -18, low: -38, high: 9, detail: 'Late 2025, returning cohort: 10 developers. The interval includes no effect; recruitment and task-selection effects make the estimate unreliable. Published February 2026.' },
    { label: 'Late 2025 / new', value: -4, low: -15, high: 9, detail: 'Late 2025, newly recruited cohort: 47 developers. The interval includes no effect; participant selection and time measurement limit interpretation. Published February 2026.' }
  ];
  const api = { presets, calculate, studies };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QEModel = api;
})(typeof window !== 'undefined' ? window : globalThis);

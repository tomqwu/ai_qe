/* The single source of arithmetic for the interactive scenarios. Percent inputs. */
((root) => {
  'use strict';
  const presets = {
    downside: { share: 45, eligible: 50, adoption: 30, saving: 10, capture: 25, cost: 1.5, risk: .5 },
    base: { share: 55, eligible: 60, adoption: 50, saving: 20, capture: 50, cost: 1, risk: .2 },
    upside: { share: 60, eligible: 70, adoption: 70, saving: 30, capture: 70, cost: .8, risk: 0 },
    noCapture: { share: 55, eligible: 60, adoption: 50, saving: 20, capture: 0, cost: 1, risk: .2 }
  };
  function calculate(p) {
    const capacity = p.share / 100 * p.eligible / 100 * p.adoption / 100 * p.saving / 100;
    const captured = capacity * p.capture / 100;
    const costs = (p.cost + p.risk) / 100;
    return { capacity, captured, uncaptured: capacity - captured, costs, net: captured - costs };
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

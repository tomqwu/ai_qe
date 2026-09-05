const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, presets, studies } = require('../assets/js/qe-model.js');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('base case releases $330k effort equivalent and nets $45k per $10M', () => {
  const r = calculate(presets.base);
  near(r.capacity * 1e7, 330000);
  near(r.captured * 1e7, 165000);
  near(r.costs * 1e7, 120000);
  near(r.net * 1e7, 45000);
});
test('published scenario inputs retain their unrounded economics', () => {
  near(calculate(presets.downside).net, -0.0183125);
  near(calculate(presets.upside).net, 0.05374);
});
test('no capture retains capacity but deducts the full costs', () => {
  const r = calculate(presets.noCapture);
  near(r.capacity, .033);
  near(r.captured, 0);
  near(r.net, -.012);
});
test('zero adoption, eligibility or task gain cannot produce a captured benefit', () => {
  for (const key of ['adoption', 'eligible', 'saving']) {
    const r = calculate({ ...presets.base, [key]: 0 });
    near(r.capacity, 0);
    near(r.net, -.012);
  }
});
test('full capture removes the uncaptured deduction; zero costs preserve captured benefit', () => {
  const r = calculate({ ...presets.base, capture: 100, cost: 0, risk: 0 });
  near(r.uncaptured, 0);
  near(r.net, .033);
});
test('the waterfall reconciles for every adoption and capture percentage', () => {
  for (let adoption = 0; adoption <= 100; adoption++) {
    for (let capture = 0; capture <= 100; capture++) {
      const p = { ...presets.base, adoption, capture }, r = calculate(p);
      near(r.capacity - r.uncaptured - p.cost / 100 - p.risk / 100, r.net);
      assert.ok(r.captured >= 0 && r.captured <= r.capacity);
    }
  }
});
test('evidence intervals contain their estimate; only follow-up intervals include zero', () => {
  for (const study of studies) assert.ok(study.low < study.value && study.value < study.high);
  assert.ok(studies[0].low > 0);
  for (const study of studies.slice(1)) assert.ok(study.low < 0 && study.high > 0);
});
